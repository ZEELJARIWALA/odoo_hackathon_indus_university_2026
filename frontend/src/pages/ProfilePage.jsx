import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Building2,
    Calendar,
    Edit2,
    Save,
    X,
    ArrowLeft
} from "lucide-react";

const ProfilePage = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = () => {
        // Get user from localStorage
        const user = localStorage.getItem("user");
        if (user) {
            try {
                const userData = JSON.parse(user);
                setProfile({
                    id: userData.id || 1,
                    name: userData.name || "Admin User",
                    email: userData.email || "admin@coreinventory.com",
                    role: userData.role || "Manager",
                    phone: userData.phone || "+1 (555) 123-4567",
                    warehouse: userData.warehouse || "Main Warehouse",
                    location: userData.location || "New York, USA",
                    joinDate: userData.joinDate || "2023-01-15",
                    status: userData.status || "Active"
                });
                setFormData({
                    name: userData.name || "Admin User",
                    email: userData.email || "admin@coreinventory.com",
                    phone: userData.phone || "+1 (555) 123-4567",
                    location: userData.location || "New York, USA"
                });
            } catch (e) {
                console.error("Error loading profile", e);
            }
        }
        setLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        // Update localStorage
        const updatedUser = {
            ...profile,
            ...formData
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setProfile(updatedUser);
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="mb-4 text-indigo-600">
                        <User size={48} className="mx-auto animate-spin" />
                    </div>
                    <p className="text-slate-600 font-black uppercase tracking-widest">Loading Profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-500 font-bold uppercase tracking-widest">No profile data found</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate("/")}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                >
                    <ArrowLeft size={24} className="text-slate-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">
                        My Profile
                    </h1>
                    <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">
                        Manage your account information
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40">
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg mb-6">
                                <User size={48} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 text-center">{profile.name}</h2>
                            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2 mb-4">
                                {profile.role}
                            </p>
                            <div className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100 mb-6">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                <span className="text-emerald-700 font-bold text-[10px] uppercase tracking-widest">
                                    {profile.status}
                                </span>
                            </div>

                            {/* Quick Info */}
                            <div className="w-full space-y-3 border-t border-slate-100 pt-6">
                                <div>
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">
                                        Email
                                    </p>
                                    <p className="text-sm text-slate-700 break-all">{profile.email}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">
                                        Warehouse
                                    </p>
                                    <p className="text-sm text-slate-700">{profile.warehouse}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">
                                        Member Since
                                    </p>
                                    <p className="text-sm text-slate-700">{new Date(profile.joinDate).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">
                                Account Details
                            </h3>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg font-bold uppercase text-xs transition-all"
                                >
                                    <Edit2 size={14} /> Edit
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-3">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-3">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-3">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-[11px] font-black text-slate-600 uppercase tracking-widest mb-3">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-4 border-t border-slate-200">
                                    <button
                                        onClick={handleSave}
                                        className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-black uppercase text-sm tracking-widest transition-all flex items-center justify-center gap-2"
                                    >
                                        <Save size={16} /> Save Changes
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-black uppercase text-sm tracking-widest transition-all flex items-center justify-center gap-2"
                                    >
                                        <X size={16} /> Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Display Mode */}
                                <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
                                    <User size={20} className="text-slate-400 mt-1" />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Full Name</p>
                                        <p className="text-lg font-bold text-slate-900">{profile.name}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
                                    <Mail size={20} className="text-slate-400 mt-1" />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Email Address</p>
                                        <p className="text-lg font-bold text-slate-900">{profile.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
                                    <Phone size={20} className="text-slate-400 mt-1" />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Phone Number</p>
                                        <p className="text-lg font-bold text-slate-900">{profile.phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
                                    <MapPin size={20} className="text-slate-400 mt-1" />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Location</p>
                                        <p className="text-lg font-bold text-slate-900">{profile.location}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <Building2 size={20} className="text-slate-400 mt-1" />
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Primary Warehouse</p>
                                        <p className="text-lg font-bold text-slate-900">{profile.warehouse}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
