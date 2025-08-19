import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  useRequestsQuery,
  useAllocationsQuery,
  scoreAssets,
} from '../api/queries'
import type { Request, AssetScore } from '../types'
import { supabase } from '../lib/supabase'
import { validateExternalHire } from '../utils/validation'

export default function PlantCoordinatorPage() {
  const { data: requests, isLoading, error } = useRequestsQuery()
  const { data: allocations } = useAllocationsQuery()
  const queryClient = useQueryClient()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [scoringId, setScoringId] = useState<string | null>(null)
  const [scores, setScores] = useState<Record<string, AssetScore[]>>({})
  const [showOpenOnly, setShowOpenOnly] = useState(true)

  const getRemaining = (r: Request) => {
    const count = allocations?.filter((a) => a.request_id === r.id).length ?? 0
    return r.quantity - count
  }

  const openRequests = requests?.filter((r) => getRemaining(r) > 0)
  const filteredRequests = showOpenOnly ? openRequests : requests

  const allocationMutation = useMutation({
    mutationFn: async (request: Request) => {
      const remaining = getRemaining(request)
      let internalCount = 0
      let externalCount = 0
      for (let i = 0; i < remaining; i++) {
        const { error } = await supabase.rpc('rpc_allocate_best_asset', {
          request_id: request.id,
        })
        if (error) {
          if (error.message === 'NO_INTERNAL_ASSET_AVAILABLE') {
            await validateExternalHire(request.group_id)
            const { error: hireError } = await supabase
              .from('external_hires')
              .insert({ request_id: request.id })
            if (hireError) {
              throw new Error(hireError.message)
            }
            externalCount++
            continue
          }
          throw new Error(error.message)
        }
        internalCount++
      }
      return { internalCount, externalCount }
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

  const handleAllocate = (request: Request) => {
    setActiveId(request.id)
    allocationMutation.mutate(request)
  }

  const handleScore = (request: Request) => {
    setScoringId(request.id)
    scoreMutation.mutate(request)
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
      <label>
        <input
          type="checkbox"
          checked={showOpenOnly}
          onChange={(e) => setShowOpenOnly(e.target.checked)}
        />
        {' '}Show open requests only
      </label>
      <ul>
        {filteredRequests?.map((r) => (
          <li key={r.id}>
            <div>
              <strong>Contract {r.contract_id}</strong> – Group {r.group_id} – {r.start_date.toLocaleDateString()} to {r.end_date.toLocaleDateString()} – Qty {r.quantity}
              {showOpenOnly && ` (remaining: ${getRemaining(r)})`}
            </div>
            <div>
              <button
                onClick={() => handleScore(r)}
                disabled={scoreMutation.isPending && scoringId === r.id}
              >
                {scoreMutation.isPending && scoringId === r.id ? 'Scoring...' : 'Score Assets'}
              </button>
              <button
                onClick={() => handleAllocate(r)}
                disabled={allocationMutation.isPending && activeId === r.id}
              >
                {allocationMutation.isPending && activeId === r.id ? 'Allocating...' : 'Allocate Assets'}
              </button>
            </div>
            {scores[r.id] && (
              scores[r.id].length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scores[r.id].map((s) => (
                      <tr key={s.asset_code}>
                        <td>{s.asset_code}</td>
                        <td>{s.score.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div>No assets available</div>
              )
            )}
            {scoreMutation.isError && scoringId === r.id && (
              <div>Error scoring assets: {scoreMutation.error.message}</div>
            )}
            {allocationMutation.isError && activeId === r.id && (
              <div>Error allocating asset: {(allocationMutation.error as Error).message}</div>
            )}
            {allocationMutation.isSuccess && activeId === r.id && (
              <div>
                {allocationMutation.data.internalCount > 0 && (
                  <div>{allocationMutation.data.internalCount} asset(s) allocated internally.</div>
                )}
                {allocationMutation.data.externalCount > 0 && (
                  <div>{allocationMutation.data.externalCount} external hire(s) created.</div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
