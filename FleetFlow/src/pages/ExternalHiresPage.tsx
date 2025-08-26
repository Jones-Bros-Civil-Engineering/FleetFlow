import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  useExternalHiresQuery,
  updateExternalHire,
  cancelExternalHire,
} from '../api/queries'

export default function ExternalHiresPage() {
  const { data: hires, isLoading, error } = useExternalHiresQuery()
  const queryClient = useQueryClient()

  const editMutation = useMutation({
    mutationFn: ({ id, requestId }: { id: string; requestId: string | null }) =>
      updateExternalHire(id, { request_id: requestId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-hires'] })
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => cancelExternalHire(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['external-hires'] })
    },
  })

  if (isLoading) {
    return <div>Loading external hires...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div>
      <h1>External Hires</h1>
      <ul>
        {hires?.map((h) => (
          <li key={h.id} data-testid={`eh-${h.id}`}>
            <span>
              Contract {h.contract_id} – Request {h.request_id ?? 'None'}
            </span>
            <button
              onClick={async () => {
                const requestId = window.prompt('Enter request id', h.request_id ?? '')
                if (requestId !== null) {
                  await editMutation.mutateAsync({
                    id: h.id,
                    requestId: requestId === '' ? null : requestId,
                  })
                }
              }}
              disabled={editMutation.isPending}
              data-testid={`edit-${h.id}`}
            >
              Edit
            </button>
            <button
              onClick={() => cancelMutation.mutate(h.id)}
              disabled={cancelMutation.isPending}
              data-testid={`cancel-${h.id}`}
            >
              Cancel
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
