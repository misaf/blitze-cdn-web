import {
  CoverLinkList,
  Icon,
  PageHero,
  cover,
  coverRuling,
  eyebrow,
  eyebrowOnCover,
  flow,
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

/* Every route on this page used to require a GitHub account, including the
   private disclosure route — which meant a researcher without one had no way
   to report a vulnerability in software that holds TLS private keys except to
   disclose it publicly. These are the account-free fallbacks. */
const SECURITY_EMAIL = 'security@blitzecdn.dev'
const GENERAL_EMAIL = 'hello@blitzecdn.dev'

const disclosureNotes = [
  'What an attacker could achieve, and what access they would need to start.',
  'The versions involved — control plane and edge collection are pinned separately.',
  'Whether it crosses a documented trust boundary.',
  'A minimal reproduction if you have one. A clear description is fine if not.',
]

/*
 * The routing table, and the page's whole argument.
 *
 * "Where to send what" is a routing decision, so the page is the routing table
 * rather than a set of cards the reader has to compare. Every destination that
 * used to live in a separate "trackers" grid is a row here, next to the thing
 * that belongs in it — that grid listed three repositories without ever saying
 * which of your problems went in which.
 *
 * `private: true` marks the one row that must never become a public issue. It
 * is the only row that takes the oxblood, because it is the only one where
 * picking the wrong destination causes harm.
 */
const routes = [
  {
    subject: 'A suspected vulnerability',
    detail:
      'Anything that could expose TLS private keys, controller state, or an edge host.',
    private: true,
    destination: 'Private advisory, never a public issue',
    destinationHref: SECURITY_CONTACT,
    fallback: SECURITY_EMAIL,
  },
  {
    subject: 'A bug in the control plane',
    detail:
      'CLI, HTTP API, desired state, deployments, rollback, certificates.',
    destination: 'blitze-cdn-cp issues',
    destinationHref: 'https://github.com/misaf/blitze-cdn-cp/issues',
  },
  {
    subject: 'A bug on the edge',
    detail:
      'Ansible roles, host convergence, Nginx templates, firewall, hardening.',
    destination: 'blitze-cdn-edge issues',
    destinationHref: 'https://github.com/misaf/blitze-cdn-edge/issues',
  },
  {
    subject: 'Documentation that is wrong',
    detail:
      'Missing, unclear, or contradicted by what the software actually does.',
    destination: 'blitze-cdn issues',
    destinationHref: 'https://github.com/misaf/blitze-cdn-web/issues',
    note: 'Or the “Edit this page on GitHub” link on any docs page, which is quicker.',
  },
  {
    subject: 'Anything that is not a bug',
    detail: 'Commercial use, talks, or a conversation before you file.',
    destination: '@misaf on GitHub',
    destinationHref: GENERAL_CONTACT,
    fallback: GENERAL_EMAIL,
  },
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

const linkStyle =
  'underline underline-offset-4 decoration-1 hover:decoration-2 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rule'

export default function ContactPage() {
  return (
    /* `main` + Nextra's skip-target id: the theme's "Skip to Content" link is
       rendered on every route but its target only exists on MDX ones. */
    <main
      id="nextra-skip-nav"
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
        The disclosure route leads: it is the one thing on this page that causes
        harm if missed.

        Set in the site's oxblood rather than in Tailwind's `red-*` scale. This
        panel used to carry a second, unrelated red palette — five shades that
        appear nowhere else on the site — which made the most important block
        here look like it belonged to a different product. Urgency now comes
        from weight rather than from a new hue: a 2px rule all the way round and
        a solid oxblood head, the only filled oxblood block outside the primary
        button.
      */}
      <section className={section}>
        <div className={inner}>
          <p className={eyebrow}>Security</p>
          <div className="border-2 border-rule bg-panel">
            <div className="flex flex-col gap-4 bg-rule p-card text-ledger">
              <h2 className="flex items-start gap-3 font-display text-card font-book tracking-display">
                <Icon className="mt-1 size-[1.4rem] shrink-0">
                  <path d="M12 8v5M12 16.5h.01M10.3 3.9 2.4 18a1.9 1.9 0 0 0 1.7 2.8h15.8a1.9 1.9 0 0 0 1.7-2.8L13.7 3.9a1.9 1.9 0 0 0-3.4 0z" />
                </Icon>
                Do not open a public issue for a suspected vulnerability
              </h2>
              <p className="leading-relaxed">
                BlitzeCDN configures production web servers and holds TLS
                private keys. A public report is a disclosure before there is a
                fix.
              </p>
            </div>

            <div className="flex flex-col gap-4 border-b border-line p-card">
              <p className="text-[1.02rem] leading-relaxed">
                Report privately through the{' '}
                <a
                  href={SECURITY_CONTACT}
                  className={`font-semibold text-rule-ink ${linkStyle}`}
                >
                  control plane&rsquo;s security advisory form
                </a>
                . The report is visible only to the repository maintainers.
              </p>
              <p className="text-[1.02rem] leading-relaxed">
                That form needs a GitHub account. If you do not have one, or
                cannot use it, email{' '}
                <a
                  href={`mailto:${SECURITY_EMAIL}`}
                  className={`font-mono font-semibold text-rule-ink ${linkStyle}`}
                >
                  {SECURITY_EMAIL}
                </a>{' '}
                instead — it reaches the same two people. Plain text is fine; do
                not let the lack of an account push you towards a public issue.
              </p>
            </div>

            <div className="grid gap-8 p-card lg:grid-cols-2">
              <div className="flex flex-col gap-3.5">
                {/* Column heads, set like every other column head on the site.
                    They were previously the smallest text in their own block —
                    smaller than the body beneath them — and the panel read as
                    one undifferentiated wall on the page where scanning matters
                    most. */}
                <h3 className="font-mono text-[0.7rem] font-medium tracking-head text-rule-ink uppercase">
                  Useful to include
                </h3>
                <ul
                  role="list"
                  className="grid gap-2.5 text-[0.95rem] leading-relaxed"
                >
                  {disclosureNotes.map((note) => (
                    <li key={note} className="flex items-start gap-2.5">
                      <span className="mt-2 size-1.5 shrink-0 bg-rule" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-3.5">
                <h3 className="font-mono text-[0.7rem] font-medium tracking-head text-rule-ink uppercase">
                  What happens next
                </h3>
                <div className="grid gap-3 text-[0.95rem] leading-relaxed text-muted">
                  <p>
                    We acknowledge the report, tell you whether we can reproduce
                    it, and agree a disclosure timeline with you. If we disagree
                    that something is a vulnerability, we say why rather than
                    let the thread go quiet.
                  </p>
                  <p>
                    There is no bug bounty and we cannot pay for reports. Better
                    you know that now than afterwards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*
        The routing table. A real `<table>`: the association between a subject
        and its destination is the entire content, and a screen reader user
        needs the column relationship to follow it.

        It scrolls sideways on a phone under the same rule as the ledger on `/`
        — a scroll container is only reachable by keyboard if it is focusable,
        so it is a tabbable named region.
      */}
      <section className={section}>
        <div className={inner}>
          <p className={eyebrow}>Routing</p>
          <div className={split}>
            <h2 className={h2}>Every message has one destination</h2>
            <p className={lede}>
              Issues are public and indexed. Inventory hostnames, IP addresses
              and certificate paths often reveal more about your infrastructure
              than you intend, so leave them out of anything in the lower four
              rows — and use the top row if they are the point.
            </p>
          </div>
          <div
            className={`${flow} overflow-x-auto border border-line focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rule`}
            tabIndex={0}
            role="region"
            aria-label="What to send, and where each kind of message goes"
          >
            <table className="w-full min-w-[38rem] border-collapse text-left">
              <thead>
                <tr className="font-mono text-[0.68rem] tracking-head uppercase">
                  <th
                    scope="col"
                    className="border-b border-line px-card py-2.5 font-medium text-muted"
                  >
                    What you have
                  </th>
                  {/* The oxblood divider, as in the hero ledger. */}
                  <th
                    scope="col"
                    className="border-b border-l-2 spread-rule border-b-line px-card py-2.5 font-medium text-rule-ink"
                  >
                    Where it goes
                  </th>
                </tr>
              </thead>
              <tbody>
                {routes.map((row) => (
                  <tr key={row.subject} className="align-top">
                    <th
                      scope="row"
                      className="w-1/2 border-b border-line px-card py-5 font-normal"
                    >
                      <span className="flex flex-col gap-1.5">
                        <span
                          className={`font-display text-[1.05rem] font-book tracking-display ${
                            row.private ? 'text-rule-ink' : ''
                          }`}
                        >
                          {row.subject}
                        </span>
                        <span className="text-[0.88rem] leading-relaxed text-muted">
                          {row.detail}
                        </span>
                      </span>
                    </th>
                    {/* No tint on the private row. An 8% oxblood wash put the
                        muted detail text at 4.37:1 — under AA — and the row is
                        already marked by its oxblood title and bold
                        destination, with the panel above carrying the real
                        emphasis. */}
                    <td className="border-b border-l-2 spread-rule border-b-line px-card py-5">
                      <span className="flex flex-col gap-1.5">
                        <a
                          href={row.destinationHref}
                          className={`w-fit font-mono text-[0.9rem] ${
                            row.private ? 'font-semibold text-rule-ink' : ''
                          } ${linkStyle}`}
                        >
                          {row.destination}
                        </a>
                        {row.fallback && (
                          <span className="text-[0.85rem] leading-relaxed text-muted">
                            No account? Email{' '}
                            <a
                              href={`mailto:${row.fallback}`}
                              className={`font-mono ${linkStyle}`}
                            >
                              {row.fallback}
                            </a>
                          </span>
                        )}
                        {row.note && (
                          <span className="text-[0.85rem] leading-relaxed text-muted">
                            {row.note}
                          </span>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          <div
            className={`${flow} grid gap-px border border-line bg-line md:grid-cols-3`}
          >
            {expectations.map((item) => (
              <div
                key={item.name}
                className="flex flex-col gap-3 bg-panel p-card"
              >
                <Icon className="size-[1.35rem] shrink-0 text-rule-ink">
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

      <section className={cover}>
        <div className={coverRuling} aria-hidden="true" />
        <div className={`relative z-10 ${inner} ${section}`}>
          <div className="grid border border-ink-line lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-5 p-card-lg">
              <p className={`${eyebrowOnCover} mb-0`}>Before you write</p>
              <h2 className={h2}>Some of it is already answered</h2>
              <p className="leading-relaxed text-ink-muted">
                The FAQ covers scope and limits, and troubleshooting covers the
                failures operators hit most. For a reference correction, include
                the control-plane or edge version you verified against, so the
                change can be reviewed against the right interface.
              </p>
            </div>
            <CoverLinkList
              links={[
                { href: '/faq', label: 'Read the FAQ first' },
                {
                  href: '/docs/guides/troubleshooting',
                  label: 'Operations and troubleshooting',
                },
                { href: '/about', label: 'Who you are writing to' },
              ]}
            />
          </div>
        </div>
      </section>
    </main>
  )
}
