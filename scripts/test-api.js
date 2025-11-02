const axios = require('axios');

// Test the API integration with the updated chartService logic
const API_BASE = 'http://localhost:3001/api';

const testApiIntegration = async () => {
  console.log('🧪 Testing API Integration...\n');

  try {
    // Test 1: Check if server is running
    console.log('1️⃣ Testing server connection...');
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ Server is running:', healthResponse.data.status);
    console.log('');

    // Test 2: Get charts list
    console.log('2️⃣ Testing charts list endpoint...');
    const chartsResponse = await axios.get(`${API_BASE}/charts`);
    console.log('✅ Charts endpoint response structure:');
    console.log('   - Success:', chartsResponse.data.success);
    console.log('   - Has data object:', !!chartsResponse.data.data);
    console.log('   - Has charts array:', !!chartsResponse.data.data?.charts);
    console.log('   - Number of charts:', chartsResponse.data.data?.charts?.length || 0);
    console.log('');

    // Test 3: Test our service logic simulation
    console.log('3️⃣ Testing service logic simulation...');
    
    const handleApiResponse = (response, expectedDataPath) => {
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      if (!response.data.success) {
        const errorMessage = response.data.error || response.data.message || 'Server returned error';
        throw new Error(errorMessage);
      }
      
      if (expectedDataPath) {
        const pathParts = expectedDataPath.split('.');
        let data = response.data;
        
        for (const part of pathParts) {
          if (!data || typeof data !== 'object' || !(part in data)) {
            throw new Error(`Invalid response structure: missing ${expectedDataPath}`);
          }
          data = data[part];
        }
        
        return data;
      }
      
      return response.data;
    };

    // Simulate chartService.getChartsData()
    const chartsData = handleApiResponse(chartsResponse, 'data');
    console.log('✅ Service simulation successful');
    console.log('   - Extracted data:', !!chartsData);
    console.log('   - Has pagination:', !!chartsData.pagination);
    console.log('');

    // Test 4: Test individual chart if available
    if (chartsData.charts && chartsData.charts.length > 0) {
      console.log('4️⃣ Testing individual chart endpoint...');
      const firstChartId = chartsData.charts[0]._id;
      console.log('   - First chart ID:', firstChartId);

      const chartResponse = await axios.get(`${API_BASE}/charts/${firstChartId}`);
      const chartData = handleApiResponse(chartResponse, 'data.chart');
      
      console.log('✅ Individual chart endpoint successful');
      console.log('   - Has plotlyData:', !!chartData.plotlyData);
      console.log('   - Chart title:', chartData.chartTitle || 'No title');
      console.log('');
    } else {
      console.log('4️⃣ No charts available for individual testing');
      console.log('💡 You may need to add some chart data first');
      console.log('');
    }

    console.log('🎉 All API integration tests passed!');
    console.log('✨ The React app should now work with the updated API');

  } catch (error) {
    console.error('❌ API Integration test failed:');
    console.error('   Error:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Response:', JSON.stringify(error.response.data, null, 2));
    }
    console.log('');
    console.log('🔧 Possible solutions:');
    console.log('   1. Make sure the API server is running on port 3001');
    console.log('   2. Check that MongoDB is connected');
    console.log('   3. Verify CORS configuration');
    console.log('   4. Add some chart data to the database');
  }
};

// Run the test
testApiIntegration();