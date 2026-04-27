// src/pages/Promotions/PromotionPreview.jsx
import { useEffect } from 'react';
import { promotionService } from '../../services/promotionService';
import StorageImage from '../../components/Common/StorageImage';

const PromotionPreview = ({ ad }) => {
  // Track impression when component mounts
  useEffect(() => {
    if (ad && ad.isActive) {
      promotionService.trackImpression(ad.id);
    }
  }, [ad]);

  const handleClick = () => {
    if (ad && ad.isActive && ad.link) {
      promotionService.trackClick(ad.id);
      window.open(ad.link, '_blank');
    }
  };

  return (
    <div
      className="relative cursor-pointer group"
      onClick={handleClick}
      title={ad.link ? "Click to visit" : ad.title}
    >
      {/* Mobile Promo Container (300×50 pixels) */}
      <div
        className="w-auto h-auto rounded-lg shadow-md flex items-center overflow-hidden p-2 transition-transform group-hover:scale-105"
        style={{
          backgroundColor: ad.bgColor,
          color: ad.textColor,
          minWidth: '280px',
          height: '50px'
        }}
      >
        {/* Company Logo */}
        {ad.companyLogo && (
          <div className="h-10 w-10 shrink-0 bg-white/20 rounded-md overflow-hidden mr-3">
            <StorageImage src={ad.companyLogo} alt="Logo" className="h-full w-full object-contain" />
          </div>
        )}

        <div className={`flex flex-col min-w-0 ${!ad.companyLogo ? 'items-center w-full' : ''}`}>
          {/* Title */}
          <div className={`text-xs font-bold truncate max-w-full ${!ad.companyLogo ? 'text-center' : ''}`}>
            {ad.title}
          </div>

          {/* Description */}
          <div className={`text-[10px] truncate max-w-full mt-0.5 opacity-90 ${!ad.companyLogo ? 'text-center' : ''}`}>
            {ad.description}
          </div>
        </div>

        {/* Click Indicator */}
        {ad.link && (
          <div className="absolute bottom-1 right-1">
            <div className="w-1.5 h-1.5 bg-white rounded-full opacity-60"></div>
          </div>
        )}

        {/* Inactive Overlay */}
        {!ad.isActive && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded uppercase font-bold">
              Inactive
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionPreview;
