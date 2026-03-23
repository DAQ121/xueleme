import { PrismaClient } from '@prisma/client';
import { MOCK_CATEGORIES, MOCK_CARDS } from '../lib/mock-data.js';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Create categories
  for (const category of MOCK_CATEGORIES) {
    await prisma.category.create({
      data: {
        name: category.name,
        order: category.order,
      },
    });
  }
  console.log(`${MOCK_CATEGORIES.length} categories created.`);

  // Create cards
  const categories = await prisma.category.findMany();
  const categoryIdMap = categories.reduce((acc, cur) => {
    acc[cur.name] = cur.id;
    return acc;
  }, {} as Record<string, number>);

  for (const card of MOCK_CARDS) {
    const categoryName = MOCK_CATEGORIES.find(c => c.id === card.categoryId)?.name;
    if (categoryName) {
      const categoryId = categoryIdMap[categoryName];
      await prisma.card.create({
        data: {
          categoryId: categoryId,
          content: card.content,
          author: card.author,
          source: card.source,
          tags: JSON.stringify(['示例标签']),
          likesCount: Math.floor(Math.random() * 100),
          favoritesCount: Math.floor(Math.random() * 50),
        },
      });
    }
  }
  console.log(`${MOCK_CARDS.length} cards created.`);

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
