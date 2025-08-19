// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
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
