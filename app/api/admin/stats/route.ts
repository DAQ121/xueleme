import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [totalCards, totalCategories, totalUsers, totalFeedbacks, publishedCards, pendingFeedbacks] = await Promise.all([
    prisma.card.count(),
    prisma.category.count(),
    prisma.user.count(),
    prisma.feedback.count(),
    prisma.card.count({ where: { status: 'PUBLISHED' } }),
    prisma.feedback.count({ where: { status: 'PENDING' } }),
  ])

  return NextResponse.json({
    code: 0,
    data: { totalCards, totalCategories, totalUsers, totalFeedbacks, publishedCards, pendingFeedbacks },
  })
}
