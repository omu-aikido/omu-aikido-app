import { ArkErrors } from 'arktype'
import { describe, it, expect } from 'vitest'

import { AccountMetadata, AccountInfo } from '../share/types/account'
import { updateAccountSchema } from '../share/types/clerkClient'
import { recordQuerySchema, rankingQuerySchema } from '../share/types/records'
import { Role } from '../share/types/role'

describe('ArkType スキーマ定義テスト', () => {
  // ============================================
  // Role スキーマ テスト
  // ============================================
  describe('Role.roleEnum', () => {
    it('有効なロール値を受け入れる', () => {
      const validRoles = ['admin', 'captain', 'vice-captain', 'treasurer', 'member']
      validRoles.forEach((role) => {
        const result = Role.roleEnum(role)
        expect(result).not.toBeInstanceOf(ArkErrors)
        expect(result).toBe(role)
      })
    })

    it('無効なロール値を拒否する', () => {
      const invalidRoles = ['invalid', 'ADMIN', 'user', 123, null, undefined, '', 'admin ', ' admin']
      invalidRoles.forEach((role) => {
        const result = Role.roleEnum(role)
        expect(result).toBeInstanceOf(ArkErrors)
      })
    })
  })

  // ============================================
  // AccountMetadata スキーマ テスト
  // ============================================
  describe('AccountMetadata', () => {
    it('有効なアカウントメタデータを受け入れる', () => {
      const validData = [
        {
          role: 'admin',
          grade: 3,
          getGradeAt: '2024-01-01',
          joinedAt: 2024,
          year: 'b1',
        },
        {
          role: 'member',
          grade: -5,
          getGradeAt: null,
          joinedAt: 2023,
          year: 'm2',
        },
        {
          role: 'captain',
          grade: 0,
          getGradeAt: '',
          joinedAt: 9999,
          year: 'd1',
        },
      ]

      validData.forEach((data) => {
        const result = AccountMetadata(data)
        expect(result).not.toBeInstanceOf(ArkErrors)
      })
    })

    it('無効なアカウントメタデータを拒否する', () => {
      const invalidData = [
        {
          role: 'admin',
          grade: 6, // -5 to 5 の範囲外
          getGradeAt: '2024-01-01',
          joinedAt: 2024,
          year: 'b1',
        },
        {
          role: 'admin',
          grade: 3,
          getGradeAt: '24-01-01', // 不正な日付フォーマット
          joinedAt: 2024,
          year: 'b1',
        },
        {
          role: 'admin',
          grade: 3,
          getGradeAt: '2024-01-01',
          joinedAt: 1999, // 2020未満
          year: 'b1',
        },
        {
          role: 'admin',
          grade: 3,
          getGradeAt: '2024-01-01',
          joinedAt: '2024',
          year: 'c1', // 無効な学年
        },
      ]

      invalidData.forEach((data) => {
        const result = AccountMetadata(data)
        expect(result).toBeInstanceOf(ArkErrors)
      })
    })
  })

  // ============================================
  // AccountInfo スキーマ テスト
  // ============================================
  describe('AccountInfo', () => {
    it('有効なアカウント情報を受け入れる', () => {
      // profileImage は File オブジェクトまたは undefined を受け入れる
      const mockFile = new File([''], 'test.png', { type: 'image/png' })

      const validData = [
        {
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          profileImage: mockFile,
        },
        { lastName: 'Doe' },
        {
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          profileImage: { some: 'object' },
        },
      ]

      validData.forEach((data) => {
        const result = AccountInfo(data)
        expect(result).not.toBeInstanceOf(ArkErrors)
      })
    })

    it('無効なアカウント情報を拒否する', () => {
      const invalidData = [
        {
          firstName: 123, // stringではない
          lastName: 'Doe',
          username: 'johndoe',
          profileImage: 'image.png',
        },
      ]

      invalidData.forEach((data) => {
        const result = AccountInfo(data)
        expect(result).toBeInstanceOf(ArkErrors)
      })
    })
  })

  // ============================================
  // recordQuerySchema テスト
  // ============================================
  describe('recordQuerySchema', () => {
    it('有効なレコードクエリを受け入れる', () => {
      const validData = [
        { userId: 'user_abcdefghijklmnopqrstuvwxyz1' },
        {
          userId: 'user_abcdefghijklmnopqrstuvwxyz1',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
      ]

      validData.forEach((data) => {
        const result = recordQuerySchema(data)
        expect(result).not.toBeInstanceOf(ArkErrors)
      })
    })

    it('無効なレコードクエリを拒否する', () => {
      const invalidData = [
        {
          userId: 'invalid_user_id',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
        },
        {
          userId: 'user_abcdefghijklmnopqrstuvwxy1',
          startDate: '24-01-01',
          endDate: '2024-12-31',
        },
        {
          userId: 'user_abcdefghijklmnopqrstuvwxy1',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          extraField: 'extra',
        },
      ]

      invalidData.forEach((data) => {
        const result = recordQuerySchema(data)
        expect(result).toBeInstanceOf(ArkErrors)
      })
    })
  })

  // ============================================
  // rankingQuerySchema テスト
  // ============================================
  describe('rankingQuerySchema', () => {
    it('有効なランキングクエリを受け入れる', () => {
      const validData = [
        {},
        { year: 2024 },
        { year: 2024, month: 6 },
        { year: 2024, month: 12, period: 'monthly' },
        { year: 2024, period: 'annual' },
        { year: 2024, period: 'fiscal' },
      ]

      validData.forEach((data) => {
        const result = rankingQuerySchema(data)
        expect(result).not.toBeInstanceOf(ArkErrors)
      })
    })

    it('無効なランキングクエリを拒否する', () => {
      const invalidData = [
        {
          year: 1899, // 1900未満
        },
        {
          year: 2101, // 2100より大きい
        },
        {
          month: 0, // 1未満
        },
        {
          month: 13, // 12より大きい
        },
        {
          period: 'weekly', // 無効なperiod値
        },
        {
          year: '2024', // string ではなく number
        },
        {
          month: '6', // string ではなく number
        },
      ]

      invalidData.forEach((data) => {
        const result = rankingQuerySchema(data)
        expect(result).toBeInstanceOf(ArkErrors)
      })
    })
  })

  // ============================================
  // updateAccountSchema テスト
  // ============================================
  describe('updateAccountSchema', () => {
    it('有効なアカウント更新を受け入れる', () => {
      const mockFile = new File([''], 'test.png', { type: 'image/png' })
      const validData = [
        {
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          profileImage: mockFile,
        },
        { firstName: 'John' },
        {},
      ]

      validData.forEach((data) => {
        const result = updateAccountSchema(data)
        expect(result).not.toBeInstanceOf(ArkErrors)
      })
    })

    it('無効なアカウント更新を拒否する', () => {
      const invalidData = [
        {
          firstName: 123, // stringではない
          lastName: 'Doe',
          username: 'johndoe',
          profileImage: 'image.png',
        },
      ]

      invalidData.forEach((data) => {
        const result = updateAccountSchema(data)
        expect(result).toBeInstanceOf(ArkErrors)
      })
    })
  })

  // ============================================
  // Role.parse テスト
  // ============================================
  describe('Role.parse', () => {
    it('有効なロール文字列を解析する', () => {
      expect(Role.parse('admin')?.role).toBe('admin')
      expect(Role.parse('captain')?.role).toBe('captain')
      expect(Role.parse('member')?.role).toBe('member')
    })

    it('無効なロール文字列は undefined を返す', () => {
      expect(Role.parse('invalid')).toBeUndefined()
      expect(Role.parse(123)).toBeUndefined()
    })
  })
})
