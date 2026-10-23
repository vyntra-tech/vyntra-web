import http from 'node:http'

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = ''
      res.on('data', chunk => { body += chunk })
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body || '{}'), rawBody: body })
        } catch(e) {
          resolve({ status: res.statusCode, headers: res.headers, rawBody: body })
        }
      })
    })
    req.on('error', reject)
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data))
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
  const token = loginRes.body.token
  if (!token) {
    console.error('No token, login failed:', loginRes.body)
    return
  }

  // 1x1 transparent PNG data url
  const pngDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

  console.log('\n2. Testing /api/admin/media/upload with PNG (including spaces/newlines)...')
  const uploadRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/admin/media/upload',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }, { name: 'profile-picture.png', data: pngDataUrl + '\r\n ' })

  console.log('Upload Status:', uploadRes.status)
  console.log('Upload Response:', uploadRes.body)

  const uploadedUrl = uploadRes.body.url
  console.log('\n3. Testing GET to retrieve uploaded file from backend: ' + uploadedUrl)
  const getRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: uploadedUrl,
    method: 'GET'
  })

  console.log('GET Status:', getRes.status, getRes.status === 200 ? '✅ SUCCESS! File served correctly' : '❌ FAILED')

  console.log('\n4. Testing GET for the previously uploaded user image (/uploads/1792732195458-shubham_jpg.jpg)...')
  const getOldRes = await request({
    hostname: '127.0.0.1',
    port: 5000,
    path: '/uploads/1792732195458-shubham_jpg.jpg',
    method: 'GET'
  })
  console.log('Old Image GET Status:', getOldRes.status, getOldRes.status === 200 ? '✅ SUCCESS! Old user image also served' : '❌ FAILED')
}

run().catch(console.error)
