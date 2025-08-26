// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ExternalHiresPage from '../ExternalHiresPage'

const hire = { id: '1', contract_id: '1', request_id: '1' }
const updateMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
const cancelMock = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))

vi.mock('../../api/queries', () => ({
  useExternalHiresQuery: () => ({ data: [hire], isLoading: false, error: null }),
  updateExternalHire: updateMock,
  cancelExternalHire: cancelMock,
}))

afterEach(() => {
  cleanup()
  updateMock.mockClear()
  cancelMock.mockClear()
})

const renderPage = () => {
  const queryClient = new QueryClient()
  return render(
    <QueryClientProvider client={queryClient}>
      <ExternalHiresPage />
    </QueryClientProvider>,
  )
}

describe('ExternalHiresPage', () => {
  it('displays hires and edits/cancels', async () => {
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue('2')
    renderPage()
    await screen.findByText('Contract 1 – Request 1')
    fireEvent.click(screen.getByTestId('edit-1'))
    await waitFor(() =>
      expect(updateMock).toHaveBeenCalledWith('1', { request_id: '2' }),
    )
    fireEvent.click(screen.getByTestId('cancel-1'))
    await waitFor(() => expect(cancelMock).toHaveBeenCalledWith('1'))
    promptSpy.mockRestore()
  })
})
