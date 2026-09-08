import React from 'react';
import { TrendingUp, Users, Calendar, Sparkles } from 'lucide-react';

interface MarketInsightsCardProps {
  category?: string;
  trendPercentage?: number;
}

export const MarketInsightsCard: React.FC<MarketInsightsCardProps> = ({
  category = 'Material',
  trendPercentage = 12,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-saffron-500" />
        <h3 className="text-sm font-bold text-gray-900">Market Insights</h3>
      </div>

      <div className="space-y-3 text-xs sm:text-sm">
        <div className="flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
            <TrendingUp className="w-3 h-3" />
          </div>
          <p className="text-gray-700">
            {category} prices have <span className="font-semibold text-green-700">increased by {trendPercentage}%</span> this month.
          </p>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full bg-saffron-50 text-saffron-600 flex items-center justify-center shrink-0 mt-0.5">
            <Users className="w-3 h-3" />
          </div>
          <p className="text-gray-700">
            <span className="font-semibold text-gray-900">High demand</span> from certified recyclers in your region.
          </p>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
            <Calendar className="w-3 h-3" />
          </div>
          <p className="text-gray-700">
            Best time to sell: <span className="font-semibold text-gray-900">Next 1–2 weeks</span> for peak rates.
          </p>
        </div>
      </div>
    </div>
  );
};

