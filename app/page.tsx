import { AppProvider } from '@/lib/app-context'
import { HomeContent } from '@/components/home-content';

export default async function HomePage() {
  return (
    <AppProvider>
      <HomeContent />
    </AppProvider>
  );
}
