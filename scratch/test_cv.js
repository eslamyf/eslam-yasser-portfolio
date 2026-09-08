async function testCv() {
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' })
  });
  const { token } = await loginRes.json();

  const cvPayload = {
    name: 'Eslam Yasser - Resume 2026.pdf',
    version: 'v2.0',
    pdfFile: '/assets/pdf/Eslam_Yasser_Resume.pdf',
    active: true
  };

  const saveRes = await fetch('http://localhost:5000/api/cv', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(cvPayload)
  });

  const saveJson = await saveRes.json();
  console.log('SAVE CV RESPONSE:', saveJson);
}

testCv();
