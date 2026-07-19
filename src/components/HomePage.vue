<template>
  <div class="home-page">
    <div class="home-header">
      <h1>欢迎使用</h1>
      <p class="home-subtitle">小学数学题生成器</p>
    </div>

    <div class="menu-grid">
      <div class="menu-card" @click="goToQuickStart">
        <div class="menu-icon">⚡</div>
        <h2>快速开始</h2>
        <p>选择预设配置，一键生成题目</p>
        <button class="menu-btn">立即开始</button>
      </div>

      <div class="menu-card" @click="goToGenerator">
        <div class="menu-icon">📝</div>
        <h2>生成题目</h2>
        <p>自定义配置参数，生成专属练习题</p>
        <button class="menu-btn">去配置</button>
      </div>

      <div class="menu-card" @click="goToHistory">
        <div class="menu-icon">📚</div>
        <h2>查看历史</h2>
        <p>浏览之前生成的试卷记录</p>
        <button class="menu-btn">查看记录</button>
      </div>
    </div>

    <div class="home-features">
      <h3>功能特点</h3>
      <div class="feature-list">
        <div class="feature-item">
          <span class="feature-icon">✨</span>
          <span>丰富的题目类型</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🎯</span>
          <span>智能难度适配</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">📄</span>
          <span>PDF导出与打印</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">💾</span>
          <span>历史记录保存</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue';

const emit = defineEmits(['navigate']);

function goToQuickStart() {
  emit('navigate', 'quick-start');
}

function goToGenerator() {
  emit('navigate', 'generator');
}

function goToHistory() {
  emit('navigate', 'history');
}
</script>

<style scoped>
.home-page {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
}

.home-header {
  text-align: center;
  margin-bottom: 50px;
}

.home-header h1 {
  font-size: 36px;
  color: #333;
  margin: 0 0 12px 0;
  font-weight: 700;
}

.home-subtitle {
  font-size: 18px;
  color: #666;
  margin: 0;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  max-width: 1000px;
  width: 100%;
  margin-bottom: 60px;
}

.menu-card {
  background: white;
  border-radius: 16px;
  padding: 40px 30px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.menu-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 30px rgba(33, 150, 243, 0.2);
  border-color: #2196f3;
}

.menu-icon {
  font-size: 64px;
  line-height: 1;
  margin-bottom: 20px;
}

.menu-card h2 {
  font-size: 24px;
  color: #333;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.menu-card p {
  font-size: 14px;
  color: #666;
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.menu-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
}

.menu-btn:hover {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
}

.home-features {
  max-width: 800px;
  width: 100%;
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.home-features h3 {
  font-size: 20px;
  color: #333;
  margin: 0 0 24px 0;
  text-align: center;
  font-weight: 600;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  font-size: 15px;
  color: #555;
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: #e3f2fd;
  color: #1976d2;
}

.feature-icon {
  font-size: 24px;
  line-height: 1;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .menu-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 0 10px;
  }

  .menu-card {
    padding: 30px 20px;
  }

  .menu-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .menu-card h2 {
    font-size: 20px;
  }

  .home-header h1 {
    font-size: 28px;
  }

  .home-header {
    margin-bottom: 30px;
  }

  .home-features {
    padding: 20px;
  }

  .feature-list {
    grid-template-columns: 1fr;
  }
}

/* Tablet Responsive */
@media (max-width: 1024px) and (min-width: 769px) {
  .menu-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .menu-card:last-child {
    grid-column: span 2;
    max-width: 50%;
    margin: 0 auto;
  }
}
</style>
