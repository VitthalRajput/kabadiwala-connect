import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { lotsApi } from '../../api/lots.api';
import { transactionsApi } from '../../api/transactions.api';
import { Lot } from '../../types/lot.types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { CardSkeleton, TableRowSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  formatCurrency,
  formatWeight,
  formatDate,
  formatLotId,
} from '../../utils/formatters';
import {
  Package,
  CheckCircle2,
  TrendingUp,
  Clock,
  PlusCircle,
  Calculator,
  ArrowRight,
  Eye,
  FileText,
} from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [lots, setLots] = useState<Lot[]>([]);
  const [totalLotsCount, setTotalLotsCount] = useState<number>(0);
  const [pickedUpCount, setPickedUpCount] = useState<number>(0);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch collector lots
        const lotsRes = await lotsApi.getCollectorLots({ page: 1, limit: 10 });
        if (isMounted && lotsRes.data) {
          const loadedLots = lotsRes.data.lots || [];
          setLots(loadedLots);
          setTotalLotsCount(lotsRes.data.pagination?.totalItems || loadedLots.length);

          const picked = loadedLots.filter(
            (l) => l.status === 'picked' || l.status === 'completed'
          ).length;
          const pending = loadedLots.filter((l) => l.status === 'pending').length;

          setPickedUpCount(picked);
          setPendingCount(pending);
        }

        // 2. Fetch collector transactions for earnings
        const transRes = await transactionsApi.getCollectorTransactions({ page: 1, limit: 50 });
        if (isMounted && transRes.data) {
          const transactions = transRes.data.transactions || [];
          const earnings = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
          setTotalEarnings(earnings);
        }
      } catch (err) {
        console.error('Failed to load seller dashboard data', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* ========================================================
          1. STATS ROW (4 Cards matching Mockup Screen 4)
         ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            {/* Total Lots */}
            <Card className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 block">Total Lots</span>
                <span className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 block">
                  {totalLotsCount}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-saffron-50 text-saffron-600 flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
            </Card>

            {/* Picked Up */}
            <Card className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 block">Picked Up</span>
                <span className="text-2xl sm:text-3xl font-black text-green-700 mt-1 block">
                  {pickedUpCount}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </Card>

            {/* Total Earnings */}
            <Card className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 block">Total Earnings</span>
                <span className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 block">
                  {formatCurrency(totalEarnings)}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </Card>

            {/* Pending */}
            <Card className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 block">Pending</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-600 mt-1 block">
                  {pendingCount}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50/60 text-amber-500 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </Card>
          </>
        )}
      </div>

      {/* ========================================================
          2. ACTION CARDS ROW (Matching Mockup Screen 4)
         ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Action 1: Create New Lot */}
        <div
          onClick={() => navigate('/seller/lots/create')}
          className="bg-white rounded-2xl p-6 border-2 border-dashed border-saffron-300 hover:border-saffron-500 hover:bg-saffron-50/40 transition-all duration-200 cursor-pointer shadow-xs group flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-saffron-500 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-md shadow-saffron-500/25">
            <PlusCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-saffron-600 transition-colors">
              Create New Lot
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Add scrap material with photos & get instant AI classification
            </p>
          </div>
        </div>

        {/* Action 2: Get Price Estimate */}
        <div
          onClick={() => navigate('/seller/price-estimate')}
          className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-saffron-300 hover:shadow-md transition-all duration-200 cursor-pointer shadow-xs group flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-saffron-600 transition-colors">
              Get Price Estimate
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Check live market rates and AI price recommendation
            </p>
          </div>
        </div>

        {/* Action 3: View My Lots */}
        <div
          onClick={() => navigate('/seller/lots')}
          className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-saffron-300 hover:shadow-md transition-all duration-200 cursor-pointer shadow-xs group flex items-start gap-4"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 group-hover:text-saffron-600 transition-colors">
              View My Lots
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Track lifecycle, view matched buyers & manage pickups
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. RECENT LOTS TABLE (Matching Mockup Screen 4)
         ======================================================== */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 sm:px-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Recent Lots</h3>
            <p className="text-xs text-gray-500">Overview of your latest material listings</p>
          </div>
          <button
            onClick={() => navigate('/seller/lots')}
            className="text-xs font-bold text-saffron-600 hover:text-saffron-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-6">
            <table className="w-full">
              <tbody>
                <TableRowSkeleton cols={7} />
                <TableRowSkeleton cols={7} />
                <TableRowSkeleton cols={7} />
              </tbody>
            </table>
          </div>
        ) : lots.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No scrap lots listed yet"
              description="Start selling your e-waste & scrap directly to certified buyers."
              actionText="Create Your First Lot"
              onAction={() => navigate('/seller/lots/create')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/70 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3 px-5">Lot ID</th>
                  <th className="py-3 px-4">Material</th>
                  <th className="py-3 px-4">Quantity</th>
                  <th className="py-3 px-4">Estimated Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lots.map((lot) => {
                  const materialName =
                    lot.mlPrediction?.predictedCategory ||
                    lot.materialId?.name ||
                    lot.description ||
                    'Scrap Material';

                  return (
                    <tr key={lot._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-5 font-bold text-xs text-gray-900">
                        {formatLotId(lot._id)}
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-800">
                        {materialName}
                      </td>
                      <td className="py-4 px-4 text-gray-600 text-xs font-medium">
                        {formatWeight(lot.estimatedWeight)}
                      </td>
                      <td className="py-4 px-4 font-bold text-gray-900 text-xs">
                        {formatCurrency(lot.estimatedPrice)}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={lot.status}>{lot.status}</Badge>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-500">
                        {formatDate(lot.createdAt)}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/seller/lots/${lot._id}`)}
                          className="py-1 px-3 text-xs"
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

