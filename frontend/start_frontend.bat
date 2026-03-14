#!/bin/bash
# Frontend First Development - No Backend Needed
# This file helps you run frontend with mock data

echo "Starting CoreInventory Frontend - Development Mode"
echo "=============================================="
echo ""
echo "Step 1: Navigate to frontend folder"
cd "d:\odoo\frontend"

echo "Step 2: Install dependencies (if needed)"
npm install

echo "Step 3: Start React dev server"
npm start

echo ""
echo "Frontend should now be running on: http://localhost:3000"
echo "All API calls are currently MOCKED - no backend needed"
