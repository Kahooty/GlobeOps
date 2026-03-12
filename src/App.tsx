import { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Dashboard } from '@/components/layout/Dashboard';
import { GlobalCommandLine } from '@/components/terminal/GlobalCommandLine';
import { CrtOverlay } from '@/components/terminal/CrtOverlay';
import { WelcomeModal } from '@/components/layout/WelcomeModal';
import { useAppStore } from '@/store/app-store';
import { usePulseDriver } from '@/hooks/usePulse';

export default function App() {
  const colorScheme = useAppStore((s) => s.colorScheme);

  // Global refresh pulse — invalidates all RSS queries every 15 seconds
  usePulseDriver();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorScheme);
  }, [colorScheme]);

  return (
    <div className="h-screen flex flex-col bg-terminal-bg text-terminal-primary font-mono">
      <Header />
      <Dashboard />
      <GlobalCommandLine />
      <CrtOverlay />
      <WelcomeModal />
    </div>
  );
}
