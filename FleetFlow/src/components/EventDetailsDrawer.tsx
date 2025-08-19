import * as Dialog from '@radix-ui/react-dialog'
import { useState } from 'react'
import type { CalendarEvent } from '../types'
import { friendlyErrorMessage } from '../utils/errors'
import './week-calendar.css'

export interface EventDetailsDrawerProps {
  event: CalendarEvent | null
  open: boolean
  onClose: () => void
  onOffHire?: (event: CalendarEvent) => void
  onReassign?: (event: CalendarEvent) => void
}

export default function EventDetailsDrawer({
  event,
  open,
  onClose,
  onOffHire,
  onReassign,
}: EventDetailsDrawerProps) {
  const [error, setError] = useState<string | null>(null)

  const handleOffHire = async () => {
    if (!event || !onOffHire) return
    try {
      setError(null)
      await onOffHire(event)
    } catch (err) {
      const message =
        err instanceof Error ? friendlyErrorMessage(err.message) : String(err)
      setError(message)
    }
  }

  const handleReassign = async () => {
    if (!event || !onReassign) return
    try {
      setError(null)
      await onReassign(event)
    } catch (err) {
      const message =
        err instanceof Error ? friendlyErrorMessage(err.message) : String(err)
      setError(message)
    }
  }
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className='drawer-overlay' />
        <Dialog.Content className='drawer-content'>
          <Dialog.Title>Details</Dialog.Title>
          {event && (
            <div className='drawer-body'>
              <p>{event.title}</p>
              <p>{event.date.toDateString()}</p>
              {event.asset_code && <p>Asset: {event.asset_code}</p>}
              {event.operator_name && <p>Operator: {event.operator_name}</p>}
              {event.contract_status && (
                <p>Status: {event.contract_status}</p>
              )}
            </div>
          )}
          <div className='drawer-actions'>
            <button onClick={handleOffHire}>Off-hire</button>
            <button onClick={handleReassign}>Reassign</button>
          </div>
          {error && <div role='alert'>{error}</div>}
          <Dialog.Close className='drawer-close'>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
