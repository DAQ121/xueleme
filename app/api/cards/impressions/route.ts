import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import logger from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { visitorId, cardIds } = body as { visitorId: string; cardIds: number[] }

    if (!visitorId || !Array.isArray(cardIds) || cardIds.length === 0) {
      return NextResponse.json({ code: 400, message: '参数错误' }, { status: 400 })
    }

    await prisma.cardImpression.createMany({
      data: cardIds.map(cardId => ({ visitorId, cardId: Number(cardId) })),
      skipDuplicates: true,
    })

    return NextResponse.json({ code: 0 })
  } catch (error: any) {
    logger.error('Error in /api/cards/impressions POST', { error: error.message })
    return NextResponse.json({ code: 500, message: '上报失败' }, { status: 500 })
  }
}
