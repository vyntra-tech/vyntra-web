import http from 'node:http'

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = ''
      res.on('data', chunk => { body += chunk })
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body || '{}') }))
    })
    req.on('error', reject)
    if (data) req.write(JSON.stringify(data))
    req.end()
  })
}

async function run() {
  console.log('1. Logging in...')
  const loginRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@vyntra.tech', password: 'VyntraAdmin@2026!' })

  console.log('Login Status:', loginRes.status)
  console.log('Token received:', loginRes.body.token ? 'YES' : 'NO')
  const token = loginRes.body.token

  console.log('\n2. Testing /api/auth/me with Bearer token...')
  const meRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  console.log('Me Status:', meRes.status)
  console.log('Me Body:', meRes.body)

  console.log('\n3. Testing /api/admin/stats with Bearer token...')
  const statsRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/admin/stats',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  console.log('Stats Status:', statsRes.status)
  console.log('Stats Body:', statsRes.body)
}

run().catch(console.error)
