import { type } from 'arktype'

export const updateAccountSchema = type({
  firstName: 'string?',
  lastName: 'string?',
  username: 'string?',
  profileImage: 'unknown?',
})
