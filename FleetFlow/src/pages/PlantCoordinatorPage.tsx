import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRequestsQuery } from '../api/queries'
import OperatorMatchList from '../components/OperatorMatchList'
import { supabase } from '../lib/supabase'

export default function PlantCoordinatorPage() {
  const { data: requests, isLoading, error } = useRequestsQuery()
  const queryClient = useQueryClient()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [openRequestId, setOpenRequestId] = useState<string | null>(null)

  const allocationMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase.rpc('rpc_allocate_best_asset', {
        request_id: requestId,
      })
      if (error) {
        throw new Error(error.message)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      queryClient.invalidateQueries({ queryKey: ['allocations'] })
    },
  })

  const handleAllocate = (id: string) => {
    setActiveId(id)
    allocationMutation.mutate(id)
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
        {requests?.map((r) => (
          <li key={r.id}>
            <div>
              <strong>Contract {r.contract_id}</strong> – Group {r.group_id} – {r.start_date.toLocaleDateString()} to {r.end_date.toLocaleDateString()} – Qty {r.quantity}
            </div>
            <button
              onClick={() => handleAllocate(r.id)}
              disabled={allocationMutation.isPending && activeId === r.id}
            >
              {allocationMutation.isPending && activeId === r.id ? 'Allocating...' : 'Allocate Asset'}
            </button>
            <button onClick={() => handleToggleOperators(r.id)}>
              {openRequestId === r.id ? 'Hide Operators' : 'Rank Operators'}
            </button>
            {allocationMutation.isError && activeId === r.id && (
              <div>Error allocating asset</div>
            )}
            {allocationMutation.isSuccess && activeId === r.id && (
              <div>Asset allocated successfully!</div>
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
