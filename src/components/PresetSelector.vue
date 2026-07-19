<template>
  <div class="preset-selector">
    <div class="preset-header">
      <h3>⚡ 快速开始</h3>
      <div class="preset-actions">
        <button class="btn-link" @click="$emit('edit')">管理预设</button>
      </div>
    </div>

    <div class="preset-grid">
      <button
        v-for="preset in presets"
        :key="preset.id"
        class="preset-card"
        @click="$emit('apply', preset.config)"
        :title="preset.description"
      >
        <span class="preset-icon">{{ preset.icon }}</span>
        <span class="preset-name">{{ preset.name }}</span>
        <span class="preset-desc">{{ preset.description }}</span>
      </button>
    </div>

    <div v-if="showCustom" class="custom-presets">
      <div class="custom-header">
        <span>我的预设</span>
        <button class="btn-add" @click="$emit('create')">+ 新建</button>
      </div>
      <div v-if="customPresets.length === 0" class="empty-custom">
        还没有自定义预设
      </div>
      <div v-else class="preset-grid">
        <button
          v-for="preset in customPresets"
          :key="preset.id"
          class="preset-card custom"
          @click="$emit('apply', preset.config)"
          :title="preset.description"
        >
          <span class="preset-icon">{{ preset.icon || '⭐' }}</span>
          <span class="preset-name">{{ preset.name }}</span>
          <span class="preset-desc">{{ preset.description }}</span>
          <button
            class="btn-delete"
            @click.stop="$emit('delete', preset.id)"
            title="删除"
          >
            ×
          </button>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { getAllPresets, getCustomPresets } from '../constants/presets.js';

const props = defineProps({
  expanded: { type: Boolean, default: true },
});

const emit = defineEmits(['apply', 'edit', 'create', 'delete']);

const showCustom = ref(true);

const presets = getAllPresets();
const customPresets = computed(() => getCustomPresets());
</script>

<style scoped>
.preset-selector {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.preset-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.preset-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.preset-actions {
  display: flex;
  gap: 8px;
}

.btn-link {
  background: none;
  border: none;
  color: #2196f3;
  cursor: pointer;
  font-size: 14px;
  text-decoration: underline;
}

.btn-link:hover {
  color: #1976d2;
}

.preset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.preset-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.preset-card:hover {
  border-color: #2196f3;
  background: #f5f9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);
}

.preset-card:active {
  transform: translateY(0);
}

.preset-icon {
  font-size: 32px;
  line-height: 1;
}

.preset-name {
  font-weight: 600;
  color: #333;
  font-size: 15px;
  text-align: center;
}

.preset-desc {
  font-size: 12px;
  color: #666;
  text-align: center;
  line-height: 1.4;
}

.preset-card.custom {
  border-color: #ff9800;
}

.preset-card.custom:hover {
  border-color: #ff9800;
  background: #fff8e1;
}

.btn-delete {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
  border-radius: 50%;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.preset-card:hover .btn-delete {
  opacity: 1;
}

.btn-delete:hover {
  background: #f44336;
  color: white;
}

.custom-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
  color: #666;
}

.btn-add {
  padding: 6px 12px;
  border: 1px dashed #ff9800;
  background: white;
  color: #ff9800;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.btn-add:hover {
  background: #ff9800;
  color: white;
}

.empty-custom {
  text-align: center;
  color: #999;
  padding: 20px;
  font-size: 14px;
}

/* Mobile responsive */
@media (max-width: 639px) {
  .preset-selector {
    padding: 16px;
  }

  .preset-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .preset-card {
    padding: 12px 8px;
  }

  .preset-icon {
    font-size: 28px;
  }

  .preset-name {
    font-size: 14px;
  }

  .preset-desc {
    font-size: 11px;
  }
}
</style>
