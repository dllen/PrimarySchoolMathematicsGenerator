<template>
  <div class="picker">
    <label>年级：</label>
    <select :value="grade" @change="onGrade">
      <option v-for="g in GRADES" :key="g" :value="g">{{ g }}年级</option>
    </select>
    <label>学期：</label>
    <select :value="semester" @change="onSemester">
      <option v-for="s in SEMESTERS" :key="s" :value="s">{{ s }}册</option>
    </select>
  </div>
</template>

<script setup>
import { GRADES, SEMESTERS } from '../../constants/options.js';

const props = defineProps({
  grade: { type: String, required: true },
  semester: { type: String, required: true },
});
const emit = defineEmits(['update:grade', 'update:semester']);

function onGrade(e) {
  emit('update:grade', e.target.value);
}
function onSemester(e) {
  emit('update:semester', e.target.value);
}
</script>

<style scoped>
.picker { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
</style>
