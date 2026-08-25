'use client'

import { useEffect } from 'react'

/*
 * The half of the print treatment that CSS cannot do. `globals.css` handles
 * the rest — see the Print section there. Two jobs, both of which failed as
 * pure CSS for the same underlying reason: the state being corrected is not
 * expressed in the cascade at the point the print rules can reach it.
 *
 * 1. THE THEME. The dark variant is bound to a `.dark` CLASS (next-themes),
 *    and the theme paints with `dark:` utilities scattered over every element
 *    — `dark:text-slate-100` on headings, its own tints on callouts, details
 *    and code. A reader printing from dark mode gets near-white prose on a
 *    fill the printer drops, i.e. a blank page. Restating all of it inside
 *    `@media print` is a losing game against a precompiled theme; the first
 *    attempt here recovered the body and the code tokens and still shipped
 *    invisible headings and a solid black `<summary>` band.
 *
 *    So the class is removed for the duration of the print instead. One line,
 *    and every dark rule in the theme and in `globals.css` switches off
 *    together — including ones added later, which is the part restating
 *    colours could never promise. next-themes only rewrites the class on a
 *    state change, so nothing puts it back before `afterprint` does.
 *
 * 2. COLLAPSED SECTIONS. A closed `<details>` prints closed, and its hidden
 *    state lives in the user-agent shadow tree where no rule on the children
 *    reaches it. The pages that lean hardest on `<details>` are exactly the
 *    ones an operator prints — troubleshooting, incident response — and a
 *    printout that silently omits half a runbook is worse than no printout.
 *    Only the ones this opened are closed again afterwards;
 *    `data-print-opened` is both that record and the hook `globals.css` uses
 *    to stop the summary reading as a control on paper.
 *
 * `beforeprint` is used rather than wrapping the button's own click because it
 * also covers Cmd+P and the browser's menu, which is how most people print.
 * Safari has never fired the pair: there the button path still works, because
 * `enter()` runs before `print()` below, and Cmd+P falls back to the behaviour
 * the site had before any of this.
 */
function enter() {
  const root = document.documentElement
  if (root.classList.contains('dark')) {
    root.classList.remove('dark')
    root.dataset.printRestoreDark = ''
  }

  for (const element of document.querySelectorAll('main details:not([open])')) {
    element.setAttribute('data-print-opened', '')
    element.open = true
  }
}

function leave() {
  const root = document.documentElement
  if ('printRestoreDark' in root.dataset) {
    delete root.dataset.printRestoreDark
    root.classList.add('dark')
  }

  for (const element of document.querySelectorAll('[data-print-opened]')) {
    element.removeAttribute('data-print-opened')
    element.open = false
  }
}

export function usePrintMode() {
  useEffect(() => {
    window.addEventListener('beforeprint', enter)
    window.addEventListener('afterprint', leave)
    return () => {
      window.removeEventListener('beforeprint', enter)
      window.removeEventListener('afterprint', leave)
      leave()
    }
  }, [])
}

/*
 * The print control.
 *
 * `data-print-hide` keeps it off the paper — a button rendered into a
 * printout is a control that cannot be pressed. It carries no icon-only
 * label: the word "Print" is two characters wider than the glyph and does not
 * need to be learned.
 *
 * Set as a ledger column head — mono, small caps, wide tracking, square, with
 * the oxblood rule on hover — because that is what every other marginal
 * control in this book is set as. It is deliberately quiet: printing is a
 * thing a reader occasionally wants, not a call to action.
 */
export default function PrintButton({ label = 'Print', children }) {
  usePrintMode()

  return (
    <button
      type="button"
      data-print-hide
      onClick={() => {
        enter()
        window.print()
      }}
      className="x:focus-visible:nextra-focus inline-flex cursor-pointer items-center gap-1.5 border border-line px-2.5 py-1 font-mono text-[0.68rem] tracking-head text-muted uppercase transition-colors hover:border-rule hover:text-fg"
    >
      <svg
        viewBox="0 0 24 24"
        width="13"
        height="13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M6 9V3h12v6M6 18H4v-6h16v6h-2M8 14h8v7H8z" />
      </svg>
      {children ?? label}
    </button>
  )
}
