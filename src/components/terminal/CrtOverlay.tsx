import { useAppStore } from '@/store/app-store';

export function CrtOverlay() {
  const enabled = useAppStore((s) => s.crtEnabled);
  if (!enabled) return null;

  return <div className="crt-overlay crt-scanlines crt-vignette" />;
}
