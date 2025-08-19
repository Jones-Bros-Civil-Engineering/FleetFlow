import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import OperatorMatchList from './OperatorMatchList'

describe('OperatorMatchList', () => {
  it('renders N/A when distance is null', () => {
    const html = renderToString(
      <OperatorMatchList operators={[{ id: 1, distance_km: null }]} />
    )
    expect(html).toContain('N/A')
  })
})
