import { describe, it, expect } from 'vitest'

import { translateGrade, timeForNextGrade } from '../../../share/lib/grade'

describe('share/lib/grade', () => {
  describe('translateGrade', () => {
    it('translates number grades correctly', () => {
      expect(translateGrade(0)).toBe('無級')
      expect(translateGrade(5)).toBe('五級')
      expect(translateGrade(1)).toBe('一級')
      expect(translateGrade(-1)).toBe('初段')
      expect(translateGrade(-5)).toBe('五段')
    })

    it('translates string number grades correctly', () => {
      expect(translateGrade('0')).toBe('無級')
      expect(translateGrade('5')).toBe('五級')
      expect(translateGrade('-1')).toBe('初段')
    })

    it('returns label if name is passed', () => {
      expect(translateGrade('無級')).toBe('無級')
      expect(translateGrade('初段')).toBe('初段')
    })

    it('returns "不明" for invalid inputs', () => {
      expect(translateGrade(99)).toBe('不明')
      expect(translateGrade('invalid')).toBe('不明')
      expect(translateGrade('')).toBe('不明')
      // @ts-ignore
      expect(translateGrade(null)).toBe('不明')
      // @ts-ignore
      expect(translateGrade(undefined)).toBe('不明')
    })
  })

  describe('timeForNextGrade', () => {
    it('returns correct time for each grade', () => {
      expect(timeForNextGrade(0)).toBe(40)
      expect(timeForNextGrade(5)).toBe(60)
      expect(timeForNextGrade(4)).toBe(60)
      expect(timeForNextGrade(3)).toBe(80)
      expect(timeForNextGrade(2)).toBe(80)
      expect(timeForNextGrade(1)).toBe(100)
      expect(timeForNextGrade(-1)).toBe(200)
    })

    it('handles string inputs', () => {
      expect(timeForNextGrade('0')).toBe(40)
      expect(timeForNextGrade('5')).toBe(60)
    })

    it('returns default time for unknown grades', () => {
      expect(timeForNextGrade(99)).toBe(300)
      expect(timeForNextGrade(-2)).toBe(300)
    })
  })
})
