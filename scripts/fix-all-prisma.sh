#!/bin/bash

echo "开始修复 Prisma 代码..."

# 1. 修复模型名（单数->复数，camelCase->snake_case）
find app lib -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e 's/prisma\.category\./prisma.categories./g' \
  -e 's/prisma\.card\./prisma.cards./g' \
  -e 's/prisma\.user\./prisma.users./g' \
  -e 's/prisma\.feedback\./prisma.feedbacks./g' \
  -e 's/prisma\.tag\./prisma.tags./g' \
  -e 's/prisma\.modelConfig\./prisma.model_configs./g' \
  -e 's/prisma\.generationLog\./prisma.generation_logs./g' \
  -e 's/prisma\.favoriteFolder\./prisma.favorite_folders./g' \
  -e 's/prisma\.favoriteCard\./prisma.favorite_cards./g' \
  -e 's/prisma\.userSetting\./prisma.user_settings./g' \
  -e 's/prisma\.cardImpression\./prisma.card_impressions./g' \
  {} +

echo "✓ 模型名修复完成"
