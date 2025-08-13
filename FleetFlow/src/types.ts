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
})
export type Request = z.infer<typeof RequestSchema>

export const WeeklyGroupUtilizationSchema = z.object({
  week_start: z.coerce.date(),
  group_id: z.string(),
  on_hire_count: z.number(),
})
export type WeeklyGroupUtilization = z.infer<typeof WeeklyGroupUtilizationSchema>
