import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@coreinventory.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
      const response = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password }
      );

      // Save token and user info
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
      await axios.post(
        `${API_URL}/api/auth/register`,
        { email, password, name: email.split('@')[0] }
      );

      setError('');
      alert('✅ Registration successful! You can now login.');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>📦 CoreInventory</h1>
        <h2>Smart Inventory Management</h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@coreinventory.com"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="admin123"
              disabled={loading}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-login">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="signup-link">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={handleRegister}
            disabled={loading}
            className="btn-register"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </p>

        <div className="test-credentials">
          <p><strong>Test Account:</strong></p>
          <p>Email: admin@coreinventory.com</p>
          <p>Password: admin123</p>
        </div>
      </div>
    </div>
  );
}
