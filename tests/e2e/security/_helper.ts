import { createClerkClient } from "@clerk/react-router/server"
import { getLogger } from "@logtape/logtape"

const logger = getLogger("Test Helper")

export function updateRole({ role }: { role: string }) {
  const client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
  const userId = process.env.E2E_CLERK_USER_ID!
  const publicMetaData = {
    role,
    year: "b2",
    grade: 3,
    joinedAt: 2025,
    getGradeAt: "2025-07-19",
  }
  client.users
    .getUser(userId)
    .then(user => {
      if (user) {
        client.users.updateUser(userId, { publicMetadata: publicMetaData })
      }
    })
    .catch(error => {
      logger.error("Error updating user role:", error)
    })
}
