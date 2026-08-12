# Documentation style guide

How to write a page. For running the site, its layout, and what CI checks, see
[README.md](README.md).

BlitzeCDN documentation is written for operators who need to make safe changes
quickly. Write for the reader's outcome first; explain internals only when they
change an operational decision.

## Where a page goes

The documentation tree has three top-level sections, and they divide by what the
reader is doing — not by subsystem. A page about certificates exists in all
three, saying something different each time.

| Section       | Answers                               | A page here is                         |
| ------------- | ------------------------------------- | -------------------------------------- |
| `operate/`    | "How do I do this safely, right now?" | An ordered, verified procedure         |
| `understand/` | "Why does it work this way?"          | An explanation of a boundary           |
| `reference/`  | "What exactly is this flag called?"   | A lookup table, complete over readable |

Two rules follow from the split, and most review comments are one of them:

- **A procedure does not explain, and an explanation does not instruct.** If a
  runbook step needs a paragraph of rationale, the paragraph belongs in
  `understand/` and the step links to it.
- **Reference is complete, guides are selective.** Do not copy a reference table
  into a guide. Link to the most specific heading instead — reference is the only
  place allowed to enumerate every flag, and the only place checked for it.

A new page must also be listed in its directory's `_meta.js`, which is the
sidebar and the running order; `check:docs` fails on a page that is not.

## Page types

- **Tutorial:** a complete learning path, such as the first deployment.
- **How-to guide:** steps for one operational outcome.
- **Explanation:** architecture, boundaries, and design decisions.
- **Reference:** maintained facts about commands, configuration, APIs, and roles.

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
- Use the terms in the [public glossary](src/content/docs/understand/glossary.mdx).
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

Show expected output only when it is stable; use an ellipsis or label
abbreviated output. Every state-changing procedure must say how to prove it
succeeded and how to recover when it does not.

Version numbers the docs pin — a clone tag, a `--version` transcript — are
compared against the release by `check:surface`, so they cannot silently rot.
Everything else about an example is your judgement.

On the HTTP API page, tag a JSON example with the model it illustrates. The tag
applies to the fence after it:

````mdx
{/* schema: PurgeResult */}

```json
{ "purged_at": "…", "complete": true, "failed_hosts": [] }
```
````

The same tag before a `curl` block validates its `-d` payload. An example the
real model refuses to parse fails the build, which is the only thing keeping an
example worth copying.

## Keeping the reference true

Reference pages are maintained MDX. Verify them directly against the current
Typer command tree under `src/blitzecdn/cli/`, FastAPI OpenAPI document,
`Settings` model, domain models, installer scripts, playbooks, role defaults,
and argument specifications.

When a public interface or lifecycle effect changes, update the affected
reference page **and** the canonical runbook procedure in the same pull request.
A reference that is correct while the runbook still tells an operator to run the
old command is the more dangerous of the two failures.

`check:surface` catches a name added or removed on either side. It cannot tell
you that a description became wrong, that an ordering is now misleading, or that
a warning no longer applies — that judgement stays yours.

Before submitting documentation changes, run:

```bash
npm run check
npm run test:e2e
```
