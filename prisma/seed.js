const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const MOCK_CATEGORIES = [
    { id: 'cat-1', name: '编程与技术', order: 1 },
    { id: 'cat-2', name: '产品与设计', order: 2 },
    { id: 'cat-3', name: '商业与创业', order: 3 },
    { id: 'cat-4', name: '金融与经济', order: 4 },
    { id: 'cat-5', name: '科学与探索', order: 5 },
    { id: 'cat-6', name: '人文与艺术', order: 6 },
    { id: 'cat-7', name: '生活与健康', order: 7 },
    { id: 'cat-8', name: '心理与认知', order: 8 },
    { id: 'cat-9', name: '效率与工具', order: 9 },
    { id: 'cat-10', name: '未来与趋势', order: 10 },
];

const MOCK_CARDS = Array.from({ length: 300 }, (_, i) => ({
    id: `card-${i + 1}`,
    categoryId: `cat-${Math.floor(i / 30) + 1}`,
    content: `这是知识卡片 #${i + 1} 的内容。每一张卡片都包含了在特定领域里的一个简洁而深刻的知识点。`,
    author: `作者 ${Math.floor(i / 30) + 1}`,
    source: '知识来源网络',
}));

async function main() {
  console.log(`Start seeding ...`);

  // Clear old data
  await prisma.favoriteCard.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.card.deleteMany({});
  await prisma.category.deleteMany({});
  console.log('Old data cleared.');

  // Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: {
      email: 'admin@xueleme.com',
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  });
  console.log('Admin user created.');

  // Create categories
  const categoryCreations = MOCK_CATEGORIES.map(category => {
    return prisma.category.create({
      data: {
        name: category.name,
        order: category.order,
        code: category.id, // Use mock ID as code
      },
    });
  });
  const createdCategories = await Promise.all(categoryCreations);
  console.log(`${createdCategories.length} categories created.`);

  // Create a map for new category IDs
  const categoryIdMap = {};
  MOCK_CATEGORIES.forEach(mockCategory => {
      const createdCategory = createdCategories.find(c => c.name === mockCategory.name);
      if (createdCategory) {
          categoryIdMap[mockCategory.id] = createdCategory.id;
      }
  });

  // Create cards
  const cardCreations = MOCK_CARDS.map(card => {
    const newCategoryId = categoryIdMap[card.categoryId];
    if (newCategoryId) {
        return prisma.card.create({
            data: {
              categoryId: newCategoryId,
              content: card.content,
              author: card.author,
              source: card.source,
              tags: JSON.stringify(['示例']),
              likesCount: Math.floor(Math.random() * 120),
              favoritesCount: Math.floor(Math.random() * 60),
            },
          });
    }
    return null;
  }).filter(Boolean);

  await Promise.all(cardCreations);
  console.log(`${cardCreations.length} cards created.`);

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