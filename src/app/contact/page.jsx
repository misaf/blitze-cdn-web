import Link from 'next/link'
import {
  Arrow,
  Icon,
  PageHero,
  band,
  bandArt,
  eyebrow,
  focusInset,
  h2,
  h3,
  inner,
  lede,
  section,
  split,
} from '@/components/ui'

export const metadata = {
  title: 'Contact us',
  description:
    'Where to report a bug, how to disclose a security issue privately, and ' +
    'what response to expect.',
}

const SECURITY_CONTACT =
  'https://github.com/misaf/blitze-cdn-cp/security/advisories/new'
const GENERAL_CONTACT = 'https://github.com/misaf'

const trackers = [
  {
    name: 'blitze-cdn-cp',
    href: 'https://github.com/misaf/blitze-cdn-cp/issues',
    scope: 'CLI, HTTP API, desired state, deployments, rollback, certificates.',
  },
  {
    name: 'blitze-cdn-edge',
    href: 'https://github.com/misaf/blitze-cdn-edge/issues',
    scope:
      'Ansible roles, host convergence, Nginx templates, firewall, hardening.',
  },
  {
    name: 'blitze-cdn',
    href: 'https://github.com/misaf/blitze-cdn-web/issues',
    scope: 'This site: documentation that is wrong, missing or unclear.',
  },
]

const disclosureNotes = [
  'What an attacker could achieve, and what access they would need to start.',
  'The versions involved — control plane and edge collection are pinned separately.',
  'Whether it crosses a documented trust boundary.',
  'A minimal reproduction if you have one. A clear description is fine if not.',
]

const expectations = [
  {
    name: 'No SLA',
    body: 'BlitzeCDN is maintained by two people alongside other work. There is no guaranteed response time and no paid support tier.',
    icon: <path d="M12 7v5l3 2M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z" />,
  },
  {
    name: 'Security first',
    body: 'Security reports are looked at before anything else. Everything else is best effort, in whatever order makes sense.',
    icon: <path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z" />,
  },
  {
    name: 'Closed with a reason',
    body: 'Requests outside the project’s deliberate limits will usually be declined — but with an explanation, rather than left open indefinitely.',
    icon: <path d="M6 6l12 12M18 6L6 18" />,
  },
]

export default function ContactPage() {
  return (
    <div
      className="canvas bg-surface text-fg antialiased [font-synthesis-weight:none]"
      /* Keeps the page in the Pagefind index now that it is a hand-built route
         rather than an MDX page Nextra would have marked for us. */
      data-pagefind-body
    >
      <PageHero eyebrow="Contact us" title="Where to send what">
        Most things are fastest as a GitHub issue, because they end up next to
        the code that has to change. Security reports are the exception — those
        should never be public.
      </PageHero>

      {/*
        The disclosure route leads, and is styled as a warning rather than a
        card: it is the one thing on this page that causes harm if missed.
      */}
      <section className={section}>
        <div className={inner}>
          <p className={eyebrow}>Security</p>
          <div className="border border-red-600/60 bg-red-50 dark:bg-red-950/30">
            <div className="flex flex-col gap-4 border-b border-red-600/40 p-[clamp(1.5rem,3vw,2.25rem)]">
              <h2 className="flex items-start gap-3 text-card font-book tracking-display text-red-800 dark:text-red-300">
                <Icon className="mt-1 size-[1.4rem] shrink-0">
                  <path d="M12 8v5M12 16.5h.01M10.3 3.9 2.4 18a1.9 1.9 0 0 0 1.7 2.8h15.8a1.9 1.9 0 0 0 1.7-2.8L13.7 3.9a1.9 1.9 0 0 0-3.4 0z" />
                </Icon>
                Do not open a public issue for a suspected vulnerability
              </h2>
              <p className="leading-relaxed text-red-900/90 dark:text-red-200/80">
                BlitzeCDN configures production web servers and holds TLS
                private keys. A public report is a disclosure before there is a
                fix.
              </p>
              <p className="text-[1.05rem] text-red-900 dark:text-red-100">
                Report privately through the{' '}
                <a
                  href={SECURITY_CONTACT}
                  className="font-semibold underline underline-offset-2"
                >
                  control plane’s security advisory form
                </a>
                . You need a GitHub account, but the report is visible only to
                the repository maintainers.
              </p>
            </div>
            <div className="grid gap-8 p-[clamp(1.5rem,3vw,2.25rem)] lg:grid-cols-2">
              <div className="flex flex-col gap-3">
                <h3 className="font-mono text-[0.78rem] tracking-[0.12em] text-red-800 uppercase dark:text-red-300">
                  Useful to include
                </h3>
                <ul className="grid gap-2.5 text-[0.95rem] leading-relaxed text-fg">
                  {disclosureNotes.map((note) => (
                    <li key={note} className="flex items-start gap-2.5">
                      <span className="mt-2 size-1.5 shrink-0 bg-red-600" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-3 text-[0.95rem] leading-relaxed text-muted">
                <h3 className="font-mono text-[0.78rem] tracking-[0.12em] text-red-800 uppercase dark:text-red-300">
                  What happens next
                </h3>
                <p>
                  We acknowledge the report, tell you whether we can reproduce
                  it, and agree a disclosure timeline with you. If we disagree
                  that something is a vulnerability, we say why rather than let
                  the thread go quiet.
                </p>
                <p>
                  There is no bug bounty and we cannot pay for reports. Better
                  you know that now than afterwards.
                </p>
              </div>
            </div>
          </div>
          <p className="mt-6 text-[0.95rem] text-muted">
            Background:{' '}
            <Link
              href="/docs/architecture#security-and-trust-boundaries"
              className="text-accent-ink underline underline-offset-2"
            >
              security and trust boundaries
            </Link>
            .
          </p>
        </div>
      </section>

      <section className={section}>
        <div className={inner}>
          <p className={eyebrow}>Bugs and questions</p>
          <div className={split}>
            <h2 className={h2}>Three repositories, three trackers</h2>
            <p className={lede}>
              If you are not sure which one, file it anywhere sensible and we
              will move it. Before filing a deployment problem,{' '}
              <code className="font-mono text-[0.9em]">blitzecdn doctor</code>{' '}
              and the{' '}
              <Link
                href="/docs/guides/troubleshooting"
                className="text-accent-ink underline underline-offset-2"
              >
                troubleshooting guide
              </Link>{' '}
              resolve a good share of them — and the output is useful in the
              issue either way.
            </p>
          </div>
          <div className="mt-[clamp(2.5rem,5vw,4rem)] grid gap-px border border-line bg-line md:grid-cols-3">
            {trackers.map((tracker) => (
              <a
                key={tracker.name}
                href={tracker.href}
                className={`group flex flex-col gap-3 bg-surface p-[clamp(1.5rem,3vw,2.25rem)] no-underline ${focusInset}`}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[0.95rem] text-fg underline-offset-4 group-hover:underline">
                    {tracker.name}
                  </span>
                  <Arrow className="size-[1.1rem] shrink-0 text-accent-ink transition-transform duration-150 group-hover:translate-x-1" />
                </span>
                <span className="text-[0.92rem] leading-relaxed text-muted">
                  {tracker.scope}
                </span>
              </a>
            ))}
          </div>

          <div className="mt-10 border-l-2 border-accent bg-surface py-4 pl-5">
            <p className="leading-relaxed text-fg">
              <strong className="font-semibold">
                Redact logs before pasting.
              </strong>{' '}
              <span className="text-muted">
                Inventory hostnames, IP addresses and certificate paths often
                reveal more about your infrastructure than you intend, and
                issues are public and indexed.
              </span>
            </p>
          </div>
        </div>
      </section>

      <section className={band}>
        <div className={bandArt} aria-hidden="true" />
        <div className={`relative z-10 ${inner} ${section}`}>
          <div className="grid border border-band-line lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-5 p-[clamp(2rem,4vw,3.5rem)]">
              <p className={`${eyebrow} mb-0 text-accent!`}>Anything else</p>
              <h2 className={h2}>Not everything fits a tracker</h2>
              <p className="leading-relaxed text-band-muted">
                Commercial use, talks, or a conversation before you file
                something — contact{' '}
                <a
                  href={GENERAL_CONTACT}
                  className="font-mono font-semibold text-band-fg underline underline-offset-2"
                >
                  @misaf on GitHub
                </a>
                .
              </p>
              <p className="text-[0.95rem] leading-relaxed text-band-muted">
                Documentation corrections are quickest through the{' '}
                <strong className="font-semibold text-band-fg">
                  Edit this page on GitHub
                </strong>{' '}
                link on any docs page. For reference corrections, include the
                control-plane or edge version you verified so the change can be
                reviewed against the right interface.
              </p>
            </div>
            <div className="flex flex-col border-t border-band-line lg:border-t-0 lg:border-l">
              {[
                { href: '/faq', label: 'Read the FAQ first' },
                {
                  href: '/docs/guides/troubleshooting',
                  label: 'Operations and troubleshooting',
                },
                { href: '/about', label: 'Who you are writing to' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex flex-1 items-center justify-between gap-6 px-[clamp(1.25rem,2.5vw,2rem)] py-[clamp(1.1rem,2.2vw,1.5rem)] text-[1.05rem] no-underline transition-colors duration-100 not-first:border-t not-first:border-band-line hover:bg-white/7 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
                >
                  <span>{link.label}</span>
                  <Arrow className="text-accent transition-transform duration-150 group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={section}>
        <div className={inner}>
          <p className={eyebrow}>What to expect</p>
          <div className={split}>
            <h2 className={h2}>An honest expectation, not a flattering one</h2>
            <p className={lede}>
              We would rather set this out plainly than have you discover it by
              waiting.
            </p>
          </div>
          <div className="mt-[clamp(2.5rem,5vw,4rem)] grid gap-px border border-line bg-line md:grid-cols-3">
            {expectations.map((item) => (
              <div
                key={item.name}
                className="flex flex-col gap-3 bg-surface p-[clamp(1.5rem,3vw,2.25rem)]"
              >
                <Icon className="size-[1.4rem] shrink-0 text-accent-ink">
                  {item.icon}
                </Icon>
                <h3 className={h3}>{item.name}</h3>
                <p className="text-[0.92rem] leading-relaxed text-muted">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
