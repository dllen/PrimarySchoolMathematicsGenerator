#!/bin/bash
echo "=== 测试路由应用 ==="
echo ""

# 1. 检查文件是否存在
echo "1. 检查文件结构..."
files=(
  "src/App.vue"
  "src/main.js"
  "src/router/index.js"
  "src/views/GeneratorView.vue"
  "src/views/QuickStartView.vue"
  "src/views/HistoryView.vue"
  "src/views/HistoryDetailView.vue"
  "src/components/HomePage.vue"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (不存在)"
  fi
done

echo ""
echo "2. 检查 Node 模块..."
if [ -d "node_modules/vue-router" ]; then
  echo "  ✅ vue-router 已安装"
else
  echo "  ❌ vue-router 未安装"
fi

echo ""
echo "3. 检查 Vite 服务器..."
if curl -s http://localhost:8080 > /dev/null 2>&1; then
  echo "  ✅ Vite 服务器正在运行 (http://localhost:8080)"
else
  echo "  ⚠️  Vite 服务器未运行"
fi

echo ""
echo "4. 检查路由配置..."
if grep -q "../components/HomePage.vue" src/router/index.js; then
  echo "  ✅ 路由路径正确"
else
  echo "  ❌ 路由路径可能有误"
fi

echo ""
echo "=== 测试完成 ==="
