import { NextResponse } from 'next/server'
import { generateForCategory, GenerationConflictError } from '@/lib/services/generation-service'

export async function POST(_: Request, { params }: { params: Promise<{ categoryId: string }> }) {
  try {
    const { categoryId } = await params
    const result = await generateForCategory(parseInt(categoryId, 10))
    return NextResponse.json({ code: 0, data: result })
  } catch (error: any) {
    if (error instanceof GenerationConflictError) {
      return NextResponse.json({ code: 409, message: error.message }, { status: 409 })
    }
    return NextResponse.json({ code: 500, message: error.message }, { status: 500 })
  }
}
