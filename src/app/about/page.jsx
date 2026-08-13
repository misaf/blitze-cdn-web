import Image from 'next/image'
import Link from 'next/link'
import {
  Attest,
  ExternalCardGrid,
  PageHero,
  btnGhost,
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
import { basePath } from '@/lib/base-path.mjs'
import { absoluteUrl } from '@/lib/site'

export const metadata = {
  title: 'About us',
  alternates: { canonical: absoluteUrl('/about') },
  description:
    'Who maintains BlitzeCDN, why it was rebuilt, and the rule each of the ' +
    'old system’s failures produced.',
}

const FOUNDER_NAME = 'Ehsan'

/*
 * The two people who keep the project.
 *
 * `avatar` is a path under `public/team/`. Both files are square, so the frame
 * crops nothing. `alt` is deliberately empty: the person's name sits
 * immediately beside the photo, and describing it again only makes a screen
 * reader announce the name twice.
 */
const people = [
  {
    name: FOUNDER_NAME,
    handle: 'misaf',
    role: 'Founder',
    avatar: '/team/misaf.jpg',
    body: 'Design, control plane, and edge roles.',
  },
  {
    name: 'Arefeh',
    role: 'Support',
    avatar: '/team/arefeh.jpg',
    body: 'Issue triage, documentation, and operator questions.',
  },
]

/*
 * The page's argument, and the reason it is a two-column register rather than
 * two lists.
 *
 * `failure` is what the predecessor actually did, from the system assessment in
 * docs/architecture. `rule` is the constraint that exists BECAUSE of it. The
 * pairing is the point: every rule here was bought with an outage, and a bare
 * list of principles — which is what this page used to be, restating the
 * landing page's "Five commitments" almost line for line — cannot show that.
 */
const reactions = [
  {
    failure: 'Queued work vanished',
    failureBody:
      'HTTP background tasks held an open fcntl lock and launched ansible-playbook. Restarting the process lost whatever was queued.',
    rule: 'Never claim more than you established',
    ruleBody:
      'The record is committed before the work starts, so a restart leaves visible abandoned work rather than silently losing it. An unknown outcome is recorded as unknown.',
  },
  {
    failure: 'Rollback wrote first',
    failureBody:
      'Current desired state was rewritten before remote convergence, so a failed rollback left the controller describing a fleet that did not exist.',
    rule: 'Canonical state moves last',
    ruleBody:
      'Desired state is replaced only after a convergence actually succeeds, in one transaction, under a single hold of the deployment lock.',
  },
  {
    failure: 'Five places to disagree',
    failureBody:
      'Validation and defaults were duplicated across Pydantic models, YAML serializers, Ansible assertions, role defaults and Jinja templates.',
    rule: 'One owner per concern',
    ruleBody:
      'Python owns validation, desired state, history, planning, rollback and audit. Ansible exclusively owns remote Linux state. When two components can both decide something, they eventually decide differently.',
  },
  {
    failure: 'Secrets in the repository',
    failureBody:
      'The inventory carried real hosts, root SSH and a repository-local private-key path. The firewall role was commented out.',
    rule: 'Secrets travel one way',
    ruleBody:
      'Private keys are validated on the way in and never returned, never logged, never rendered into a plan, and never accepted as command-line arguments.',
  },
]

/* The two rules that are not reactions. Stated separately rather than folded
   into the register above, because implying they were paid for in outages
   would be the same flattery this page exists to avoid. */
const designedIn = [
  {
    name: 'Enforce it twice',
    body: 'Every constraint that holds on the controller is re-checked on the edge. A hand-edited desired-state file is not a supported input path, and it does not become one by accident.',
  },
  {
    name: 'Refuse clearly',
    body: 'No VM provisioning, no DNS, no wildcard certificates, no cache invalidation fan-out, no active/active. Each needs a design we have not done, and a stated boundary is easier to operate against than a vague one.',
  },
]

const repositories = [
  {
    name: 'blitze-cdn-cp',
    href: 'https://github.com/misaf/blitze-cdn-cp',
    note: 'Control plane: CLI, HTTP API, domain models, deployment history, and the Ansible roles that converge the edge hosts.',
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

      {/* People lead. On a page called "About us", who we are is the answer to
          the question the reader arrived with; it used to sit fourth, below
          three sections of architecture history. */}
      <section className={section}>
        <div className={inner}>
          <p className={eyebrow}>Who keeps it</p>
          <div className={split}>
            <h2 className={h2}>The whole team</h2>
            <p className={lede}>
              Between us we cover the project&rsquo;s day-to-day, alongside
              other work. We are not a 24/7 support desk and would rather say so
              plainly than imply otherwise. What to expect is set out on{' '}
              <Link
                href="/contact"
                className="text-rule-ink underline underline-offset-2"
              >
                Contact us
              </Link>
              .
            </p>
          </div>
          <div className={`${flow} grid border border-line md:grid-cols-2`}>
            {people.map((person, index) => (
              <div
                key={person.name}
                className={`flex gap-5 p-card ${
                  index > 0
                    ? 'border-t border-line md:border-t-0 md:border-l'
                    : ''
                }`}
              >
                {/* Square and ruled, like every other frame in the book — a
                    circular crop is the one shape this design does not have.
                    `next/image` rather than a bare `<img>`: the build runs with
                    `images: { unoptimized: true }`, so it emits a plain tag
                    anyway while keeping the intrinsic size declared. The src is
                    prefixed with `basePath` because unoptimized export does not
                    add it — a root-relative `/team/...` would resolve to the
                    Pages domain root and 404 on the project site, exactly the
                    break this line fixed. */}
                <Image
                  src={`${basePath}${person.avatar}`}
                  alt=""
                  width={400}
                  height={400}
                  className="size-20 shrink-0 border border-line bg-panel object-cover sm:size-24"
                />
                <div className="flex flex-col gap-2">
                  <p className="font-mono text-[0.68rem] tracking-head text-rule-ink uppercase">
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
                  <p className="text-[0.95rem] leading-relaxed text-muted">
                    {person.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*
        The register. Same double-entry device as the landing page's hero, doing
        a different job: there the two columns are two enforcers agreeing, here
        they are a failure and the rule it produced.
      */}
      <section className={section}>
        <div className={inner}>
          <p className={eyebrow}>Why it was rebuilt</p>
          <div className={split}>
            <h2 className={h2}>Everything here is a reaction to something</h2>
            <p className={lede}>
              BlitzeCDN is a rewrite. The earlier system combined a global
              FastAPI application, loosely typed service functions, a YAML site
              database, SQLite deployment records, a Bash and curl helper, and
              Ansible roles. None of it was one bad decision — it was many
              reasonable ones accumulating without a boundary to stop them. So
              the rewrite started from the boundary rather than the features.
            </p>
          </div>

          {/* A real table: two headed columns whose association is the whole
              content. A screen reader user needs to know the right-hand cell is
              the consequence of the left, not a second unrelated list. It
              scrolls sideways on a phone under the same rule as the hero
              ledger — a scroll container is only reachable by keyboard if it is
              focusable, so it is a tabbable named region. */}
          <div
            className={`${flow} overflow-x-auto border border-line focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-rule`}
            tabIndex={0}
            role="region"
            aria-label="Each failure of the previous system, and the rule it produced"
          >
            <table className="w-full min-w-[36rem] border-collapse text-left">
              <caption className="border-b border-line px-card py-3 text-left font-mono text-[0.68rem] tracking-head text-muted uppercase">
                The previous system · assessed before the rewrite
              </caption>
              <thead>
                <tr className="font-mono text-[0.68rem] tracking-head uppercase">
                  <th
                    scope="col"
                    className="border-b border-line px-card py-2.5 font-medium text-muted"
                  >
                    What went wrong
                  </th>
                  {/* The oxblood divider, as in the hero ledger: left of it is
                      what happened, right of it is what it cost. */}
                  <th
                    scope="col"
                    className="border-b border-l-2 spread-rule border-b-line px-card py-2.5 font-medium text-rule-ink"
                  >
                    The rule it produced
                  </th>
                </tr>
              </thead>
              <tbody>
                {reactions.map((row) => (
                  <tr key={row.failure} className="align-top">
                    <th
                      scope="row"
                      className="w-1/2 border-b border-line px-card py-5 font-normal"
                    >
                      <span className="flex flex-col gap-2">
                        <span className="font-display text-[1.05rem] font-book tracking-display">
                          {row.failure}
                        </span>
                        <span className="text-[0.88rem] leading-relaxed text-muted">
                          {row.failureBody}
                        </span>
                      </span>
                    </th>
                    <td className="border-b border-l-2 spread-rule border-b-line px-card py-5">
                      <span className="flex flex-col gap-2">
                        <span className="font-display text-[1.05rem] font-book tracking-display text-rule-ink">
                          {row.rule}
                        </span>
                        <span className="text-[0.88rem] leading-relaxed text-muted">
                          {row.ruleBody}
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-flow grid gap-x-10 gap-y-6 border-t-2 border-rule pt-6 md:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
            <h3 className="font-display text-card font-book tracking-display">
              And two that cost nothing
            </h3>
            <div className="grid gap-5">
              <p className="text-[0.95rem] leading-relaxed text-muted">
                These two were designed in rather than paid for. Implying
                otherwise would be the same flattery this page exists to avoid.
              </p>
              <dl className="grid gap-4">
                {designedIn.map((item) => (
                  <div key={item.name} className="grid gap-1.5">
                    <dt className="font-display text-[1.05rem] font-book tracking-display">
                      {item.name}
                    </dt>
                    <dd className="text-[0.9rem] leading-relaxed text-muted">
                      {item.body}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="mt-flow flex justify-center">
            <Link href="/docs/understand/architecture" className={btnGhost}>
              See how they play out
            </Link>
          </div>
        </div>
      </section>

      <section className={section}>
        <div className={inner}>
          <p className={eyebrow}>How it is put together</p>
          <div className={split}>
            <h2 className={h2}>Two repositories, deliberately</h2>
            <p className={lede}>
              The control plane and edge roles ship together so their internal
              desired-state contract cannot be version-skewed. The separate web
              repository holds documentation and no controller credentials.
            </p>
          </div>
          <ExternalCardGrid items={repositories} />
        </div>
      </section>

      <section className={cover}>
        <div className={coverRuling} aria-hidden="true" />
        <div className={`relative z-10 ${inner} ${section}`}>
          <div className="grid gap-10 border border-ink-line p-card-lg lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-5">
              <p className={`${eyebrowOnCover} mb-0`}>Licence</p>
              <h2 className={h2}>MIT, warranty and all</h2>
            </div>
            <div className="flex flex-col gap-4 text-ink-muted">
              <p className="leading-relaxed">
                Use it commercially, modify it, redistribute it. It comes with
                no warranty — which, for software that reconfigures production
                web servers as root, is worth reading literally.
              </p>
              <ul role="list" className="grid gap-2.5 text-[0.95rem]">
                <li className="flex items-start gap-2.5">
                  <Attest className="text-attest-bright" />
                  <span>Commercial use, modification, redistribution</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Attest className="text-attest-bright" />
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
