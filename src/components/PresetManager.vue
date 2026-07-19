<template>
  <div v-if="visible" class="preset-manager">
    <div class="manager-header">
      <h3>管理预设</h3>
      <button class="btn-close" @click="$emit('close')">×</button>
    </div>

    <div class="manager-content">
      <!-- 创建新预设 -->
      <div class="create-section">
        <h4>创建新预设</h4>
        <div class="form-group">
          <label>预设名称</label>
          <input
            v-model="newPreset.name"
            type="text"
            placeholder="如：乘法练习"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label>描述</label>
          <input
            v-model="newPreset.description"
            type="text"
            placeholder="如：适合 3 年级"
            class="form-input"
          />
        </div>
        <div class="form-group">
          <label>图标（Emoji）</label>
          <input
            v-model="newPreset.icon"
            type="text"
            placeholder="如：✖️"
            class="form-input"
          />
        </div>
        <button class="btn-primary" @click="createPreset">
          创建预设
        </button>
      </div>

      <!-- 自定义预设列表 -->
      <div v-if="customPresets.length > 0" class="custom-list">
        <h4>我的预设</h4>
        <div
          v-for="preset in customPresets"
          :key="preset.id"
          class="preset-item"
        >
          <div class="preset-info">
            <span class="preset-icon">{{ preset.icon || '⭐' }}</span>
            <div class="preset-details">
              <div class="preset-name">{{ preset.name }}</div>
              <div class="preset-desc">{{ preset.description }}</div>
            </div>
          </div>
          <div class="preset-actions">
            <button class="btn-secondary-sm" @click="editPreset(preset)">
              编辑
            </button>
            <button class="btn-danger-sm" @click="confirmDelete(preset.id)">
              删除
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="customPresets.length === 0" class="empty-state">
        还没有自定义预设，点击上方"创建预设"开始
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { getCustomPresets, saveCustomPreset, deleteCustomPreset } from '../constants/presets.js';

const props = defineProps({
  visible: { type: Boolean, required: true },
});

const emit = defineEmits(['close', 'created', 'deleted']);

const customPresets = computed(() => getCustomPresets());

const newPreset = ref({
  name: '',
  description: '',
  icon: '⭐',
  config: {},
});

function createPreset() {
  if (!newPreset.value.name.trim()) {
    alert('请输入预设名称');
    return;
  }

  const preset = {
    id: `custom-${Date.now()}`,
    ...newPreset.value,
    config: JSON.parse(JSON.stringify(newPreset.value.config)),
  };

  if (saveCustomPreset(preset)) {
    emit('created', preset);
    // Reset form
    newPreset.value = {
      name: '',
      description: '',
      icon: '⭐',
      config: {},
    };
  }
}

function editPreset(preset) {
  // TODO: Implement edit functionality
  alert('编辑功能开发中...');
}

function confirmDelete(presetId) {
  if (confirm('确定删除这个预设吗？')) {
    if (deleteCustomPreset(presetId)) {
      emit('deleted', presetId);
    }
  }
}
</script>

<style scoped>
.preset-manager {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.manager-header h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  cursor: pointer;
  font-size: 24px;
  line-height: 1;
  color: #666;
}

.btn-close:hover {
  background: #e0e0e0;
}

.manager-content {
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
}

.create-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.create-section h4 {
  margin: 0 0 16px 0;
  color: #333;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #2196f3;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #1976d2;
}

.custom-list h4 {
  margin: 0 0 16px 0;
  color: #333;
}

.preset-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
  transition: all 0.2s;
}

.preset-item:hover {
  border-color: #2196f3;
  background: #f5f9ff;
}

.preset-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.preset-info .preset-icon {
  font-size: 32px;
  line-height: 1;
}

.preset-details {
  flex: 1;
}

.preset-details .preset-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.preset-details .preset-desc {
  font-size: 13px;
  color: #666;
}

.preset-actions {
  display: flex;
  gap: 8px;
}

.btn-secondary-sm {
  padding: 6px 12px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #333;
  cursor: pointer;
  font-size: 13px;
}

.btn-secondary-sm:hover {
  background: #e0e0e0;
}

.btn-danger-sm {
  padding: 6px 12px;
  background: #f5f5f5;
  border: 1px solid #f44336;
  border-radius: 4px;
  color: #f44336;
  cursor: pointer;
  font-size: 13px;
}

.btn-danger-sm:hover {
  background: #f44336;
  color: white;
}

.empty-state {
  text-align: center;
  color: #999;
  padding: 40px 20px;
  font-size: 14px;
}
</style>
