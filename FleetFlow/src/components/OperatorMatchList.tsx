import { useOperatorRankingsQuery } from '../api/queries'

interface Props {
  requestId: string
}

export default function OperatorMatchList({ requestId }: Props) {
  const { data, isLoading, error } = useOperatorRankingsQuery(requestId)

  if (isLoading) {
    return <div>Loading operators...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  if (!data || data.length === 0) {
    return <div>No operators found</div>
  }

  return (
    <ol>
      {data.map((o) => (
        <li key={o.operator_id}>
          {o.operator_name} – {o.eligible ? 'eligible' : 'ineligible'} (
          {o.distance_km ?? 'N/A'} km)
        </li>
      ))}
    </ol>
  )
}
