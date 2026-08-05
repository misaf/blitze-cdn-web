import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'
import {
  Callout,
  Cards,
  Details,
  FileTree,
  ImageZoom,
  Mermaid,
  Steps,
  Summary,
  Tabs,
} from 'nextra/components'

const docsComponents = getDocsMDXComponents()

/*
 * The theme renders tables as `display: block; overflow-x: auto`, which makes
 * the wide reference tables — role variables, CLI flags, domain records —
 * horizontally scrollable. A scroll container is only reachable by keyboard if
 * it is focusable, so without `tabIndex` a keyboard user cannot reach the
 * columns that overflow: on `/docs/reference/roles` that is the Default and
 * Choices columns, which is most of the value of the page.
 *
 * The same reasoning already applies to the landing page's code panels; this
 * is the docs-route half of it. Kept as a `tabIndex` on the table rather than
 * a `role="region"` wrapper so the table keeps its table semantics — a screen
 * reader still announces rows and columns.
 */
const Table = ({ className, ...props }) => (
  <docsComponents.table
    {...props}
    tabIndex={0}
    className={`focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-ink ${className ?? ''}`}
  />
)

export const useMDXComponents = (components) => ({
  ...docsComponents,
  table: Table,
  Callout,
  Cards,
  Details,
  FileTree,
  ImageZoom,
  Mermaid,
  Steps,
  Summary,
  Tabs,
  ...components,
})
