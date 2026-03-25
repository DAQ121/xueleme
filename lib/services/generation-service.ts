import { prisma } from '@/lib/prisma'
import logger from '@/lib/logger'

interface GeneratedCard {
  content: string
  tags?: string[]
}

export class GenerationConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GenerationConflictError'
  }
}

export async function generateForCategory(categoryId: number): Promise<{ generatedCount: number; logId: number }> {
  // 并发控制：检查 10 分钟内是否有 RUNNING 状态的同分类任务
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
  const running = await prisma.generation_logs.findFirst({
    where: { categoryId, status: 'RUNNING', createdAt: { gte: tenMinutesAgo } },
  })
  if (running) {
    throw new GenerationConflictError('该分类正在生成中，请稍后再试')
  }

  // 创建日志记录
  const log = await prisma.generation_logs.create({
    data: { categoryId, status: 'RUNNING' },
  })

  try {
    const category = await prisma.categories.findUnique({
      where: { id: categoryId },
      include: { modelConfig: true },
    })

    if (!category) throw new Error(`分类 ${categoryId} 不存在`)
    if (!category.template) throw new Error('该分类未配置生成模板')

    // 取模型配置：优先用分类绑定的，否则取默认
    let modelConfig = category.modelConfig
    if (!modelConfig) {
      modelConfig = await prisma.model_configs.findFirst({ where: { isDefault: true } })
    }
    if (!modelConfig) throw new Error('未找到可用的模型配置，请先在「模型配置」中添加并设为默认')

    await prisma.generation_logs.update({
      where: { id: log.id },
      data: { modelConfigId: modelConfig.id },
    })

    // 根据 apiType 构造请求
    const baseUrl = modelConfig.baseUrl.replace(/\/$/, '')
    let apiUrl: string
    let requestBody: object

    if (modelConfig.apiType === 'VOLC_ENGINE') {
      apiUrl = baseUrl.endsWith('/responses') ? baseUrl : `${baseUrl}/responses`
      requestBody = {
        model: modelConfig.model,
        input: [
          { role: 'user', content: [{ type: 'input_text', text: category.template }] },
        ],
      }
    } else {
      // OPENAI 兼容
      apiUrl = `${baseUrl}/v1/chat/completions`
      requestBody = {
        model: modelConfig.model,
        temperature: modelConfig.temperature,
        max_tokens: modelConfig.maxTokens,
        messages: [{ role: 'user', content: category.template }],
      }
    }

    logger.info('[generation] 发送请求到大模型 API', {
      url: apiUrl,
      model: modelConfig.model,
      prompt: category.template,
    })

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${modelConfig.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errText = await response.text()
      logger.error('[generation] 大模型 API 返回错误', { status: response.status, body: errText })
      throw new Error(`模型 API 返回错误 ${response.status}: ${errText}`)
    }

    const result = await response.json()

    // 兼容两种响应格式
    // OpenAI: result.choices[0].message.content
    // 火山引擎 Responses API: result.output[0].content[0].text
    let rawContent: string = ''
    if (result.choices?.[0]?.message?.content) {
      rawContent = result.choices[0].message.content
    } else if (Array.isArray(result.output)) {
      const outputItem = result.output.find((o: any) => o.role === 'assistant' || o.type === 'message')
      rawContent = outputItem?.content?.[0]?.text ?? ''
    }
    logger.info('[generation] 大模型 API 返回内容', { rawContent })

    // 解析 JSON 数组，兼容 markdown 代码块包裹
    const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)```/)
    const jsonStr = jsonMatch ? jsonMatch[1].trim() : rawContent.trim()

    let cards: GeneratedCard[]
    try {
      cards = JSON.parse(jsonStr)
      if (!Array.isArray(cards)) throw new Error('返回内容不是数组')
    } catch {
      throw new Error(`解析模型返回内容失败，原始内容：${rawContent.slice(0, 200)}`)
    }

    // 校验并过滤 tags（只保留分类标签池中的标签）
    const categoryTags = (category.tags as string[]) ?? []
    const validCards = cards
      .filter(c => c.content && typeof c.content === 'string' && c.content.trim())
      .map(c => ({
        categoryId,
        content: c.content.trim(),
        tags: Array.isArray(c.tags)
          ? c.tags.filter(t => categoryTags.length === 0 || categoryTags.includes(t))
          : [],
        status: 'DRAFT' as const,
      }))

    if (validCards.length === 0) throw new Error('模型未返回有效卡片内容')

    await prisma.cards.createMany({ data: validCards })

    await prisma.generation_logs.update({
      where: { id: log.id },
      data: { status: 'SUCCESS', generatedCount: validCards.length },
    })

    logger.info(`[generation] 分类 ${category.name} 生成 ${validCards.length} 张卡片`)
    return { generatedCount: validCards.length, logId: log.id }

  } catch (error: any) {
    await prisma.generation_logs.update({
      where: { id: log.id },
      data: { status: 'FAILED', errorMsg: error.message },
    })
    logger.error(`[generation] 分类 ${categoryId} 生成失败`, { error: error.message })
    throw error
  }
}
