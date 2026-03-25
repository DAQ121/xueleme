import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function maskApiKey(key: string) {
  if (key.length <= 8) return '****'
  return key.slice(0, 4) + '****' + key.slice(-4)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, baseUrl, apiKey, model, temperature, maxTokens, apiType, isDefault } = body

    if (isDefault) {
      await prisma.modelConfig.updateMany({ data: { isDefault: false } })
    }

    const data: any = { name, baseUrl, model, temperature, maxTokens, apiType, isDefault }
    if (apiKey && !apiKey.includes('****')) {
      data.apiKey = apiKey
    }

    const config = await prisma.modelConfig.update({
      where: { id: parseInt(id, 10) },
      data,
    })

    return NextResponse.json({ code: 0, data: { ...config, apiKey: maskApiKey(config.apiKey) } })
  } catch (error: any) {
    return NextResponse.json({ code: 500, message: '更新失败: ' + error.message }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.modelConfig.delete({ where: { id: parseInt(id, 10) } })
    return NextResponse.json({ code: 0, data: null })
  } catch (error: any) {
    return NextResponse.json({ code: 500, message: '删除失败: ' + error.message }, { status: 500 })
  }
}
