const fetch = require('node-fetch');

async function testQuoteAPI() {
  try {
    console.log('🧪 Testing Quote API...');
    
    const response = await fetch('http://localhost:3000/api/quote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: 'success',
        mood: 'motivational',
        count: 3,
        language: 'English'
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Quote API is working!');
      console.log('📝 Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Quote API failed:', response.status, response.statusText);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
    
  } catch (error) {
    console.log('❌ Error testing Quote API:', error.message);
  }
}

testQuoteAPI(); 