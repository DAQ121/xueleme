import { AppProvider } from '@/lib/app-context'
import { HomeContent } from '@/components/home-content';

export default function HomePage() {
  return (
    <AppProvider>
      <HomeContent />
    </AppProvider>
  );
}
