const axios = require('axios');

const BASE_URL = 'http://localhost:5000';
let authToken = '';
let adminToken = '';
let userId = '';
let supplierId = '';
let catalogItemId = '';
let rfqId = '';
let bidId = '';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m'
};

function log(status, method, endpoint, message = '') {
  const statusColor = status === 'PASS' ? colors.green : status === 'FAIL' ? colors.red : colors.yellow;
  console.log(`${statusColor}[${status}]${colors.reset} ${colors.blue}${method}${colors.reset} ${endpoint} ${colors.gray}${message}${colors.reset}`);
}

async function testEndpoint(method, endpoint, data = null, headers = {}, expectedStatus = 200) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers,
      ...(data && { data })
    };
    
    const response = await axios(config);
    
    if (response.status === expectedStatus) {
      log('PASS', method, endpoint, `Status: ${response.status}`);
      return { success: true, data: response.data };
    } else {
      log('WARN', method, endpoint, `Expected ${expectedStatus}, got ${response.status}`);
      return { success: false, data: response.data };
    }
  } catch (error) {
    if (error.response && error.response.status === expectedStatus) {
      log('PASS', method, endpoint, `Status: ${error.response.status} (Expected error)`);
      return { success: true, data: error.response.data };
    }
    log('FAIL', method, endpoint, `Error: ${error.response?.data?.message || error.message}`);
    return { success: false, error: error.response?.data || error.message };
  }
}

async function runTests() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 TESTING ALL API ROUTES');
  console.log('='.repeat(80) + '\n');

  // ============================================================================
  // 1. HEALTH CHECK
  // ============================================================================
  console.log('\n📍 1. HEALTH CHECK\n');
  
  await testEndpoint('GET', '/');
  await testEndpoint('GET', '/health');

  // ============================================================================
  // 2. AUTH ROUTES - REGISTRATION
  // ============================================================================
  console.log('\n📍 2. AUTH ROUTES - REGISTRATION\n');

  // Test registration with missing fields (should fail)
  await testEndpoint('POST', '/api/auth/register', {
    name: 'Test User'
  }, {}, 400);

  // Test registration with invalid email (should fail)
  await testEndpoint('POST', '/api/auth/register', {
    name: 'Test User',
    email: 'invalid-email',
    password: '123456'
  }, {}, 400);

  // Test successful user registration
  const userReg = await testEndpoint('POST', '/api/auth/register', {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123',
    role: 'user'
  }, {}, 201);

  if (userReg.success && userReg.data.data) {
    authToken = userReg.data.data.token;
    userId = userReg.data.data._id;
  }

  // Test admin registration
  const adminReg = await testEndpoint('POST', '/api/auth/register', {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  }, {}, 201);

  if (adminReg.success && adminReg.data.data) {
    adminToken = adminReg.data.data.token;
  }

  // Test duplicate registration (should fail)
  await testEndpoint('POST', '/api/auth/register', {
    name: 'Test User',
    email: 'testuser@example.com',
    password: 'password123'
  }, {}, 400);

  // ============================================================================
  // 3. AUTH ROUTES - LOGIN
  // ============================================================================
  console.log('\n📍 3. AUTH ROUTES - LOGIN\n');

  // Test login with wrong password (should fail)
  await testEndpoint('POST', '/api/auth/login', {
    email: 'testuser@example.com',
    password: 'wrongpassword'
  }, {}, 401);

  // Test login with correct credentials
  const login = await testEndpoint('POST', '/api/auth/login', {
    email: 'testuser@example.com',
    password: 'password123'
  });

  if (login.success && login.data.data) {
    authToken = login.data.data.token;
  }

  // ============================================================================
  // 4. AUTH ROUTES - PROFILE
  // ============================================================================
  console.log('\n📍 4. AUTH ROUTES - PROFILE\n');

  // Test getting profile without token (should fail)
  await testEndpoint('GET', '/api/auth/me', null, {}, 401);

  // Test getting profile with token
  await testEndpoint('GET', '/api/auth/me', null, {
    Authorization: `Bearer ${authToken}`
  });

  // Test updating profile
  await testEndpoint('PUT', '/api/auth/profile', {
    name: 'Updated Test User'
  }, {
    Authorization: `Bearer ${authToken}`
  });

  // Test changing password
  await testEndpoint('PUT', '/api/auth/change-password', {
    currentPassword: 'password123',
    newPassword: 'newpassword123'
  }, {
    Authorization: `Bearer ${authToken}`
  });

  // Login with new password
  const newLogin = await testEndpoint('POST', '/api/auth/login', {
    email: 'testuser@example.com',
    password: 'newpassword123'
  });

  if (newLogin.success && newLogin.data.data) {
    authToken = newLogin.data.data.token;
  }

  // ============================================================================
  // 5. SUPPLIER ROUTES
  // ============================================================================
  console.log('\n📍 5. SUPPLIER ROUTES\n');

  // Test creating supplier without auth (should fail)
  await testEndpoint('POST', '/api/suppliers', {
    companyName: 'Test Supplier',
    email: 'supplier@example.com'
  }, {}, 401);

  // Test creating supplier as non-admin (should fail)
  await testEndpoint('POST', '/api/suppliers', {
    companyName: 'Test Supplier',
    email: 'supplier@example.com'
  }, {
    Authorization: `Bearer ${authToken}`
  }, 403);

  // Test creating supplier as admin
  const supplierCreate = await testEndpoint('POST', '/api/suppliers', {
    companyName: 'Test Supplier Co.',
    email: 'supplier@example.com',
    phone: '+1234567890',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10001'
    },
    contactPerson: {
      name: 'John Doe',
      email: 'john@supplier.com',
      phone: '+1234567890',
      position: 'Manager'
    },
    categories: ['Electronics', 'Hardware']
  }, {
    Authorization: `Bearer ${adminToken}`
  }, 201);

  if (supplierCreate.success && supplierCreate.data.data) {
    supplierId = supplierCreate.data.data._id;
  }

  // Test getting all suppliers
  await testEndpoint('GET', '/api/suppliers', null, {
    Authorization: `Bearer ${authToken}`
  });

  // Test getting suppliers with pagination
  await testEndpoint('GET', '/api/suppliers?page=1&limit=10&sortBy=companyName&sortOrder=asc', null, {
    Authorization: `Bearer ${authToken}`
  });

  // Test getting suppliers with search
  await testEndpoint('GET', '/api/suppliers?search=Test', null, {
    Authorization: `Bearer ${authToken}`
  });

  // Test getting single supplier
  if (supplierId) {
    await testEndpoint('GET', `/api/suppliers/${supplierId}`, null, {
      Authorization: `Bearer ${authToken}`
    });

    // Test updating supplier
    await testEndpoint('PUT', `/api/suppliers/${supplierId}`, {
      phone: '+9876543210'
    }, {
      Authorization: `Bearer ${authToken}`
    });

    // Test approving supplier (admin only)
    await testEndpoint('PUT', `/api/suppliers/${supplierId}/approve`, null, {
      Authorization: `Bearer ${adminToken}`
    });

    // Test getting supplier stats
    await testEndpoint('GET', `/api/suppliers/${supplierId}/stats`, null, {
      Authorization: `Bearer ${authToken}`
    });

    // Test rating supplier
    await testEndpoint('POST', `/api/suppliers/${supplierId}/rate`, {
      rating: 4.5
    }, {
      Authorization: `Bearer ${authToken}`
    });
  }

  // ============================================================================
  // 6. CATALOG ROUTES
  // ============================================================================
  console.log('\n📍 6. CATALOG ROUTES\n');

  // Test creating catalog item without auth (should fail)
  await testEndpoint('POST', '/api/catalog', {
    name: 'Test Product',
    supplierId: supplierId
  }, {}, 401);

  // Test creating catalog item with auth
  if (supplierId) {
    const catalogCreate = await testEndpoint('POST', '/api/catalog', {
      supplierId: supplierId,
      name: 'Laptop Computer',
      sku: 'LAP-001',
      description: 'High-performance laptop',
      category: 'Electronics',
      unitPrice: 999.99,
      uom: 'piece',
      stockQuantity: 50,
      minimumOrderQuantity: 1
    }, {
      Authorization: `Bearer ${authToken}`
    }, 201);

    if (catalogCreate.success && catalogCreate.data.data) {
      catalogItemId = catalogCreate.data.data._id;
    }
  }

  // Test getting all catalog items (public)
  await testEndpoint('GET', '/api/catalog');

  // Test getting catalog with pagination
  await testEndpoint('GET', '/api/catalog?page=1&limit=10');

  // Test getting single catalog item
  if (catalogItemId) {
    await testEndpoint('GET', `/api/catalog/${catalogItemId}`);

    // Test updating catalog item
    await testEndpoint('PUT', `/api/catalog/${catalogItemId}`, {
      unitPrice: 899.99
    }, {
      Authorization: `Bearer ${authToken}`
    });
  }

  // ============================================================================
  // 7. RFQ ROUTES
  // ============================================================================
  console.log('\n📍 7. RFQ ROUTES\n');

  // Test creating RFQ without system auth (should fail)
  await testEndpoint('POST', '/api/rfqs', {
    title: 'Test RFQ'
  }, {}, 401);

  // Test creating RFQ with system auth
  const rfqCreate = await testEndpoint('POST', '/api/rfqs', {
    organizationId: 'ORG-001',
    title: 'Request for Office Supplies',
    description: 'Need office supplies for Q4',
    category: 'Office Supplies',
    items: [{
      itemName: 'Laptop',
      description: 'Business laptop',
      quantity: 10,
      uom: 'piece',
      estimatedPrice: 1000
    }],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: 'system'
  }, {
    'x-api-key': process.env.ORGANIZATION_API_KEY || 'test-api-key'
  }, 201);

  if (rfqCreate.success && rfqCreate.data.data) {
    rfqId = rfqCreate.data.data._id;
  }

  // Test getting all RFQs
  await testEndpoint('GET', '/api/rfqs', null, {
    'x-api-key': process.env.ORGANIZATION_API_KEY || 'test-api-key'
  });

  // Test getting single RFQ
  if (rfqId) {
    await testEndpoint('GET', `/api/rfqs/${rfqId}`, null, {
      'x-api-key': process.env.ORGANIZATION_API_KEY || 'test-api-key'
    });

    // Test updating RFQ
    await testEndpoint('PUT', `/api/rfqs/${rfqId}`, {
      description: 'Updated description'
    }, {
      'x-api-key': process.env.ORGANIZATION_API_KEY || 'test-api-key'
    });
  }

  // ============================================================================
  // 8. BID ROUTES
  // ============================================================================
  console.log('\n📍 8. BID ROUTES\n');

  // Test creating bid without auth (should fail)
  await testEndpoint('POST', '/api/bids', {
    rfqId: rfqId
  }, {}, 401);

  // Test creating bid with auth
  if (rfqId && supplierId) {
    const bidCreate = await testEndpoint('POST', '/api/bids', {
      rfqId: rfqId,
      supplierId: supplierId,
      items: [{
        itemName: 'Laptop',
        quantity: 10,
        uom: 'piece',
        unitPrice: 950,
        totalPrice: 9500
      }],
      pricing: {
        subtotal: 9500,
        tax: 950,
        shipping: 100,
        discount: 0,
        totalAmount: 10550,
        currency: 'USD'
      }
    }, {
      Authorization: `Bearer ${authToken}`
    }, 201);

    if (bidCreate.success && bidCreate.data.data) {
      bidId = bidCreate.data.data._id;
    }
  }

  // Test getting all bids (system auth)
  await testEndpoint('GET', '/api/bids', null, {
    'x-api-key': process.env.ORGANIZATION_API_KEY || 'test-api-key'
  });

  // Test getting bids by RFQ
  if (rfqId) {
    await testEndpoint('GET', `/api/bids/rfq/${rfqId}`, null, {
      Authorization: `Bearer ${authToken}`
    });
  }

  // Test updating bid
  if (bidId) {
    await testEndpoint('PUT', `/api/bids/${bidId}`, {
      notes: 'Updated bid notes'
    }, {
      Authorization: `Bearer ${authToken}`
    });
  }

  // ============================================================================
  // 9. ERROR HANDLING
  // ============================================================================
  console.log('\n📍 9. ERROR HANDLING\n');

  // Test 404 for non-existent route
  await testEndpoint('GET', '/api/nonexistent', null, {}, 404);

  // Test invalid MongoDB ID
  await testEndpoint('GET', '/api/suppliers/invalid-id', null, {
    Authorization: `Bearer ${authToken}`
  }, 400);

  // ============================================================================
  // 10. RATE LIMITING
  // ============================================================================
  console.log('\n📍 10. RATE LIMITING (Testing 3 rapid requests)\n');

  for (let i = 0; i < 3; i++) {
    await testEndpoint('POST', '/api/auth/login', {
      email: 'test@test.com',
      password: 'wrong'
    }, {}, 401);
  }

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n' + '='.repeat(80));
  console.log('✅ TEST SUITE COMPLETED');
  console.log('='.repeat(80));
  console.log(`\n${colors.blue}Test Data Created:${colors.reset}`);
  console.log(`  User ID: ${userId}`);
  console.log(`  Supplier ID: ${supplierId}`);
  console.log(`  Catalog Item ID: ${catalogItemId}`);
  console.log(`  RFQ ID: ${rfqId}`);
  console.log(`  Bid ID: ${bidId}`);
  console.log(`\n${colors.yellow}Note: Check server logs for detailed error messages${colors.reset}\n`);
}

// Run tests
runTests().catch(error => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
