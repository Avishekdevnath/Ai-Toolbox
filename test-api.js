const https = require('https');
const http = require('http');

async function testAPI() {
  console.log('🔍 Testing API Endpoints...\n');

  // Test 1: Admin Login
  console.log('1. Testing Admin Login...');
  try {
    const loginResponse = await makeRequest('POST', '/api/admin/auth/login', {
      email: 'superadmin@ai-toolbox.com',
      password: 'Admin@123456'
    });
    
    if (loginResponse.success) {
      console.log('✅ Login successful');
      const token = loginResponse.token;
      
      // Test 2: Users API with token
      console.log('\n2. Testing Users API...');
      const usersResponse = await makeRequest('GET', '/api/admin/users?page=1&limit=5', null, token);
      
      if (usersResponse.success) {
        console.log('✅ Users API working');
        console.log(`📊 Found ${usersResponse.data.users.length} users`);
        console.log(`📄 Total users: ${usersResponse.data.pagination.totalUsers}`);
      } else {
        console.log('❌ Users API failed:', usersResponse.error);
      }
    } else {
      console.log('❌ Login failed:', loginResponse.error);
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve(response);
        } catch (error) {
          resolve({ success: false, error: 'Invalid JSON response' });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

testAPI(); 