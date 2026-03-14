# CoreInventory Backend Setup Guide

## 📋 Prerequisites
- Python 3.8+
- XAMPP with MySQL running
- Database `coreinventory` created

## 🚀 Quick Start

### 1️⃣ Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2️⃣ Setup Environment Variables
```bash
# Copy the example file
copy .env.example .env

# Edit .env with your configuration (optional for development)
# Default: localhost, root (no password), coreinventory
```

### 3️⃣ Verify Database Connection
- Open XAMPP Control Panel
- Start **Apache** and **MySQL** services
- Open phpMyAdmin: http://localhost/phpmyadmin
- Verify `coreinventory` database exists with tables:
  - users
  - products
  - stock_moves
  - stock_levels
  - locations
  - warehouses

### 4️⃣ Create Initial User (Admin) for Testing
```bash
# Connect to MySQL
# In phpMyAdmin, run this SQL:

INSERT INTO users (username, email, password_hash, role, warehouse_id, location_id, created_at) 
VALUES (
  'admin',
  'admin@test.com',
  '$2b$12$YOUR_HASHED_PASSWORD_HERE',
  'admin',
  1,
  1,
  NOW()
);

# OR use Python to create user with hashed password
```

### 5️⃣ Run Flask Backend
```bash
python app.py
```

Expected output:
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

### 6️⃣ Test Backend Health
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "✅ Backend running",
  "database": "Connected to MySQL 5.7.xx",
  "api_version": "1.0"
}
```

---

## 🔐 OTP-Based Login Flow

### Complete 3-Step Flow:

#### **Step 1: Send OTP to Email**
```bash
POST http://localhost:5000/api/auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}

# Response:
{
  "message": "OTP sent to your email",
  "email": "user@example.com",
  "expires_in": "10 minutes"
}
```

#### **Step 2: Verify OTP and Get JWT Token**
```bash
POST http://localhost:5000/api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}

# Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "email": "user@example.com"
  }
}
```

#### **Step 3: Use Token for Protected Routes**
```bash
GET http://localhost:5000/api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Response:
{
  "id": 1,
  "username": "admin",
  "email": "user@example.com",
  "role": "admin",
  "location_id": 1,
  "warehouse_id": 1,
  "created_at": "2026-03-14T10:30:00"
}
```

---

## 📧 Email Configuration for Gmail

### Setup Gmail App Password:
1. Go to: https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Generate "App Password" for Gmail
4. Copy the 16-character password
5. Add to `.env`:
```
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

### For Development (No Email):
- Just request OTP endpoint will return debug OTP
- Useful for testing without email setup

---

## 🔗 Frontend Integration

### Update Frontend axiosconfig (in App.js):
```javascript
// Create axios instance with auth token
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Frontend Login Flow:
```javascript
// Step 1: Send OTP
const response = await api.post('/api/auth/send-otp', {
  email: userEmail
});

// Step 2: Verify OTP (after user enters code)
const loginResponse = await api.post('/api/auth/verify-otp', {
  email: userEmail,
  otp: userOTP
});

// Save token
localStorage.setItem('authToken', loginResponse.data.token);

// Step 3: Use authenticated requests
const userProfile = await api.get('/api/auth/me');
```

---

## 🐛 Debugging

### Check Database Connection:
```python
python
>>> from app import test_db_connection
>>> status, message = test_db_connection()
>>> print(f"Status: {status}, Message: {message}")
```

### View OTP in Console (Development):
When you request OTP, check the Flask terminal for:
```
✅ OTP sent to user@example.com: 123456
```

### Common Issues:

**"Database connection failed"**
- Check XAMPP MySQL is running
- Verify database name: `coreinventory`
- Check MySQL port: 3306

**"Email sending failed"**
- Check MAIL_USERNAME and MAIL_PASSWORD in .env
- Verify Gmail app password (not regular password)
- Check firewall/antivirus blocking SMTP port 587

**"OTP has expired"**
- OTP expires in 10 minutes
- User must request new OTP
- Stored attempts counter blocks after 5 failures

---

## 📝 API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /health | No | Health check |
| POST | /api/auth/send-otp | No | Request OTP to email |
| POST | /api/auth/verify-otp | No | Verify OTP and get token |
| GET | /api/auth/me | **Yes** | Get current user info |
| POST | /api/auth/logout | **Yes** | Logout |
| POST | /api/auth/signup | No | Create new user account |
| POST | /api/auth/login | No | Traditional password login |
| GET | /api/products | **Yes** | Get all products |
| POST | /api/products | **Yes** | Create product |
| POST | /api/stock-moves | **Yes** | Create stock move |

---

## 🎯 Next Steps

1. ✅ Setup database (done)
2. ✅ Install dependencies
3. ✅ Run backend
4. ⏳ Test OTP flow with Postman/Curl
5. ⏳ Connect frontend to backend
6. ⏳ Implement Products API
7. ⏳ Implement Stock Moves API
8. ⏳ Implement Stock Adjustments API

---

## 📞 Support

For issues:
1. Check console output for error messages
2. Verify database connection (see Debugging section)
3. Check .env configuration
4. Review API response status codes

**Created:** March 2026 | **Version:** 1.0
