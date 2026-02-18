import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../../services/dashboardService';
import { HiCheckCircle, HiSearch, HiFilter, HiArrowRight, HiChatAlt2, HiUserCircle, HiStar } from 'react-icons/hi';
import toast from 'react-hot-toast';

const ReviewsPage = () => {
    const [customerReviews, setCustomerReviews] = useState([]);
    const [providerReviews, setProviderReviews] = useState([]);
    const [activeTab, setActiveTab] = useState('customer');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [ratingFilter, setRatingFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const data = await dashboardService.getRecentReviews();
            setCustomerReviews(data.customerReviews);
            setProviderReviews(data.providerReviews);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            toast.error('Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const filteredReviews = (activeTab === 'customer' ? customerReviews : providerReviews).filter(review => {
        const matchesSearch = review.reviewerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRating = ratingFilter === 'all' || Math.floor(review.rating) === parseInt(ratingFilter);
        return matchesSearch && matchesRating;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Platform Reviews</h1>
                    <p className="mt-1 text-slate-500 font-medium text-sm">Manage and monitor all interactions and feedback</p>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm">
                    <HiCheckCircle className="h-5 w-5 text-indigo-500" />
                    <span className="text-slate-700 text-sm font-bold">{customerReviews.length + providerReviews.length} Total Reviews</span>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="card-premium p-4 sm:p-6 flex flex-col lg:flex-row gap-4">
                <div className="relative flex-grow">
                    <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search by name, service..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-4">
                    <div className="relative min-w-[160px]">
                        <HiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <select
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white appearance-none text-sm font-bold text-slate-700"
                            value={ratingFilter}
                            onChange={(e) => setRatingFilter(e.target.value)}
                        >
                            <option value="all">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                    </div>
                    <button
                        onClick={fetchReviews}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 gap-8">
                <button
                    onClick={() => setActiveTab('customer')}
                    className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'customer' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Customer Reviews
                    {activeTab === 'customer' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('provider')}
                    className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'provider' ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    Provider Reviews
                    {activeTab === 'provider' && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full"></div>}
                </button>
            </div>

            {/* Reviews Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredReviews.length === 0 ? (
                    <div className="col-span-full py-20 text-center card-premium bg-slate-50/50 border-dashed">
                        <HiCheckCircle className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No reviews match your criteria</p>
                    </div>
                ) : (
                    filteredReviews.map((review) => (
                        <div key={review.id} className="card-premium p-6 hover:shadow-2xl transition-all group flex flex-col relative overflow-hidden bg-white border-slate-100">
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${activeTab === 'customer' ? 'bg-indigo-500' : 'bg-emerald-500'}`}></div>

                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center border shadow-sm overflow-hidden ${activeTab === 'customer' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                                        {review.imageUrl ? (
                                            <img src={review.imageUrl} alt={review.reviewerName} className="h-full w-full object-cover" />
                                        ) : (
                                            review.reviewerName?.charAt(0)
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-black text-slate-900 truncate">{review.reviewerName}</p>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest truncate">Reviewing {review.recipientName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100 text-amber-600 shadow-sm">
                                    <HiStar className="h-4 w-4" />
                                    <span className="text-sm font-black">{review.rating}</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200">
                                    {review.serviceName}
                                </span>
                            </div>

                            <p className="text-sm text-slate-600 font-medium leading-relaxed italic flex-grow py-2">
                                "{review.review}"
                            </p>

                            <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <HiUserCircle className="h-4 w-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{formatDate(review.date)}</span>
                                </div>
                                <button
                                    onClick={() => navigate(`/reviews/${review.id}`)}
                                    className="flex items-center gap-1.5 text-[10px] font-black text-indigo-500 hover:text-indigo-700 uppercase tracking-widest group/btn transition-all"
                                >
                                    Full Details
                                    <HiArrowRight className="h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReviewsPage;
