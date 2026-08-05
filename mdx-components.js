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

export const useMDXComponents = (components) => ({
  ...docsComponents,
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
