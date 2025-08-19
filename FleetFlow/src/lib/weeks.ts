export const getWeekDays = (date = new Date()): Date[] => {
  const start = new Date(date)
  const day = (start.getDay() + 6) % 7 // Monday as 0
  start.setDate(start.getDate() - day)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}
