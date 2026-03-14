import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import ProductsPage from "./pages/ProductsPage";
import ProfilePage from "./pages/ProfilePage";
import AuthPage from "./pages/AuthPage";
import OperationsPage from "./pages/OperationsPage";
import OperationDetailPage from "./pages/OperationDetailPage";
import StockPage from "./pages/StockPage";
import MoveHistoryPage from "./pages/MoveHistoryPage";
import SettingsPage from "./pages/SettingsPage";
import { setupMockAPI } from "./services/mockAPI";

// Setup mock API for frontend development (no backend needed)
setupMockAPI(axios);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/auth" />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-screen">
              <Navbar />
              <main className="pt-20 px-6 pb-12">
                <div className="max-w-7xl mx-auto">
                  <header className="mb-8 flex justify-between items-center text-sm font-medium text-slate-600 italic">
                    <span>CoreInventory Dashboard &gt; Management System</span>
                  </header>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/operations/receipt" element={<OperationsPage type="receipt" />} />
                    <Route path="/operations/receipt/:id" element={<OperationDetailPage />} />
                    <Route path="/operations/delivery" element={<OperationsPage type="delivery" />} />
                    <Route path="/operations/delivery/:id" element={<OperationDetailPage />} />
                    <Route path="/operations/adjustment" element={<OperationsPage type="adjustment" />} />
                    <Route path="/stock" element={<StockPage />} />
                    <Route path="/move-history" element={<MoveHistoryPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </div>
                <footer className="mt-16 py-6 border-t border-slate-200 text-center text-slate-400 text-xs tracking-widest italic max-w-7xl mx-auto">
                  COREINVENTORY SYSTEM &copy; 2026 | MODERNIZED ENTERPRISE RESOURCE PLANNING
                </footer>
              </main>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
