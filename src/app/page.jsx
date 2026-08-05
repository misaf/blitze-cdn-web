import Link from 'next/link'
import HeroGlobe from '@/components/hero-globe'
import {
  Arrow,
  Check,
  Icon,
  band,
  bandArt,
  btnGhost,
  btnPrimary,
  eyebrow,
  grid,
  gridCell,
  h2,
  inner,
  lede,
  section,
  split
} from '@/components/ui'

export const metadata = {
  title: 'BlitzeCDN – edge control plane',
  description:
    'A security-focused control plane for converging Nginx CDN edge servers. ' +
    'Python owns desired state and history; Ansible owns remote Linux state.'
}

/* Landing-page only: the deployment triptych is the sole place code panels
   appear, so this stays here rather than in the shared module. */
const codeBlock =
  'overflow-x-auto border border-line bg-ink px-5 py-[1.15rem] font-mono ' +
  'text-[0.82rem] leading-[1.72] text-code-fg'

/* The stack this release commits to. This occupies the slot a project with
   adopters would fill with a logo wall; the honest equivalent for a young
   project is what it actually targets. */
const stack = [
  { name: 'Nginx', note: 'The edge data plane, templated from typed state.' },
  { name: 'Ansible', note: 'Sole owner of remote Linux state, no workflow.' },
  { name: 'Debian 12+', note: 'Supported edge platform.' },
  { name: 'Ubuntu 24.04+', note: 'Supported edge platform.' },
  { name: 'ACME HTTP-01', note: 'Issued once centrally, synced to every edge.' },
  { name: 'OpenSSH', note: 'Host-key verification, non-root users, sudo.' },
  { name: 'UFW + Fail2Ban', note: 'Baseline host hardening on every edge.' },
  { name: 'Append-only history', note: 'Snapshots, deployments, audit trail.' }
]

const flow = [
  {
    owner: 'Python',
    title: 'Validate and pin',
    body: 'Immutable Pydantic models constrain every value before it can reach a template. What survives is pinned as a snapshot.',
    steps: ['parse desired state', 'reject invalid values', 'pin a snapshot']
  },
  {
    owner: 'Python → Ansible',
    title: 'Plan under one lock',
    body: 'A single hold of the deployment lock covers check mode and apply, so no concurrent run can interleave with this one.',
    steps: ['take the deploy lock', 'run check mode', 'show the record']
  },
  {
    owner: 'Ansible',
    title: 'Converge the edges',
    body: 'The roles re-check the same rules against the host, then converge it. Canonical state advances only once they succeed.',
    steps: ['re-validate on host', 'converge Nginx', 'settle or roll back']
  }
]

const guarantees = [
  {
    title: 'One boundary, enforced twice',
    body: 'Immutable Pydantic models constrain every value that reaches an Nginx template. The Ansible roles re-check the same rules against the host, so hand-edited desired state cannot slip past.',
    points: [
      'Typed, immutable desired state',
      'Defensive re-validation on the edge'
    ]
  },
  {
    title: 'Deployments you can audit',
    body: 'Each run pins an immutable snapshot and records queued → running → settled with bounded output, alongside an append-only trail of who changed what.',
    points: ['Bounded, retained run output', 'Append-only operator audit log']
  },
  {
    title: 'Rollback to a real state',
    body: 'Roll back to a prior successful snapshot rather than to a guess. Canonical desired state changes only after Ansible converges, under a single hold of the deployment lock.',
    points: ['Snapshots, not reconstructions', 'No half-applied canonical state']
  }
]

const principles = [
  {
    name: 'Python owns state',
    body: 'Validation, desired state, deployment history, planning, rollback, audit records and process execution all live on the controller. There is exactly one place to look for what the system believes.',
    icon: <path d="M4 6h16M4 12h16M4 18h10" />
  },
  {
    name: 'Ansible owns hosts',
    body: 'The roles exclusively own remote Linux state. They carry defensive validation but no product workflow decisions, so the two halves can never disagree about who is in charge.',
    icon: <path d="M3 5h18v5H3zM3 14h18v5H3zM7 7.5h.01M7 16.5h.01" />
  },
  {
    name: 'Validate twice',
    body: 'Every constraint that holds on the controller is re-checked on the edge. A value that reaches an Nginx template has passed the same rules in two independent places.',
    icon: <path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z" />
  },
  {
    name: 'Secrets go one way',
    body: 'Private keys are validated on the way in and never returned, never logged, never rendered into a plan. Certificates are issued once by the controller and distributed from there.',
    icon: <path d="M6 11V8a6 6 0 0 1 12 0v3M5 11h14v9H5z" />
  },
  {
    name: 'Limits are deliberate',
    body: 'One controller node. Two supported distributions. The scope this release refuses is documented as carefully as the scope it accepts, because a stated boundary is easier to operate than a vague one.',
    icon: <path d="M12 3v18M3 12h18" />
  }
]

const referenceLinks = [
  { href: '/docs/reference/cli', label: 'CLI — every command and exit code' },
  { href: '/docs/reference/api', label: 'HTTP API — every route and model' },
  {
    href: '/docs/reference/configuration',
    label: 'Configuration — every BLITZE_* variable'
  },
  { href: '/docs/reference/roles', label: 'Ansible roles — every variable, typed' }
]

export default function LandingPage() {
  return (
    <div className="canvas bg-surface text-fg antialiased [font-synthesis-weight:none]">
      {/*
        Nextra renders this route straight into <body> with no container of its
        own — no max-width, no padding — so these sections are already
        full-bleed. Resist adding the usual `ml-[calc(50%-50vw)] w-screen`
        breakout: it overhangs by half a scrollbar width on platforms with
        classic (non-overlay) scrollbars, and buys nothing here.
      */}
      <section className="grid min-h-[min(80vh,46rem)] items-stretch bg-ink text-ink-fg lg:grid-cols-2">
        <div className="ml-auto flex w-full max-w-[calc(var(--spacing-measure)/2)] flex-col justify-center px-gutter py-[clamp(3.5rem,8vw,7rem)]">
          <h1 className="max-w-[12ch] text-hero font-book leading-[1.06] tracking-display text-balance">
            The control plane for your Nginx edge
          </h1>
          <ul className="mt-[clamp(2rem,4vw,2.75rem)] grid gap-[0.9rem]">
            {[
              'Typed desired state, enforced on both sides',
              'Auditable deployments and real rollback',
              'Certificates issued once, distributed everywhere'
            ].map(item => (
              <li
                key={item}
                className="flex items-start gap-3 text-[1.02rem] text-ink-muted"
              >
                <Check />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-[clamp(2.25rem,4vw,3rem)] flex flex-wrap gap-3.5">
            <Link href="/docs" className={btnPrimary}>
              Read the docs
            </Link>
            <Link href="/docs/reference/cli" className={btnGhost}>
              CLI reference
            </Link>
          </div>
          <p className="mt-9 font-mono text-[0.78rem] tracking-[0.04em] text-ink-faint">
            Debian 12+ / Ubuntu 24.04+ &nbsp;·&nbsp; one controller node
          </p>
        </div>
        {/* The CSS bloom is the base layer and the fallback: the WebGL globe
            mounts on top of it client-side, and simply never appears where
            WebGL is unavailable. The `after:` scrim feathers the left edge
            into the copy column and sits above both. */}
        <div
          className="hero-art relative min-h-72 after:absolute after:inset-0 after:bg-[linear-gradient(90deg,#0c0e14_0%,rgba(12,14,20,0)_22%)] after:content-['']"
          aria-hidden="true"
        >
          <HeroGlobe />
        </div>
      </section>

      <section className={section}>
        <div className={inner}>
          <div className="grid items-start gap-[clamp(1.25rem,4vw,4rem)] lg:grid-cols-2">
            <h2 className={h2}>Opinionated about its stack, on purpose</h2>
            <p className="text-[clamp(1rem,1.15vw,1.15rem)] leading-relaxed text-muted">
              BlitzeCDN does not try to abstract over every edge platform. It
              targets a narrow, well-understood stack and commits to it — which
              is what makes enforcing the same rules on both the controller and
              the host tractable in the first place.
            </p>
          </div>
          {/* Cells draw only their top and left rules and the container closes
              the outer right and bottom, so interior rules never double up. */}
          <dl className="mt-[clamp(2.5rem,5vw,4rem)] grid grid-cols-2 border-r border-b border-line sm:grid-cols-4">
            {stack.map(item => (
              <div
                key={item.name}
                className="flex min-h-34 flex-col justify-center gap-1.5 border-t border-l border-line p-[clamp(1.5rem,3vw,2.25rem)]"
              >
                <dt className="text-[1.18rem] font-medium tracking-tight">
                  {item.name}
                </dt>
                <dd className="text-[0.88rem] leading-normal text-muted">
                  {item.note}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={section}>
        <div className={inner}>
          <p className={eyebrow}>Introduction</p>
          <div className="grid items-start gap-[clamp(1.25rem,4vw,4rem)] lg:grid-cols-2">
            <h2 className={h2}>What is BlitzeCDN?</h2>
            <p className="text-[clamp(1rem,1.15vw,1.15rem)] leading-relaxed text-muted">
              BlitzeCDN converges Nginx CDN edge servers from a single
              controller. The split between its two halves is deliberate and
              absolute: Python owns validation, desired state, history, planning
              and rollback; Ansible exclusively owns remote Linux state. Nothing
              reaches an edge that has not been through both.
            </p>
          </div>
          {/* A 1px gap over a line-coloured background is what draws the
              interior rules here. */}
          <div className="mt-[clamp(2.5rem,5vw,4rem)] grid gap-px border border-line bg-line md:grid-cols-3">
            {flow.map(stage => (
              <div
                key={stage.title}
                className="flex flex-col gap-3.5 bg-surface p-[clamp(1.5rem,3vw,2.25rem)]"
              >
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-accent-ink">
                  {stage.owner}
                </p>
                <h3 className="text-xl font-book tracking-display">
                  {stage.title}
                </h3>
                <p className="text-[0.92rem] leading-relaxed text-muted">
                  {stage.body}
                </p>
                <ul className="mt-1.5 grid gap-2 font-mono text-[0.8rem]">
                  {stage.steps.map(step => (
                    <li key={step} className="flex items-baseline gap-2.5">
                      <span className="shrink-0 text-accent-ink">→</span>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-[clamp(2.5rem,5vw,4rem)] flex justify-center">
            <Link href="/docs/architecture" className={btnGhost}>
              Read the architecture
            </Link>
          </div>
        </div>
      </section>

      <section className={section}>
        <div className={inner}>
          <p className={eyebrow}>How it works</p>
          <h2 className={h2}>A BlitzeCDN deployment</h2>
          <div className="mt-[clamp(2.5rem,5vw,3.5rem)] grid lg:grid-cols-3">
            {[
              {
                n: '1',
                title: 'Describe the edge',
                code: (
                  <code>
                    <span className="text-tok-key">name</span>: example-cdn{'\n'}
                    <span className="text-tok-key">server_names</span>:{'\n'}
                    {'  '}- <span className="text-tok-str">cdn.example.com</span>
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
                    <span className="text-tok-key">cache_valid_success</span>:{' '}
                    <span className="text-tok-num">10m</span>
                  </code>
                )
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
                )
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
                )
              }
            ].map((panel, index) => (
              <div
                key={panel.n}
                className={`border-t border-line pt-[1.1rem] ${
                  index > 0 ? 'mt-8 lg:mt-0 lg:border-l lg:pl-7' : ''
                } ${index < 2 ? 'lg:pr-7' : ''}`}
              >
                <p className="flex items-center gap-2.5 pb-[1.1rem] text-[1.05rem]">
                  <span className="inline-flex size-5.5 shrink-0 items-center justify-center bg-accent font-mono text-[0.78rem] font-semibold text-accent-contrast">
                    {panel.n}
                  </span>
                  {panel.title}
                </p>
                <pre className={codeBlock}>{panel.code}</pre>
              </div>
            ))}
          </div>
          <div className="mt-[clamp(2.5rem,5vw,4rem)] flex justify-center">
            <Link href="/docs/reference/cli" className={btnPrimary}>
              See every command
            </Link>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-band text-band-fg">
        <div
          className="band-art pointer-events-none absolute right-0 bottom-0 h-full w-[min(30%,26rem)]"
          aria-hidden="true"
        />
        <div className={`relative z-10 ${inner} ${section}`}>
          <p className={`${eyebrow} text-accent`}>Operational guarantees</p>
          <h2 className={h2}>Built for the day something goes wrong</h2>
          <div className="mt-[clamp(2.5rem,5vw,3.5rem)] grid border border-band-line lg:grid-cols-3">
            {guarantees.map((card, index) => (
              <div
                key={card.title}
                className={`flex flex-col ${
                  index > 0
                    ? 'border-t border-band-line lg:border-t-0 lg:border-l'
                    : ''
                }`}
              >
                <h3 className="flex min-h-22 items-center border-b border-band-line p-[clamp(1.25rem,2.5vw,1.75rem)] text-card font-book tracking-display">
                  {card.title}
                </h3>
                <div className="flex flex-1 flex-col gap-5 p-[clamp(1.25rem,2.5vw,1.75rem)]">
                  <p className="text-[0.95rem] leading-relaxed text-band-muted">
                    {card.body}
                  </p>
                  <ul className="grid gap-2.5 text-[0.88rem]">
                    {card.points.map(point => (
                      <li key={point} className="flex items-start gap-2.5">
                        <Check />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-[clamp(2.5rem,5vw,4rem)] flex justify-center">
            <Link href="/docs/operations" className={btnPrimary}>
              Read the operations guide
            </Link>
          </div>
        </div>
      </section>

      <section className={section}>
        <div className={inner}>
          <p className={eyebrow}>Design principles</p>
          <h2 className={h2}>Five commitments</h2>
          <div className="mt-[clamp(2.5rem,5vw,4rem)]">
            {principles.map(principle => (
              <div
                key={principle.name}
                className="grid items-start gap-x-8 gap-y-3 border-t border-line py-[clamp(1.75rem,3vw,2.5rem)] last:border-b md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]"
              >
                <h3 className="flex items-center gap-4 text-principle font-book tracking-display">
                  <svg
                    className="size-[1.4rem] shrink-0 text-accent-ink"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="square"
                    aria-hidden="true"
                  >
                    {principle.icon}
                  </svg>
                  {principle.name}
                </h3>
                <p className="leading-relaxed text-muted">{principle.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-band text-band-fg">
        <div
          className="band-art pointer-events-none absolute right-0 bottom-0 h-full w-[min(30%,26rem)]"
          aria-hidden="true"
        />
        <div className={`relative z-10 ${inner} ${section}`}>
          <div className="grid border border-band-line lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-5 p-[clamp(2rem,4vw,3.5rem)]">
              <h2 className={h2}>The reference writes itself</h2>
              <p className="leading-relaxed text-band-muted">
                Everything under Reference is generated from the source tree —
                the OpenAPI schema, the Typer command tree,{' '}
                <code>Settings.from_environment</code>, and each role&rsquo;s{' '}
                <code>argument_specs.yml</code>. CI fails when the committed
                output no longer matches the code, so these pages cannot quietly
                go stale.
              </p>
            </div>
            <div className="flex flex-col border-t border-band-line lg:border-t-0 lg:border-l">
              {referenceLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex flex-1 items-center justify-between gap-6 px-[clamp(1.25rem,2.5vw,2rem)] py-[clamp(1.1rem,2.2vw,1.5rem)] text-[1.05rem] no-underline transition-colors duration-100 not-first:border-t not-first:border-band-line hover:bg-white/7 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
                >
                  <span>{link.label}</span>
                  <svg
                    className="size-[1.35rem] shrink-0 text-accent transition-transform duration-150 group-hover:translate-x-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="square"
                    aria-hidden="true"
                  >
                    <path d="M4 12h15M13 6l6 6-6 6" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className={inner}>
        <p className="max-w-3xl border-t border-line py-[clamp(3rem,5vw,4.5rem)] text-[0.92rem] leading-relaxed text-muted">
          This site ships nothing to edge servers, never runs on a controller,
          and holds no credentials. See{' '}
          <Link
            href="/docs/architecture"
            className="text-accent-ink underline underline-offset-2"
          >
            architecture
          </Link>{' '}
          for the limits this release deliberately accepts.
        </p>
      </div>
    </div>
  )
}
