import { ImageResponse } from 'next/og'

export const alt =
  'BlitzeCDN — every rule is written down twice, once by the controller and ' +
  'again by the edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const dynamic = 'force-static'

/*
 * The social card is the hero's argument at a glance: the headline beside a
 * miniature of the double-entry spread, with the oxblood rule dividing the
 * controller's column from the edge's.
 *
 * Two constraints from Satori, which renders this:
 *
 * - Every element that contains more than one child needs an explicit
 *   `display: 'flex'`. There is no grid, and a missing `display` throws at
 *   build time rather than laying out badly.
 * - No web fonts are loaded here, so this falls back to the renderer's default
 *   sans. The three site faces are deliberately not fetched — this is a static
 *   export and pulling font binaries into the image build to style four lines
 *   of text is not worth the build-time network dependency. The card carries
 *   the identity through colour, the rule and the layout instead.
 */

/* Each row is one of the constraints from the hero ledger, trimmed to what
   reads at card size. Kept in step with `entries` in `page.jsx`. */
const rows = [
  ['certificate_path', 'confined', 'refused elsewhere'],
  ['ssh_authentication', 'publickey', 'verified on host'],
  ['firewall_ssh_sources', 'non-empty', 'aborts, never opens'],
]

const INK = '#151a1b'
const PAPER = '#e8ebe8'
const MUTED = '#9aa4a1'
const RULE = '#a63a2e'
const ATTEST = '#3f9a71'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        background: INK,
        color: PAPER,
        display: 'flex',
        height: '100%',
        padding: '72px',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', gap: 56, width: '100%' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: 560,
          }}
        >
          <div
            style={{
              borderBottom: `3px solid ${RULE}`,
              color: PAPER,
              display: 'flex',
              fontSize: 22,
              letterSpacing: 4,
              paddingBottom: 10,
            }}
          >
            BLITZECDN / EDGE CONTROL PLANE
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 68,
              fontWeight: 600,
              letterSpacing: '-2px',
              lineHeight: 1.06,
              marginTop: 36,
            }}
          >
            Every rule is written down twice
          </div>
          <div
            style={{
              color: MUTED,
              display: 'flex',
              fontSize: 26,
              marginTop: 32,
            }}
          >
            Python decides · Ansible acts · neither trusts the other
          </div>
        </div>

        <div
          style={{
            border: `1px solid #2a3234`,
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              borderBottom: '1px solid #2a3234',
              color: MUTED,
              display: 'flex',
              fontSize: 17,
              letterSpacing: 3,
              padding: '16px 20px',
            }}
          >
            CONTROLLER / EDGE
          </div>
          {rows.map(([constraint, left, right]) => (
            <div
              key={constraint}
              style={{
                borderBottom: '1px solid #2a3234',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: '18px 20px',
              }}
            >
              <div style={{ display: 'flex', fontSize: 19 }}>{constraint}</div>
              <div style={{ color: MUTED, display: 'flex', fontSize: 17 }}>
                {left}
                <span style={{ color: RULE, padding: '0 10px' }}>|</span>
                {/* The attest mark as SVG, not as a `✓` character. Satori has
                    no glyph for it in the fallback face and tries to fetch a
                    dynamic font at build time, which fails on an offline
                    build and logs an error while silently dropping the mark.
                    Drawing it needs no font at all. */}
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke={ATTEST}
                  strokeWidth="2.6"
                  style={{ marginRight: 8, marginTop: 3 }}
                >
                  <path d="M3 10.5 8 15.5 17 5" />
                </svg>
                {right}
              </div>
            </div>
          ))}
          <div
            style={{
              color: ATTEST,
              display: 'flex',
              fontSize: 18,
              letterSpacing: 3,
              padding: '16px 20px',
            }}
          >
            BALANCES
          </div>
        </div>
      </div>
    </div>,
    size,
  )
}
