import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PriceTrendChartProps {
  currentPrice?: number;
  materialName?: string;
}

export const PriceTrendChart: React.FC<PriceTrendChartProps> = ({
  currentPrice = 220,
  materialName = 'Material',
}) => {
  const [range, setRange] = useState<'30' | '7'>('30');

  // Simulated 30-day historical points around current price
  const generateData = () => {
    const points = [];
    const base = currentPrice || 200;
    const count = range === '30' ? 12 : 7;
    const now = new Date();

    for (let i = count - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i * (range === '30' ? 2.5 : 1));
      const variation = Math.sin(i * 1.5) * (base * 0.12) + (Math.random() * 8 - 4);
      const val = Math.max(10, Math.round(base + (i === 0 ? 0 : variation)));
      points.push({
        date: d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        price: i === 0 ? currentPrice : val,
      });
    }
    return points;
  };

  const data = generateData();

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Price Trend</h3>
          <p className="text-xs text-gray-500">{materialName} market valuation</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as '30' | '7')}
            className="text-xs font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-saffron-500"
          >
            <option value="30">Last 30 Days</option>
            <option value="7">Last 7 Days</option>
          </select>
        </div>
      </div>

      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#9CA3AF' }}
              domain={['auto', 'auto']}
              tickFormatter={(val) => `₹${val}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                borderRadius: '8px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
                padding: '6px 10px',
              }}
              formatter={(val: any) => [`₹${val} / kg`, 'Market Rate']}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#FF6B00"
              strokeWidth={3}
              dot={{ fill: '#FF6B00', r: 4, strokeWidth: 2, stroke: '#FFFFFF' }}
              activeDot={{ r: 6, fill: '#FF6B00' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>Current Rate:</span>
        <span className="font-bold text-gray-900 bg-saffron-50 text-saffron-700 px-2 py-0.5 rounded-md border border-saffron-200">
          ₹{currentPrice} / kg
        </span>
      </div>
    </div>
  );
};

