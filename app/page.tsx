import { AppProvider } from '@/lib/app-context'
import { getCards } from '@/lib/data';
import { HomeContent } from '@/components/home-content';
import type { KnowledgeCard } from '@/lib/types';

export default async function HomePage() {
  const allCards: KnowledgeCard[] = await getCards();

  return (
    <AppProvider>
      <HomeContent allCards={allCards} />
    </AppProvider>
  );
}
