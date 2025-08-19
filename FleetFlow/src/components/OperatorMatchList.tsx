import type { FC } from 'react'

interface Operator {
  id: number | string
  distance_km: number | null
}

interface OperatorMatchListProps {
  operators: Operator[]
}

const OperatorMatchList: FC<OperatorMatchListProps> = ({ operators }) => {
  return (
    <ul>
      {operators.map((o) => (
        <li key={o.id}>{o.distance_km?.toFixed(1) ?? 'N/A'} km</li>
      ))}
    </ul>
  )
}

export default OperatorMatchList
