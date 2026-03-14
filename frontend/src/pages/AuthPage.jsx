import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, RefreshCw, LogIn, UserPlus, X, ArrowRight } from 'lucide-react';

const AuthPage = () => {
    const [view, setView] = useState('login'); // 'login' or 'signup'
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotStep, setForgotStep] = useState(1); // 1: email, 2: otp, 3: new password
    const [formData, setFormData] = useState({ 
        username: '', email: '', password: '', confirmPassword: '', role: 'staff', otp: '', newPassword: '', confirmNewPassword: ''
    });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [forgotError, setForgotError] = useState('');
    const [forgotMessage, setForgotMessage] = useState('');
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

            console.log('📤 Sending request:', { url, payload });
            const res = await axios.post(url, payload);
            console.log('📥 Response received:', res.data);

            if (view === 'login') {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                navigate('/');
            } else {
                console.log('✅ Signup response:', res.status, res.data);
                setMessage('Signup successful! Please login.');
                setView('login');
                setFormData({ username: '', email: '', password: '', confirmPassword: '', role: 'staff', otp: '', newPassword: '', confirmNewPassword: '' });
            }
        } catch (err) {
            console.error('❌ Error:', err.response?.data || err.message);
            setError(err.response?.data?.error || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    // Forgot Password - Step 1: Request OTP
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setForgotError('');
        setForgotMessage('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/auth/send-otp', {
                email: formData.email
            });

            setForgotMessage('✅ OTP sent to your email! Check inbox.');
            setForgotStep(2);
        } catch (err) {
            setForgotError(err.response?.data?.error || 'Failed to send OTP. Check email.');
        } finally {
            setLoading(false);
        }
    };

    // Forgot Password - Step 2: Verify OTP
    const handleVerifyOTPForgot = async (e) => {
        e.preventDefault();
        setForgotError('');
        setForgotMessage('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/auth/verify-otp', {
                email: formData.email,
                otp: formData.otp
            });

            setForgotMessage('✅ OTP verified! Enter your new password.');
            setForgotStep(3);
        } catch (err) {
            setForgotError(err.response?.data?.error || 'Invalid OTP. Try again.');
        } finally {
            setLoading(false);
        }
    };

    // Forgot Password - Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setForgotError('');
        setForgotMessage('');

        if (formData.newPassword !== formData.confirmNewPassword) {
            setForgotError('Passwords do not match');
            return;
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.newPassword) || formData.newPassword.length < 6 || formData.newPassword.length > 20) {
            setForgotError('Password must be 6-20 characters with special character');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/api/auth/reset-password', {
                email: formData.email,
                otp: formData.otp,
                new_password: formData.newPassword
            });

            setForgotMessage('✅ Password reset successful! Please login.');
            setTimeout(() => {
                setShowForgotPassword(false);
                setForgotStep(1);
                setFormData({...formData, email: '', otp: '', newPassword: '', confirmNewPassword: ''});
            }, 2000);
        } catch (err) {
            setForgotError(err.response?.data?.error || 'Password reset failed');
        } finally {
            setLoading(false);
        }
    };

    // Close Forgot Password Modal
    const closeForgotPassword = () => {
        setShowForgotPassword(false);
        setForgotStep(1);
        setForgotError('');
        setForgotMessage('');
        setFormData({...formData, email: '', otp: '', newPassword: '', confirmNewPassword: ''});
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
                                            onClick={() => setShowForgotPassword(true)}
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

            {/* FORGOT PASSWORD MODAL */}
            {showForgotPassword && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 shadow-2xl max-w-md w-full">
                        {/* Close Button */}
                        <button 
                            onClick={closeForgotPassword}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        {/* Header */}
                        <div className="text-center mb-6">
                            <span className="text-lg font-black text-indigo-600 italic uppercase tracking-wide">
                                {forgotStep === 1 && '🔐 Reset Password'}
                                {forgotStep === 2 && '📧 Enter OTP'}
                                {forgotStep === 3 && '🔑 New Password'}
                            </span>
                        </div>

                        {/* Error */}
                        {forgotError && (
                            <div className="p-4 bg-rose-50 border-l-4 border-rose-500 rounded-lg flex items-start space-x-3 mb-4">
                                <AlertCircle className="text-rose-600 flex-shrink-0 mt-0.5" size={18} />
                                <p className="text-sm font-bold text-rose-800">{forgotError}</p>
                            </div>
                        )}

                        {/* Message */}
                        {forgotMessage && (
                            <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-lg flex items-start space-x-3 mb-4">
                                <RefreshCw className="text-emerald-600 flex-shrink-0 mt-0.5 animate-spin" size={18} />
                                <p className="text-sm font-bold text-emerald-800">{forgotMessage}</p>
                            </div>
                        )}

                        {/* STEP 1: Email */}
                        {forgotStep === 1 && (
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest italic">Email Address</label>
                                    <input 
                                        type="email" 
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all text-sm font-medium placeholder:text-slate-400 placeholder:italic"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        required
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    disabled={loading || !formData.email}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg disabled:shadow-none flex items-center justify-center"
                                >
                                    {loading ? <RefreshCw className="animate-spin mr-2" size={16} /> : <ArrowRight size={16} className="mr-2" />}
                                    Send OTP
                                </button>
                            </form>
                        )}

                        {/* STEP 2: OTP */}
                        {forgotStep === 2 && (
                            <form onSubmit={handleVerifyOTPForgot} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest italic">6-Digit OTP</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all text-sm font-medium placeholder:text-slate-400 placeholder:italic tracking-widest text-center text-2xl font-bold"
                                        placeholder="000000"
                                        maxLength="6"
                                        value={formData.otp}
                                        onChange={(e) => setFormData({...formData, otp: e.target.value.replace(/[^0-9]/g, '').slice(0, 6)})}
                                        required
                                    />
                                    <p className="text-xs text-slate-500 italic mt-2">Sent to: <span className="font-bold text-indigo-600">{formData.email}</span></p>
                                </div>
                                <button 
                                    type="submit"
                                    disabled={loading || formData.otp.length !== 6}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg disabled:shadow-none flex items-center justify-center"
                                >
                                    {loading ? <RefreshCw className="animate-spin mr-2" size={16} /> : <ArrowRight size={16} className="mr-2" />}
                                    Verify OTP
                                </button>
                            </form>
                        )}

                        {/* STEP 3: New Password */}
                        {forgotStep === 3 && (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest italic">New Password</label>
                                    <input 
                                        type="password" 
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all text-sm font-medium placeholder:text-slate-400 placeholder:italic"
                                        placeholder="6-20 chars with special char"
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-700 mb-2 uppercase tracking-widest italic">Confirm Password</label>
                                    <input 
                                        type="password" 
                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all text-sm font-medium placeholder:text-slate-400 placeholder:italic"
                                        placeholder="Re-enter password"
                                        value={formData.confirmNewPassword}
                                        onChange={(e) => setFormData({...formData, confirmNewPassword: e.target.value})}
                                        required
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    disabled={loading || !formData.newPassword || formData.newPassword !== formData.confirmNewPassword}
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition-all shadow-lg disabled:shadow-none flex items-center justify-center"
                                >
                                    {loading ? <RefreshCw className="animate-spin mr-2" size={16} /> : <ArrowRight size={16} className="mr-2" />}
                                    Reset Password
                                </button>
                            </form>
                        )}

                        {/* Back Button */}
                        {forgotStep > 1 && (
                            <button 
                                type="button"
                                onClick={() => {
                                    setForgotStep(forgotStep - 1);
                                    setForgotError('');
                                    setForgotMessage('');
                                    if (forgotStep === 2) setFormData({...formData, otp: ''});
                                    if (forgotStep === 3) setFormData({...formData, newPassword: '', confirmNewPassword: ''});
                                }}
                                disabled={loading}
                                className="w-full mt-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all"
                            >
                                ← Back
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthPage;
