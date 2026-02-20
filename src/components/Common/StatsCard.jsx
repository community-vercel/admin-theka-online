// src/components/Common/StatsCard.jsx
import { HiArrowUp, HiArrowDown } from 'react-icons/hi';
import { useState, useEffect } from 'react';

const StatsCard = ({
  title,
  value,
  icon,
  color = 'blue',
  change,
  trend,
  loading = false,
  subtitle,
  onClick,
  compact = false
}) => {
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const colorClasses = {
    blue: {
      bg: 'bg-indigo-50 dark:bg-indigo-500/10',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-100 dark:border-indigo-500/20',
      iconBg: 'bg-indigo-600/10'
    },
    green: {
      bg: 'bg-emerald-50 dark:bg-emerald-500/10',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-500/20',
      iconBg: 'bg-emerald-600/10'
    },
    yellow: {
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-500/20',
      iconBg: 'bg-amber-600/10'
    },
    purple: {
      bg: 'bg-violet-50 dark:bg-violet-500/10',
      text: 'text-violet-600 dark:text-violet-400',
      border: 'border-violet-100 dark:border-violet-500/20',
      iconBg: 'bg-violet-600/10'
    },
    red: {
      bg: 'bg-rose-50 dark:bg-rose-500/10',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-100 dark:border-rose-500/20',
      iconBg: 'bg-rose-600/10'
    },
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-500/10',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-100 dark:border-indigo-500/20',
      iconBg: 'bg-indigo-600/10'
    },
    gray: {
      bg: 'bg-slate-50',
      text: 'text-slate-600',
      border: 'border-slate-100',
      iconBg: 'bg-slate-600/10'
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-600/10'
    },
    violet: {
      bg: 'bg-violet-50',
      text: 'text-violet-600',
      border: 'border-violet-100',
      iconBg: 'bg-violet-600/10'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
      iconBg: 'bg-amber-600/10'
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-100',
      iconBg: 'bg-rose-600/10'
    }
  };

  const selectedColor = colorClasses[color] || colorClasses.blue;

  // Responsive icon size
  const getIconSize = () => {
    if (compact) return 'h-4 w-4 sm:h-5 sm:w-5';
    if (isMobile) return 'h-5 w-5';
    return 'h-6 w-6';
  };

  // Responsive value font size
  const getValueFontSize = () => {
    if (compact) return 'text-xl sm:text-2xl';
    if (isMobile) return 'text-2xl sm:text-3xl';
    return 'text-3xl lg:text-4xl';
  };

  if (loading) {
    return (
      <div className="card-premium p-4 sm:p-6 animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-12 w-12 rounded-xl bg-slate-100"></div>
          <div className="h-6 w-16 bg-slate-50 rounded-full"></div>
        </div>
        <div>
          <div className="h-4 w-24 bg-slate-50 rounded mb-3"></div>
          <div className="h-10 w-32 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        card-premium card-hover p-4 sm:p-6 
        flex flex-col h-full
        ${onClick ? 'cursor-pointer' : ''}
      `}
      onClick={onClick}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : -1}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Top Section - Icon & Trend */}
      <div className={`flex items-start justify-between ${compact ? 'mb-3' : 'mb-4 sm:mb-6'}`}>
        {/* Icon Container */}
        <div className={`
          ${selectedColor.iconBg} ${selectedColor.text} rounded-xl
          ${compact ? 'p-2.5' : 'p-3.5 sm:p-4'}
          shadow-sm
        `}>
          <div className={getIconSize()}>
            {icon}
          </div>
        </div>

        {/* Trend Indicator */}
        {trend && change && (
          <div className={`
            flex items-center text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full border tracking-wide uppercase
            ${trend === 'up'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
              : 'bg-rose-50 text-rose-700 border-rose-100'
            }
          `}>
            {trend === 'up' ? (
              <HiArrowUp className="h-3 w-3 mr-1" />
            ) : (
              <HiArrowDown className="h-3 w-3 mr-1" />
            )}
            <span className="whitespace-nowrap">{change}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col">
        {/* Title */}
        <p className={`
          text-slate-500 mb-1 font-medium
          ${compact ? 'text-xs' : 'text-sm'}
          uppercase tracking-wider
        `}>
          {title}
        </p>

        {/* Value */}
        <div className="flex items-baseline gap-2 overflow-hidden">
          <p className={`
            font-extrabold text-slate-900 mb-0 break-all sm:break-words tracking-tight
            ${getValueFontSize()}
          `}>
            {value}
          </p>
        </div>

        {/* Subtitle (Optional) */}
        {subtitle && (
          <p className={`
            mt-3
            ${compact ? 'text-[11px]' : 'text-[13px]'}
            text-slate-400 dark:text-slate-500 leading-relaxed italic
          `}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Modern Detail Bar */}
      {!compact && !isMobile && subtitle && (
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Platform Status</span>
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

// Responsive Stats Grid Container Component
export const StatsGrid = ({ children, columns = 4, spacing = 'md', compact = false }) => {
  const gridConfig = {
    sm: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
      6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6'
    },
    spacing: {
      none: 'gap-0',
      sm: 'gap-2 sm:gap-3',
      md: 'gap-4 sm:gap-6',
      lg: 'gap-6 sm:gap-8'
    }
  };

  return (
    <div className={`
      grid ${gridConfig.sm[columns]} ${gridConfig.spacing[spacing]}
      ${compact ? 'auto-rows-fr' : ''}
    `}>
      {children}
    </div>
  );
};

export default StatsCard;