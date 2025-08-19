import * as Dialog from '@radix-ui/react-dialog'
import type { CalendarEvent } from '../types'
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
            </div>
          )}
          <div className='drawer-actions'>
            <button onClick={() => event && onOffHire?.(event)}>
              Off-hire
            </button>
            <button onClick={() => event && onReassign?.(event)}>
              Reassign
            </button>
          </div>
          <Dialog.Close className='drawer-close'>Close</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
