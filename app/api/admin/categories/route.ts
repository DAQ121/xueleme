import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/api-response';
import { createCategorySchema } from '@/lib/validations';
import { getCache, setCache, clearCachePattern } from '@/lib/cache';
import logger from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const search = searchParams.get('search')?.toString();

    const cacheKey = `admin:categories:${page}:${pageSize}:${search || ''}`;
    const cached = await getCache(cacheKey);
    if (cached) return apiSuccess(cached);

    const where = search ? { name: { contains: search } } : {};

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { order: 'asc' },
        select: {
          id: true,
          name: true,
          code: true,
          template: true,
          isScheduled: true,
          cronExpression: true,
          order: true,
          isActive: true,
          createdAt: true,
          _count: { select: { cards: true } },
        },
      }),
      prisma.category.count({ where }),
    ]);

    const result = { list: categories, total, page, pageSize };
    await setCache(cacheKey, result, 60);
    return apiSuccess(result);
  } catch (error: any) {
    logger.error('Failed to fetch categories', { error: error.message });
    return apiError('FETCH_FAILED', '获取分类失败', 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createCategorySchema.parse(body);

    const category = await prisma.category.create({
      data: validated,
    });

    await clearCachePattern('admin:categories:*');
    await clearCachePattern('categories');
    logger.info('Category created', { categoryId: category.id });
    return apiSuccess(category, 201);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return apiError('DUPLICATE', '分类已存在', 409);
    }
    logger.error('Failed to create category', { error: error.message });
    if (error.name === 'ZodError') {
      return apiError('VALIDATION_ERROR', '输入数据格式错误', 400);
    }
    return apiError('CREATE_FAILED', '创建分类失败', 500);
  }
}
