import { arktypeValidator } from '@hono/arktype-validator'
import { getAuth } from '@hono/clerk-auth'
import { ArkErrors } from 'arktype'
import { Hono } from 'hono'

import { getProfile, getUser, patchProfile } from '@/server/clerk/profile'
import { AccountMetadata } from '@/share/types/account'
import { updateAccountSchema } from '@/share/types/clerkClient'
import { Role } from '@/share/types/role'

export const clerk = new Hono<{ Bindings: Env }>() //
  .get('/account', async (c) => {
    const auth = getAuth(c)
    if (!auth || !auth.userId) throw new Error('Not Authenticated')
    const user = await getUser(c)
    if (!user) throw new Error('User not found')
    return c.json(user, 200)
  })
  .patch(
    '/account',
    arktypeValidator('form', updateAccountSchema, (result, c) => {
      if (!result.success) {
        return c.json({ error: 'Invalid account payload' }, 400)
      }
      return
    }),
    async (c) => {
      const auth = getAuth(c)
      if (!auth || !auth.userId) throw new Error('Not Authenticated')

      const body = c.req.valid('form')

      const username = body.username
      const firstName = body.firstName
      const lastName = body.lastName
      const profileImage = body.profileImage

      const { createClerkClient } = await import('@clerk/backend')
      const clerkClient = createClerkClient({
        secretKey: c.env.CLERK_SECRET_KEY,
      })

      try {
        const updatePayload: Parameters<typeof clerkClient.users.updateUser>[1] = {}

        if (username && typeof username === 'string') updatePayload.username = username
        if (firstName && typeof firstName === 'string') updatePayload.firstName = firstName
        if (lastName && typeof lastName === 'string') updatePayload.lastName = lastName
        if (Object.keys(updatePayload).length > 0) await clerkClient.users.updateUser(auth.userId, updatePayload)

        if (profileImage instanceof File && profileImage.size > 0) {
          await clerkClient.users.updateUserProfileImage(auth.userId, {
            file: profileImage,
          })
        }

        const updatedUser = await clerkClient.users.getUser(auth.userId)

        // Invalidate cache after update
        const cacheKey = `user:${auth.userId}`
        await c.env.KV.delete(cacheKey)

        return c.json(
          {
            userId: updatedUser.id,
            username: updatedUser.username,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            imageUrl: updatedUser.imageUrl,
          },
          200
        )
      } catch (error) {
        console.error('Failed to update account:', error)
        throw new Error('Failed to update account', { cause: error })
      }
    }
  )
  .get('/profile', async (c) => {
    const auth = getAuth(c)

    if (!auth || !auth.userId) throw new Error('Not Authenticated')

    const profile = await getProfile(c)

    if (!profile) throw new Error('Profile not found')

    return c.json({ profile: { id: auth.userId, ...profile } }, 200)
  })
  .patch(
    '/profile',
    arktypeValidator('json', AccountMetadata.omit('role'), (result, c) => {
      if (!result.success) {
        return c.json({ error: 'Invalid profile payload' }, 400)
      }
      return
    }),
    async (c) => {
      const reqData = c.req.valid('json')
      const profile = await getProfile(c)

      if (!profile) throw new Error('Profile not found')

      const newUserData = await patchProfile(c, {
        role: profile.role,
        ...reqData,
      })

      if (Object.keys(newUserData.publicMetadata).length === 0) throw new Error('Failed to update user data.')

      const newProfile = AccountMetadata(newUserData.publicMetadata)

      if (newProfile instanceof ArkErrors) throw new Error('Invalid profile data')

      return c.json({ profile: { id: newUserData.id, ...newProfile } }, 200)
    }
  )
  .get('/menu', async (c) => {
    const auth = getAuth(c)
    if (!auth || !auth.userId) throw new Error('Not Authenticated')

    const profile = await getProfile(c)
    const role = profile ? Role.parse(profile.role) : undefined
    const isManagement = role?.isManagement() ?? false

    const menuItems = [
      {
        id: 'record',
        title: '活動記録',
        href: '/record',
        icon: 'clipboard-list',
        theme: 'blue',
      },
      {
        id: 'account',
        title: 'アカウント',
        href: '/account',
        icon: 'user',
        theme: 'neutral',
      },
    ]

    if (isManagement) {
      menuItems.push({
        id: 'admin',
        title: '管理パネル',
        href: '/admin',
        icon: 'settings',
        theme: 'indigo',
      })
    }

    return c.json({ menu: menuItems }, 200)
  })
