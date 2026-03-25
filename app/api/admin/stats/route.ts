import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const [totalCards, totalCategories, totalUsers, totalFeedbacks, publishedCards, pendingFeedbacks] = await Promise.all([
    prisma.cards.count(),
    prisma.categories.count(),
    prisma.users.count(),
    prisma.feedbacks.count(),
    prisma.cards.count({ where: { status: 'PUBLISHED' } }),
    prisma.feedbacks.count({ where: { status: 'PENDING' } }),
  ])

  return NextResponse.json({
    code: 0,
    data: { totalCards, totalCategories, totalUsers, totalFeedbacks, publishedCards, pendingFeedbacks },
  })
}
