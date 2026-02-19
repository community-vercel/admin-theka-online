// src/pages/AcceptanceLogs/LogDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import {
    HiArrowLeft, HiUser, HiBriefcase, HiLocationMarker,
    HiCalendar, HiCurrencyDollar, HiCheckCircle, HiStar,
    HiPhone, HiMail, HiPhotograph, HiClock, HiLightningBolt
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const LogDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [log, setLog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogDetails();
    }, [id]);

    const fetchLogDetails = async () => {
        try {
            setLoading(true);
            const details = await orderService.getAcceptanceLogById(id);
            if (details) {
                setLog(details);
            } else {
                toast.error('Log entry not found');
                navigate('/acceptance-logs');
            }
        } catch (error) {
            console.error('Error fetching log details:', error);
            toast.error('Failed to load log details');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="h-12 w-12 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin"></div>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Loading complete history...</p>
            </div>
        );
    }

    if (!log) return null;

    return (
        <div className="space-y-8 max-w-[1200px] mx-auto pb-12">
            {/* Header / Back Button */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/acceptance-logs')}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm transition-colors group"
                >
                    <HiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Logs</span>
                </button>
                <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-xs font-black uppercase tracking-widest rounded-full border border-emerald-100 shadow-sm">
                    {log.status || 'COMPLETED'}
                </div>
            </div>

            {/* Title Section */}
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Match Details</h1>
                <p className="text-slate-500 mt-1 font-medium italic">Record ID: {log.id}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: User Profiles */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Customer Profile */}
                    <div className="card-premium p-6">
                        <div className="flex items-center gap-2 mb-6 text-indigo-600">
                            <HiUser className="h-5 w-5" />
                            <h3 className="font-black uppercase tracking-widest text-xs">Customer Profile</h3>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="h-24 w-24 rounded-3xl bg-indigo-50 overflow-hidden border-4 border-white shadow-xl mb-4">
                                {log.userProfileImage ? (
                                    <img src={log.userProfileImage} alt={log.userName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl font-black text-indigo-300">
                                        {log.userName?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <h4 className="text-xl font-bold text-slate-900">{log.userName}</h4>
                            <div className="mt-4 w-full space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <HiPhone className="text-slate-400" />
                                    <span className="text-sm font-bold text-slate-700">{log.userPhone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <HiMail className="text-slate-400" />
                                    <span className="text-xs font-bold text-slate-700 truncate">{log.userEmail || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Provider Profile */}
                    <div className="card-premium p-6">
                        <div className="flex items-center gap-2 mb-6 text-purple-600">
                            <HiBriefcase className="h-5 w-5" />
                            <h3 className="font-black uppercase tracking-widest text-xs">ServiceProvider Profile</h3>
                        </div>
                        <div className="flex flex-col items-center text-center">
                            <div className="h-24 w-24 rounded-3xl bg-purple-50 overflow-hidden border-4 border-white shadow-xl mb-4">
                                {log.providerProfileImage ? (
                                    <img src={log.providerProfileImage} alt={log.providerName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl font-black text-purple-300">
                                        {log.providerName?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <h4 className="text-xl font-bold text-slate-900">{log.providerName}</h4>
                            <p className="text-xs font-black text-purple-600 uppercase tracking-tighter mt-1">{log.providerCategory}</p>
                            <div className="mt-4 w-full space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <HiPhone className="text-slate-400" />
                                    <span className="text-sm font-bold text-slate-700">{log.providerPhone || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Job Details & Status */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Job Highlights */}
                    <div className="card-premium p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-100">
                                    <HiLightningBolt />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">{log.service}</h2>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{log.requestType} Request</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 justify-end text-emerald-600">
                                    <HiCurrencyDollar className="h-5 w-5" />
                                    <span className="text-2xl font-black">{log.price || 0}</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Total Fee</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <HiLocationMarker /> Pickup Location
                                    </h4>
                                    <p className="text-sm font-bold text-slate-700 leading-relaxed">{log.location}</p>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <HiClock /> Service Timeline
                                    </h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span className="font-medium text-slate-400">Created:</span>
                                            <span className="font-bold text-slate-700">{formatDate(log.createdAt)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="font-medium text-slate-400">Accepted:</span>
                                            <span className="font-bold text-indigo-600">{formatDate(log.acceptedAt)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="font-medium text-slate-400">Finished:</span>
                                            <span className="font-bold text-emerald-600">{formatDate(log.completedAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</h4>
                                <p className="text-sm font-medium text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 min-h-[100px]">
                                    {log.description || "No description provided."}
                                </p>
                            </div>
                        </div>

                        {/* Subcategories */}
                        {log.subcategory && log.subcategory.length > 0 && (
                            <div className="mb-8">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tasks Included:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {log.subcategory.map((sub, i) => (
                                        <span key={i} className="px-3 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg shadow-sm">
                                            {sub}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Job Images */}
                        {log.imageUrl && (
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <HiPhotograph /> Visual Evidence
                                </h4>
                                <div className="group relative w-full aspect-video rounded-3xl overflow-hidden border-4 border-white shadow-xl">
                                    <img src={log.imageUrl} alt="Job" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Reviews & Ratings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Customer Review */}
                        <div className="card-premium p-6 border-l-4 border-l-indigo-500">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Feedback</h4>
                                <div className="flex items-center gap-1 text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                        <HiStar key={i} className={i < (log.customerRating || 0) ? "fill-current" : "text-slate-200"} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm italic text-slate-600 font-medium font-serif leading-relaxed">
                                "{log.customerReview || "No comment provided."}"
                            </p>
                        </div>

                        {/* Provider Review */}
                        <div className="card-premium p-6 border-l-4 border-l-purple-500">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Provider Feedback</h4>
                                <div className="flex items-center gap-1 text-amber-400">
                                    {[...Array(5)].map((_, i) => (
                                        <HiStar key={i} className={i < (log.providerRating || 0) ? "fill-current" : "text-slate-200"} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm italic text-slate-600 font-medium font-serif leading-relaxed">
                                "{log.providerReview || "No comment provided."}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogDetails;
