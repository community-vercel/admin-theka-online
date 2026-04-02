import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { userService } from '../../services/userService';
import DataTable from '../../components/Common/DataTable';
import {
  HiEye,
  HiSearch,
  HiArrowLeft,
  HiXCircle
} from 'react-icons/hi';

const RejectedApplications = () => {
  const [rejectedUsers, setRejectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRejectedUsers();
  }, []);

  const fetchRejectedUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await userService.getAllUsers();
      // Filter for providers that are explicitly rejected
      const rejected = allUsers.filter(user => user.accountStatus === 'rejected');
      setRejectedUsers(rejected);
    } catch (error) {
      console.error('Error fetching rejected users:', error);
      toast.error('Failed to load rejected applications');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = rejectedUsers.filter(user => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.includes(searchTerm) ||
      user.serviceCategory?.toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    {
      Header: 'Identity',
      accessor: 'name',
      Cell: ({ row }) => (
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-2xl flex items-center justify-center text-white font-black shadow-lg bg-gradient-to-br from-rose-500 to-rose-600 shadow-rose-100">
            {row.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{row.name}</p>
            <p className="text-[11px] text-slate-400 font-bold tracking-tighter mt-0.5">{row.phone}</p>
          </div>
        </div>
      )
    },
    {
      Header: 'Category',
      accessor: 'serviceCategory',
      Cell: ({ row }) => (
        <div className="space-y-1.5">
          <span className="status-badge bg-slate-100 text-slate-600">
            {row.serviceType || 'Provider'}
          </span>
          <p className="text-xs font-bold text-slate-500 truncate max-w-[150px]">{row.serviceCategory || 'No Category'}</p>
        </div>
      )
    },
    {
      Header: 'Rejection Reason',
      accessor: 'reason',
      Cell: ({ row }) => (
        <div className="flex items-start gap-2 max-w-[300px]">
          <HiXCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold text-slate-700 whitespace-pre-wrap">{row.reason || <span className="italic text-slate-400">No reason provided</span>}</p>
        </div>
      )
    },
    {
      Header: 'Date Evaluated',
      accessor: 'updatedAt',
      Cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold text-slate-700">
            {row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : 'Unknown'}
          </p>
          <p className="text-[10px] text-slate-400 tracking-tighter uppercase font-medium">Original Submission: {row.formattedDate}</p>
        </div>
      )
    },
    {
      Header: 'Actions',
      accessor: 'actions',
      Cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Link to={`/verification/${row.id}`} state={{ provider: row }} className="flex items-center gap-2 px-3 py-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-all font-bold text-xs" title="Review Complete Profile">
            <HiEye className="h-4 w-4" />
            Inspect Application
          </Link>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => navigate('/users')}
              className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all"
              title="Back to Users"
            >
              <HiArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Rejected Applications</h1>
          </div>
          <p className="text-slate-500 font-medium text-sm sm:text-base ml-12">Monitor service applications that failed the screening process.</p>
        </div>
      </div>

      {/* Advanced Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative group w-full md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <HiSearch className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, phone, or category..."
            className="input-field pl-12 bg-white border-slate-200 w-full"
          />
        </div>
      </div>

      {/* Main DataTable Card */}
      <div className="card-premium overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <div className="h-12 w-12 rounded-full border-4 border-slate-100 border-t-rose-500 animate-spin"></div>
            <p className="text-slate-500 font-black tracking-widest text-[10px] uppercase">Retrieving Data...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/50">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white shadow-sm text-slate-300 rounded-3xl mb-6">
              <HiSearch className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">No rejected applications found</h3>
            <p className="text-slate-500 mt-2">There are currently no records matching your criteria.</p>
          </div>
        ) : (
          <DataTable data={filteredUsers} columns={columns} />
        )}
      </div>
    </div>
  );
};

export default RejectedApplications;
