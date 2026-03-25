import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function maskApiKey(key: string) {
  if (key.length <= 8) return '****'
  return key.slice(0, 4) + '****' + key.slice(-4)
}

export async function GET() {
  const configs = await prisma.model_configs.findMany({ orderBy: { created_at: 'asc' } })
  return NextResponse.json({
    code: 0,
    data: { list: configs.map(c => ({ ...c, api_key: maskApiKey(c.api_key) })) },
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
      await prisma.model_configs.updateMany({ data: { is_default: false } })
    }

    const config = await prisma.model_configs.create({
      data: { name, base_url: baseUrl, api_key: apiKey, model, temperature: temperature ?? 0.7, max_tokens: maxTokens ?? 2000, api_type: apiType ?? 'OPENAI', is_default: isDefault ?? false },
    })

    return NextResponse.json({ code: 0, data: { ...config, api_key: maskApiKey(config.api_key) } }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ code: 500, message: '创建失败: ' + error.message }, { status: 500 })
  }
}
