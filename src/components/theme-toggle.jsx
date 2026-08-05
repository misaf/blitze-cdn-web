'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  const dark = mounted && resolvedTheme === 'dark'
  /* Before hydration the resolved theme is unknowable, so the button cannot
     honestly name a destination. It says what it does instead — announcing
     "Switch to dark theme" to someone already in dark mode is worse than
     being unspecific for one frame. */
  const label = !mounted
    ? 'Toggle theme'
    : dark
      ? 'Switch to light theme'
      : 'Switch to dark theme'

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      className="x:focus-visible:nextra-focus x:hover:bg-gray-200 x:dark:hover:bg-primary-100/5 flex size-8 cursor-pointer items-center justify-center rounded-md text-gray-600 transition-colors dark:text-gray-400"
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        {dark ? (
          <path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z" />
        ) : (
          <path d="M20 15.2A8.5 8.5 0 0 1 8.8 4 8.5 8.5 0 1 0 20 15.2z" />
        )}
      </svg>
    </button>
  )
}
