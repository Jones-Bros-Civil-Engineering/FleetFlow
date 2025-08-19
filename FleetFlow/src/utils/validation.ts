import { supabase } from '../lib/supabase'
import {
  GroupSubstitutionSchema,
  GroupRequiredTicketSchema,
  OperatorTicketSchema,
} from '../types'

export async function validateExternalHire(groupId: string): Promise<void> {
  const { data, error } = await supabase
    .from('group_substitutions')
    .select('*')
    .eq('group_id', groupId)
  if (error) {
    throw new Error(error.message)
  }
  const substitutions = GroupSubstitutionSchema.array().parse(data ?? [])
  if (substitutions.length > 0) {
    throw new Error('SUBSTITUTION_AVAILABLE')
  }
}

export async function validateOperatorAssignment(
  groupId: string,
  operatorId: string,
): Promise<void> {
  const { data: requiredData, error: requiredError } = await supabase
    .from('group_required_tickets')
    .select('ticket_code')
    .eq('group_id', groupId)
  if (requiredError) {
    throw new Error(requiredError.message)
  }
  const required = GroupRequiredTicketSchema.array().parse(requiredData ?? [])
  if (required.length === 0) {
    return
  }

  const { data: operatorData, error: operatorError } = await supabase
    .from('operator_tickets')
    .select('ticket_code')
    .eq('operator_id', operatorId)
  if (operatorError) {
    throw new Error(operatorError.message)
  }
  const operatorTickets = OperatorTicketSchema.array().parse(operatorData ?? [])

  const missing = required.filter(
    (rt) => !operatorTickets.some((ot) => ot.ticket_code === rt.ticket_code),
  )
  if (missing.length > 0) {
    throw new Error('MISSING_REQUIRED_TICKETS')
  }
}
