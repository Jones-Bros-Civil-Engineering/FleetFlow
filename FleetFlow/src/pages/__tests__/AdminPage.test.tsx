// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import AdminPage from '../AdminPage'

const fromMock = vi.hoisted(() => vi.fn())
const toastSuccess = vi.hoisted(() => vi.fn())
const toastError = vi.hoisted(() => vi.fn())

function deferred<T>() {
  let resolve: (v: T) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  // @ts-expect-error resolve is assigned synchronously
  return { promise, resolve }
}

vi.mock('../../lib/supabase', () => ({ supabase: { from: fromMock } }))
vi.mock('react-hot-toast', () => ({ toast: { success: toastSuccess, error: toastError } }))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.restoreAllMocks()
})

const setupFetch = (profiles: any[] = []) => {
  const eqMock = vi.fn().mockResolvedValue({ data: profiles, error: null })
  const selectMock = vi.fn(() => ({ eq: eqMock }))
  fromMock.mockReturnValue({ select: selectMock, insert: vi.fn(), update: vi.fn() })
  return { selectMock }
}

describe('AdminPage create', () => {
  it('optimistically adds a user and rolls back on error', async () => {
    const insertSingle = deferred({ data: null, error: { message: 'fail' } })
    const insertMock = vi.fn(() => ({
      select: vi.fn(() => ({ single: vi.fn(() => insertSingle.promise) })),
    }))

    const { selectMock } = setupFetch([])
    fromMock.mockReturnValue({ select: selectMock, insert: insertMock, update: vi.fn() })

    render(<AdminPage />)
    await screen.findByText('Add User')

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: ' new@user.com ' },
    })
    fireEvent.click(screen.getByText('Create'))
    // optimistic update
    expect(screen.getByText('new@user.com')).toBeTruthy()

    insertSingle.resolve({ data: null, error: { message: 'fail' } })
    await waitFor(() => screen.getByText('fail'))
    expect(screen.queryByText('new@user.com')).toBeNull()
  })

  it('persists user on successful create', async () => {
    const insertSingle = deferred({ data: { id: '2', email: 'new@user.com', role: 'contract_manager' }, error: null })
    const insertMock = vi.fn(() => ({
      select: vi.fn(() => ({ single: vi.fn(() => insertSingle.promise) })),
    }))

    const { selectMock } = setupFetch([])
    fromMock.mockReturnValue({ select: selectMock, insert: insertMock, update: vi.fn() })

    render(<AdminPage />)
    await screen.findByText('Add User')
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: ' new@user.com ' },
    })
    fireEvent.click(screen.getByText('Create'))
    expect(screen.getByText('new@user.com')).toBeTruthy()

    insertSingle.resolve({ data: { id: '2', email: 'new@user.com', role: 'contract_manager' }, error: null })
    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith('User created'))
    expect(screen.getByText('new@user.com')).toBeTruthy()
  })
})

describe('AdminPage edit', () => {
  it('optimistically edits a user and rolls back on error', async () => {
    const updateSingle = deferred({ data: null, error: { message: 'fail' } })
    const updateMock = vi.fn(() => ({
      eq: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(() => updateSingle.promise) })) })),
    }))

    const { selectMock } = setupFetch([{ id: '1', email: 'a@a.com', role: 'admin' }])
    fromMock.mockReturnValue({ select: selectMock, insert: vi.fn(), update: updateMock })

    render(<AdminPage />)
    await screen.findByText('a@a.com')
    fireEvent.click(screen.getByText('Edit'))
    fireEvent.change(screen.getByDisplayValue('a@a.com'), {
      target: { value: 'b@b.com' },
    })
    fireEvent.click(screen.getByText('Save'))
    expect(screen.getByText('b@b.com')).toBeTruthy()

    updateSingle.resolve({ data: null, error: { message: 'fail' } })
    await waitFor(() => screen.getByText('fail'))
    expect(screen.getByDisplayValue('a@a.com')).toBeTruthy()
  })

  it('persists user on successful edit', async () => {
    const updateSingle = deferred({ data: { id: '1', email: 'b@b.com', role: 'admin' }, error: null })
    const updateMock = vi.fn(() => ({
      eq: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(() => updateSingle.promise) })) })),
    }))

    const { selectMock } = setupFetch([{ id: '1', email: 'a@a.com', role: 'admin' }])
    fromMock.mockReturnValue({ select: selectMock, insert: vi.fn(), update: updateMock })

    render(<AdminPage />)
    await screen.findByText('a@a.com')
    fireEvent.click(screen.getByText('Edit'))
    fireEvent.change(screen.getByDisplayValue('a@a.com'), {
      target: { value: 'b@b.com' },
    })
    fireEvent.click(screen.getByText('Save'))
    expect(screen.getByText('b@b.com')).toBeTruthy()

    updateSingle.resolve({ data: { id: '1', email: 'b@b.com', role: 'admin' }, error: null })
    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith('User updated'))
    expect(screen.getByText('b@b.com')).toBeTruthy()
  })
})

describe('AdminPage delete', () => {
  it('optimistically deletes a user and rolls back on error', async () => {
    const deleteEq = deferred({ error: { message: 'fail' } })
    const updateMock = vi.fn(() => ({ eq: vi.fn(() => deleteEq.promise) }))
    const { selectMock } = setupFetch([{ id: '1', email: 'a@a.com', role: 'admin' }])
    fromMock.mockReturnValue({ select: selectMock, insert: vi.fn(), update: updateMock })
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<AdminPage />)
    await screen.findByText('a@a.com')
    fireEvent.click(screen.getByText('Delete'))
    expect(screen.queryByText('a@a.com')).toBeNull()

    deleteEq.resolve({ error: { message: 'fail' } })
    await waitFor(() => screen.getByText('fail'))
    expect(screen.getByText('a@a.com')).toBeTruthy()
  })

  it('removes user on successful delete', async () => {
    const deleteEq = deferred({ error: null })
    const updateMock = vi.fn(() => ({ eq: vi.fn(() => deleteEq.promise) }))
    const { selectMock } = setupFetch([{ id: '1', email: 'a@a.com', role: 'admin' }])
    fromMock.mockReturnValue({ select: selectMock, insert: vi.fn(), update: updateMock })
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<AdminPage />)
    await screen.findByText('a@a.com')
    fireEvent.click(screen.getByText('Delete'))
    expect(screen.queryByText('a@a.com')).toBeNull()

    deleteEq.resolve({ error: null })
    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith('User deleted'))
    expect(screen.queryByText('a@a.com')).toBeNull()
  })
})
