import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

// 临时硬编码管理员账号，接入数据库后从 DB 查询
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@xueleme.com'
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync('admin123', 10)

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (email !== ADMIN_EMAIL) {
    return NextResponse.json({ message: '邮箱或密码错误' }, { status: 401 })
  }

  const valid = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)
  if (!valid) {
    return NextResponse.json({ message: '邮箱或密码错误' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set('admin_token', 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7天
    path: '/',
  })

  return NextResponse.json({ message: '登录成功' })
}
