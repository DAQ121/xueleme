import { NextResponse } from 'next/server'

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ code: 0, data }, { status })
}

export function fail(message: string, status = 400, code?: number): NextResponse {
  return NextResponse.json({ code: code ?? status, message }, { status })
}
