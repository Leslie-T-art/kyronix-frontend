import React from 'react';
import { MoonStarIcon, SunMediumIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../contexts/ThemeContext';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600 transition-colors',
        'hover:bg-zinc-50 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy',
        className
      )}
    >
      {isDark ? <SunMediumIcon className="h-4 w-4" /> : <MoonStarIcon className="h-4 w-4" />}
      <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  );
}
