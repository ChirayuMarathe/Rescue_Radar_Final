// API Testing Script for RescueRadar
// This script tests all API endpoints to ensure they're working correctly

const API_BASE = 'http://localhost:3002/api';

const testData = {
  report: {
    description: "Injured dog found on the street, appears to have a broken leg and is limping badly. The dog seems friendly but scared.",
    location: "123 Main Street, Downtown Area",
    contact_name: "John Doe",
    contact_email: "john@example.com",
    contact_phone: "+1234567890",
    urgency_level: "high",
    animal_type: "dog",
    situation_type: "injury"
  }
};

async function testAPI(endpoint, method = 'GET', data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();
    
    console.log(`✅ ${method} ${endpoint}:`, response.status, result);
    return { success: response.ok, data: result };
  } catch (error) {
    console.error(`❌ ${method} ${endpoint}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting RescueRadar API Tests...\n');
  
  // Test 1: AI Analysis
  console.log('1. Testing AI Analysis...');
  const aiTest = await testAPI('/ai-analysis', 'POST', {
    description: testData.report.description,
    location: testData.report.location,
    animal_type: testData.report.animal_type,
    situation_type: testData.report.situation_type
  });
  
  // Test 2: Save Report
  console.log('\n2. Testing Save Report...');
  const saveTest = await testAPI('/save-report', 'POST', {
    ...testData.report,
    ai_analysis: aiTest.success ? aiTest.data.analysis : null
  });
  
  let reportId = null;
  if (saveTest.success && saveTest.data.report_id) {
    reportId = saveTest.data.report_id;
  }
  
  // Test 3: Email Notification
  if (reportId) {
    console.log('\n3. Testing Email Notification...');
    await testAPI('/email-notify', 'POST', {
      report_id: reportId,
      email: testData.report.contact_email,
      subject: 'Test Email Notification',
      content: 'This is a test email notification from RescueRadar API.',
      urgency_level: testData.report.urgency_level
    });
  }
  
  // Test 4: WhatsApp Notification
  if (reportId) {
    console.log('\n4. Testing WhatsApp Notification...');
    await testAPI('/whatsapp-notify', 'POST', {
      phone_number: testData.report.contact_phone,
      message: `Test WhatsApp notification for report ${reportId}`,
      report_id: reportId,
      urgency_level: testData.report.urgency_level
    });
  }
  
  // Test 5: QR Code Generation
  if (reportId) {
    console.log('\n5. Testing QR Code Generation...');
    await testAPI(`/generate-qr?report_id=${reportId}&format=png&size=200`);
  }
  
  // Test 6: Complete Report Workflow
  console.log('\n6. Testing Complete Report Workflow...');
  await testAPI('/report', 'POST', testData.report);
  
  console.log('\n🎉 API Testing Complete!');
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  runTests();
} else {
  // Browser environment - expose function to window
  window.runRescueRadarTests = runTests;
  console.log('RescueRadar API test function loaded. Run window.runRescueRadarTests() to start tests.');
}

module.exports = { runTests, testAPI, testData };
