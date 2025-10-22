import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearGranularityCache,
  getSlotGranularityMinutes,
  getValidGranularityOptions,
  isValidGranularity,
  setSlotGranularityMinutes,
} from '../granularity';

describe('Granularity', () => {
  beforeEach(() => {
    clearGranularityCache();
  });

  describe('isValidGranularity', () => {
    it('should accept valid granularities', () => {
      expect(isValidGranularity(5)).toBe(true);
      expect(isValidGranularity(10)).toBe(true);
      expect(isValidGranularity(15)).toBe(true);
      expect(isValidGranularity(20)).toBe(true);
      expect(isValidGranularity(30)).toBe(true);
      expect(isValidGranularity(60)).toBe(true);
    });

    it('should reject invalid granularities', () => {
      expect(isValidGranularity(1)).toBe(false);
      expect(isValidGranularity(7)).toBe(false);
      expect(isValidGranularity(25)).toBe(false);
      expect(isValidGranularity(45)).toBe(false);
      expect(isValidGranularity(70)).toBe(false);
      expect(isValidGranularity(0)).toBe(false);
      expect(isValidGranularity(-5)).toBe(false);
    });
  });

  describe('getValidGranularityOptions', () => {
    it('should return all valid options', () => {
      const options = getValidGranularityOptions();
      expect(options).toEqual([5, 10, 15, 20, 30, 60]);
    });
  });

  describe('setSlotGranularityMinutes', () => {
    it('should set valid granularity', () => {
      expect(() => setSlotGranularityMinutes('test-shop', 15)).not.toThrow();
    });

    it('should throw for invalid granularity', () => {
      expect(() => setSlotGranularityMinutes('test-shop', 25)).toThrow();
    });
  });

  describe('getSlotGranularityMinutes', () => {
    it('should return default granularity when not set', () => {
      const granularity = getSlotGranularityMinutes('test-shop');
      expect(granularity).toBe(15); // Default from .env
    });

    it('should return cached granularity', () => {
      setSlotGranularityMinutes('test-shop', 30);
      const granularity = getSlotGranularityMinutes('test-shop');
      expect(granularity).toBe(30);
    });
  });
});
