import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/api-response';
import { getCache, setCache, clearCachePattern } from '@/lib/cache';
import { createCardSchema } from '@/lib/validations';
import logger from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const cacheKey = `admin:cards:${page}:${pageSize}`;
    const cached = await getCache(cacheKey);
    if (cached) return apiSuccess(cached);

    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          categoryId: true,
          status: true,
          tags: true,
          author: true,
          source: true,
          likesCount: true,
          favoritesCount: true,
          createdAt: true,
          updatedAt: true,
          category: { select: { id: true, name: true, code: true } },
        },
      }),
      prisma.card.count(),
    ]);

    const list = cards.map(card => ({
      ...card,
      tags: Array.isArray(card.tags) ? card.tags : JSON.parse(card.tags as string || '[]'),
    }));

    const result = { list, total, page, pageSize };
    await setCache(cacheKey, result, 60);
    return apiSuccess(result);
  } catch (error: any) {
    logger.error('Failed to fetch cards', { error: error.message });
    return apiError('FETCH_FAILED', '获取卡片失败', 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createCardSchema.parse(body);

    const card = await prisma.card.create({
      data: {
        content: validated.content,
        categoryId: validated.categoryId,
        status: validated.status || 'DRAFT',
        tags: validated.tags || [],
        author: validated.author,
        source: validated.source,
      },
    });

    await clearCachePattern('admin:cards:*');
    await clearCachePattern('cards:*');
    logger.info('Card created', { cardId: card.id });
    return apiSuccess(card, 201);
  } catch (error: any) {
    logger.error('Failed to create card', { error: error.message });
    if (error.name === 'ZodError') {
      return apiError('VALIDATION_ERROR', '输入数据格式错误', 400);
    }
    return apiError('CREATE_FAILED', '创建卡片失败', 500);
  }
}
