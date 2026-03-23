import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/api-response';
import logger from '@/lib/logger';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search') || '';

    const where = {
      ...(status && status !== 'ALL' ? { status: status as any } : {}),
      ...(search ? { content: { contains: search } } : {}),
    };

    const [feedbacks, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          status: true,
          createdAt: true,
          user: { select: { id: true, phone: true, email: true } },
        },
      }),
      prisma.feedback.count({ where }),
    ]);

    return apiSuccess({ list: feedbacks, total, page, pageSize });
  } catch (error: any) {
    logger.error('Failed to fetch feedbacks', { error: error.message });
    return apiError('FETCH_FAILED', '获取反馈失败', 500);
  }
}
