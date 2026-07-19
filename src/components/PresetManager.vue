<template>
  <div v-if="visible" class="preset-manager">
    <div class="manager-header">
      <h3>{{ editingPreset ? '编辑预设' : '管理预设' }}</h3>
      <button class="btn-close" @click="handleClose">×</button>
    </div>

    <div class="manager-content">
      <!-- 创建/编辑预设表单 -->
      <div class="form-section">
        <h4>{{ editingPreset ? '编辑预设' : '创建新预设' }}</h4>

        <div class="form-group">
          <label>预设名称 <span class="required">*</span></label>
          <input
            v-model="formData.name"
            type="text"
            placeholder="如：乘法练习"
            class="form-input"
            maxlength="20"
          />
        </div>

        <div class="form-group">
          <label>描述</label>
          <input
            v-model="formData.description"
            type="text"
            placeholder="如：适合 3 年级"
            class="form-input"
            maxlength="50"
          />
        </div>

        <div class="form-group">
          <label>图标（Emoji）</label>
          <input
            v-model="formData.icon"
            type="text"
            placeholder="如：✖️"
            class="form-input"
            maxlength="2"
          />
          <div class="icon-preview">
            <span class="preview-icon">{{ formData.icon || '⭐' }}</span>
            <span class="preview-text">预览</span>
          </div>
        </div>

        <!-- 配置编辑区 -->
        <div class="form-group">
          <label>配置</label>
          <div class="config-editor">
            <div class="config-row">
              <label>年级：</label>
              <select v-model="formData.config.grade" class="form-select">
                <option v-for="g in ['1', '2', '3', '4', '5', '6']" :key="g" :value="g">{{ g }}年级</option>
              </select>
            </div>

            <div class="config-row">
              <label>学期：</label>
              <select v-model="formData.config.semester" class="form-select">
                <option value="上">上册</option>
                <option value="下">下册</option>
              </select>
            </div>

            <div class="config-row">
              <label>题目数量：</label>
              <input
                v-model.number="formData.config.problemCount"
                type="number"
                min="10"
                max="100"
                step="10"
                class="form-input number-input"
              />
            </div>

            <div class="config-row">
              <label>难度：</label>
              <select v-model="formData.config.difficulty" class="form-select">
                <option value="easy">简单</option>
                <option value="medium">中等</option>
                <option value="hard">困难</option>
              </select>
            </div>

            <div class="config-row">
              <label>题型：</label>
              <div class="checkbox-group">
                <label v-for="type in questionTypes" :key="type.value" class="checkbox-label">
                  <input
                    type="checkbox"
                    :value="type.value"
                    v-model="formData.config.questionTypes"
                  />
                  <span>{{ type.label }}</span>
                </label>
              </div>
            </div>

            <div v-if="formData.config.questionTypes.includes('arithmetic')" class="config-row">
              <label>运算类型：</label>
              <div class="checkbox-group">
                <label v-for="op in operations" :key="op.value" class="checkbox-label">
                  <input
                    type="checkbox"
                    :value="op.value"
                    v-model="formData.config.operations[op.value]"
                  />
                  <span>{{ op.label }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button v-if="editingPreset" class="btn-secondary" @click="cancelEdit">
            取消
          </button>
          <button class="btn-primary" @click="handleSubmit">
            {{ editingPreset ? '保存修改' : '创建预设' }}
          </button>
        </div>
      </div>

      <!-- 自定义预设列表 -->
      <div v-if="!editingPreset && customPresets.length > 0" class="custom-list">
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
            <button class="btn-secondary-sm" @click="startEdit(preset)">
              编辑
            </button>
            <button class="btn-danger-sm" @click="confirmDelete(preset.id)">
              删除
            </button>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!editingPreset && customPresets.length === 0" class="empty-state">
        还没有自定义预设，点击上方"创建预设"开始
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue';
import {
  getCustomPresets,
  saveCustomPreset,
  deleteCustomPreset,
  updateCustomPreset,
} from '../constants/presets.js';

const props = defineProps({
  visible: { type: Boolean, required: true },
});

const emit = defineEmits(['close', 'created', 'updated', 'deleted']);

const customPresets = computed(() => getCustomPresets());

const editingPreset = ref(null);

const defaultFormData = {
  name: '',
  description: '',
  icon: '⭐',
  config: {
    grade: '3',
    semester: '上',
    problemCount: 20,
    difficulty: 'medium',
    questionTypes: ['arithmetic'],
    operations: {
      add: true,
      subtract: true,
      multiply: false,
      divide: false,
    },
  },
};

const formData = reactive({ ...defaultFormData });

const questionTypes = [
  { value: 'arithmetic', label: '算术题' },
  { value: 'application', label: '应用题' },
  { value: 'olympiad', label: '奥数题' },
];

const operations = [
  { value: 'add', label: '加法' },
  { value: 'subtract', label: '减法' },
  { value: 'multiply', label: '乘法' },
  { value: 'divide', label: '除法' },
];

// 当对话框关闭时重置表单
watch(() => props.visible, (newVal) => {
  if (!newVal) {
    resetForm();
  }
});

function resetForm() {
  Object.assign(formData, JSON.parse(JSON.stringify(defaultFormData)));
  editingPreset.value = null;
}

function startEdit(preset) {
  editingPreset.value = preset;

  // 深拷贝预设数据到表单
  Object.assign(formData, {
    name: preset.name,
    description: preset.description,
    icon: preset.icon || '⭐',
    config: JSON.parse(JSON.stringify(preset.config)),
  });
}

function cancelEdit() {
  resetForm();
}

function handleSubmit() {
  if (!formData.name.trim()) {
    alert('请输入预设名称');
    return;
  }

  if (editingPreset.value) {
    // 更新现有预设
    if (updateCustomPreset(editingPreset.value.id, {
      name: formData.name,
      description: formData.description,
      icon: formData.icon,
      config: formData.config,
    })) {
      emit('updated', editingPreset.value.id);
      alert('预设更新成功！');
      resetForm();
    } else {
      alert('更新失败，请重试');
    }
  } else {
    // 创建新预设
    const preset = {
      id: `custom-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      icon: formData.icon,
      config: JSON.parse(JSON.stringify(formData.config)),
    };

    if (saveCustomPreset(preset)) {
      emit('created', preset);
      alert('预设创建成功！');
      resetForm();
    } else {
      alert('创建失败，请重试');
    }
  }
}

function confirmDelete(presetId) {
  if (confirm('确定删除这个预设吗？')) {
    if (deleteCustomPreset(presetId)) {
      emit('deleted', presetId);
      alert('预设已删除');
    } else {
      alert('删除失败，请重试');
    }
  }
}

function handleClose() {
  resetForm();
  emit('close');
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

.form-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.form-section h4 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 16px;
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

.required {
  color: #f44336;
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

.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: #2196f3;
}

.number-input {
  width: 120px;
}

.icon-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  padding: 8px;
  background: #f5f5f5;
  border-radius: 4px;
}

.preview-icon {
  font-size: 24px;
}

.preview-text {
  font-size: 13px;
  color: #666;
}

.config-editor {
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.config-row {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.config-row:last-child {
  margin-bottom: 0;
}

.config-row label {
  font-weight: 600;
  color: #555;
  min-width: 80px;
}

.checkbox-group {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  font-weight: normal;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.btn-primary {
  flex: 1;
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

.btn-secondary {
  padding: 12px 24px;
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #e0e0e0;
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

/* Mobile responsive */
@media (max-width: 639px) {
  .preset-manager {
    padding: 10px;
  }

  .manager-content {
    padding: 20px;
  }

  .config-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .config-row label {
    margin-bottom: 5px;
  }

  .preset-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .preset-actions {
    width: 100%;
  }

  .preset-actions button {
    flex: 1;
  }
}
</style>
