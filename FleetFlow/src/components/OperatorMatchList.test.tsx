import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import OperatorMatchList from './OperatorMatchList'

describe('OperatorMatchList', () => {
  it('renders N/A when distance is null', () => {
    const html = renderToString(
      <OperatorMatchList operators={[{ id: 1, name: 'Jane', distance_km: null }]} />
    )
    expect(html).toContain('N/A')
    expect(html).toContain('Jane')
  })

  it('renders assign button when callback provided', () => {
    const html = renderToString(
      <OperatorMatchList
        operators={[{ id: 2, name: 'Bob', distance_km: 1.2 }]}
        onAssign={() => {}}
      />
    )
    expect(html).toContain('Assign')
  })

  it('sorts by distance ascending', () => {
    const html = renderToString(
      <OperatorMatchList
        operators={[
          { id: 1, name: 'Far', distance_km: 10 },
          { id: 2, name: 'Near', distance_km: 5 },
        ]}
      />,
    )
    expect(html.indexOf('Near')).toBeLessThan(html.indexOf('Far'))
  })
})
