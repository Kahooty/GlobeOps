import { useState, useEffect } from 'react';

export function useTypewriter(text: string, speed: number): string {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (speed <= 0) return;
    setIndex(0);
  }, [text, speed]);

  useEffect(() => {
    if (speed <= 0 || index >= text.length) return;

    const timer = setTimeout(() => setIndex((i) => i + 1), speed);
    return () => clearTimeout(timer);
  }, [index, text, speed]);

  if (speed <= 0) return text;
  return text.slice(0, index);
}
