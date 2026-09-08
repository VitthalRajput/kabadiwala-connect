import React from 'react';
import { MatchedRecyclerInfo } from '../../types/lot.types';
import { ShieldCheck, MapPin, Award, ArrowRight, Phone } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../common/Button';

interface RecyclerMatchCardProps {
  match: MatchedRecyclerInfo;
  onSelect?: (match: MatchedRecyclerInfo) => void;
  isBest?: boolean;
}

export const RecyclerMatchCard: React.FC<RecyclerMatchCardProps> = ({
  match,
  onSelect,
  isBest = false,
}) => {
  const recyclerName =
    typeof match.recyclerId === 'object' && match.recyclerId !== null
      ? (match.recyclerId as any).fullName
      : match.recyclerName || 'Verified Recycler';

  const phoneNumber =
    typeof match.recyclerId === 'object' && match.recyclerId !== null
      ? (match.recyclerId as any).phoneNumber
      : match.phoneNumber;

  return (
    <div
      className={`rounded-2xl p-5 border transition-all duration-200 bg-white ${
        isBest
          ? 'border-saffron-300 ring-2 ring-saffron-100 shadow-md'
          : 'border-gray-200 hover:border-gray-300 shadow-sm'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Info & Badges */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-bold text-gray-900">{recyclerName}</h4>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              Verified Buyer
            </span>
            {isBest && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-saffron-700 bg-saffron-50 px-2.5 py-0.5 rounded-full border border-saffron-200">
                <Award className="w-3.5 h-3.5 text-saffron-600" />
                Best Match
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {match.distance ? `${match.distance.toFixed(1)} km away` : 'Nearby'}
            </span>
            {phoneNumber && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                {phoneNumber}
              </span>
            )}
          </div>

          {/* Score breakdown tags */}
          {match.breakdown && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-md">
                Match Score: <strong>{match.score}%</strong>
              </span>
              <span className="text-[11px] bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-md">
                Price Score: {match.breakdown.price}%
              </span>
              <span className="text-[11px] bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded-md">
                Distance: {match.breakdown.distance}%
              </span>
            </div>
          )}
        </div>

        {/* Right: Pricing & CTA */}
        <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
          <div className="text-right">
            <span className="text-xs text-gray-400 block">Offer Rate</span>
            <span className="text-lg font-extrabold text-saffron-600">
              ₹{match.price} <span className="text-xs font-medium text-gray-500">/ kg</span>
            </span>
            {match.estimatedTotal ? (
              <span className="text-xs text-gray-500 block">
                Total: {formatCurrency(match.estimatedTotal)}
              </span>
            ) : null}
          </div>

          {onSelect && (
            <Button
              variant={isBest ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onSelect(match)}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Select Recycler
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

