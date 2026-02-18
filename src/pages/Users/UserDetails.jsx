// src/pages/Users/UserDetails.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import {
    HiArrowLeft,
    HiMail,
    HiPhone,
    HiLocationMarker,
    HiIdentification,
    HiUser,
    HiCheckCircle,
    HiClock,
    HiXCircle,
    HiBriefcase,
    HiLightningBolt,

} from 'react-icons/hi';

const UserDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = location.state || {};
    const [activities, setActivities] = useState([]);
    const [loadingActivities, setLoadingActivities] = useState(true);

    useEffect(() => {
        if (user) {
            fetchActivities();
        }
    }, [user]);

    const fetchActivities = async () => {
        try {
            setLoadingActivities(true);
            const data = await orderService.getOrdersByUser(user.uid, user.userType);
            setActivities(data);
        } catch (error) {
            console.error("Error loading activities:", error);
        } finally {
            setLoadingActivities(false);
        }
    };

    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'pending': return 'bg-amber-50 text-amber-700 border-amber-100';
            case 'cancelled':
            case 'rejected': return 'bg-rose-50 text-rose-700 border-rose-100';
            case 'in-progress': return 'bg-blue-50 text-blue-700 border-blue-100';
            default: return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return <HiCheckCircle className="h-4 w-4" />;
            case 'pending': return <HiClock className="h-4 w-4" />;
            case 'cancelled':
            case 'rejected': return <HiXCircle className="h-4 w-4" />;
            default: return <HiLightningBolt className="h-4 w-4" />;
        }
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <HiUser className="h-10 w-10" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">User not found</h2>
                <button
                    onClick={() => navigate('/users')}
                    className="btn-secondary flex items-center gap-2"
                >
                    <HiArrowLeft />
                    Go Back
                </button>
            </div>
        );
    }

    const isProvider = user.userType === 'service_provider';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header with Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/users')}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <HiArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">User Details</h1>
                        <p className="text-slate-500 text-sm font-medium">Viewing full profile and activity logs</p>
                    </div>
                </div>

                <div className={`
          px-4 py-2 rounded-xl border font-bold text-xs uppercase tracking-widest flex items-center gap-2
          ${user.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-amber-50 text-amber-700 border-amber-100'}
        `}>
                    <div className={`h-2 w-2 rounded-full ${user.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></div>
                    {user.status} account
                </div>
            </div>

            {/* Main Profile Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Profile & Essential Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card-premium p-8 flex flex-col items-center text-center">
                        <div className={`
              h-32 w-32 rounded-3xl flex items-center justify-center text-white text-5xl font-black shadow-2xl mb-6
              ${isProvider
                                ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                                : 'bg-gradient-to-br from-blue-500 to-indigo-500'}
            `}>
                            {user.profileImage ? (
                                <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover rounded-3xl" />
                            ) : (
                                user.name?.charAt(0)?.toUpperCase()
                            )}
                        </div>

                        <h2 className="text-2xl font-black text-slate-900">{user.name}</h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`
                px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border
                ${isProvider ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'}
              `}>
                                {user.userType}
                            </span>
                            {user.isVerified && (
                                <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                    <HiCheckCircle className="h-3.5 w-3.5" />
                                    Verified
                                </span>
                            )}
                        </div>

                        <div className="w-full mt-8 pt-8 border-t border-slate-100 space-y-4">
                            <div className="flex items-center gap-4 text-left">
                                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                    <HiMail className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Email Address</p>
                                    <p className="text-sm font-bold text-slate-700 truncate">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-left">
                                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                    <HiPhone className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Phone Number</p>
                                    <p className="text-sm font-bold text-slate-700">{user.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-left">
                                <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                    <HiLocationMarker className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Location / City</p>
                                    <p className="text-sm font-bold text-slate-700">{user.city}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card-premium p-6">
                        <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Account Snapshot</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">Joined On</span>
                                <span className="font-bold text-slate-900">{user.formattedDate}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 font-medium">User ID</span>
                                <span className="font-mono text-[11px] bg-slate-100 px-2 py-1 rounded text-slate-600">{user.uid}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Columns - Details & Documents */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Service Details for Providers */}
                    {isProvider && (
                        <div className="card-premium p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                    <HiBriefcase className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">Professional Profile</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Service Category</p>
                                    <p className="text-lg font-black text-slate-900">{user.serviceCategory || 'Not specified'}</p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className={`
                      px-2.5 py-1 rounded-lg text-[10px] font-bold
                      ${user.serviceType === 'skilled' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}
                    `}>
                                            {user.serviceType?.toUpperCase()} WORKER
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Skill Sub-categories</p>
                                    <div className="flex flex-wrap gap-2">
                                        {user.subcategories && user.subcategories.length > 0 ? (
                                            user.subcategories.map((sub, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-sm">
                                                    {sub}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-slate-400 text-sm italic">No specialized sub-categories listed</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Verification Documents for Providers */}
                    {isProvider && (
                        <div className="card-premium p-8">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                    <HiIdentification className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">Verification Assets</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-slate-500 ml-1">CNIC - Front Side</p>
                                    <div className="aspect-[1.6/1] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group relative">
                                        {user.cnicFront ? (
                                            <>
                                                <img src={user.cnicFront} alt="CNIC Front" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                <a href={user.cnicFront} target="_blank" rel="noreferrer" className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold transition-opacity">View Full Image</a>
                                            </>
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-slate-400 italic text-sm">No front image uploaded</div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <p className="text-xs font-bold text-slate-500 ml-1">CNIC - Back Side</p>
                                    <div className="aspect-[1.6/1] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group relative">
                                        {user.cnicBack ? (
                                            <>
                                                <img src={user.cnicBack} alt="CNIC Back" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                <a href={user.cnicBack} target="_blank" rel="noreferrer" className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold transition-opacity">View Full Image</a>
                                            </>
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-slate-400 italic text-sm">No back image uploaded</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Activity Section Placeholder */}
                    <div className="card-premium p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                                <HiLightningBolt className="h-6 w-6" />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">Recent Platform Activity</h3>
                        </div>
                        <div className="space-y-4">
                            {loadingActivities ? (
                                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-medium">Activity logs are being synchronized...</p>
                                    <div className="mt-4 flex justify-center gap-1">
                                        {[1, 2, 3].map(i => <div key={i} className="h-1.5 w-1.5 rounded-full bg-slate-200 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>)}
                                    </div>
                                </div>
                            ) : activities.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-medium">No recent platform activity found for this user.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {activities.map((activity) => (
                                        <div key={activity.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:shadow-md transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-lg ${getStatusStyles(activity.status)}`}>
                                                    {getStatusIcon(activity.status)}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-slate-900">{activity.serviceName || 'Service Request'}</h4>
                                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">
                                                        {activity.formattedDate} • ID: {activity.id.substring(0, 8)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight border ${getStatusStyles(activity.status)}`}>
                                                    {activity.status || 'Unknown'}
                                                </div>
                                                {activity.amount && (
                                                    <p className="text-xs font-bold text-slate-900 mt-1.5">Rs. {activity.amount}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetails;
