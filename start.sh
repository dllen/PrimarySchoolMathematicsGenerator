#!/bin/bash

echo "🚀 小学数学题生成器 - 路由版"
echo "================================"
echo ""

# 检查 Vite 是否运行
if curl -s http://localhost:5000 > /dev/null 2>&1; then
  echo "✅ Vite 服务器正在运行"
  echo "📍 地址: http://localhost:5000"
  echo ""
  echo "可访问的页面:"
  echo "  🏠 首页:        http://localhost:5000/"
  echo "  ⚡ 快速开始:    http://localhost:5000/quick-start"
  echo "  📝 生成题目:    http://localhost:5000/generator"
  echo "  📚 历史记录:    http://localhost:5000/history"
  echo ""
  echo "打开浏览器访问上述地址即可使用"
  echo ""

elif curl -s http://localhost:8080 > /dev/null 2>&1; then
  echo "✅ Vite 服务器正在运行 (端口 8080)"
  echo "📍 地址: http://localhost:8080"
  echo ""
  echo "⚠️  注意: 默认配置是 5000 端口"
  echo "   如需使用 5000 端口，请先停止 8080 端口的服务器"
  echo ""
  echo "按任意键在浏览器中打开..."
  read -n 1
  open "http://localhost:8080"

else
  echo "❌ Vite 服务器未运行"
  echo ""
  echo "启动选项:"
  echo "  1. 使用默认端口 5000"
  echo "  2. 使用端口 8080 (推荐，如果 5000 被占用)"
  echo ""
  read -p "请选择 (1/2): " choice

  case $choice in
    1)
      echo ""
      echo "正在启动服务器 (端口 5000)..."
      npm run dev
      ;;
    2)
      echo ""
      echo "正在启动服务器 (端口 8080)..."
      npm run dev -- --port 8080
      ;;
    *)
      echo "无效选择，退出"
      exit 1
      ;;
  esac
fi
