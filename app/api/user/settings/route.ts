import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) return NextResponse.json({ message: '缺少 userId' }, { status: 400 })

  const settings = await prisma.userSettings.findUnique({ where: { userId } })
  if (!settings) return NextResponse.json(null)

  return NextResponse.json({
    selectedCategories: settings.selectedCategories as string[],
    categoryOrder: settings.categoryOrder as string[],
    theme: settings.theme,
  })
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) return NextResponse.json({ message: '缺少 userId' }, { status: 400 })

  const body = await request.json()

  const settings = await prisma.userSettings.upsert({
    where: { userId },
    update: {
      ...(body.selectedCategories !== undefined ? { selectedCategories: body.selectedCategories } : {}),
      ...(body.categoryOrder !== undefined ? { categoryOrder: body.categoryOrder } : {}),
      ...(body.theme !== undefined ? { theme: body.theme } : {}),
    },
    create: {
      userId,
      selectedCategories: body.selectedCategories || [],
      categoryOrder: body.categoryOrder || [],
      theme: body.theme || 'system',
    },
  })

  return NextResponse.json({
    selectedCategories: settings.selectedCategories as string[],
    categoryOrder: settings.categoryOrder as string[],
    theme: settings.theme,
  })
}
