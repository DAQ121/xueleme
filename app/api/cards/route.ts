import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { toInt } from '@/lib/id-utils'
import logger from '@/lib/logger'

const POOL_SIZE = 20

type CardRow = {
  id: number
  title: string | null
  content: string
  category_id: number
  tags: any
  author: string | null
  source: string | null
  created_at: Date
}


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const visitorId = searchParams.get('visitorId') || ''
    const seed = parseInt(searchParams.get('seed') || '1')

    const categoryFilter = categoryId
      ? Prisma.sql`AND c.category_id = ${toInt(categoryId)}`
      : Prisma.empty

    const listQuery = Prisma.sql`
      SELECT
        c.id,
        c.title,
        c.content,
        c.category_id,
        c.tags,
        c.author,
        c.source,
        c.created_at
      FROM cards c
      LEFT JOIN card_impressions ci
        ON c.id = ci.card_id AND ci.visitor_id = ${visitorId}
      WHERE c.status = 'PUBLISHED'
        AND ci.id IS NULL
      ${categoryFilter}
      ORDER BY RAND(${seed})
      LIMIT ${Prisma.raw(String(POOL_SIZE))}
    `

    const [rows] = await Promise.all([
      prisma.$queryRaw<CardRow[]>(listQuery),
    ])

    const list = rows.map(row => ({
      id: String(row.id),
      categoryId: String(row.category_id),
      title: row.title ?? undefined,
      content: row.content,
      tags: Array.isArray(row.tags) ? row.tags : (row.tags ? JSON.parse(row.tags as string) : []),
      author: row.author,
      source: row.source,
      gradient: '',
      createdAt: row.created_at.toISOString(),
    }))

    return NextResponse.json({
      code: 0,
      data: { list, hasMore: rows.length === POOL_SIZE },
    })
  } catch (error: any) {
    logger.error('Error in /api/cards GET', { error: error.message })
    return NextResponse.json({ code: 500, message: '获取卡片失败' }, { status: 500 })
  }
}
