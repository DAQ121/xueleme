import cron from 'node-cron'
import { prisma } from '@/lib/prisma'
import { generateForCategory, GenerationConflictError } from '@/lib/services/generation-service'
import logger from '@/lib/logger'

const scheduledTasks = new Map<number, cron.ScheduledTask>()

export async function initCron() {
  logger.info('[cron] 初始化定时任务...')

  const categories = await prisma.categories.findMany({
    where: { isScheduled: true, isActive: true, cronExpression: { not: null } },
  })

  for (const category of categories) {
    registerTask(category.id, category.cronExpression!, category.name)
  }

  logger.info(`[cron] 已注册 ${categories.length} 个定时任务`)
}

export function registerTask(categoryId: number, cronExpression: string, name: string) {
  // 先停掉旧任务（如果有）
  stopTask(categoryId)

  if (!cron.validate(cronExpression)) {
    logger.warn(`[cron] 分类「${name}」的 cron 表达式无效: ${cronExpression}`)
    return
  }

  const task = cron.schedule(cronExpression, async () => {
    logger.info(`[cron] 触发分类「${name}」生成任务`)
    try {
      const result = await generateForCategory(categoryId)
      logger.info(`[cron] 分类「${name}」生成完成，共 ${result.generatedCount} 张`)
    } catch (error: any) {
      if (error instanceof GenerationConflictError) {
        // 多实例部署时其他实例已在运行，静默跳过
        logger.info(`[cron] 分类「${name}」已有任务在运行，跳过本次`)
      } else {
        logger.error(`[cron] 分类「${name}」生成失败`, { error: error.message })
      }
    }
  })

  scheduledTasks.set(categoryId, task)
  logger.info(`[cron] 已注册分类「${name}」定时任务: ${cronExpression}`)
}

export function stopTask(categoryId: number) {
  const existing = scheduledTasks.get(categoryId)
  if (existing) {
    existing.stop()
    scheduledTasks.delete(categoryId)
  }
}
