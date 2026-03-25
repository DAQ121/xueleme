import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function maskApiKey(key: string) {
  if (key.length <= 8) return '****'
  return key.slice(0, 4) + '****' + key.slice(-4)
}

export async function GET() {
  const configs = await prisma.modelConfig.findMany({ orderBy: { createdAt: 'asc' } })
  return NextResponse.json({
    code: 0,
    data: { list: configs.map(c => ({ ...c, apiKey: maskApiKey(c.apiKey) })) },
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, baseUrl, apiKey, model, temperature, maxTokens, apiType, isDefault } = body

    if (!name || !baseUrl || !apiKey || !model) {
      return NextResponse.json({ code: 400, message: '名称、Base URL、API Key、模型名称均为必填' }, { status: 400 })
    }

    if (isDefault) {
      await prisma.modelConfig.updateMany({ data: { isDefault: false } })
    }

    const config = await prisma.modelConfig.create({
      data: { name, baseUrl, apiKey, model, temperature: temperature ?? 0.7, maxTokens: maxTokens ?? 2000, apiType: apiType ?? 'OPENAI', isDefault: isDefault ?? false },
    })

    return NextResponse.json({ code: 0, data: { ...config, apiKey: maskApiKey(config.apiKey) } }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ code: 500, message: '创建失败: ' + error.message }, { status: 500 })
  }
}
