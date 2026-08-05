'use client'

import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

/*
 * The site's single theme control.
 *
 * It used to be a two-state light/dark toggle sitting alongside Nextra's own
 * sidebar switcher, which offers three. Two controls for one setting is a
 * consistency problem on its own, but the real bug was that a user on System
 * who pressed this could not get back: it only ever wrote 'light' or 'dark',
 * and the control that could restore System was an unlabelled listbox in the
 * sidebar footer, not visible at all on `/about` and `/contact` at narrow
 * widths. So this cycles through all three states, and Nextra's switcher is
 * turned off in `app/layout.jsx`.
 *
 * The order is System → Light → Dark → System: pressing once from the default
 * pins the theme you can currently see, which is the least surprising result.
 */
const ORDER = ['system', 'light', 'dark']

const LABEL = {
  system: 'Theme: follow system. Switch to light theme',
  light: 'Theme: light. Switch to dark theme',
  dark: 'Theme: dark. Follow system theme',
}

const ICON = {
  /* Half-filled circle: neither sun nor moon, because it is neither. */
  system: 'M12 3a9 9 0 1 0 0 18zM12 3a9 9 0 1 1 0 18',
  light:
    'M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z',
  dark: 'M20 15.2A8.5 8.5 0 0 1 8.8 4 8.5 8.5 0 1 0 20 15.2z',
}

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  /* Before hydration the stored preference is unknowable, so the button cannot
     honestly name its current state or its destination. It says what it does
     instead — announcing "Theme: dark" to someone in light mode is worse than
     being unspecific for one frame. */
  const current = mounted && ORDER.includes(theme) ? theme : 'system'
  const label = mounted ? LABEL[current] : 'Change theme'
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setTheme(next)}
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
        <path d={ICON[mounted ? current : 'system']} />
      </svg>
    </button>
  )
}
