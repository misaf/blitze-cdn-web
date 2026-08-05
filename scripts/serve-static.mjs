import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize, resolve } from 'node:path'

const root = resolve(process.argv[2] ?? 'out')
const port = Number(process.argv[3] ?? 4173)

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm',
  '.xml': 'application/xml; charset=utf-8',
}

function isFile(path) {
  return existsSync(path) && statSync(path).isFile()
}

function resolveRequest(pathname) {
  const decoded = decodeURIComponent(pathname).replace(/\/$/, '') || '/'
  const relative = normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, '')
  const exact = join(root, relative)
  const cleanHtml = decoded === '/' ? join(root, 'index.html') : `${exact}.html`

  // Next's export uses `route.html` beside `route/` RSC payload directories.
  // Prefer the HTML page for a clean URL, while still serving exact assets.
  if (!extname(exact) && isFile(cleanHtml)) return cleanHtml
  if (isFile(exact)) return exact
  if (isFile(join(exact, 'index.html'))) return join(exact, 'index.html')
  return join(root, '404.html')
}

createServer((request, response) => {
  try {
    const pathname = new URL(request.url, 'http://localhost').pathname
    const file = resolveRequest(pathname)
    const found = !file.endsWith('404.html') || pathname === '/404.html'
    response.writeHead(found ? 200 : 404, {
      'Content-Type': contentTypes[extname(file)] ?? 'application/octet-stream',
    })
    if (request.method === 'HEAD') response.end()
    else createReadStream(file).pipe(response)
  } catch {
    response.writeHead(400).end('Bad request')
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`Serving ${root} at http://127.0.0.1:${port}`)
})
