// src/pages/Ads/AdPreview.jsx
import { useEffect } from 'react';
import { adsService } from '../../services/adsService';

const AdPreview = ({ ad }) => {
  // Track impression when component mounts
  useEffect(() => {
    if (ad && ad.isActive) {
      adsService.trackImpression(ad.id);
    }
  }, [ad]);

  const handleClick = () => {
    if (ad && ad.isActive && ad.link) {
      adsService.trackClick(ad.id);
      window.open(ad.link, '_blank');
    }
  };

  return (
    <div
      className="relative cursor-pointer group"
      onClick={handleClick}
      title={ad.link ? "Click to visit" : ad.title}
    >
      {/* Mobile Ad Container (300×50 pixels) */}
      <div
        className="w-auto h-auto rounded-lg shadow-md flex items-center overflow-hidden p-2 transition-transform group-hover:scale-105"
        style={{
          backgroundColor: ad.bgColor,
          color: ad.textColor
        }}
      >
        {/* Company Logo */}
        {ad.companyLogo && (
          <div className="h-10 w-10 shrink-0 bg-white/20 rounded-md overflow-hidden mr-3">
            <img src={ad.companyLogo} alt="Logo" className="h-full w-full object-contain" />
          </div>
        )}

        <div className={`flex flex-col min-w-0 ${!ad.companyLogo ? 'items-center w-full' : ''}`}>
          {/* Ad Title */}
          <div className={`text-xs font-bold truncate max-w-full ${!ad.companyLogo ? 'text-center' : ''}`}>
            {ad.title}
          </div>

          {/* Ad Description */}
          <div className={`text-[10px] truncate max-w-full mt-0.5 opacity-90 ${!ad.companyLogo ? 'text-center' : ''}`}>
            {ad.description}
          </div>

          {/* Additional Details */}
          {ad.details && (
            <div className={`text-[8px] opacity-70 mt-0.5 truncate ${!ad.companyLogo ? 'text-center' : ''}`}>
              {ad.details}
            </div>
          )}
        </div>

        {/* Click Indicator */}
        {ad.link && (
          <div className="absolute bottom-1 right-1">
            <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
          </div>
        )}

        {/* Inactive Overlay */}
        {!ad.isActive && (
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="bg-red-600 text-white text-[8px] px-2 py-1 rounded">
              INACTIVE
            </div>
          </div>
        )}
      </div>

      {/* Stats Tooltip on Hover */}
      <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
        {ad.clicks || 0} clicks • {ad.impressions || 0} views
      </div>
    </div>
  );
};

export default AdPreview;