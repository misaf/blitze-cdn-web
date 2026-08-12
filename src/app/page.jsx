import Link from 'next/link'
import {
  Attest,
  CoverLinkList,
  Icon,
  btnGhost,
  btnPrimary,
  closingNote,
  cover,
  coverRuling,
  eyebrow,
  eyebrowOnCover,
  flow,
  focusInsetDark,
  grid,
  gridCell,
  h2,
  h3,
  inner,
  lede,
  principleRow,
  section,
  split,
} from '@/components/ui'
import { absoluteUrl } from '@/lib/site'

export const metadata = {
  title: 'BlitzeCDN – edge control plane',
  alternates: { canonical: absoluteUrl('/') },
  description:
    'A security-focused control plane for converging Nginx CDN edge servers. ' +
    'Python owns desired state and history; Ansible owns remote Linux state.',
}

/* Landing-page only: the deployment triptych is the sole place code panels
   appear, so this stays here rather than in the shared module.

   These panels scroll horizontally on narrow viewports. A scroll container is
   only reachable by keyboard if it is focusable, so each one is a tabbable
   named region (see the `tabIndex` and `aria-label` at the call site) and
   carries its own focus ring. */
const codeBlock =
  `overflow-x-auto border border-ink-line bg-ink px-5 py-[1.15rem] font-mono ` +
  `text-[0.8rem] leading-[1.75] text-code-fg ${focusInsetDark}`

/*
 * The hero ledger.
 *
 * This is the page's argument, not an illustration of it: each row is a real
 * constraint, written in the controller's book and independently written again
 * in the edge's book. `left` is what the controller enforces before a value can
 * reach a template; `right` is what the role re-checks against the live host.
 *
 * Every entry here corresponds to something that actually exists — the TLS path
 * confinement, the public-key-only SSH posture, the firewall's fail-closed
 * refusal — because a fabricated row would make the whole device a decoration.
 */
const entries = [
  {
    constraint: 'certificate_path',
    left: 'confined to /etc/blitzecdn/tls',
    right: 'refuses paths outside it',
  },
  {
    constraint: 'ssh_authentication',
    left: 'publickey, no password',
    right: 'verified with sshd -T',
  },
  {
    constraint: 'firewall_ssh_sources',
    left: 'must be non-empty',
    right: 'aborts rather than open',
  },
  {
    constraint: 'origin_scheme',
    left: 'typed enum, immutable',
    right: 'choices re-declared in role',
  },
  {
    constraint: 'state_version',
    left: 'emitted as 4',
    right: 'unsupported versions refused',
  },
]

/* The stack this release commits to. This occupies the slot a project with
   adopters would fill with a logo wall; the honest equivalent for a young
   project is what it actually targets. */
const stack = [
  { name: 'Nginx', note: 'The edge data plane, templated from typed state.' },
  { name: 'Ansible', note: 'Sole owner of remote Linux state, no workflow.' },
  { name: 'Debian 12+', note: 'Supported edge platform.' },
  { name: 'Ubuntu 24.04+', note: 'Supported edge platform.' },
  {
    name: 'ACME HTTP-01',
    note: 'Issued once centrally, synced to every edge.',
  },
  { name: 'OpenSSH', note: 'Host-key verification, non-root users, sudo.' },
  { name: 'UFW + Fail2Ban', note: 'Baseline host hardening on every edge.' },
  { name: 'Append-only history', note: 'Snapshots, deployments, audit trail.' },
]

const stages = [
  {
    owner: 'Python',
    title: 'Validate and pin',
    body: 'Immutable Pydantic models constrain every value before it can reach a template. What survives is pinned as a snapshot.',
    steps: ['parse desired state', 'reject invalid values', 'pin a snapshot'],
  },
  {
    owner: 'Python → Ansible',
    title: 'Plan under one lock',
    body: 'A single hold of the deployment lock covers check mode and apply, so no concurrent run can interleave with this one.',
    steps: ['take the deploy lock', 'run check mode', 'show the record'],
  },
  {
    owner: 'Ansible',
    title: 'Converge the edges',
    body: 'The roles re-check the same rules against the host, then converge it. Canonical state advances only once they succeed.',
    steps: ['re-validate on host', 'converge Nginx', 'settle or roll back'],
  },
]

const guarantees = [
  {
    title: 'One boundary, enforced twice',
    body: 'Immutable Pydantic models constrain every value that reaches an Nginx template. The Ansible roles re-check the same rules against the host, so hand-edited desired state cannot slip past.',
    points: [
      'Typed, immutable desired state',
      'Defensive re-validation on the edge',
    ],
  },
  {
    title: 'Deployments you can audit',
    body: 'Each run pins an immutable snapshot and records queued → running → settled with bounded output, alongside an append-only trail of who changed what.',
    points: ['Bounded, retained run output', 'Append-only operator audit log'],
  },
  {
    title: 'Rollback to a real state',
    body: 'Roll back to a prior successful snapshot rather than to a guess. Canonical desired state changes only after Ansible converges, under a single hold of the deployment lock.',
    points: [
      'Snapshots, not reconstructions',
      'No half-applied canonical state',
    ],
  },
]

const principles = [
  {
    name: 'Python owns state',
    body: 'Validation, desired state, deployment history, planning, rollback, audit records and process execution all live on the controller. There is exactly one place to look for what the system believes.',
    icon: <path d="M4 6h16M4 12h16M4 18h10" />,
  },
  {
    name: 'Ansible owns hosts',
    body: 'The roles exclusively own remote Linux state. They carry defensive validation but no product workflow decisions, so the two halves can never disagree about who is in charge.',
    icon: <path d="M3 5h18v5H3zM3 14h18v5H3zM7 7.5h.01M7 16.5h.01" />,
  },
  {
    name: 'Validate twice',
    body: 'Every constraint that holds on the controller is re-checked on the edge. A value that reaches an Nginx template has passed the same rules in two independent places.',
    icon: <path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z" />,
  },
  {
    name: 'Secrets go one way',
    body: 'Private keys are validated on the way in and never returned, never logged, never rendered into a plan. Certificates are issued once by the controller and distributed from there.',
    icon: <path d="M6 11V8a6 6 0 0 1 12 0v3M5 11h14v9H5z" />,
  },
  {
    name: 'Limits are deliberate',
    body: 'One controller node. Two supported distributions. The scope this release refuses is documented as carefully as the scope it accepts, because a stated boundary is easier to operate than a vague one.',
    icon: <path d="M12 3v18M3 12h18" />,
  },
]

const referenceLinks = [
  {
    href: '/docs/understand/reference/cli',
    label: 'CLI — every command and exit code',
  },
  {
    href: '/docs/understand/reference/http-api',
    label: 'HTTP API — every route and model',
  },
  {
    href: '/docs/understand/reference/configuration',
    label: 'Configuration — every BLITZE_* variable',
  },
  {
    href: '/docs/understand/reference/ansible',
    label: 'Ansible roles — every variable, typed',
  },
]

/*
 * The double-entry spread.
 *
 * Structurally a description list would be wrong — this is tabular data with
 * two headed columns and a summary row, and a screen reader user needs the
 * column association to understand that the right-hand cell is a *second,
 * independent* check rather than a restatement. So it is a real `<table>` with
 * a `<caption>`, and the visual ruling is the table's own borders.
 *
 * The `--entry` custom property drives the staggered posting animation in
 * `globals.css`; it is inline because the delay is per-row and there is no
 * utility for "the nth value of a sequence".
 */
function LedgerSpread() {
  return (
    /* Three columns of prose do not fit a phone, and collapsing them would
       destroy the point — the whole device is the two books sitting side by
       side. So it scrolls sideways instead, under the site's existing rule
       for wide tables: a scroll container is only reachable by keyboard if it
       is focusable, so it is a tabbable named region with its own focus ring.
       Same treatment as the code panels below and the docs reference tables. */
    <div
      className={`overflow-x-auto border border-ink-line bg-ink/40 backdrop-blur-[1px] ${focusInsetDark}`}
      tabIndex={0}
      role="region"
      aria-label="Desired state: every constraint as enforced by the controller and re-checked on the edge"
    >
      <table className="w-full min-w-[30rem] border-collapse text-left">
        <caption className="border-b border-ink-line px-4 py-3 text-left font-mono text-[0.68rem] font-medium tracking-head text-ink-faint uppercase">
          Desired state · snapshot a41f9c2
        </caption>
        <thead>
          <tr className="font-mono text-[0.68rem] tracking-head uppercase">
            <th
              scope="col"
              className="border-b border-ink-line px-4 py-2.5 font-medium text-ink-faint"
            >
              Constraint
            </th>
            {/* The oxblood rule between the two books is the one structural
                line in the design: left of it the controller decides, right of
                it the host re-decides. It is heavier than the horizontals
                because it carries more meaning than they do. */}
            <th
              scope="col"
              className="border-b border-l-2 spread-rule border-b-ink-line px-4 py-2.5 font-medium text-ink-fg"
            >
              Controller
            </th>
            <th
              scope="col"
              className="border-b border-ink-line px-4 py-2.5 font-medium text-ink-fg"
            >
              Edge
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, index) => (
            <tr
              key={entry.constraint}
              className="posts-in align-top"
              style={{ '--entry': index }}
            >
              <th
                scope="row"
                className="border-b border-ink-line px-4 py-3 font-mono text-[0.78rem] font-normal text-ink-fg"
              >
                {entry.constraint}
              </th>
              <td className="border-b border-l-2 spread-rule border-b-ink-line px-4 py-3 text-[0.82rem] leading-snug text-ink-muted">
                {entry.left}
              </td>
              <td className="border-b border-ink-line px-4 py-3 text-[0.82rem] leading-snug text-ink-muted">
                <span
                  className="confirms-in flex items-start gap-2"
                  style={{ '--entry': index }}
                >
                  <Attest className="text-attest-bright" />
                  <span>{entry.right}</span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          {/* The closing line of a double-entry page. It is the only place on
              the site where balance-green is used at this size, and it is
              earned: it states the property the whole architecture exists to
              produce. */}
          <tr>
            <td
              colSpan={3}
              className="px-4 py-3.5 font-mono text-[0.72rem] tracking-head uppercase"
            >
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-attest-bright">Balances</span>
                <span className="text-ink-faint">
                  5 constraints · 2 independent books · 0 disagreements
                </span>
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default function LandingPage() {
  return (
    /* `main` with Nextra's skip-target id: the theme renders "Skip to Content"
       into every page, but only emits the landmark it points at on MDX routes.
       This route is hand-built, so it has to supply both itself or the first
       control on the site's most-visited page does nothing. */
    <main
      id="nextra-skip-nav"
      className="canvas bg-surface text-fg antialiased [font-synthesis-weight:none]"
    >
      {/*
        Nextra renders this route straight into <body> with no container of its
        own — no max-width, no padding — so these sections are already
        full-bleed. Resist adding the usual `ml-[calc(50%-50vw)] w-screen`
        breakout: it overhangs by half a scrollbar width on platforms with
        classic (non-overlay) scrollbars, and buys nothing here.
      */}
      <section className={cover}>
        <div className={coverRuling} aria-hidden="true" />
        <div
          className={`relative z-10 ${inner} grid items-center gap-x-16 gap-y-14 py-[clamp(3.5rem,7vw,6.5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]`}
        >
          <div>
            <p className={eyebrowOnCover}>Edge control plane</p>
            <h1 className="font-display text-hero leading-[1.04] font-book tracking-display text-balance">
              Every rule is written down twice
            </h1>
            <p className="mt-7 max-w-[46ch] text-[1.05rem] leading-relaxed text-ink-muted">
              BlitzeCDN converges Nginx CDN edge servers from a single
              controller. Python owns validation, desired state, history and
              rollback. Ansible exclusively owns remote Linux state. Neither
              half takes the other&rsquo;s word for anything.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/docs" className={btnPrimary}>
                Read the docs
              </Link>
              <Link href="/docs/understand/reference/cli" className={btnGhost}>
                CLI reference
              </Link>
            </div>
            <p className="mt-9 font-mono text-[0.74rem] tracking-[0.06em] text-ink-faint">
              Controller: Debian 13+ / Ubuntu 24.04+ &nbsp;·&nbsp; edges: Debian
              12+ / Ubuntu 24.04+
            </p>
          </div>
          <LedgerSpread />
        </div>
      </section>

      <section className={section}>
        <div className={inner}>
          <p className={eyebrow}>Introduction</p>
          <div className={split}>
            <h2 className={h2}>What is BlitzeCDN?</h2>
            <p className={lede}>
              A deployment is three movements, and the boundary between them is
              absolute: the controller decides what should be true, Ansible
              makes it true on the host, and canonical state only advances once
              the host agrees. Nothing reaches an edge that has not been through
              both.
            </p>
          </div>
          {/* A 1px gap over a line-coloured background is what draws the
              interior rules here. */}
          <div
            className={`${flow} grid gap-px border border-line bg-line md:grid-cols-3`}
          >
            {stages.map((stage) => (
              <div
                key={stage.title}
                className="flex flex-col gap-3.5 bg-panel p-card"
              >
                <p className="font-mono text-[0.68rem] tracking-head text-rule-ink uppercase">
                  {stage.owner}
                </p>
                {/* `h3` rather than a one-off `text-xl`: these are card
                    titles, and the guarantee cards below use `text-card`. */}
                <h3 className={h3}>{stage.title}</h3>
                <p className="text-[0.9rem] leading-relaxed text-muted">
                  {stage.body}
                </p>
                <ul
                  role="list"
                  className="mt-1.5 grid gap-2 font-mono text-[0.78rem]"
                >
                  {stage.steps.map((step) => (
                    <li key={step} className="flex items-baseline gap-2.5">
                      <span className="shrink-0 text-rule-ink">→</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-flow flex justify-center">
            <Link href="/docs/understand/architecture" className={btnGhost}>
              Read the architecture
            </Link>
          </div>
        </div>
      </section>

      <section className={section}>
        <div className={inner}>
          <p className={eyebrow}>How it works</p>
          <h2 className={h2}>A BlitzeCDN deployment</h2>
          {/* Numbered because this genuinely is a sequence — you cannot plan a
              change you have not described, or converge one you have not
              planned — and the order is the thing a reader needs. */}
          <div className="mt-flow grid lg:grid-cols-3">
            {[
              {
                n: '1',
                title: 'Describe the edge',
                code: (
                  <code>
                    <span className="text-tok-key">name</span>: example-cdn
                    {'\n'}
                    <span className="text-tok-key">server_names</span>:{'\n'}
                    {'  '}-{' '}
                    <span className="text-tok-str">cdn.example.com</span>
                    {'\n'}
                    <span className="text-tok-key">origin_host</span>:{' '}
                    <span className="text-tok-str">origin.example.com</span>
                    {'\n'}
                    <span className="text-tok-key">origin_scheme</span>:{' '}
                    <span className="text-tok-str">https</span>
                    {'\n'}
                    <span className="text-tok-key">certificate_mode</span>: acme
                    {'\n'}
                    <span className="text-tok-key">cache_enabled</span>:{' '}
                    <span className="text-tok-num">true</span>
                    {'\n'}
                    <span className="text-tok-key">
                      cache_valid_success
                    </span>: <span className="text-tok-num">10m</span>
                  </code>
                ),
              },
              {
                n: '2',
                title: 'Plan the change',
                code: (
                  <code>
                    <span className="text-tok-com">$</span> blitzecdn plan{'\n'}
                    {'\n'}
                    snapshot <span className="text-tok-num">a41f9c2</span> ·
                    check mode{'\n'}
                    {'\n'}
                    edge-1 <span className="text-tok-ok">changed</span>{' '}
                    nginx/site.conf{'\n'}
                    edge-2 <span className="text-tok-ok">changed</span>{' '}
                    nginx/site.conf{'\n'}
                    {'\n'}
                    <span className="text-tok-com">2 changed, 0 failed</span>
                  </code>
                ),
              },
              {
                n: '3',
                title: 'Converge and record',
                code: (
                  <code>
                    <span className="text-tok-com">$</span> blitzecdn deploy
                    --yes{'\n'}
                    {'\n'}
                    queued → running →{' '}
                    <span className="text-tok-ok">settled</span>
                    {'\n'}
                    {'\n'}
                    snapshot <span className="text-tok-num">a41f9c2</span> is
                    canonical{'\n'}
                    rollback target{' '}
                    <span className="text-tok-num">7bd0e14</span> kept{'\n'}
                    <span className="text-tok-com">audit: deploy by alice</span>
                  </code>
                ),
              },
            ].map((panel, index) => (
              <div
                key={panel.n}
                /* `flex flex-col` with a `flex-1` panel below: the three
                   transcripts are different lengths, and left to themselves
                   they ended at three different heights against a shared rule
                   above them, which read as a mistake rather than as data. */
                className={`flex flex-col border-t-2 border-rule pt-[1.1rem] ${
                  index > 0
                    ? 'mt-8 lg:mt-0 lg:border-l lg:border-l-line lg:pl-7'
                    : ''
                } ${index < 2 ? 'lg:pr-7' : ''}`}
              >
                {/* A heading, not a paragraph: this is the clearest
                    explanation of the product on the site, and as a `p` the
                    whole three-step walkthrough was skipped by heading
                    navigation — and left this the only `h2` on the page with
                    no `h3` beneath it. */}
                <h3 className="flex items-baseline gap-3 pb-[1.1rem] font-display text-[1.05rem] font-book">
                  <span className="font-mono text-[0.8rem] font-semibold text-rule-ink">
                    {panel.n}
                  </span>
                  {panel.title}
                </h3>
                <pre
                  className={`${codeBlock} flex-1`}
                  tabIndex={0}
                  role="region"
                  aria-label={`Step ${panel.n}: ${panel.title}`}
                >
                  {panel.code}
                </pre>
              </div>
            ))}
          </div>
          <div className="mt-flow flex justify-center">
            <Link href="/docs/understand/reference/cli" className={btnPrimary}>
              See every command
            </Link>
          </div>
        </div>
      </section>

      <section className={cover}>
        <div className={coverRuling} aria-hidden="true" />
        <div className={`relative z-10 ${inner} ${section}`}>
          <p className={eyebrowOnCover}>Operational guarantees</p>
          <h2 className={h2}>Built for the day something goes wrong</h2>
          <div className={`${flow} grid border border-ink-line lg:grid-cols-3`}>
            {guarantees.map((card, index) => (
              <div
                key={card.title}
                className={`flex flex-col ${
                  index > 0
                    ? 'border-t border-ink-line lg:border-t-0 lg:border-l'
                    : ''
                }`}
              >
                <h3 className="flex min-h-20 items-center border-b border-ink-line p-card-sm font-display text-card font-book tracking-display">
                  {card.title}
                </h3>
                <div className="flex flex-1 flex-col gap-5 p-card-sm">
                  <p className="text-[0.92rem] leading-relaxed text-ink-muted">
                    {card.body}
                  </p>
                  <ul role="list" className="grid gap-2.5 text-[0.86rem]">
                    {card.points.map((point) => (
                      <li key={point} className="flex items-start gap-2.5">
                        <Attest className="text-attest-bright" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-flow flex justify-center">
            <Link href="/docs/operate/deploy" className={btnPrimary}>
              Read the deployment guide
            </Link>
          </div>
        </div>
      </section>

      {/* The one place the stock's own ruling is allowed to show. These rows
          are literally entries in the book — one commitment per line — so the
          lines behind them are describing the content rather than decorating
          it. Everywhere else the ruling stays on the dark covers. */}
      <section className={`${section} ruled-paper`}>
        <div className={inner}>
          <p className={eyebrow}>Design principles</p>
          <h2 className={h2}>Five commitments</h2>
          <div className={flow}>
            {principles.map((principle) => (
              <div key={principle.name} className={principleRow()}>
                <h3 className="flex items-center gap-4 font-display text-principle font-book tracking-display">
                  <Icon className="size-[1.35rem] shrink-0 text-rule-ink">
                    {principle.icon}
                  </Icon>
                  {principle.name}
                </h3>
                <p className="leading-relaxed text-muted">{principle.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={section}>
        <div className={inner}>
          <p className={eyebrow}>Scope</p>
          <div className={split}>
            <h2 className={h2}>Opinionated about its stack, on purpose</h2>
            <p className={lede}>
              BlitzeCDN does not try to abstract over every edge platform. It
              targets a narrow, well-understood stack and commits to it — which
              is what makes enforcing the same rules on both the controller and
              the host tractable in the first place.
            </p>
          </div>
          <dl className={`${grid} grid-cols-2 sm:grid-cols-4`}>
            {stack.map((item) => (
              <div key={item.name} className={`${gridCell} min-h-32`}>
                <dt className="font-display text-[1.1rem] font-book tracking-display">
                  {item.name}
                </dt>
                <dd className="text-[0.85rem] leading-normal text-muted">
                  {item.note}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={cover}>
        <div className={coverRuling} aria-hidden="true" />
        <div className={`relative z-10 ${inner} ${section}`}>
          <div className="grid border border-ink-line lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-5 p-card-lg">
              <h2 className={h2}>Reference checked against reality</h2>
              <p className="leading-relaxed text-ink-muted">
                Everything under Reference is maintained in this repository and
                reviewed against the OpenAPI schema, the Typer command tree,{' '}
                <code className="font-mono text-[0.92em]">
                  Settings.from_environment
                </code>
                , and each role&rsquo;s{' '}
                <code className="font-mono text-[0.92em]">
                  argument_specs.yml
                </code>
                .
              </p>
            </div>
            <CoverLinkList links={referenceLinks} />
          </div>
        </div>
      </section>

      <div className={inner}>
        <p className={closingNote}>
          This site ships nothing to edge servers, never runs on a controller,
          and holds no credentials. See{' '}
          <Link
            href="/docs/understand/architecture"
            className="text-rule-ink underline underline-offset-2"
          >
            architecture
          </Link>{' '}
          for the limits this release deliberately accepts.
        </p>
      </div>
    </main>
  )
}
