import { z } from 'zod'

export const ExampleSchema = z.object({
  id: z.number(),
  name: z.string(),
})
export type Example = z.infer<typeof ExampleSchema>

export const CalendarEventSchema = z.object({
  id: z.string(),
  date: z.coerce.date(),
  title: z.string(),
  site: z.string().optional(),
  contract_status: z.string().optional(),
  operated: z.boolean().optional(),
  asset_code: z.string().optional(),
  operator_name: z.string().optional(),
})
export type CalendarEvent = z.infer<typeof CalendarEventSchema>

export const EquipmentGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
})
export type EquipmentGroup = z.infer<typeof EquipmentGroupSchema>

export const AllocationSchema = z.object({
  id: z.string(),
  asset_code: z.string(),
  group_id: z.string(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  source: z.string().optional(),
  contract_status: z.string().optional(),
  contract_code: z.string().optional(),
  request_id: z.string().nullable().optional(),
})
export type Allocation = z.infer<typeof AllocationSchema>

export const RequestSchema = z.object({
  id: z.string(),
  contract_id: z.string(),
  group_id: z.string(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
  quantity: z.number(),
  operated: z.boolean(),
  site_lat: z.number(),
  site_lon: z.number(),
})
export type Request = z.infer<typeof RequestSchema>

export const WeeklyGroupUtilizationSchema = z.object({
  week_start: z.coerce.date(),
  contract_id: z.string(),
  group_id: z.string(),
  on_hire_count: z.number(),
})
export type WeeklyGroupUtilization = z.infer<typeof WeeklyGroupUtilizationSchema>

export const WeekStartSchema = z.object({
  week_start: z.coerce.date(),
})
export type WeekStart = z.infer<typeof WeekStartSchema>

export const AssetScoreSchema = z.object({
  asset_code: z.string(),
  score: z.number(),
})
export type AssetScore = z.infer<typeof AssetScoreSchema>

export const OperatorMatchSchema = z.object({
  operator_id: z.string(),
  operator_name: z.string(),
  distance_km: z.number().nullable(),
})
export type OperatorMatch = z.infer<typeof OperatorMatchSchema>

export const OperatorAssignmentSchema = z.object({
  id: z.string(),
  request_id: z.string(),
  operator_id: z.string(),
  start_date: z.coerce.date(),
  end_date: z.coerce.date(),
})
export type OperatorAssignment = z.infer<typeof OperatorAssignmentSchema>

export const GroupSubstitutionSchema = z.object({
  group_id: z.string(),
  substitute_group_id: z.string(),
})
export type GroupSubstitution = z.infer<typeof GroupSubstitutionSchema>

export const OperatorTicketSchema = z.object({
  operator_id: z.string(),
  ticket_code: z.string(),
})
export type OperatorTicket = z.infer<typeof OperatorTicketSchema>

export const GroupRequiredTicketSchema = z.object({
  group_id: z.string(),
  ticket_code: z.string(),
})
export type GroupRequiredTicket = z.infer<typeof GroupRequiredTicketSchema>

export const ExternalHireSchema = z.object({
  id: z.coerce.string(),
  contract_id: z.coerce.string(),
  request_id: z.coerce.string().nullable(),
})
export type ExternalHire = z.infer<typeof ExternalHireSchema>
