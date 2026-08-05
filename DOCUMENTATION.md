# Documentation style guide

BlitzeCDN documentation is written for operators who need to make safe changes
quickly. Write for the reader's outcome first; explain internals only when they
change an operational decision.

## Page types

- **Tutorial:** a complete learning path, such as the quick start.
- **How-to guide:** steps for one operational outcome.
- **Explanation:** architecture, boundaries, and design decisions.
- **Reference:** maintained facts about commands, configuration, APIs, and roles.

Do not mix detailed reference material into a guide. Link to the exact reference
section instead.

## Standard guide shape

Use the sections that apply, in this order:

1. A short outcome statement.
2. `Before you begin` for prerequisites and risk.
3. `Steps` or task-specific imperative headings.
4. `Verify` with a command and observable success criteria.
5. `Recover` or `Roll back` when the task changes state.
6. `Troubleshooting` with links to specific symptoms.

## Voice and mechanics

- Address the reader as **you** and use imperative verbs: “Run,” “Verify,” and
  “Replace.”
- Use present tense and short sentences. Put the consequence before the internal
  mechanism.
- Use the terms in the [public glossary](src/content/docs/glossary.mdx).
- Link the first use of a specialized term to its glossary definition. Do not
  add hover-only tooltips; the explanation must remain reachable by keyboard,
  touch, and assistive technology.
- Use `bash` for commands or scripts, `console` when showing command output,
  `yaml` for YAML, and `json` for JSON.
- Explain placeholders immediately. Use reserved example domains and addresses.
- Link to the most specific heading that answers the reader's next question.
- Never describe a destructive or security-sensitive action as “simple” or
  “just.”

## Callouts

Use callouts sparingly:

- `type="info"` for context that prevents confusion.
- `type="warning"` for outage, lockout, or partial-state risks.
- `type="error"` for credential exposure, irreversible loss, or an action that
  must not proceed.

Keep the required action inside the callout. Do not use a callout only for visual
emphasis.

## Examples and verification

Examples must match the pinned control-plane and edge versions. Show expected
output only when it is stable; use an ellipsis or label abbreviated output.
Every state-changing procedure must say how to prove it succeeded and how to
recover when it does not.

Reference pages are maintained MDX. Verify changes against the corresponding
control-plane or edge release. Each reference page must include
`verifiedAgainst` and `lastVerified` frontmatter. Review commands and exit codes,
API requests/responses/errors, configuration precedence/defaults, role
variables, the compatibility matrix, and the upgrade guide whenever a public
interface changes. Before submitting documentation changes, run:

```bash
npm run check
npm run test:e2e
```
