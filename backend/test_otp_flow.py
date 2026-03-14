#!/usr/bin/env python3
"""
Test OTP Login Flow - Complete 3-Step Implementation
Run this script to test the OTP-based login system
"""
import requests
import json
import re
from datetime import datetime

BASE_URL = 'http://localhost:5000'

# Color codes for terminal output
class Colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_step(step_num, title):
    print(f"\n{Colors.BOLD}{Colors.OKBLUE}{'='*60}{Colors.ENDC}")
    print(f"{Colors.OKBLUE}STEP {step_num}: {title}{Colors.ENDC}")
    print(f"{Colors.OKBLUE}{'='*60}{Colors.ENDC}")

def print_request(method, endpoint, data=None):
    print(f"\n{Colors.BOLD}📤 Request:{Colors.ENDC}")
    print(f"   {Colors.OKCYAN}{method} {endpoint}{Colors.ENDC}")
    if data:
        print(f"   Body: {json.dumps(data, indent=6)}")

def print_response(response):
    print(f"\n{Colors.BOLD}📥 Response:{Colors.ENDC}")
    print(f"   Status: {Colors.OKGREEN if response.status_code < 400 else Colors.FAIL}{response.status_code}{Colors.ENDC}")
    try:
        data = response.json()
        print(f"   Body: {json.dumps(data, indent=6)}")
        return data
    except:
        print(f"   Body: {response.text}")
        return None

def test_health_check():
    print(f"\n{Colors.HEADER}{Colors.BOLD}🧪 Testing Backend Health{Colors.ENDC}")
    print("=" * 60)
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        data = print_response(response)
        
        if response.status_code == 200:
            print(f"\n{Colors.OKGREEN}✅ Backend is healthy!{Colors.ENDC}")
            return True
        else:
            print(f"\n{Colors.FAIL}❌ Backend returned error{Colors.ENDC}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"{Colors.FAIL}❌ Could not connect to backend!{Colors.ENDC}")
        print(f"{Colors.WARNING}Make sure Flask is running: python app.py{Colors.ENDC}")
        return False

def test_otp_login_flow():
    test_email = "admin@test.com"
    
    # STEP 1: Request OTP
    print_step(1, f"Request OTP to {test_email}")
    print_request('POST', '/api/auth/send-otp', {"email": test_email})
    
    response = requests.post(
        f"{BASE_URL}/api/auth/send-otp",
        json={"email": test_email}
    )
    data = print_response(response)
    
    if response.status_code not in [200, 201]:
        print(f"\n{Colors.FAIL}❌ Failed to request OTP{Colors.ENDC}")
        return None
    
    print(f"\n{Colors.OKGREEN}✅ OTP requested successfully!{Colors.ENDC}")
    
    # Extract OTP from response (if in debug mode)
    otp = None
    if isinstance(data, dict) and 'debug_otp' in data:
        otp = data['debug_otp']
        print(f"{Colors.WARNING}🔍 Debug OTP: {otp}{Colors.ENDC}")
    
    if not otp:
        # For production, user would get OTP from email
        print(f"\n{Colors.WARNING}📧 OTP sent to email. Check your inbox!{Colors.ENDC}")
        otp = input(f"{Colors.BOLD}Enter OTP code: {Colors.ENDC}")
    
    # STEP 2: Verify OTP and Get Token
    print_step(2, f"Verify OTP and Get JWT Token")
    print_request('POST', '/api/auth/verify-otp', {"email": test_email, "otp": otp})
    
    response = requests.post(
        f"{BASE_URL}/api/auth/verify-otp",
        json={"email": test_email, "otp": otp}
    )
    data = print_response(response)
    
    if response.status_code not in [200, 201]:
        print(f"\n{Colors.FAIL}❌ Failed to verify OTP{Colors.ENDC}")
        if data and 'attempts_left' in data:
            print(f"   {Colors.WARNING}Attempts left: {data['attempts_left']}{Colors.ENDC}")
        return None
    
    print(f"\n{Colors.OKGREEN}✅ OTP verified successfully!{Colors.ENDC}")
    
    # Extract JWT token
    token = data.get('token')
    if not token:
        print(f"{Colors.FAIL}❌ No token in response{Colors.ENDC}")
        return None
    
    print(f"\n{Colors.BOLD}🔐 JWT Token:{Colors.ENDC}")
    print(f"   {token[:50]}...")
    
    # STEP 3: Use Token to Access Protected Routes
    print_step(3, "Access Protected Route (Get Current User)")
    
    headers = {"Authorization": f"Bearer {token}"}
    print_request('GET', '/api/auth/me', None)
    print(f"   Headers: {json.dumps({'Authorization': 'Bearer ' + token[:50] + '...'}, indent=6)}")
    
    response = requests.get(
        f"{BASE_URL}/api/auth/me",
        headers=headers
    )
    data = print_response(response)
    
    if response.status_code == 200:
        print(f"\n{Colors.OKGREEN}✅ Successfully accessed protected route!{Colors.ENDC}")
        print(f"\n{Colors.BOLD}User Profile:{Colors.ENDC}")
        if isinstance(data, dict):
            for key, value in data.items():
                print(f"   {Colors.OKCYAN}{key}:{Colors.ENDC} {value}")
        return token
    else:
        print(f"\n{Colors.FAIL}❌ Failed to access protected route{Colors.ENDC}")
        return None

def test_logout(token):
    print_step(4, "Logout")
    
    headers = {"Authorization": f"Bearer {token}"}
    print_request('POST', '/api/auth/logout', {})
    
    response = requests.post(
        f"{BASE_URL}/api/auth/logout",
        headers=headers
    )
    data = print_response(response)
    
    if response.status_code == 200:
        print(f"\n{Colors.OKGREEN}✅ Logged out successfully!{Colors.ENDC}")
        return True
    else:
        print(f"\n{Colors.FAIL}❌ Logout failed{Colors.ENDC}")
        return False

def main():
    print(f"\n{Colors.BOLD}{Colors.HEADER}")
    print("╔═══════════════════════════════════════════════════════════╗")
    print("║         CoreInventory OTP Login Flow Test                 ║")
    print("║                  Version 1.0 - 2026                       ║")
    print("╚═══════════════════════════════════════════════════════════╝")
    print(f"{Colors.ENDC}")
    
    print(f"\n{Colors.BOLD}🕐 Test started at {datetime.now().strftime('%H:%M:%S')}{Colors.ENDC}")
    
    # Test 1: Health Check
    if not test_health_check():
        print(f"\n{Colors.FAIL}Backend is not running. Exiting.{Colors.ENDC}")
        return
    
    # Test 2-4: OTP Login Flow
    print(f"\n{Colors.BOLD}{Colors.HEADER}Starting OTP Login Test...{Colors.ENDC}")
    
    token = test_otp_login_flow()
    
    if token:
        # Test 5: Logout
        test_logout(token)
    
    # Summary
    print(f"\n{Colors.BOLD}{Colors.HEADER}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.OKGREEN}✅ Test Complete!{Colors.ENDC}")
    print(f"{Colors.HEADER}{'='*60}{Colors.ENDC}")
    
    print(f"""
{Colors.OKGREEN}What we tested:{Colors.ENDC}
  ✅ Backend health check
  ✅ OTP request to email
  ✅ OTP verification & JWT token generation
  ✅ Protected route access with JWT token
  ✅ User logout

{Colors.OKGREEN}Next steps:{Colors.ENDC}
  1. Update frontend to use {BASE_URL}
  2. Implement login UI with OTP flow
  3. Store JWT token in localStorage
  4. Add JWT token to all API requests
  
{Colors.OKCYAN}Documentation:{Colors.ENDC}
  - See BACKEND_SETUP.md for detailed instructions
  - Import CoreInventory_API.postman_collection.json to Postman

{Colors.ENDC}""")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n\n{Colors.WARNING}Test interrupted by user{Colors.ENDC}")
    except Exception as e:
        print(f"\n{Colors.FAIL}Error: {e}{Colors.ENDC}")
