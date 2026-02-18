// src/pages/Reviews/ReviewDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import {
    HiArrowLeft,
    HiStar,
    HiLocationMarker,
    HiCash,
    HiCalendar,
    HiUser,
    HiBriefcase,
    HiClock,
    HiCheckCircle,
    HiChatAlt2,
    HiMail,
    HiPhone
} from 'react-icons/hi';

const ReviewDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const data = await dashboardService.getReviewDetails(id);
                setReview(data);
            } catch (err) {
                console.error("Error fetching review details:", err);
                setError("Failed to load review details. It might have been deleted.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchDetails();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-medium animate-pulse">Retrieving full record...</p>
            </div>
        );
    }

    if (error || !review) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[40vh] gap-6 text-center px-4">
                <div className="h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
                    <HiChatAlt2 className="h-10 w-10" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{error || "Review not found"}</h2>
                    <p className="text-slate-500 mt-2">The requested review details are not available at this time.</p>
                </div>
                <button
                    onClick={() => navigate('/reviews')}
                    className="btn-secondary"
                >
                    Back to Reviews
                </button>
            </div>
        );
    }

    const renderStars = (rating) => {
        return (
            <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                    <HiStar
                        key={i}
                        className={`h-5 w-5 ${i < Math.floor(rating) ? 'text-amber-400' : 'text-slate-200'}`}
                    />
                ))}
            </div>
        );
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Intl.DateTimeFormat('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-white transition-all shadow-sm"
                    >
                        <HiArrowLeft className="h-5 w-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider rounded-md border border-indigo-100">
                                Request ID: {id.substring(0, 8)}
                            </span>
                            <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md border ${review.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-700 border-slate-100'
                                }`}>
                                {review.status}
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Service Completion Details</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Completed On</p>
                        <p className="text-sm font-bold text-slate-900">{formatDate(review.completedAt)}</p>
                    </div>
                    <div className="h-10 w-[1px] bg-slate-100 hidden sm:block"></div>
                    <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-indigo-200 hover:scale-105 transition-transform flex items-center gap-2">
                        <HiCash className="h-5 w-5 opacity-80" />
                        Rs. {review.price || '0'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-slate-700 font-medium	">
                {/* Left Column - Service Context */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Service Image */}
                    <div className="card-premium overflow-hidden group">
                        <div className="aspect-square bg-slate-100 relative">
                            {review.imageUrl ? (
                                <img
                                    src={review.imageUrl}
                                    alt={review.service}
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            ) : (
                                <div className="h-full w-full flex flex-col items-center justify-center text-slate-300 gap-2">
                                    <HiBriefcase className="h-16 w-16 opacity-20" />
                                    <span className="text-xs font-bold uppercase tracking-widest">No service photo</span>
                                </div>
                            )}
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm text-xs font-bold text-indigo-600">
                                {review.requestType || 'Standard'}
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-lg font-black text-slate-900 mb-2">{review.service || 'Service Name'}</h3>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {Array.isArray(review.subcategory) ? (
                                    review.subcategory.map((tag, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 rounded-lg uppercase tracking-wider">
                                            {tag}
                                        </span>
                                    ))
                                ) : review.subcategory?.split ? (
                                    review.subcategory.split(',').map((tag, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 rounded-lg uppercase tracking-wider">
                                            {tag.trim()}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-[10px] font-bold text-slate-400">No subcategory</span>
                                )}
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed italic">
                                "{review.description || 'No detailed description provided for this request.'}"
                            </p>
                        </div>
                    </div>

                    {/* Metadata Card */}
                    <div className="card-premium p-6 space-y-6">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <HiClock className="h-4 w-4 text-indigo-500" />
                            Timeline & Logistics
                        </h4>
                        <div className="space-y-4">
                            <div className="flex gap-4 items-start">
                                <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                                    <HiLocationMarker className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Service Location</p>
                                    <p className="text-xs font-bold text-slate-700">{review.location || 'Not specified'}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                                    <HiCalendar className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Started On</p>
                                    <p className="text-xs font-bold text-slate-700">{formatDate(review.createdAt)}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 shrink-0">
                                    <HiCheckCircle className="h-5 w-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Accepted At</p>
                                    <p className="text-xs font-bold text-slate-700">{formatDate(review.acceptedAt)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Columns - Participants & Feedback */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Mutual Participants Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer Info */}
                        <div className="card-premium p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-16 w-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-black shadow-sm overflow-hidden">
                                    {review.userProfileImage ? (
                                        <img src={review.userProfileImage} alt={review.userName} className="h-full w-full object-cover" />
                                    ) : (
                                        review.userName?.charAt(0) || <HiUser />
                                    )}
                                </div>
                                <div>
                                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-md">Customer</span>
                                    <h3 className="text-lg font-black text-slate-900 mt-1">{review.userName || 'Anonymous'}</h3>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    <HiMail className="h-5 w-5 text-slate-400" />
                                    <span className="text-xs font-bold truncate">{review.userEmail || 'No email shared'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    <HiPhone className="h-5 w-5 text-slate-400" />
                                    <span className="text-xs font-bold">{review.userPhone || 'No phone shared'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Provider Info */}
                        <div className="card-premium p-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="h-16 w-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 text-2xl font-black shadow-sm overflow-hidden">
                                    {review.providerProfileImage ? (
                                        <img src={review.providerProfileImage} alt={review.providerName} className="h-full w-full object-cover" />
                                    ) : (
                                        review.providerName?.charAt(0) || <HiBriefcase />
                                    )}
                                </div>
                                <div>
                                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-md">Provider</span>
                                    <h3 className="text-lg font-black text-slate-900 mt-1">{review.providerName || 'Unknown Provider'}</h3>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    <HiBriefcase className="h-5 w-5 text-slate-400" />
                                    <span className="text-xs font-bold truncate">{review.providerCategory || 'Generalist'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                    <HiPhone className="h-5 w-5 text-slate-400" />
                                    <span className="text-xs font-bold">{review.providerPhone || 'No phone shared'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mutual Feedback Comparison */}
                    <div className="card-premium p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                <HiChatAlt2 className="h-6 w-6" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Post-Service Feedback Matrix</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Direction: Customer -> Provider */}
                            <div className="space-y-6 relative">
                                <div className="absolute -left-4 top-0 bottom-0 w-[2px] bg-indigo-100 rounded-full hidden md:block"></div>
                                <div>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        Rating for the Provider
                                    </p>
                                    <div className="flex items-center gap-4 mb-4">
                                        {renderStars(review.customerRating)}
                                        <span className="text-2xl font-black text-slate-900">{review.customerRating || '0'}.0</span>
                                    </div>
                                    <div className="bg-indigo-50/30 p-5 rounded-2xl border border-indigo-100 italic text-slate-700 text-sm leading-relaxed">
                                        "{review.customerReview || 'The customer did not leave a written review for this service.'}"
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Feedback Provided By</p>
                                    <p className="text-xs font-bold text-slate-900 mt-1">{review.userName}</p>
                                </div>
                            </div>

                            {/* Direction: Provider -> Customer */}
                            <div className="space-y-6 relative">
                                <div className="absolute -left-4 top-0 bottom-0 w-[2px] bg-emerald-100 rounded-full hidden md:block"></div>
                                <div>
                                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        Rating for the Customer
                                    </p>
                                    <div className="flex items-center gap-4 mb-4">
                                        {renderStars(review.providerRating)}
                                        <span className="text-2xl font-black text-slate-900">{review.providerRating || '0'}.0</span>
                                    </div>
                                    <div className="bg-emerald-50/30 p-5 rounded-2xl border border-emerald-100 italic text-slate-700 text-sm leading-relaxed">
                                        "{review.providerReview || 'The provider did not leave a written review for the customer.'}"
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-100">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Feedback Provided By</p>
                                    <p className="text-xs font-bold text-slate-900 mt-1">{review.providerName}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewDetails;
