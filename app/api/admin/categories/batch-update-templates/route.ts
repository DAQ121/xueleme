import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const categories = await prisma.categories.findMany({
      where: { template: { not: null } },
      select: { id: true, name: true, template: true }
    })

    const updates = []

    for (const cat of categories) {
      if (!cat.template) continue

      // 更新模板，添加 title、author/source 字段说明
      let newTemplate = cat.template

      // 如果模板中包含旧格式的示例，替换为新格式
      if (newTemplate.includes('{"content":') || newTemplate.includes('"content":')) {
        // 在 JSON 格式说明前添加新字段说明
        newTemplate = newTemplate.replace(
          /(\[[\s\n]*{[\s\n]*"content")/,
          '[\n  {\n    "title": "标题（可选）",\n    "content"'
        )
        newTemplate = newTemplate.replace(
          /(,[\s\n]*"tags")/,
          ',\n    "author": "作者或来源（可选）"$1'
        )
      } else {
        // 如果没有示例格式，在末尾添加格式说明
        newTemplate += '\n\n输出格式：\n[{\n  "title": "标题（可选）",\n  "content": "内容",\n  "author": "作者或来源（可选）",\n  "tags": ["标签1", "标签2"]\n}]'
      }

      await prisma.categories.update({
        where: { id: cat.id },
        data: { template: newTemplate }
      })

      updates.push({ id: cat.id, name: cat.name })
    }

    return NextResponse.json({
      code: 0,
      message: `已更新 ${updates.length} 个分类的模板`,
      data: updates
    })
  } catch (error: any) {
    return NextResponse.json({ code: 500, message: error.message }, { status: 500 })
  }
}
