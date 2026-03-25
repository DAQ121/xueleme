import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/admin/cards/batch
// Body: { action: 'publish' | 'archive' | 'delete', ids?: number[], filter?: { status: string } }
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, ids, filter } = body

    const where = ids?.length ? { id: { in: ids } } : filter?.status ? { status: filter.status as any } : undefined
    if (!where) return NextResponse.json({ message: '必须提供 ids 或 filter' }, { status: 400 })

    if (action === 'publish') {
      const result = await prisma.card.updateMany({ where, data: { status: 'PUBLISHED' } })
      return NextResponse.json({ count: result.count })
    }
    if (action === 'archive') {
      const result = await prisma.card.updateMany({ where, data: { status: 'ARCHIVED' } })
      return NextResponse.json({ count: result.count })
    }
    if (action === 'delete') {
      const result = await prisma.card.deleteMany({ where })
      return NextResponse.json({ count: result.count })
    }

    return NextResponse.json({ message: '不支持的操作' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ message: '批量操作失败: ' + error.message }, { status: 500 })
  }
}
