import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lot } from '../../types/lot.types';
import { formatCurrency, formatWeight, formatRelativeTime } from '../../utils/formatters';
import { MapPin, Clock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

interface LotCardProps {
  lot: Lot;
  viewMode?: 'grid' | 'list';
}

export const LotCard: React.FC<LotCardProps> = ({ lot, viewMode = 'list' }) => {
  const navigate = useNavigate();

  const title =
    lot.mlPrediction?.predictedCategory ||
    lot.materialId?.name ||
    lot.description ||
    'Mixed E-Waste / Scrap';

  const category =
    lot.mlPrediction?.predictedCategory ||
    lot.materialId?.category ||
    'Recyclables';

  const subCategory = lot.materialId?.subCategory;

  const image =
    lot.images && lot.images.length > 0
      ? lot.images[0]
      : 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=60';

  const locationCity = lot.location?.city || lot.location?.address || 'India';
  const pricePerKg =
    lot.estimatedWeight > 0 ? Math.round(lot.estimatedPrice / lot.estimatedWeight) : 0;

  if (viewMode === 'grid') {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card hover-elevate overflow-hidden flex flex-col group transition-all duration-300">
        {/* Image thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
            {formatWeight(lot.estimatedWeight)}
          </div>
          {lot.mlPrediction?.confidenceScore && (
            <div className="absolute top-2.5 left-2.5 bg-saffron-500/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI Verified
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold text-saffron-600 uppercase tracking-wider mb-1">
              {category} {subCategory ? `> ${subCategory}` : ''}
            </div>
            <h4 className="text-base font-black text-gray-900 line-clamp-1 mb-2 group-hover:text-saffron-600 transition-colors">
              {title}
            </h4>

            <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {locationCity}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                {formatRelativeTime(lot.createdAt)}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-base sm:text-lg font-black text-gray-900">
                {formatCurrency(lot.estimatedPrice)}
              </span>
              <span className="text-[11px] text-gray-500 block font-medium">
                ₹{pricePerKg}/kg
              </span>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/recycler/lots/${lot._id}`)}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="tap-bounce shadow-xs hover:shadow-md hover:shadow-saffron-500/20"
            >
              View
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-card hover-elevate flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group transition-all duration-300">
      <div className="flex items-start gap-4 flex-1 min-w-0">
        {/* Photo thumbnail */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 relative">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </div>

        {/* Details */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-saffron-600">
              {category} {subCategory ? `> ${subCategory}` : ''}
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] text-green-700 bg-green-50 border border-green-200/60 px-2 py-0.5 rounded-full font-bold">
              <ShieldCheck className="w-3 h-3 text-green-600" /> Verified Lot
            </span>
          </div>

          <h4 className="text-base sm:text-lg font-black text-gray-900 truncate group-hover:text-saffron-600 transition-colors">
            {title}
          </h4>

          <div className="text-xs text-gray-500 font-medium">
            {formatWeight(lot.estimatedWeight)} • {locationCity}
          </div>

          <div className="text-xs text-gray-400 flex items-center gap-1 pt-0.5">
            <Clock className="w-3 h-3" />
            <span>Posted {formatRelativeTime(lot.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Right Pricing & Action */}
      <div className="flex sm:flex-col items-end justify-between sm:justify-center w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 gap-3 shrink-0">
        <div className="text-left sm:text-right">
          <div className="text-lg sm:text-xl font-black text-gray-900">
            {formatCurrency(lot.estimatedPrice)}
          </div>
          <div className="text-xs text-gray-500 font-bold">
            (₹{pricePerKg}/kg)
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate(`/recycler/lots/${lot._id}`)}
          className="px-5 shadow-xs tap-bounce hover:shadow-md hover:shadow-saffron-500/20"
        >
          View Details
        </Button>
      </div>
    </div>
  );
};
