export async function register() {
  // 暂时禁用 cron，避免 Prisma 模型名问题
  // 如需启用，请先修复 lib/cron.ts 中的模型名和字段名
}
