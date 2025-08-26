import { test, expect } from '@playwright/experimental-ct-react'
import * as ReactQuery from '@tanstack/react-query'
import type { ReactElement } from 'react'
import ExternalHiresPage from '../ExternalHiresPage'
import { supabase } from '../../lib/supabase'

const withProviders = (component: ReactElement) => {
  const queryClient = new ReactQuery.QueryClient()
  return (
    <ReactQuery.QueryClientProvider client={queryClient}>
      {component}
    </ReactQuery.QueryClientProvider>
  )
}

test('edits and cancels an external hire', async ({ mount }) => {
  const { data } = await supabase
    .from('external_hires')
    .insert({ contract_id: 1 })
    .select()
    .single()
  const component = await mount(withProviders(<ExternalHiresPage />))
  await component.evaluate(() => {
    window.prompt = () => '1'
  })
  await component.getByTestId(`edit-${data.id}`).click()
  await component.getByText('Request 1')
  let { data: updated } = await supabase
    .from('external_hires')
    .select('*')
    .eq('id', data.id)
    .single()
  expect(updated.request_id).toBe(1)
  await component.getByTestId(`cancel-${data.id}`).click()
  const { count } = await supabase
    .from('external_hires')
    .select('*', { count: 'exact', head: true })
    .eq('id', data.id)
  expect(count).toBe(0)
})
