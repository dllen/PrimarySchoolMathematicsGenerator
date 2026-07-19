import { describe, it, expect, beforeEach } from 'vitest';
import {
  builtinPresets,
  getCustomPresets,
  saveCustomPreset,
  deleteCustomPreset,
  updateCustomPreset,
  movePreset,
  exportCustomPresets,
  importCustomPresets,
  importPresetsFromFile,
  getAllPresets,
  getPresetById,
} from './presets.js';

describe('presets', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('builtinPresets', () => {
    it('should have at least 3 presets', () => {
      expect(builtinPresets.length).toBeGreaterThanOrEqual(3);
    });

    it('each preset should have required fields', () => {
      for (const preset of builtinPresets) {
        expect(preset).toHaveProperty('id');
        expect(preset).toHaveProperty('name');
        expect(preset).toHaveProperty('description');
        expect(preset).toHaveProperty('config');

        // Verify config has essential fields
        const config = preset.config;
        expect(config).toHaveProperty('problemCount');
        expect(config).toHaveProperty('grade');
        expect(config).toHaveProperty('questionTypes');
        expect(config).toHaveProperty('difficulty');
        expect(config).toHaveProperty('operations');
      }
    });

    it('preset configs should have valid problemCount', () => {
      for (const preset of builtinPresets) {
        expect(preset.config.problemCount).toBeGreaterThan(0);
        expect(preset.config.problemCount).toBeLessThanOrEqual(100);
      }
    });

    it('preset configs should have valid grade', () => {
      const validGrades = ['1', '2', '3', '4', '5', '6'];
      for (const preset of builtinPresets) {
        expect(validGrades).toContain(preset.config.grade);
      }
    });
  });

  describe('getAllPresets', () => {
    it('should return builtin presets when no custom presets', () => {
      const all = getAllPresets();
      expect(all.length).toBe(builtinPresets.length);
    });

    it('should include custom presets', () => {
      const custom = {
        id: 'custom-test',
        name: '测试预设',
        description: '测试',
        icon: '⭐',
        config: { problemCount: 10, grade: '1' },
      };
      saveCustomPreset(custom);

      const all = getAllPresets();
      expect(all.some(p => p.id === 'custom-test')).toBe(true);
    });
  });

  describe('getCustomPresets', () => {
    it('should return empty array when no custom presets', () => {
      expect(getCustomPresets()).toEqual([]);
    });

    it('should return saved custom presets', () => {
      const custom = {
        id: 'custom-1',
        name: '我的预设',
        description: '描述',
        icon: '⭐',
        config: { problemCount: 10, grade: '2' },
      };
      saveCustomPreset(custom);

      expect(getCustomPresets()).toHaveLength(1);
      expect(getCustomPresets()[0].id).toBe('custom-1');
    });
  });

  describe('saveCustomPreset', () => {
    it('should save preset to localStorage', () => {
      const custom = {
        id: 'custom-2',
        name: '预设 2',
        description: '描述 2',
        icon: '📌',
        config: { problemCount: 20 },
      };

      expect(saveCustomPreset(custom)).toBe(true);

      const saved = getCustomPresets();
      expect(saved).toHaveLength(1);
      expect(saved[0].id).toBe('custom-2');
    });
  });

  describe('deleteCustomPreset', () => {
    it('should delete preset from localStorage', () => {
      const custom = {
        id: 'custom-3',
        name: '预设 3',
        description: '描述 3',
        icon: '📌',
        config: {},
      };
      saveCustomPreset(custom);

      expect(deleteCustomPreset('custom-3')).toBe(true);
      expect(getCustomPresets()).toHaveLength(0);
    });

    it('should return false for non-existent preset', () => {
      expect(deleteCustomPreset('non-existent')).toBe(false);
    });
  });

  describe('updateCustomPreset', () => {
    it('should update preset in localStorage', () => {
      const custom = {
        id: 'custom-update',
        name: '原名称',
        description: '原描述',
        icon: '📌',
        config: { problemCount: 10, grade: '1' },
      };
      saveCustomPreset(custom);

      expect(updateCustomPreset('custom-update', {
        name: '新名称',
        description: '新描述',
      })).toBe(true);

      const updated = getCustomPresets();
      expect(updated[0].name).toBe('新名称');
      expect(updated[0].description).toBe('新描述');
      expect(updated[0].config.problemCount).toBe(10); // config 未变
    });

    it('should update preset config', () => {
      const custom = {
        id: 'custom-update-config',
        name: '测试',
        description: '描述',
        icon: '⭐',
        config: { problemCount: 10, grade: '1' },
      };
      saveCustomPreset(custom);

      expect(updateCustomPreset('custom-update-config', {
        config: { problemCount: 20, grade: '2' },
      })).toBe(true);

      const updated = getCustomPresets();
      expect(updated[0].config.problemCount).toBe(20);
      expect(updated[0].config.grade).toBe('2');
    });

    it('should return false for non-existent preset', () => {
      expect(updateCustomPreset('non-existent', { name: 'test' })).toBe(false);
    });
  });

  describe('getPresetById', () => {
    it('should find builtin preset by id', () => {
      const preset = getPresetById('mental-arithmetic');
      expect(preset).toBeDefined();
      expect(preset.name).toBe('20 题口算');
    });

    it('should find custom preset by id', () => {
      const custom = {
        id: 'custom-find',
        name: '查找测试',
        description: '描述',
        icon: '⭐',
        config: {},
      };
      saveCustomPreset(custom);

      const found = getPresetById('custom-find');
      expect(found).toBeDefined();
      expect(found.name).toBe('查找测试');
    });

    it('should return null for non-existent preset', () => {
      expect(getPresetById('non-existent')).toBeNull();
    });
  });
});
