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
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      hover: 'hover:border-blue-300'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
      hover: 'hover:border-green-300'
    },
    yellow: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      border: 'border-yellow-200',
      hover: 'hover:border-yellow-300'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200',
      hover: 'hover:border-purple-300'
    },
    red: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-200',
      hover: 'hover:border-red-300'
    },
    indigo: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
      hover: 'hover:border-indigo-300'
    },
    gray: {
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      border: 'border-gray-200',
      hover: 'hover:border-gray-300'
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
    if (compact) return 'text-lg sm:text-xl lg:text-2xl';
    if (isMobile) return 'text-xl sm:text-2xl';
    return 'text-2xl lg:text-3xl';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${selectedColor.bg}`}>
            <div className="h-6 w-6 rounded-full bg-gray-300"></div>
          </div>
          <div className="h-4 w-12 bg-gray-200 rounded"></div>
        </div>
        <div>
          <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
          <div className="h-7 w-16 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
        bg-white rounded-xl border ${selectedColor.border} 
        p-4 sm:p-5 lg:p-6 shadow-sm hover:shadow-md transition-all duration-200
        flex flex-col h-full
        ${onClick ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : ''}
        ${selectedColor.hover}
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
      <div className={`flex items-start justify-between ${compact ? 'mb-3' : 'mb-4 sm:mb-5'}`}>
        {/* Icon Container */}
        <div className={`
          ${selectedColor.bg} ${selectedColor.text} rounded-lg
          ${compact ? 'p-2' : 'p-3 sm:p-3.5'}
          transition-transform duration-200 hover:scale-105 flex-shrink-0
        `}>
          <div className={getIconSize()}>
            {icon}
          </div>
        </div>

        {/* Trend Indicator */}
        {trend && change && (
          <div className={`
            flex items-center text-xs sm:text-sm font-medium px-2 py-1 rounded-full ml-2
            ${trend === 'up'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
            }
          `}>
            {trend === 'up' ? (
              <HiArrowUp className="h-3 w-3 mr-1 flex-shrink-0" />
            ) : (
              <HiArrowDown className="h-3 w-3 mr-1 flex-shrink-0" />
            )}
            <span className="whitespace-nowrap">{change}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col justify-end">
        {/* Title */}
        <p className={`
          text-gray-600 mb-1
          ${compact ? 'text-xs' : 'text-sm sm:text-base'}
          leading-tight
        `}>
          {title}
        </p>

        {/* Value */}
        <p className={`
          font-bold text-gray-900 mb-0 break-words
          ${getValueFontSize()}
        `}>
          {value}
        </p>

        {/* Subtitle (Optional) */}
        {subtitle && (
          <p className={`
            mt-2
            ${compact ? 'text-[10px]' : 'text-xs sm:text-sm'}
            text-gray-500 leading-relaxed
          `}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Additional Info for larger screens - Only if not already showing subtitle above */}
      {!compact && !isMobile && subtitle && (
        <div className="mt-4 pt-4 border-t border-gray-100 hidden lg:block">
          <p className="text-xs text-gray-400 font-medium">Platform Insight</p>
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
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