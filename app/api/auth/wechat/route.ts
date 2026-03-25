import { NextRequest, NextResponse } from 'next/server'
import { apiResponse } from '@/lib/api-response'

const APPID = process.env.WECHAT_APPID || ''
const SECRET = process.env.WECHAT_SECRET || ''

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()

    if (!code) {
      return apiResponse.error('缺少 code 参数', 400)
    }

    // 调用微信 API 获取 openid
    const wxRes = await fetch(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${SECRET}&js_code=${code}&grant_type=authorization_code`
    )
    const wxData = await wxRes.json()

    if (wxData.errcode) {
      return apiResponse.error(`微信登录失败: ${wxData.errmsg}`, 400)
    }

    const { openid, session_key } = wxData

    // TODO: 查询或创建用户，生成 JWT token
    const token = 'mock_token_' + openid

    return apiResponse.success({
      token,
      user: { openid },
    })
  } catch (error) {
    console.error('微信登录错误:', error)
    return apiResponse.error('登录失败', 500)
  }
}
