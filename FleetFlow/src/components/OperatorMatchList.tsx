import type { FC } from 'react'

interface Operator {
  id: number | string
  name: string
  distance_km: number | null
}

interface OperatorMatchListProps {
  operators: Operator[]
  onAssign?: (id: number | string) => void
}

const OperatorMatchList: FC<OperatorMatchListProps> = ({
  operators,
  onAssign,
}) => {
  const sorted = [...operators].sort((a, b) => {
    if (a.distance_km == null) return 1
    if (b.distance_km == null) return -1
    return a.distance_km - b.distance_km
  })

  return (
    <ul>
      {sorted.map((o) => (
        <li key={o.id}>
          {o.name} – {o.distance_km?.toFixed(1) ?? 'N/A'} km
          {onAssign && (
            <button onClick={() => onAssign(o.id)}>Assign</button>
          )}
        </li>
      ))}
    </ul>
  )
}

export default OperatorMatchList
