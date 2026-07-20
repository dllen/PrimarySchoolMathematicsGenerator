#!/bin/bash

echo "🔍 验证路由功能..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试函数
test_route() {
  local path=$1
  local expected=$2
  local description=$3

  echo -n "测试: $description ... "

  response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:8080$path")

  if [ "$response" -eq 200 ]; then
    echo -e "${GREEN}✅ 通过${NC} (HTTP $response)"
    return 0
  else
    echo -e "${RED}❌ 失败${NC} (HTTP $response)"
    return 1
  fi
}

# 测试文件存在性
echo "📁 检查文件结构..."
for file in \
  "src/App.vue" \
  "src/main.js" \
  "src/router/index.js" \
  "src/views/GeneratorView.vue" \
  "src/views/QuickStartView.vue" \
  "src/views/HistoryView.vue" \
  "src/views/HistoryDetailView.vue" \
  "src/components/HomePage.vue"
do
  if [ -f "$file" ]; then
    echo -e "  ${GREEN}✅${NC} $file"
  else
    echo -e "  ${RED}❌${NC} $file (缺失)"
  fi
done

echo ""
echo "🌐 检查路由..."

# 测试首页
test_route "/" "200" "首页"

# 测试视图组件（Vue SFC 会返回 200）
test_route "/src/views/GeneratorView.vue" "200" "生成器视图"
test_route "/src/views/QuickStartView.vue" "200" "快速开始视图"
test_route "/src/views/HistoryView.vue" "200" "历史视图"
test_route "/src/views/HistoryDetailView.vue" "200" "历史详情视图"

echo ""
echo "📦 检查依赖..."

if [ -d "node_modules/vue-router" ]; then
  echo -e "  ${GREEN}✅${NC} vue-router 已安装"
  vue_router_version=$(cat node_modules/vue-router/package.json | grep '"version"' | head -1 | sed 's/.*"version": *"\([^"]*\)".*/\1/')
  echo "     版本: $vue_router_version"
else
  echo -e "  ${RED}❌${NC} vue-router 未安装"
fi

echo ""
echo "🔗 检查路由配置..."
if grep -q "path: '/'" src/router/index.js; then
  echo -e "  ${GREEN}✅${NC} 路由路径正确"
else
  echo -e "  ${RED}❌${NC} 路由路径有误"
fi

echo ""
echo "✨ 验证完成！"
echo ""
echo "💡 提示:"
echo "  - Vite 服务器运行在: http://localhost:8080"
echo "  - 访问测试页面: http://localhost:8080/test-routing.html"
echo "  - 查看诊断文档: cat TROUBLESHOOTING.md"
echo ""
