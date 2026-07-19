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

        <div class="form-actions">
          <button v-if="editingPreset" class="btn-secondary" @click="cancelEdit">
            取消
          </button>
          <button class="btn-primary" @click="handleSubmit">
            {{ editingPreset ? '保存修改' : '创建预设' }}
          </button>
        </div>
      </div>

      <!-- 导入/导出 -->
      <div class="io-section">
        <div class="section-header">
          <span>数据管理</span>
        </div>
        <div class="io-buttons">
          <button class="btn-io" @click="handleExport">
            📥 导出预设
          </button>
          <label class="btn-io">
            📤 导入预设
            <input
              type="file"
              accept=".json"
              @change="handleImport"
              style="display: none"
            />
          </label>
        </div>
      </div>

      <!-- 自定义预设列表 -->
      <div v-if="customPresets.length > 0" class="custom-list">
        <div class="list-header">
          <h4>我的预设</h4>
          <span class="drag-hint">拖拽可调整顺序</span>
        </div>
        <div class="preset-list">
          <div
            v-for="(preset, index) in customPresets"
            :key="preset.id"
            class="preset-item"
            :draggable="true"
            @dragstart="handleDragStart($event, index)"
            @dragover.prevent
            @drop="handleDrop($event, index)"
            @dragend="handleDragEnd"
          >
            <div class="drag-handle">⋮⋮</div>
            <div class="preset-icon">{{ preset.icon || '⭐' }}</div>
            <div class="preset-info">
              <div class="preset-name">{{ preset.name }}</div>
              <div class="preset-desc">{{ preset.description }}</div>
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
      </div>

      <!-- 空状态 -->
      <div v-if="customPresets.length === 0" class="empty-state">
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
  movePreset,
  exportCustomPresets,
  importPresetsFromFile,
} from '../constants/presets.js';
import { useToast } from '../composables/useToast.js';

const props = defineProps({
  visible: { type: Boolean, required: true },
});

const emit = defineEmits(['close', 'created', 'updated', 'deleted']);
const { success, error, warning, info } = useToast();

const customPresets = computed(() => getCustomPresets());

const editingPreset = ref(null);
const dragStartIndex = ref(null);

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
    error('输入错误', '请输入预设名称');
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
      success('更新成功', formData.name);
      resetForm();
    } else {
      error('更新失败', '请重试');
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
      success('创建成功', preset.name);
      resetForm();
    } else {
      error('创建失败', '请重试');
    }
  }
}

function confirmDelete(presetId) {
  if (confirm('确定删除这个预设吗？')) {
    if (deleteCustomPreset(presetId)) {
      emit('deleted', presetId);
      success('预设已删除');
    } else {
      error('删除失败', '请重试');
    }
  }
}

function handleExport() {
  const result = exportCustomPresets();
  if (result.success) {
    success('导出成功', `已导出 ${result.count} 个预设`);
  } else {
    error('导出失败', result.error || '未知错误');
  }
}

async function handleImport(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.name.endsWith('.json')) {
    error('格式错误', '请选择 JSON 文件');
    return;
  }

  const result = await importPresetsFromFile(file);

  if (result.success) {
    success('导入成功', `已导入 ${result.imported} 个预设，共 ${result.total} 个`);
    emit('created'); // 触发列表刷新
  } else {
    error('导入失败', result.error || '未知错误');
  }

  // 清空 input 以允许重复导入同一文件
  event.target.value = '';
}

// 拖拽排序
function handleDragStart(event, index) {
  dragStartIndex.value = index;
  event.dataTransfer.effectAllowed = 'move';
  event.target.style.opacity = '0.5';
}

function handleDrop(event, targetIndex) {
  const sourceIndex = dragStartIndex.value;

  if (sourceIndex === null || sourceIndex === targetIndex) {
    return;
  }

  if (movePreset(sourceIndex, targetIndex)) {
    success('排序已保存');
    emit('created'); // 触发列表刷新
  } else {
    error('排序失败', '请重试');
  }
}

function handleDragEnd(event) {
  event.target.style.opacity = '1';
  dragStartIndex.value = null;
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
  margin-bottom: 24px;
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

/* 导入/导出 */
.io-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
  color: #555;
}

.io-buttons {
  display: flex;
  gap: 12px;
}

.btn-io {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  border: 2px solid #2196f3;
  border-radius: 6px;
  color: #2196f3;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-io:hover {
  background: #2196f3;
  color: white;
}

/* 预设列表 */
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.list-header h4 {
  margin: 0;
  color: #333;
}

.drag-hint {
  font-size: 12px;
  color: #999;
  font-weight: normal;
}

.preset-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.preset-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  transition: all 0.2s;
  cursor: move;
}

.preset-item:hover {
  border-color: #2196f3;
  background: #f5f9ff;
}

.preset-item[draggable="true"]:active {
  opacity: 0.5;
}

.drag-handle {
  font-size: 20px;
  color: #ccc;
  cursor: move;
  user-select: none;
  line-height: 1;
}

.preset-item:hover .drag-handle {
  color: #2196f3;
}

.preset-item .preset-icon {
  font-size: 28px;
  line-height: 1;
}

.preset-info {
  flex: 1;
  min-width: 0;
}

.preset-name {
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.preset-desc {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.preset-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
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

  .io-buttons {
    flex-direction: column;
  }

  .btn-io {
    width: 100%;
  }

  .preset-item {
    flex-wrap: wrap;
  }

  .preset-actions {
    width: 100%;
    margin-top: 10px;
  }

  .preset-actions button {
    flex: 1;
  }
}
</style>
