/**
 * Mock API Service - Replaces backend during frontend development
 * All API calls return mock data - no backend needed!
 */

const mockData = {
  users: [
    {
      id: 1,
      username: "admin",
      email: "admin@coreinventory.com",
      role: "manager",
      is_active: true
    }
  ],
  products: [
    {
      id: 1,
      name: "Widget A",
      sku: "SKU-001",
      category: "Electronics",
      uom: "Units",
      min_stock_level: 10
    },
    {
      id: 2,
      name: "Widget B",
      sku: "SKU-002",
      category: "Electronics",
      uom: "Units",
      min_stock_level: 15
    },
    {
      id: 3,
      name: "Component X",
      sku: "SKU-003",
      category: "Parts",
      uom: "Units",
      min_stock_level: 20
    }
  ],
  warehouses: [
    {
      id: 1,
      name: "Main Warehouse",
      short_code: "WH-001",
      address: "123 Business Street, Industrial Area"
    }
  ],
  locations: [
    {
      id: 1,
      name: "Storage Room A",
      short_code: "LOC-001",
      warehouse_id: 1
    },
    {
      id: 2,
      name: "Storage Room B",
      short_code: "LOC-002",
      warehouse_id: 1
    },
    {
      id: 3,
      name: "Loading Dock",
      short_code: "LOC-003",
      warehouse_id: 1
    }
  ],
  stockLevels: [
    {
      id: 1,
      product_id: 1,
      location_id: 1,
      on_hand: 50,
      free_to_use: 48,
      per_unit_cost: 99.99
    },
    {
      id: 2,
      product_id: 2,
      location_id: 1,
      on_hand: 75,
      free_to_use: 70,
      per_unit_cost: 149.99
    },
    {
      id: 3,
      product_id: 3,
      location_id: 2,
      on_hand: 100,
      free_to_use: 95,
      per_unit_cost: 49.99
    }
  ],
  stockMoves: [
    // RECEIPT OPERATIONS
    {
      id: 1,
      product_id: 1,
      product_name: "Widget A",
      from_location: "Vendor - Azure Interior",
      to_location: "WH/Stock1",
      contact: "Azure Interior",
      schedule_date: "2026-03-18",
      quantity: 10,
      reference: "WH/IN/0001",
      status: "Ready",
      move_type: "in",
      type: "receipt",
      created_at: new Date(Date.now() - 2*24*60*60*1000).toISOString()
    },
    {
      id: 2,
      product_id: 2,
      product_name: "Widget B",
      from_location: "Vendor - Tech Supplies",
      to_location: "WH/Stock1",
      contact: "Tech Supplies",
      schedule_date: "2026-03-19",
      quantity: 5,
      reference: "WH/IN/0002",
      status: "Ready",
      move_type: "in",
      type: "receipt",
      created_at: new Date(Date.now() - 1*24*60*60*1000).toISOString()
    },
    {
      id: 3,
      product_id: 1,
      product_name: "Widget A",
      from_location: "Vendor - Global Parts",
      to_location: "WH/Stock1",
      contact: "Global Parts",
      schedule_date: "2026-03-10",
      quantity: 20,
      reference: "WH/IN/0003",
      status: "Draft",
      move_type: "in",
      type: "receipt",
      created_at: new Date(Date.now() - 5*24*60*60*1000).toISOString()
    },
    {
      id: 4,
      product_id: 3,
      product_name: "Component X",
      from_location: "Vendor - Manufacturing Co",
      to_location: "WH/Stock1",
      contact: "Manufacturing Co",
      schedule_date: "2026-03-12",
      quantity: 15,
      reference: "WH/IN/0004",
      status: "Waiting",
      move_type: "in",
      type: "receipt",
      created_at: new Date(Date.now() - 3*24*60*60*1000).toISOString()
    },
    {
      id: 5,
      product_id: 2,
      product_name: "Widget B",
      from_location: "Vendor - Bulk Suppliers",
      to_location: "WH/Stock1",
      contact: "Bulk Suppliers",
      schedule_date: "2026-03-08",
      quantity: 25,
      reference: "WH/IN/0005",
      status: "Draft",
      move_type: "in",
      type: "receipt",
      created_at: new Date(Date.now() - 7*24*60*60*1000).toISOString()
    },
    {
      id: 6,
      product_id: 1,
      product_name: "Widget A",
      from_location: "Vendor - Quality Store",
      to_location: "WH/Stock1",
      contact: "Quality Store",
      schedule_date: "2026-03-20",
      quantity: 12,
      reference: "WH/IN/0006",
      status: "Ready",
      move_type: "in",
      type: "receipt",
      created_at: new Date(Date.now() - 30*60*60*1000).toISOString()
    },
    
    // DELIVERY OPERATIONS
    {
      id: 7,
      product_id: 2,
      product_name: "Widget B",
      from_location: "WH/Stock1",
      to_location: "Customer - Acme Corp",
      contact: "Acme Corp",
      schedule_date: "2026-03-17",
      quantity: 8,
      reference: "WH/OUT/0001",
      status: "Ready",
      move_type: "out",
      type: "delivery",
      created_at: new Date(Date.now() - 1*24*60*60*1000).toISOString()
    },
    {
      id: 8,
      product_id: 1,
      product_name: "Widget A",
      from_location: "WH/Stock1",
      to_location: "Customer - Big Retail",
      contact: "Big Retail",
      schedule_date: "2026-03-19",
      quantity: 30,
      reference: "WH/OUT/0002",
      status: "Ready",
      move_type: "out",
      type: "delivery",
      created_at: new Date(Date.now() - 2*24*60*60*1000).toISOString()
    },
    {
      id: 9,
      product_id: 3,
      product_name: "Component X",
      from_location: "WH/Stock1",
      to_location: "Customer - Industrial Ltd",
      contact: "Industrial Ltd",
      schedule_date: "2026-03-15",
      quantity: 50,
      reference: "WH/OUT/0003",
      status: "Draft",
      move_type: "out",
      type: "delivery",
      created_at: new Date(Date.now() - 4*24*60*60*1000).toISOString()
    },
    {
      id: 10,
      product_id: 2,
      product_name: "Widget B",
      from_location: "WH/Stock1",
      to_location: "Customer - Express Dist",
      contact: "Express Dist",
      schedule_date: "2026-03-16",
      quantity: 12,
      reference: "WH/OUT/0004",
      status: "Waiting",
      move_type: "out",
      type: "delivery",
      created_at: new Date(Date.now() - 3*24*60*60*1000).toISOString()
    },
    {
      id: 11,
      product_id: 1,
      product_name: "Widget A",
      from_location: "WH/Stock1",
      to_location: "Customer - Quick Sales",
      contact: "Quick Sales",
      schedule_date: "2026-03-20",
      quantity: 18,
      reference: "WH/OUT/0005",
      status: "Ready",
      move_type: "out",
      type: "delivery",
      created_at: new Date(Date.now() - 30*60*60*1000).toISOString()
    },
    {
      id: 12,
      product_id: 3,
      product_name: "Component X",
      from_location: "WH/Stock1",
      to_location: "Customer - Supply Plus",
      contact: "Supply Plus",
      schedule_date: "2026-03-09",
      quantity: 40,
      reference: "WH/OUT/0006",
      status: "Draft",
      move_type: "out",
      type: "delivery",
      created_at: new Date(Date.now() - 6*24*60*60*1000).toISOString()
    },
    // Additional Receipt Entries
    {
      id: 13,
      product_id: 2,
      product_name: "Widget B",
      from_location: "Vendor - Premium Electronics",
      to_location: "WH/Stock1",
      contact: "Premium Electronics",
      schedule_date: "2026-03-22",
      quantity: 35,
      reference: "WH/IN/0007",
      status: "Waiting",
      move_type: "in",
      type: "receipt",
      created_at: new Date(Date.now() - 8*60*60*1000).toISOString()
    },
    {
      id: 14,
      product_id: 3,
      product_name: "Component X",
      from_location: "Vendor - Industrial Supplies",
      to_location: "WH/Stock1",
      contact: "Industrial Supplies",
      schedule_date: "2026-03-25",
      quantity: 60,
      reference: "WH/IN/0008",
      status: "Draft",
      move_type: "in",
      type: "receipt",
      created_at: new Date(Date.now() - 12*60*60*1000).toISOString()
    },
    // Additional Delivery Entries
    {
      id: 15,
      product_id: 2,
      product_name: "Widget B",
      from_location: "WH/Stock1",
      to_location: "Customer - Elite Traders",
      contact: "Elite Traders",
      schedule_date: "2026-03-21",
      quantity: 22,
      reference: "WH/OUT/0007",
      status: "Waiting",
      move_type: "out",
      type: "delivery",
      created_at: new Date(Date.now() - 4*60*60*1000).toISOString()
    },
    {
      id: 16,
      product_id: 1,
      product_name: "Widget A",
      from_location: "WH/Stock1",
      to_location: "Customer - Prime Distribution",
      contact: "Prime Distribution",
      schedule_date: "2026-03-23",
      quantity: 45,
      reference: "WH/OUT/0008",
      status: "Ready",
      move_type: "out",
      type: "delivery",
      created_at: new Date(Date.now() - 10*60*60*1000).toISOString()
    }
  ]
};

/**
 * Intercept API calls and return mock data
 * Works exactly like the real backend
 */
export const setupMockAPI = (axiosInstance) => {
  // Use request interceptor to intercept BEFORE network call
  axiosInstance.interceptors.request.use(
    config => {
      // Intercept GET requests
      if (config.method === 'get') {
        if (config.url.includes('/api/products')) {
          config.adapter = () => Promise.resolve({
            data: mockData.products,
            status: 200
          });
        }
        
        if (config.url.includes('/api/warehouses')) {
          config.adapter = () => Promise.resolve({
            data: mockData.warehouses,
            status: 200
          });
        }
        
        if (config.url.includes('/api/locations')) {
          config.adapter = () => Promise.resolve({
            data: mockData.locations,
            status: 200
          });
        }
        
        if (config.url.includes('/api/stock-moves')) {
          config.adapter = () => Promise.resolve({
            data: mockData.stockMoves,
            status: 200
          });
        }
        
        if (config.url.includes('/health')) {
          config.adapter = () => Promise.resolve({
            data: { status: "Mock Backend is running" },
            status: 200
          });
        }
      }
      
      // Intercept POST requests
      if (config.method === 'post') {
        if (config.url.includes('/api/auth/login')) {
          const data = JSON.parse(config.data);
          config.adapter = () => Promise.resolve({
            data: {
              token: "mock-jwt-token-" + Date.now(),
              user: {
                id: 1,
                username: data.username || data.email,
                email: data.email || "demo@example.com",
                role: "staff"
              }
            },
            status: 200
          });
        }
        
        if (config.url.includes('/api/auth/signup')) {
          config.adapter = () => Promise.resolve({
            data: {
              message: "Mock: User created successfully"
            },
            status: 201
          });
        }
        
        if (config.url.includes('/api/auth/request-otp')) {
          config.adapter = () => Promise.resolve({
            data: {
              message: "Mock OTP: 123456 (valid for 10 min)"
            },
            status: 200
          });
        }
        
        if (config.url.includes('/api/auth/reset-password')) {
          config.adapter = () => Promise.resolve({
            data: {
              message: "Mock: Password reset successful"
            },
            status: 200
          });
        }
        
        if (config.url.includes('/api/products')) {
          config.adapter = () => Promise.resolve({
            data: { message: "Mock: Product created", id: 4 },
            status: 201
          });
        }
        
        if (config.url.includes('/api/stock-moves')) {
          config.adapter = () => Promise.resolve({
            data: { message: "Mock: Stock move created", id: 4 },
            status: 201
          });
        }
        
        if (config.url.includes('/api/warehouses')) {
          config.adapter = () => Promise.resolve({
            data: { message: "Mock: Warehouse created", id: 2 },
            status: 201
          });
        }
        
        if (config.url.includes('/api/locations')) {
          config.adapter = () => Promise.resolve({
            data: { message: "Mock: Location created", id: 4 },
            status: 201
          });
        }
      }
      
      return config;
    },
    error => Promise.reject(error)
  );
};

export default mockData;
