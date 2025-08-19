// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import EventDetailsDrawer from './EventDetailsDrawer'
import type { CalendarEvent } from '../types'

describe('EventDetailsDrawer', () => {
  it('renders action buttons when open', () => {
    const event: CalendarEvent = {
      id: '1',
      title: 'Test Event',
      date: new Date('2024-01-01'),
    }
    render(
      <EventDetailsDrawer event={event} open={true} onClose={() => {}} />,
    )
    expect(screen.getByText('Off-hire')).toBeTruthy()
    expect(screen.getByText('Reassign')).toBeTruthy()
  })
})

describe('EventDetailsDrawer callbacks', () => {
  it('invokes handlers when action buttons are clicked', () => {
    const event: CalendarEvent = {
      id: '1',
      title: 'Test Event',
      date: new Date('2024-01-01'),
    }
    const offHire = vi.fn()
    const reassign = vi.fn()
    render(
      <EventDetailsDrawer
        event={event}
        open={true}
        onClose={() => {}}
        onOffHire={offHire}
        onReassign={reassign}
      />,
    )
    fireEvent.click(screen.getAllByText('Off-hire').at(-1)!)
    expect(offHire).toHaveBeenCalledWith(event)
    fireEvent.click(screen.getAllByText('Reassign').at(-1)!)
    expect(reassign).toHaveBeenCalledWith(event)
  })
})
