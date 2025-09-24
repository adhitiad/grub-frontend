// Test script to verify API connectivity
const axios = require('axios');

async function testApiConnection() {
  console.log('🧪 Testing API Connection...\n');

  // Test 1: Direct backend connection
  console.log('1. Testing direct backend connection...');
  try {
    const response = await axios.get('http://localhost:8520/health', {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Direct backend connection: SUCCESS');
    console.log('   Status:', response.status);
    console.log('   Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Direct backend connection: FAILED');
    console.log('   Error:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Next.js proxy connection
  console.log('2. Testing Next.js proxy connection...');
  try {
    const response = await axios.get('http://localhost:3003/health', {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ Next.js proxy connection: SUCCESS');
    console.log('   Status:', response.status);
    console.log('   Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Next.js proxy connection: FAILED');
    console.log('   Error:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: CORS test (simulating browser request)
  console.log('3. Testing CORS headers...');
  try {
    const response = await axios.get('http://localhost:8520/health', {
      timeout: 5000,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3003'
      }
    });
    console.log('✅ CORS test: SUCCESS');
    console.log('   CORS Headers:');
    console.log('   - Access-Control-Allow-Origin:', response.headers['access-control-allow-origin']);
    console.log('   - Access-Control-Allow-Methods:', response.headers['access-control-allow-methods']);
    console.log('   - Access-Control-Allow-Headers:', response.headers['access-control-allow-headers']);
  } catch (error) {
    console.log('❌ CORS test: FAILED');
    console.log('   Error:', error.message);
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Headers:', error.response.headers);
    }
  }

  console.log('\n🏁 API Connection Test Complete!');
}

// Run the test
testApiConnection().catch(console.error);
