import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  useRequestsQuery,
  useAllocationsQuery,
  scoreAssets,
} from '../api/queries'
import type { Request, AssetScore } from '../types'
import OperatorMatchList from '../components/OperatorMatchList'
import { supabase } from '../lib/supabase'

export default function PlantCoordinatorPage() {
  const { data: requests, isLoading, error } = useRequestsQuery()
  const { data: allocations } = useAllocationsQuery()
  const queryClient = useQueryClient()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [scoringId, setScoringId] = useState<string | null>(null)
  const [scores, setScores] = useState<Record<string, AssetScore[]>>({})
  const [openRequestId, setOpenRequestId] = useState<string | null>(null)

  const openRequests = requests?.filter((r) => {
    const count = allocations?.filter((a) => a.request_id === r.id).length ?? 0
    return count < r.quantity
  })

  const allocationMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase.rpc('rpc_allocate_best_asset', {
        request_id: requestId,
      })
      if (error) {
        if (error.message === 'NO_INTERNAL_ASSET_AVAILABLE') {
          const { error: hireError } = await supabase
            .from('external_hires')
            .insert({ request_id: requestId })
          if (hireError) {
            throw new Error(hireError.message)
          }
          return { external: true }
        }
        throw new Error(error.message)
      }
      return { external: false }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['allocations'] })
    },
  })

  const scoreMutation = useMutation({
    mutationFn: async (request: Request) => scoreAssets(request.id),
    onSuccess: (data, variables) => {
      setScores((prev) => ({ ...prev, [variables.id]: data }))
    },
  })

  const handleAllocate = (id: string) => {
    setActiveId(id)
    allocationMutation.mutate(id)
  }

  const handleScore = (request: Request) => {
    setScoringId(request.id)
    scoreMutation.mutate(request)
  }

  const handleToggleOperators = (id: string) => {
    setOpenRequestId(openRequestId === id ? null : id)
  }

  if (isLoading) {
    return <div>Loading requests...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div>
      <h1>Plant Coordinator</h1>
      <ul>
        {openRequests?.map((r) => (
          <li key={r.id}>
            <div>
              <strong>Contract {r.contract_id}</strong> – Group {r.group_id} – {r.start_date.toLocaleDateString()} to {r.end_date.toLocaleDateString()} – Qty {r.quantity}
            </div>
            <div>
              <button
                onClick={() => handleScore(r)}
                disabled={scoreMutation.isPending && scoringId === r.id}
              >
                {scoreMutation.isPending && scoringId === r.id ? 'Scoring...' : 'Score Assets'}
              </button>
              <button
                onClick={() => handleAllocate(r.id)}
                disabled={allocationMutation.isPending && activeId === r.id}
              >
                {allocationMutation.isPending && activeId === r.id ? 'Allocating...' : 'Allocate Asset'}
              </button>
              <button onClick={() => handleToggleOperators(r.id)}>
                {openRequestId === r.id ? 'Hide Operators' : 'Rank Operators'}
              </button>
            </div>
            {scores[r.id] && (
              <ul>
                {scores[r.id].map((s) => (
                  <li key={s.asset_code}>
                    {s.asset_code} – {s.score.toFixed(2)}
                  </li>
                ))}
              </ul>
            )}
            {allocationMutation.isError && activeId === r.id && (
              <div>Error allocating asset</div>
            )}
            {allocationMutation.isSuccess && activeId === r.id && (
              <div>
                {allocationMutation.data?.external
                  ? 'No internal asset available – external hire created.'
                  : 'Asset allocated successfully!'}
              </div>
            )}
            {openRequestId === r.id && (
              <OperatorMatchList requestId={r.id} />
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

