import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CATEGORIES = [
  { id: 'funny', name: '搞笑', order: 0 },
  { id: 'history', name: '历史', order: 1 },
  { id: 'military', name: '军事', order: 2 },
  { id: 'science', name: '科学', order: 3 },
  { id: 'philosophy', name: '哲理', order: 4 },
  { id: 'life', name: '生活', order: 5 },
  { id: 'tech', name: '科技', order: 6 },
  { id: 'art', name: '艺术', order: 7 },
  { id: 'sports', name: '体育', order: 8 },
  { id: 'food', name: '美食', order: 9 },
]

const CARDS = [
  { id: 'funny-1', categoryId: 'funny', content: '人生苦短，及时行乐。钱没了可以再赚，头发没了就真没了。', author: '网络热梗' },
  { id: 'funny-2', categoryId: 'funny', content: '我不是在浪费时间，我是在和时间一起浪。', author: '互联网嘴替' },
  { id: 'funny-3', categoryId: 'funny', content: '生活不止眼前的苟且，还有读不懂的诗和去不了的远方。', author: '打工人语录' },
  { id: 'funny-4', categoryId: 'funny', content: '成年人的崩溃往往就在一瞬间，但成年人的自愈也是。打开外卖软件的那一刻，又是一条好汉。', author: '干饭人日记' },
  { id: 'funny-5', categoryId: 'funny', content: '我的钱包就像洋葱，每次打开都让我泪流满面。', author: '月光族' },
  { id: 'funny-6', categoryId: 'funny', content: '早起的鸟儿有虫吃，早起的虫儿被鸟吃。所以到底要不要早起？', author: '哲学家' },
  { id: 'funny-7', categoryId: 'funny', content: '我不是懒，我只是进入了节能模式。', author: '环保达人' },
  { id: 'funny-8', categoryId: 'funny', content: '减肥这件事，明天再说吧。反正明天也不会做。', author: '自知之明' },
  { id: 'funny-9', categoryId: 'funny', content: '熬夜的本质是：白天的自己和晚上的自己在抢夺对身体的控制权。', author: '夜猫子' },
  { id: 'funny-10', categoryId: 'funny', content: '世上无难事，只要肯放弃。', author: '躺平学家' },
  { id: 'history-1', categoryId: 'history', content: '以史为镜，可以知兴替；以人为镜，可以明得失。', author: '唐太宗李世民' },
  { id: 'history-2', categoryId: 'history', content: '历史是任人打扮的小姑娘。', author: '胡适' },
  { id: 'history-3', categoryId: 'history', content: '读史使人明智，读诗使人灵秀，数学使人周密，科学使人深刻。', author: '培根' },
  { id: 'history-4', categoryId: 'history', content: '秦人不暇自哀，而后人哀之；后人哀之而不鉴之，亦使后人而复哀后人也。', author: '杜牧《阿房宫赋》' },
  { id: 'history-5', categoryId: 'history', content: '滚滚长江东逝水，浪花淘尽英雄。是非成败转头空，青山依旧在，几度夕阳红。', author: '杨慎' },
  { id: 'science-1', categoryId: 'science', content: '如果你无法简单地解释一件事，说明你还没有真正理解它。', author: '爱因斯坦' },
  { id: 'science-2', categoryId: 'science', content: '科学的本质是怀疑。', author: '费曼' },
  { id: 'science-3', categoryId: 'science', content: '我没有失败，我只是发现了一万种行不通的方法。', author: '爱迪生' },
  { id: 'science-4', categoryId: 'science', content: '站在巨人的肩膀上，才能看得更远。', author: '牛顿' },
  { id: 'science-5', categoryId: 'science', content: '宇宙中最不可理解的事，就是宇宙是可以被理解的。', author: '爱因斯坦' },
  { id: 'philosophy-1', categoryId: 'philosophy', content: '我思故我在。', author: '笛卡尔' },
  { id: 'philosophy-2', categoryId: 'philosophy', content: '人是万物的尺度。', author: '普罗泰戈拉' },
  { id: 'philosophy-3', categoryId: 'philosophy', content: '知道自己无知，才是真正的智慧。', author: '苏格拉底' },
  { id: 'philosophy-4', categoryId: 'philosophy', content: '人不能两次踏入同一条河流。', author: '赫拉克利特' },
  { id: 'philosophy-5', categoryId: 'philosophy', content: '己所不欲，勿施于人。', author: '孔子' },
  { id: 'life-1', categoryId: 'life', content: '生活就像一盒巧克力，你永远不知道下一颗是什么味道。', author: '《阿甘正传》' },
  { id: 'life-2', categoryId: 'life', content: '不要等待机会，而要创造机会。', author: '林肯' },
  { id: 'life-3', categoryId: 'life', content: '生命中最重要的事情，不是你站在哪里，而是你朝哪个方向走。', author: '霍姆斯' },
  { id: 'life-4', categoryId: 'life', content: '昨天是历史，明天是谜团，今天是礼物，所以叫做"当下"。', author: '《功夫熊猫》' },
  { id: 'life-5', categoryId: 'life', content: '你若盛开，清风自来。', author: '仓央嘉措' },
  { id: 'tech-1', categoryId: 'tech', content: '任何足够先进的技术，都与魔法无异。', author: '阿瑟·克拉克' },
  { id: 'tech-2', categoryId: 'tech', content: '软件正在吞噬世界。', author: '马克·安德森' },
  { id: 'tech-3', categoryId: 'tech', content: '代码是写给人看的，顺便让机器执行。', author: '《计算机程序的构造和解释》' },
  { id: 'tech-4', categoryId: 'tech', content: '过早的优化是万恶之源。', author: '高德纳' },
  { id: 'tech-5', categoryId: 'tech', content: '简单是可靠性的前提。', author: '迪杰斯特拉' },
  { id: 'military-1', categoryId: 'military', content: '知己知彼，百战不殆。', author: '孙子' },
  { id: 'military-2', categoryId: 'military', content: '兵者，诡道也。', author: '孙子兵法' },
  { id: 'military-3', categoryId: 'military', content: '上兵伐谋，其次伐交，其次伐兵，其下攻城。', author: '孙子' },
  { id: 'military-4', categoryId: 'military', content: '不战而屈人之兵，善之善者也。', author: '孙子' },
  { id: 'military-5', categoryId: 'military', content: '胜兵先胜而后求战，败兵先战而后求胜。', author: '孙子' },
  { id: 'art-1', categoryId: 'art', content: '艺术是谎言，但它说出了真相。', author: '毕加索' },
  { id: 'art-2', categoryId: 'art', content: '美是到处都有的，对于我们的眼睛，不是缺少美，而是缺少发现。', author: '罗丹' },
  { id: 'art-3', categoryId: 'art', content: '音乐是流动的建筑，建筑是凝固的音乐。', author: '歌德' },
  { id: 'art-4', categoryId: 'art', content: '没有什么比一首好歌更能触动人心。', author: '雨果' },
  { id: 'art-5', categoryId: 'art', content: '艺术的目的是洗去日常生活的尘埃。', author: '毕加索' },
  { id: 'sports-1', categoryId: 'sports', content: '更快、更高、更强。', author: '奥林匹克格言' },
  { id: 'sports-2', categoryId: 'sports', content: '冠军不是在赛场上产生的，冠军是在日常训练中产生的。', author: '拳王阿里' },
  { id: 'sports-3', categoryId: 'sports', content: '痛苦是暂时的，放弃是永远的。', author: '兰斯·阿姆斯特朗' },
  { id: 'sports-4', categoryId: 'sports', content: '我可以接受失败，但我不能接受放弃。', author: '迈克尔·乔丹' },
  { id: 'sports-5', categoryId: 'sports', content: '每天进步1%，一年后你会进步37倍。', author: '复利效应' },
  { id: 'food-1', categoryId: 'food', content: '民以食为天。', author: '《汉书》' },
  { id: 'food-2', categoryId: 'food', content: '吃饭是一种仪式，我们通过它来纪念那些我们爱的人。', author: '《料理鼠王》' },
  { id: 'food-3', categoryId: 'food', content: '人生得意须尽欢，莫使金樽空对月。', author: '李白' },
  { id: 'food-4', categoryId: 'food', content: '世间万物，唯有美食与爱不可辜负。', author: '网络' },
  { id: 'food-5', categoryId: 'food', content: '一个人可以没有钱，但不能没有美食。', author: '美食家' },
]

async function main() {
  console.log('开始导入数据...')

  // 导入分类
  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: { name: cat.name, order: cat.order },
      create: { id: cat.id, name: cat.name, order: cat.order },
    })
    console.log(`✓ 分类: ${cat.name}`)
  }

  // 导入卡片
  console.log('\n开始导入卡片数据...')
  for (const card of CARDS) {
    await prisma.card.upsert({
      where: { id: card.id },
      update: { content: card.content, author: card.author },
      create: {
        id: card.id,
        categoryId: card.categoryId,
        content: card.content,
        author: card.author,
        status: 'PUBLISHED',
      },
    })
  }
  console.log(`✓ 导入 ${CARDS.length} 张卡片`)

  console.log('\n✅ 数据导入完成！')
}

main()
  .catch(e => {
    console.error('导入失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
