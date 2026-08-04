import Link from 'next/link'

export const metadata = {
  title: 'BlitzeCDN – edge control plane',
  description:
    'A security-focused control plane for converging Nginx CDN edge servers. ' +
    'Python owns desired state and history; Ansible owns remote Linux state.'
}

const capabilities = [
  {
    title: 'One boundary, enforced twice',
    body: 'Immutable Pydantic models constrain every value that reaches an Nginx template. The Ansible roles re-check the same rules, so hand-edited desired state cannot slip past.'
  },
  {
    title: 'Deployments you can audit',
    body: 'Each run pins an immutable snapshot, records queued → running → settled with bounded output, and writes an append-only audit trail of who changed what.'
  },
  {
    title: 'Rollback to a real state',
    body: 'Roll back to a prior successful snapshot. Canonical desired state changes only after Ansible converges, under a single hold of the deployment lock.'
  },
  {
    title: 'Certificates handled centrally',
    body: 'Upload a chain or issue via ACME HTTP-01 from the controller, with challenge tokens synchronised to every edge before validation. Keys are validated, never returned, never logged.'
  }
]

export default function LandingPage() {
  return (
    <div className="x:mx-auto x:max-w-4xl x:px-6 x:py-16">
      <section className="x:mb-16">
        <h1 className="x:text-5xl x:font-bold x:tracking-tight">BlitzeCDN</h1>
        <p className="x:mt-4 x:text-xl x:opacity-80">
          A security-focused control plane for converging Nginx CDN edge
          servers. Python owns validation, desired state, deployment history and
          rollback. Ansible exclusively owns remote Linux state.
        </p>
        <div className="x:mt-8 x:flex x:gap-4">
          <Link
            href="/docs"
            className="x:rounded-lg x:bg-black x:px-5 x:py-2.5 x:font-medium x:text-white x:dark:bg-white x:dark:text-black"
          >
            Read the docs
          </Link>
          <Link
            href="/docs/reference/cli"
            className="x:rounded-lg x:border x:px-5 x:py-2.5 x:font-medium"
          >
            CLI reference
          </Link>
        </div>
      </section>

      <section className="x:mb-16">
        <pre className="x:overflow-x-auto x:rounded-lg x:border x:p-4 x:text-sm">
          <code>{`blitzecdn site add --file examples/site.yml
blitzecdn validate
blitzecdn plan
blitzecdn deploy --yes`}</code>
        </pre>
      </section>

      <section className="x:grid x:gap-8 x:sm:grid-cols-2">
        {capabilities.map(item => (
          <div key={item.title}>
            <h2 className="x:mb-2 x:text-lg x:font-semibold">{item.title}</h2>
            <p className="x:opacity-80">{item.body}</p>
          </div>
        ))}
      </section>

      <section className="x:mt-16 x:border-t x:pt-8 x:text-sm x:opacity-70">
        <p>
          Debian 12+ and Ubuntu 24.04+ edges. One controller node. See{' '}
          <Link href="/docs/architecture" className="x:underline">
            architecture
          </Link>{' '}
          for the deliberate limits.
        </p>
      </section>
    </div>
  )
}
