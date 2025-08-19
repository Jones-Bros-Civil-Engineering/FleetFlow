import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  useRequestsQuery,
  useOperatorAssignmentsQuery,
  rankOperators,
} from '../api/queries'
import type { Request, OperatorMatch } from '../types'
import { supabase } from '../lib/supabase'
import OperatorMatchList from '../components/OperatorMatchList'
import { validateOperatorAssignment } from '../utils/validation'
import { friendlyErrorMessage } from '../utils/errors'

export default function WorkforceCoordinatorPage() {
  const { data: requests, isLoading, error } = useRequestsQuery()
  const { data: assignments } = useOperatorAssignmentsQuery()
  const queryClient = useQueryClient()
  const [rankingId, setRankingId] = useState<string | null>(null)
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [matches, setMatches] = useState<Record<string, OperatorMatch[]>>({})
  const [assignError, setAssignError] = useState<string | null>(null)
  const [rankError, setRankError] = useState<string | null>(null)

  const rankMutation = useMutation({
    mutationFn: (request: Request) =>
      rankOperators(
        request.start_date,
        request.end_date,
        request.site_lat,
        request.site_lon,
      ),
    onSuccess: (data, variables) => {
      setMatches((prev) => ({ ...prev, [variables.id]: data }))
    },
  })

  const assignMutation = useMutation({
    mutationFn: async ({
      requestId,
      groupId,
      operatorId,
      startDate,
      endDate,
    }: {
      requestId: string
      groupId: string
      operatorId: string
      startDate: Date
      endDate: Date
    }) => {
      await validateOperatorAssignment(groupId, operatorId)
      const { error } = await supabase.from('operator_assignments').insert({
        request_id: requestId,
        operator_id: operatorId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      })
      if (error) {
        throw new Error(error.message)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operator-assignments'] })
    },
  })

  const openRequests = requests?.filter((r) => {
    if (!r.operated) return false
    const count =
      assignments?.filter((a) => a.request_id === r.id).length ?? 0
    return count < r.quantity
  })

  const handleRank = async (r: Request) => {
    setRankingId(r.id)
    setRankError(null)
    try {
      await rankMutation.mutateAsync(r)
    } catch (err) {
      const message =
        err instanceof Error ? friendlyErrorMessage(err.message) : String(err)
      setRankError(message)
    }
  }

  const handleAssign = async (r: Request, operatorId: string) => {
    setAssigningId(r.id)
    setAssignError(null)
    try {
      await assignMutation.mutateAsync({
        requestId: r.id,
        groupId: r.group_id,
        operatorId,
        startDate: r.start_date,
        endDate: r.end_date,
      })
    } catch (err) {
      const message =
        err instanceof Error ? friendlyErrorMessage(err.message) : String(err)
      setAssignError(message)
    }
  }

  if (isLoading) {
    return <div>Loading requests...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div>
      <h1>Workforce Coordinator</h1>
      <ul>
        {openRequests?.map((r) => (
          <li key={r.id}>
            <div>
              <strong>Contract {r.contract_id}</strong> – Group {r.group_id} –
              {r.start_date.toLocaleDateString()} to
              {r.end_date.toLocaleDateString()} – Qty {r.quantity}
            </div>
            <div>
              <button
                onClick={() => handleRank(r)}
                disabled={rankMutation.isPending && rankingId === r.id}
              >
                {rankMutation.isPending && rankingId === r.id
                  ? 'Ranking...'
                  : 'Rank Operators'}
              </button>
            </div>
            {matches[r.id] && (
              <OperatorMatchList
                operators={matches[r.id].map((m) => ({
                  id: m.operator_id,
                  name: m.operator_name,
                  distance_km: m.distance_km,
                }))}
                onAssign={(opId) => handleAssign(r, String(opId))}
              />
            )}
            {rankError && rankingId === r.id && (
              <div role="alert">{rankError}</div>
            )}
            {assignError && assigningId === r.id && (
              <div role="alert">{assignError}</div>
            )}
            {assignMutation.isSuccess && assigningId === r.id && (
              <div role="alert">Operator assigned!</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

