import { ImageResponse } from 'next/og'

export const alt = 'BlitzeCDN — the control plane for your Nginx edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const dynamic = 'force-static'

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: 'center',
        background: '#0c0e14',
        color: '#f4f6fa',
        display: 'flex',
        height: '100%',
        justifyContent: 'center',
        padding: '76px',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        <div style={{ color: '#ffb61f', display: 'flex', fontSize: 28 }}>
          BLITZECDN / EDGE CONTROL PLANE
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 76,
            fontWeight: 600,
            letterSpacing: '-3px',
            lineHeight: 1.05,
            marginTop: 34,
            maxWidth: 940,
          }}
        >
          The control plane for your Nginx edge
        </div>
        <div
          style={{
            color: '#a3acbd',
            display: 'flex',
            fontSize: 30,
            marginTop: 42,
          }}
        >
          Typed state · auditable deployments · real rollback
        </div>
      </div>
    </div>,
    size,
  )
}
