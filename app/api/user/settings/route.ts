import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserIdFromSession } from '@/lib/session'

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromSession()
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const settings = await prisma.userSettings.findUnique({ where: { userId } })

    const defaultSettings = {
      selectedCategories: [],
      categoryOrder: [],
      theme: 'system',
    }

    if (!settings) {
      return NextResponse.json({ code: 0, data: defaultSettings })
    }

    return NextResponse.json({
      code: 0,
      data: {
        selectedCategories: settings.selectedCategories as string[],
        categoryOrder: settings.categoryOrder as string[],
        theme: settings.theme,
      }
    })
  } catch (error) {
    console.error("Error in /api/user/settings GET:", error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const userId = await getUserIdFromSession()
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

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

    const responseData = {
      selectedCategories: settings.selectedCategories as string[],
      categoryOrder: settings.categoryOrder as string[],
      theme: settings.theme,
    }

    return NextResponse.json({ code: 0, data: responseData })
  } catch (error) {
    console.error("Error in /api/user/settings PATCH:", error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
