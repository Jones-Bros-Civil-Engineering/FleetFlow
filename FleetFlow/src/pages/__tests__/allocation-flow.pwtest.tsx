import { test, expect } from '@playwright/experimental-ct-react'
import * as ReactQuery from '@tanstack/react-query'
import type { ReactElement } from 'react'
import PlantCoordinatorPage from '../PlantCoordinatorPage'
import WorkforceCoordinatorPage from '../WorkforceCoordinatorPage'
import { supabase } from '../../lib/supabase'

const withProviders = (component: ReactElement) => {
  const queryClient = new ReactQuery.QueryClient()
  return (
    <ReactQuery.QueryClientProvider client={queryClient}>
      {component}
    </ReactQuery.QueryClientProvider>
  )
}

test('allocates asset via PlantCoordinatorPage', async ({ mount }) => {
  const component = await mount(withProviders(<PlantCoordinatorPage />))
  const { count: before } = await supabase
    .from('vw_allocations')
    .select('*', { count: 'exact', head: true })
  await component.getByRole('button', { name: 'Allocate Assets' }).click()
  await component.getByText(/allocated/)
  const { count: after } = await supabase
    .from('vw_allocations')
    .select('*', { count: 'exact', head: true })
  expect((after ?? 0) > (before ?? 0)).toBeTruthy()
})

test('assigns operator via WorkforceCoordinatorPage', async ({ mount }) => {
  const component = await mount(withProviders(<WorkforceCoordinatorPage />))
  const { count: before } = await supabase
    .from('vw_operator_assignments')
    .select('*', { count: 'exact', head: true })
  await component.getByRole('button', { name: 'Rank Operators' }).click()
  await component.getByRole('button', { name: /Assign/ }).click()
  await component.getByText('Operator assigned!')
  const { count: after } = await supabase
    .from('vw_operator_assignments')
    .select('*', { count: 'exact', head: true })
  expect((after ?? 0) > (before ?? 0)).toBeTruthy()
})
