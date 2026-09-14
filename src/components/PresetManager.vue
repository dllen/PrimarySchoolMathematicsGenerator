<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-deep/40 backdrop-blur-sm"
      @click.self="$emit('update:modelValue', false)"
    >
      <div class="bg-paper rounded-xl shadow-large w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <!-- 标题栏 -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-rule-soft flex-shrink-0">
          <h3 class="font-serif text-base font-semibold text-ink-deep">
            {{ editingPreset ? '编辑预设' : '管理预设' }}
          </h3>
          <button
            class="w-8 h-8 rounded-full bg-rule-softer text-ink-muted hover:bg-rule-soft flex items-center justify-center transition-colors"
            @click="$emit('update:modelValue', false)"
          >
            ×
          </button>
        </div>

        <!-- 内容区：桌面两栏 / 移动堆叠 -->
        <div class="flex flex-1 overflow-hidden">
          <!-- 左栏：预设列表 -->
          <div class="w-full md:w-48 lg:w-56 border-r border-rule-soft overflow-y-auto p-4 flex-shrink-0 hidden md:block">
            <div class="flex items-center justify-between mb-3">
              <p class="text-xs font-semibold text-ink-muted uppercase tracking-wide">我的预设</p>
            </div>
            <div v-if="customPresets.length === 0" class="text-center py-6">
              <p class="text-xs text-ink-faint">暂无自定义预设</p>
            </div>
            <div v-else class="space-y-2">
              <div
                v-for="preset in customPresets"
                :key="preset.id"
                class="p-3 rounded-lg border border-rule-soft hover:border-ember cursor-pointer transition-colors group"
                :class="editingPreset?.id === preset.id ? 'border-ember bg-ember/5' : ''"
                @click="startEdit(preset)"
              >
                <div class="flex items-center gap-2">
                  <span class="text-xl">{{ preset.icon || '⭐' }}</span>
                  <span class="text-sm font-medium text-ink-deep truncate">{{ preset.name }}</span>
                </div>
                <p class="text-xs text-ink-faint mt-0.5 truncate">{{ preset.description }}</p>
              </div>
            </div>
          </div>

          <!-- 右栏：编辑表单 -->
          <div class="flex-1 overflow-y-auto p-5 space-y-5">
            <!-- 移动端预设列表入口 -->
            <div class="md:hidden">
              <button
                class="w-full text-left text-sm font-medium text-ink-muted border border-rule-soft rounded-lg px-3 py-2 flex items-center justify-between"
                @click="mobileListOpen = !mobileListOpen"
              >
                <span>{{ editingPreset ? `当前：${editingPreset.name}` : '选择预设（可选）' }}</span>
                <span>{{ mobileListOpen ? '∧' : '∨' }}</span>
              </button>
              <div v-if="mobileListOpen" class="mt-2 p-3 border border-rule-soft rounded-lg space-y-2">
                <div
                  v-for="preset in customPresets"
                  :key="preset.id"
                  class="flex items-center gap-2 p-2 rounded-lg hover:bg-rule-softer cursor-pointer"
                  @click="mobileListOpen = false; startEdit(preset)"
                >
                  <span>{{ preset.icon || '⭐' }}</span>
                  <span class="text-sm text-ink-deep">{{ preset.name }}</span>
                </div>
                <p v-if="customPresets.length === 0" class="text-xs text-ink-faint text-center py-2">暂无自定义预设</p>
              </div>
            </div>

            <!-- 表单 -->
            <div class="space-y-4">
              <p class="text-sm font-semibold text-ink-deep">
                {{ editingPreset ? '编辑预设' : '创建新预设' }}
              </p>

              <div>
                <label class="block text-xs font-medium text-ink-muted mb-1.5">
                  预设名称 <span class="text-red-500">*</span>
                </label>
                <BaseInput
                  v-model="formData.name"
                  placeholder="如：乘法练习"
                  maxlength="20"
                  class="w-full"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-ink-muted mb-1.5">描述</label>
                <BaseInput
                  v-model="formData.description"
                  placeholder="如：适合 3 年级"
                  maxlength="50"
                  class="w-full"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-ink-muted mb-1.5">图标</label>
                <div class="flex items-center gap-3">
                  <BaseInput
                    v-model="formData.icon"
                    placeholder="✖️"
                    maxlength="2"
                    class="w-16 text-center text-xl"
                  />
                  <span class="text-2xl">{{ formData.icon || '⭐' }}</span>
                </div>
              </div>

              <!-- 表单操作 -->
              <div class="flex gap-2 pt-1">
                <BaseButton
                  v-if="editingPreset"
                  variant="ghost"
                  size="sm"
                  @click="cancelEdit"
                >
                  取消
                </BaseButton>
                <BaseButton
                  variant="ember"
                  size="sm"
                  class="flex-1"
                  :disabled="!formData.name.trim()"
                  @click="handleSubmit"
                >
                  {{ editingPreset ? '保存修改' : '创建预设' }}
                </BaseButton>
              </div>
            </div>

            <!-- 导入/导出 -->
            <div class="border-t border-rule-soft pt-4 space-y-3">
              <p class="text-xs font-semibold text-ink-muted uppercase tracking-wide">数据管理</p>
              <div class="flex gap-2 flex-wrap">
                <BaseButton variant="ghost" size="sm" @click="handleExport">
                  📥 导出
                </BaseButton>
                <label class="cursor-pointer">
                  <BaseButton as="span" variant="ghost" size="sm">
                    📤 导入
                  </BaseButton>
                  <input type="file" accept=".json" class="hidden" @change="handleImport" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { ref, reactive, watch, computed } from 'vue'
import { BaseButton, BaseInput } from './base'
import {
  getCustomPresets,
  saveCustomPreset,
  deleteCustomPreset,
  updateCustomPreset,
  exportCustomPresets,
  importPresetsFromFile,
} from '../constants/presets.js'
import { useToast } from '../composables/useToast.js'

export default {
  name: 'PresetManager',
  components: { BaseButton, BaseInput },
  props: {
    modelValue: { type: Boolean, required: true },
  },
  emits: ['update:modelValue', 'created', 'updated', 'deleted'],
  setup(props, { emit }) {
    const customPresets = computed(() => getCustomPresets())
    const editingPreset = ref(null)
    const mobileListOpen = ref(false)
    const { success, error } = useToast()

    const defaultForm = () => ({
      name: '',
      description: '',
      icon: '⭐',
      config: {
        grade: '3',
        semester: '上',
        problemCount: 20,
        difficulty: 'medium',
        questionTypes: ['arithmetic'],
        operations: { add: true, subtract: true, multiply: false, divide: false },
      },
    })

    const formData = reactive(defaultForm())

    watch(() => props.modelValue, (val) => {
      if (!val) {
        resetForm()
        editingPreset.value = null
      }
    })

    function resetForm() {
      Object.assign(formData, defaultForm())
    }

    function startEdit(preset) {
      editingPreset.value = preset
      Object.assign(formData, {
        name: preset.name,
        description: preset.description,
        icon: preset.icon || '⭐',
        config: { ...preset.config },
      })
    }

    function cancelEdit() {
      editingPreset.value = null
      resetForm()
    }

    function handleSubmit() {
      if (!formData.name.trim()) return
      try {
        if (editingPreset.value) {
          updateCustomPreset(editingPreset.value.id, { name: formData.name, description: formData.description, icon: formData.icon, config: formData.config })
          success('预设已更新')
          emit('updated')
        } else {
          saveCustomPreset({ name: formData.name, description: formData.description, icon: formData.icon, config: formData.config })
          success('预设已创建')
          emit('created')
        }
        resetForm()
        editingPreset.value = null
      } catch (err) {
        error('保存失败', err.message)
      }
    }

    async function handleExport() {
      try {
        const json = exportCustomPresets()
        const blob = new Blob([json], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'math-presets.json'
        a.click()
        URL.revokeObjectURL(url)
        success('导出成功')
      } catch (err) {
        error('导出失败', err.message)
      }
    }

    async function handleImport(e) {
      try {
        const file = e.target.files[0]
        if (!file) return
        await importPresetsFromFile(file)
        success('导入成功')
        emit('created')
      } catch (err) {
        error('导入失败', err.message)
      }
    }

    return {
      customPresets,
      editingPreset,
      mobileListOpen,
      formData,
      resetForm,
      startEdit,
      cancelEdit,
      handleSubmit,
      handleExport,
      handleImport,
    }
  },
}
</script>
