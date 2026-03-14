import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, RefreshCw, LogIn, UserPlus } from 'lucide-react';

const AuthPage = () => {
    const [view, setView] = useState('login'); // 'login' or 'signup'
    const [formData, setFormData] = useState({ 
        username: '', email: '', password: '', confirmPassword: '', role: 'staff'
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // Client-side validation
        if (view === 'signup') {
            if (formData.username.length < 6 || formData.username.length > 12) {
                setError('Login ID must be between 6-12 characters');
                return;
            }
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                return;
            }
            if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) || formData.password.length < 6 || formData.password.length > 20) {
                setError('Password must be 6-20 characters and contain at least one special character');
                return;
            }
        }

        setLoading(true);

        try {
            let url = '';
            let payload = {};

            if (view === 'login') {
                url = 'http://localhost:5000/api/auth/login';
                payload = { email: formData.username || formData.email, password: formData.password };
            } else if (view === 'signup') {
                url = 'http://localhost:5000/api/auth/signup';
                payload = { username: formData.username, email: formData.email, password: formData.password, role: formData.role };
            }

            const res = await axios.post(url, payload);

            if (view === 'login') {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                navigate('/');
            } else {
                setMessage('Signup successful! Please login.');
                setView('login');
                setFormData({ username: '', email: '', password: '', confirmPassword: '', role: 'staff' });
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex flex-col items-center justify-center p-4 font-sans">
            {/* App Logo */}
            <div className="mb-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-4xl font-black text-white italic">CI</span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 italic uppercase tracking-tight">CoreInventory</h1>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Enterprise ERP System</p>
            </div>

            {/* Auth Cards Container */}
            <div className="w-full max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* LOGIN CARD */}
                    <div className={`bg-white rounded-3xl border-2 border-slate-200 p-8 shadow-lg shadow-slate-200/40 transition-all duration-500 ${view === 'login' ? 'lg:scale-100 opacity-100' : 'lg:scale-95 lg:opacity-50'}`}>
                        {/* Card Badge */}
                        <div className="text-center mb-8">
                            <span className="text-lg font-black text-indigo-600 italic uppercase tracking-wide">Login Page</span>
                        </div>

                        <form onSubmit={view === 'login' ? handleAuth : (e) => e.preventDefault()} className="space-y-6">
                            {/* Error Message */}
                            {error && view === 'login' && (
                                <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-lg flex items-start space-x-3">
                                    <AlertCircle className="text-rose-600 flex-shrink-0 mt-0.5" size={18} />
                                    <p className="text-sm font-bold text-rose-800">{error}</p>
                                </div>
                            )}

                            {/* Success Message */}
                            {message && view === 'login' && (
                                <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg flex items-start space-x-3">
                                    <RefreshCw className="text-emerald-600 flex-shrink-0 mt-0.5 animate-spin" size={18} />
                                    <p className="text-sm font-bold text-emerald-800">{message}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest italic">Login ID</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all text-sm font-medium placeholder:text-slate-400 placeholder:italic"
                                    placeholder="Enter your login ID"
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    disabled={view !== 'login'}
                                    required={view === 'login'}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest italic">Password</label>
                                <input 
                                    type="password" 
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all text-sm font-medium placeholder:text-slate-400 placeholder:italic"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    disabled={view !== 'login'}
                                    required={view === 'login'}
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={loading || view !== 'login'}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg disabled:shadow-none"
                            >
                                {loading ? <RefreshCw className="animate-spin inline mr-2" size={16} /> : null}
                                Sign In
                            </button>

                            {view === 'login' && (
                                <div className="text-center pt-4">
                                    <div className="space-y-2">
                                        <button 
                                            type="button"
                                            onClick={() => setError('Password reset feature coming soon')}
                                            className="block w-full text-xs font-bold text-slate-600 hover:text-indigo-600 uppercase tracking-wider italic"
                                        >
                                            Forgot Password?
                                        </button>
                                        <span className="text-slate-400 text-xs">|</span>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                setView('signup');
                                                setError('');
                                                setMessage('');
                                            }}
                                            className="block w-full text-xs font-bold text-slate-600 hover:text-indigo-600 uppercase tracking-wider italic"
                                        >
                                            Sign Up
                                        </button>
                                    </div>
                                </div>
                            )}
                        </form>

                        {/* Info Box */}
                        {view === 'login' && (
                            <div className="mt-8 p-4 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1 italic font-medium">
                                <p>• Check for login credentials</p>
                                <p>• Match creds - if not exist, show error</p>
                                <p>• Clear all input, Load register page</p>
                            </div>
                        )}
                    </div>

                    {/* SIGN UP CARD */}
                    <div className={`bg-white rounded-3xl border-2 border-slate-200 p-8 shadow-lg shadow-slate-200/40 transition-all duration-500 ${view === 'signup' ? 'lg:scale-100 opacity-100' : 'lg:scale-95 lg:opacity-50'}`}>
                        {/* Card Badge */}
                        <div className="text-center mb-8">
                            <span className="text-lg font-black text-indigo-600 italic uppercase tracking-wide">Sign Up Page</span>
                        </div>

                        <form onSubmit={view === 'signup' ? handleAuth : (e) => e.preventDefault()} className="space-y-5">
                            {/* Error Message */}
                            {error && view === 'signup' && (
                                <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-lg flex items-start space-x-3">
                                    <AlertCircle className="text-rose-600 flex-shrink-0 mt-0.5" size={18} />
                                    <p className="text-sm font-bold text-rose-800">{error}</p>
                                </div>
                            )}

                            {/* Success Message */}
                            {message && view === 'signup' && (
                                <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg flex items-start space-x-3">
                                    <RefreshCw className="text-emerald-600 flex-shrink-0 mt-0.5 animate-spin" size={18} />
                                    <p className="text-sm font-bold text-emerald-800">{message}</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest italic">Enter Login ID</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all text-sm font-medium placeholder:text-slate-400 placeholder:italic"
                                    placeholder="6-12 characters"
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    disabled={view !== 'signup'}
                                    required={view === 'signup'}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest italic">Enter Email ID</label>
                                <input 
                                    type="email" 
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all text-sm font-medium placeholder:text-slate-400 placeholder:italic"
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    disabled={view !== 'signup'}
                                    required={view === 'signup'}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest italic">Enter Password</label>
                                <input 
                                    type="password" 
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all text-sm font-medium placeholder:text-slate-400 placeholder:italic"
                                    placeholder="6-20 characters with special char"
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    disabled={view !== 'signup'}
                                    required={view === 'signup'}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest italic">Re-Enter Password</label>
                                <input 
                                    type="password" 
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all text-sm font-medium placeholder:text-slate-400 placeholder:italic"
                                    placeholder="Confirm password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                    disabled={view !== 'signup'}
                                    required={view === 'signup'}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest italic">Select Role</label>
                                <select
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    disabled={view !== 'signup'}
                                    required={view === 'signup'}
                                >
                                    <option value="staff">Warehouse Staff</option>
                                    <option value="manager">Inventory Manager</option>
                                </select>
                            </div>

                            <button 
                                type="submit"
                                disabled={loading || view !== 'signup'}
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg disabled:shadow-none mt-6"
                            >
                                {loading ? <RefreshCw className="animate-spin inline mr-2" size={16} /> : null}
                                Sign Up
                            </button>

                            {view === 'signup' && (
                                <button 
                                    type="button"
                                    onClick={() => {
                                        setView('login');
                                        setError('');
                                        setMessage('');
                                    }}
                                    className="w-full text-xs font-bold text-slate-600 hover:text-indigo-600 uppercase tracking-wider italic mt-4"
                                >
                                    Back to Login
                                </button>
                            )}
                        </form>

                        {/* Info Box */}
                        {view === 'signup' && (
                            <div className="mt-8 p-4 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1 italic font-medium">
                                <p>• Create database entry on signup</p>
                                <p>• Login ID: 6-12 characters, unique</p>
                                <p>• Password: 6-20 chars, special char required</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-slate-400 font-bold uppercase tracking-widest italic mt-8">
                CoreInventory &copy; 2026 | Enterprise Resource Planning System
            </div>
        </div>
    );
};

export default AuthPage;
