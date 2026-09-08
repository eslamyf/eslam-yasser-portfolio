const fs = require('fs');
const http = require('http');
const path = require('path');

async function test() {
  // 1. Login to get valid JWT token
  const loginData = JSON.stringify({ username: 'admin', password: 'admin123' });
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: loginData
  });
  const loginJson = await loginRes.json();
  console.log('LOGIN JSON:', loginJson);

  const token = loginJson.token;

  // 2. Test File Upload
  const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
  const filePath = path.join(__dirname, '../client/assets/pdf/Eslam_Yasser_Resume.pdf');
  const fileBuffer = fs.readFileSync(filePath);

  let body = '';
  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="cv"; filename="Eslam_Yasser_Resume.pdf"\r\n`;
  body += `Content-Type: application/pdf\r\n\r\n`;

  const postData = Buffer.concat([
    Buffer.from(body, 'utf8'),
    fileBuffer,
    Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8')
  ]);

  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/files/upload',
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': postData.length,
      'Authorization': `Bearer ${token}`
    }
  }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log('UPLOAD STATUS:', res.statusCode);
      console.log('UPLOAD RESPONSE:', data);
    });
  });

  req.on('error', e => console.error(e));
  req.write(postData);
  req.end();
}

test();
