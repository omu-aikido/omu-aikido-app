export type DateString = `${number}-${number}-${number}`

export const isDateString = (value: string): value is DateString => {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}
