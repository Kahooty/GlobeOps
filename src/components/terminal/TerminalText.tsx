import { useTypewriter } from '@/hooks/useTypewriter';

interface TerminalTextProps {
  text: string;
  typewriter?: boolean;
  typeSpeed?: number;
  variant?: 'primary' | 'red' | 'cyan' | 'amber' | 'dim';
  prefix?: string;
  className?: string;
}

const VARIANT_CLASSES: Record<string, string> = {
  primary: 'text-terminal-primary text-glow',
  amber: 'text-terminal-amber text-glow-amber',
  red: 'text-terminal-red text-glow-red',
  cyan: 'text-terminal-cyan text-glow-cyan',
  dim: 'text-terminal-primary-dim',
};

export function TerminalText({
  text,
  typewriter = false,
  typeSpeed = 30,
  variant = 'primary',
  prefix,
  className = '',
}: TerminalTextProps) {
  const displayed = useTypewriter(text, typewriter ? typeSpeed : 0);

  return (
    <span className={`font-mono ${VARIANT_CLASSES[variant]} ${className}`}>
      {prefix && <span className="text-terminal-primary-dim">{prefix}</span>}
      {typewriter ? displayed : text}
      {typewriter && displayed.length < text.length && (
        <span className="animate-cursor-blink">{'\u2588'}</span>
      )}
    </span>
  );
}
