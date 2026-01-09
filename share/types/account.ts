import { type } from 'arktype'

import { Role } from './role'

export const AccountMetadata = type({
  role: Role.type,
  grade: '(string.numeric.parse |> -5 <= number.integer <= 5) | -5 <= number.integer <= 5',
  getGradeAt: "/^\\d{4}-\\d{2}-\\d{2}$/ | null | ''",
  joinedAt: '(string.numeric.parse |> 2020 <= number.integer <= 9999) | 2020 <= number.integer <= 9999',
  year: '/^(b[1-4]|m[1-2]|d[1-2])$/',
  '+': 'delete',
})

export const AccountInfo = type({
  firstName: 'string?',
  lastName: 'string?',
  username: 'string?',
  profileImage: 'unknown?',
})
