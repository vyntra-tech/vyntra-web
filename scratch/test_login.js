import http from 'node:http'

const postData = JSON.stringify({
  email: 'admin@vyntra.tech',
  password: 'VyntraAdmin@2026!'
})

const options = {
  hostname: '127.0.0.1',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
}

const req = http.request(options, (res) => {
  let body = ''
  console.log('STATUS:', res.statusCode)
  res.on('data', (chunk) => { body += chunk })
  res.on('end', () => {
    console.log('BODY:', body)
  })
})

req.on('error', (e) => {
  console.error('ERROR:', e.message)
})

req.write(postData)
req.end()
