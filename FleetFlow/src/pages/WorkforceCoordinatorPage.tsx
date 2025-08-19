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

export default function WorkforceCoordinatorPage() {
  const { data: requests, isLoading, error } = useRequestsQuery()
  const { data: assignments } = useOperatorAssignmentsQuery()
  const queryClient = useQueryClient()
  const [rankingId, setRankingId] = useState<string | null>(null)
  const [assigningId, setAssigningId] = useState<string | null>(null)
  const [matches, setMatches] = useState<Record<string, OperatorMatch[]>>({})

  const rankMutation = useMutation({
    mutationFn: (request: Request) =>
      rankOperators(request.start_date, request.end_date),
    onSuccess: (data, variables) => {
      setMatches((prev) => ({ ...prev, [variables.id]: data }))
    },
  })

  const assignMutation = useMutation({
    mutationFn: async ({
      requestId,
      operatorId,
      startDate,
      endDate,
    }: {
      requestId: string
      operatorId: string
      startDate: Date
      endDate: Date
    }) => {
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

  const handleRank = (r: Request) => {
    setRankingId(r.id)
    rankMutation.mutate(r)
  }

  const handleAssign = (r: Request, operatorId: string) => {
    setAssigningId(r.id)
    assignMutation.mutate({
      requestId: r.id,
      operatorId,
      startDate: r.start_date,
      endDate: r.end_date,
    })
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
                  distance_km: null,
                }))}
                onAssign={(opId) => handleAssign(r, String(opId))}
              />
            )}
            {assignMutation.isError && assigningId === r.id && (
              <div>Error assigning operator</div>
            )}
            {assignMutation.isSuccess && assigningId === r.id && (
              <div>Operator assigned!</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

