import Link from 'next/link'
import {
  Check,
  ExternalCardGrid,
  Icon,
  PageHero,
  band,
  bandArt,
  btnGhost,
  btnPrimary,
  eyebrow,
  flow,
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

export const metadata = {
  title: 'About us',
  description:
    'Who maintains BlitzeCDN, why it was rebuilt, and the principles the ' +
    'current design commits to.',
}

const FOUNDER_NAME = 'Misaf'

/* The predecessor's failure modes, from the original system assessment in
   docs/architecture. These are the reasons the current boundaries exist. */
const inherited = [
  {
    title: 'Queued work vanished',
    body: 'HTTP background tasks held an open fcntl lock and launched ansible-playbook. Restarting the process lost whatever was queued.',
  },
  {
    title: 'Rollback wrote first',
    body: 'Current desired state was rewritten before remote convergence, so a failed rollback left the controller describing a fleet that did not exist.',
  },
  {
    title: 'Five places to disagree',
    body: 'Validation and defaults were duplicated across Pydantic models, YAML serializers, Ansible assertions, role defaults and Jinja templates.',
  },
  {
    title: 'Secrets in the repository',
    body: 'The inventory carried real hosts, root SSH and a repository-local private-key path. The firewall role was commented out.',
  },
]

const beliefs = [
  {
    name: 'One owner per concern',
    body: 'Python owns validation, desired state, history, planning, rollback and audit. Ansible exclusively owns remote Linux state and carries no product workflow decisions. When two components can both decide something, they will eventually decide differently.',
    icon: <path d="M4 6h16M4 12h16M4 18h10" />,
  },
  {
    name: 'Enforce it twice',
    body: 'Every constraint that holds on the controller is re-checked on the edge. A hand-edited desired-state file is not a supported input path, and it does not become one by accident.',
    icon: <path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z" />,
  },
  {
    name: 'Never claim more than you established',
    body: 'Canonical state changes only after a convergence actually succeeds. An unknown outcome is recorded as unknown — abandoned is not a synonym for failed.',
    icon: <path d="M12 8v5M12 16.5h.01M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z" />,
  },
  {
    name: 'Secrets travel one way',
    body: 'Private keys are validated on the way in and are never returned, never logged, never rendered into a plan, and never accepted as command-line arguments.',
    icon: <path d="M6 11V8a6 6 0 0 1 12 0v3M5 11h14v9H5z" />,
  },
  {
    name: 'Refuse clearly',
    body: 'No VM provisioning, no DNS, no wildcard certificates, no cache invalidation fan-out, no active/active. Each needs a design we have not done, and a stated boundary is easier to operate against than a vague one.',
    icon: <path d="M12 3v18M3 12h18" />,
  },
]

const people = [
  {
    name: FOUNDER_NAME,
    handle: 'misaf',
    role: 'Founder',
    body: 'Design, control plane, and edge roles.',
  },
  {
    name: 'Arefeh',
    role: 'Support',
    body: 'Issue triage, documentation, and operator questions.',
  },
]

const repositories = [
  {
    name: 'blitze-cdn-cp',
    href: 'https://github.com/misaf/blitze-cdn-cp',
    note: 'Control plane: CLI, HTTP API, domain models, deployment history.',
  },
  {
    name: 'blitze-cdn-edge',
    href: 'https://github.com/misaf/blitze-cdn-edge',
    note: 'The Ansible roles that converge the edge hosts.',
  },
  {
    name: 'blitze-cdn',
    href: 'https://github.com/misaf/blitze-cdn-web',
    note: 'This site. Holds no credentials and never runs on a controller.',
  },
]

export default function AboutPage() {
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
      <PageHero eyebrow="About us" title="Two people, one narrow tool">
        We build and maintain BlitzeCDN, an open-source control plane for
        converging Nginx CDN edge servers from a single controller. There is no
        company behind it, no support organisation, and no roadmap we are
        contractually obliged to — and this page would rather be accurate about
        that than impressive.
      </PageHero>

      <section className={section}>
        <div className={inner}>
          <p className={eyebrow}>Why it was rebuilt</p>
          <div className={split}>
            <h2 className={h2}>Everything here is a reaction to something</h2>
            <p className={lede}>
              BlitzeCDN is a rewrite. The earlier system combined a global
              FastAPI application, loosely typed service functions, a YAML site
              database, SQLite deployment records, a Bash and curl helper, and
              Ansible roles. None of it was the result of one bad decision — it
              was many reasonable ones accumulating without a boundary to stop
              them. So the rewrite started from the boundary rather than the
              features.
            </p>
          </div>
          <dl className={`${grid} sm:grid-cols-2`}>
            {inherited.map((item) => (
              <div key={item.title} className={`${gridCell} min-h-44`}>
                <dt className="text-[1.18rem] font-medium tracking-tight">
                  {item.title}
                </dt>
                <dd className="text-[0.92rem] leading-relaxed text-muted">
                  {item.body}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={band}>
        <div className={bandArt} aria-hidden="true" />
        <div className={`relative z-10 ${inner} ${section}`}>
          <p className={`${eyebrow} text-accent!`}>What we believe</p>
          <h2 className={h2}>Five commitments the design is held to</h2>
          <div className={flow}>
            {beliefs.map((belief) => (
              <div key={belief.name} className={principleRow('band')}>
                <h3 className="flex items-center gap-4 text-principle font-book tracking-display">
                  <Icon className="size-[1.4rem] shrink-0 text-accent">
                    {belief.icon}
                  </Icon>
                  {belief.name}
                </h3>
                <p className="leading-relaxed text-band-muted">{belief.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-flow flex justify-center">
            <Link href="/docs/architecture" className={btnPrimary}>
              See how they play out
            </Link>
          </div>
        </div>
      </section>

      <section className={section}>
        <div className={inner}>
          <p className={eyebrow}>Who we are</p>
          <div className={split}>
            <h2 className={h2}>The whole team</h2>
            <p className={lede}>
              Between us we cover the project&rsquo;s day-to-day, alongside
              other work. We are not a 24/7 support desk and would rather say so
              plainly than imply otherwise.
            </p>
          </div>
          <div className={`${flow} grid border border-line md:grid-cols-2`}>
            {people.map((person, index) => (
              <div
                key={person.name}
                /* `p-card`, matching every other card on the site — this was
                   the one place using a fourth, slightly larger padding. */
                className={`flex flex-col gap-3 p-card ${
                  index > 0
                    ? 'border-t border-line md:border-t-0 md:border-l'
                    : ''
                }`}
              >
                <p className="font-mono text-[0.72rem] tracking-[0.12em] text-accent-ink uppercase">
                  {person.role}
                </p>
                <h3 className={h3}>{person.name}</h3>
                {person.handle && (
                  <a
                    href={`https://github.com/${person.handle}`}
                    className="w-fit font-mono text-[0.82rem] text-muted underline underline-offset-4 hover:text-fg"
                  >
                    @{person.handle}
                  </a>
                )}
                <p className="leading-relaxed text-muted">{person.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-[0.95rem] text-muted">
            What to expect from us is spelled out on{' '}
            <Link
              href="/contact"
              className="text-accent-ink underline underline-offset-2"
            >
              Contact us
            </Link>
            .
          </p>
        </div>
      </section>

      <section className={section}>
        <div className={inner}>
          <p className={eyebrow}>How it is put together</p>
          <div className={split}>
            <h2 className={h2}>Three repositories, deliberately</h2>
            <p className={lede}>
              The control plane and the edge roles are released independently,
              which makes the desired-state document they exchange a versioned
              public interface rather than an internal detail. A version-skewed
              pair fails before the first host is touched.
            </p>
          </div>
          <ExternalCardGrid items={repositories} />
          <div className="mt-flow flex justify-center">
            <Link href="/blog/a-version-is-an-interface" className={btnGhost}>
              Why a version is an interface
            </Link>
          </div>
        </div>
      </section>

      <section className={band}>
        <div className={bandArt} aria-hidden="true" />
        <div className={`relative z-10 ${inner} ${section}`}>
          <div className="grid gap-10 border border-band-line p-card-lg lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-5">
              <p className={`${eyebrow} mb-0 text-accent!`}>Licence</p>
              <h2 className={h2}>MIT, warranty and all</h2>
            </div>
            <div className="flex flex-col gap-4 text-band-muted">
              <p className="leading-relaxed">
                Use it commercially, modify it, redistribute it. It comes with
                no warranty — which, for software that reconfigures production
                web servers as root, is worth reading literally.
              </p>
              <ul role="list" className="grid gap-2.5 text-[0.95rem]">
                <li className="flex items-start gap-2.5">
                  <Check />
                  <span>Commercial use, modification, redistribution</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check />
                  <span>Test against hosts you can afford to break first</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
