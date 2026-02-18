// src/components/Layout/BottomNav.jsx
import { NavLink, useLocation } from 'react-router-dom';
import {
    HiHome,
    HiUsers,
    HiCheckCircle,
    HiPhotograph,
    HiDotsHorizontal
} from 'react-icons/hi';

const BottomNav = ({ onMoreClick }) => {
    const location = useLocation();

    const navItems = [
        { path: '/dashboard', icon: <HiHome />, label: 'Dashboard' },
        { path: '/users', icon: <HiUsers />, label: 'User' },
        { path: '/verification', icon: <HiCheckCircle />, label: 'Verification' },
        { path: '/ads', icon: <HiPhotograph />, label: 'Ads' },
    ];

    return (
        <div className="lg:hidden fixed bottom-6 left-0 right-0 z-50 px-4">
            <nav className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.12)] rounded-[2.5rem] px-2 py-2">
                <div className="flex items-center justify-around h-14">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={`
                                    relative flex flex-col items-center justify-center flex-1 h-full gap-1
                                    transition-all duration-300 rounded-2xl
                                    ${isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}
                                `}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-indigo-50/50 rounded-2xl scale-90 -z-10 animate-in fade-in zoom-in duration-300" />
                                )}
                                <span className={`text-xl transition-all duration-300 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}>
                                    {item.icon}
                                </span>
                                <span className={`text-[9px] font-black uppercase tracking-[0.05em] transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                                    {item.label}
                                </span>
                                {isActive && (
                                    <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.6)]" />
                                )}
                            </NavLink>
                        );
                    })}

                    {/* More Button */}
                    <button
                        onClick={onMoreClick}
                        className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-slate-400 active:text-indigo-600 transition-all duration-200"
                    >
                        <span className="text-xl">
                            <HiDotsHorizontal />
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-[0.05em] opacity-70">
                            More
                        </span>
                    </button>
                </div>
            </nav>
        </div>
    );
};

export default BottomNav;
