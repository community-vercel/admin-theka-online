// src/pages/AcceptanceLogs/index.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { HiRefresh, HiSearch, HiClipboardList, HiCheckCircle, HiCalendar, HiUser, HiBriefcase, HiEye } from 'react-icons/hi';
import toast from 'react-hot-toast';
import DataTable from '../../components/Common/DataTable';

const AcceptanceLogs = () => {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Listen for global search events from Navbar
    useEffect(() => {
        const handleGlobalSearch = (e) => {
            setSearch(e.detail || '');
        };
        window.addEventListener('app:search', handleGlobalSearch);
        return () => window.removeEventListener('app:search', handleGlobalSearch);
    }, []);

    useEffect(() => {
        fetchLogs();
    }, []);

    useEffect(() => {
        filterLogs();
    }, [logs, search]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const allLogs = await orderService.getAcceptanceLogs();
            setLogs(allLogs);
        } catch (error) {
            console.error('Error fetching acceptance logs:', error);
            toast.error('Failed to load logs');
        } finally {
            setLoading(false);
        }
    };

    const filterLogs = () => {
        const result = logs.filter(log =>
            log.userName?.toLowerCase().includes(search.toLowerCase()) ||
            log.providerName?.toLowerCase().includes(search.toLowerCase()) ||
            log.service?.toLowerCase().includes(search.toLowerCase()) ||
            log.location?.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredLogs(result);
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

    const tableColumns = [
        {
            Header: 'Match Details',
            accessor: 'userName',
            Cell: ({ row }) => (
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <HiUser className="text-indigo-400 h-4 w-4" />
                        <span className="font-bold text-slate-900">{row.userName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <HiBriefcase className="text-purple-400 h-4 w-4" />
                        <span className="font-bold text-slate-600">{row.providerName}</span>
                    </div>
                </div>
            )
        },
        {
            Header: 'Service & Category',
            accessor: 'service',
            Cell: ({ row }) => (
                <div>
                    <p className="font-black text-slate-900 text-sm group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{row.service}</p>
                    <p className="text-[11px] text-slate-400 uppercase font-black tracking-tight mt-0.5">{row.providerCategory}</p>
                </div>
            )
        },
        {
            Header: 'Location',
            accessor: 'location',
            Cell: ({ value }) => (
                <p className="text-xs font-bold text-slate-500 truncate max-w-[200px]" title={value}>
                    {value || 'Not Specified'}
                </p>
            )
        },
        {
            Header: 'Time',
            accessor: 'acceptedAt',
            Cell: ({ value }) => (
                <div className="space-y-1">
                    <p className="text-[11px] font-black text-slate-900 uppercase">Accepted At</p>
                    <p className="text-[10px] text-slate-400 font-bold">{formatDate(value)}</p>
                </div>
            )
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ row }) => (
                <div className="flex items-center justify-end gap-3">
                    <Link
                        to={`/acceptance-logs/${row.id}`}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="View Details"
                    >
                        <HiEye className="h-5 w-5" />
                    </Link>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-100 shadow-sm shadow-emerald-50">
                        ACCEPTED
                    </span>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Acceptance Logs</h1>
                    <p className="text-slate-500 mt-1 font-medium">Global history of customer and provider mutual matches</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchLogs}
                        className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm"
                    >
                        <HiRefresh className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="card-premium p-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 text-2xl">
                        <HiClipboardList />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Total Matches</p>
                        <h4 className="text-2xl font-black text-slate-900 mt-2">{logs.length}</h4>
                    </div>
                </div>
                <div className="card-premium p-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 text-2xl">
                        <HiCheckCircle />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Completed Today</p>
                        <h4 className="text-2xl font-black text-slate-900 mt-2">
                            {logs.filter(l => new Date(l.acceptedAt).toDateString() === new Date().toDateString()).length}
                        </h4>
                    </div>
                </div>
                <div className="card-premium p-6 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 text-2xl">
                        <HiCalendar />
                    </div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">Active History</p>
                        <h4 className="text-2xl font-black text-slate-900 mt-2">Global</h4>
                    </div>
                </div>
            </div>

            {/* Filter & Search */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <HiSearch className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by customer, provider, service or location..."
                    className="input-field pl-12 bg-white/50 focus:bg-white border-slate-200"
                />
            </div>

            {/* Logs Table */}
            <div className="card-premium overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-80 gap-4">
                        <div className="h-12 w-12 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin"></div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Syncing Acceptance Logs...</p>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl mb-6">
                            <HiClipboardList className="h-10 w-10" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">No logs found</h3>
                        <p className="text-slate-500 mt-2">We couldn't find any results matching your search.</p>
                    </div>
                ) : (
                    <DataTable data={filteredLogs} columns={tableColumns} />
                )}
            </div>
        </div>
    );
};

export default AcceptanceLogs;
