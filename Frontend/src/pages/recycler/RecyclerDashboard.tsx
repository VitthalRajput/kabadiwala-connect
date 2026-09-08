import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { lotsApi } from '../../api/lots.api';
import { transactionsApi } from '../../api/transactions.api';
import { Lot } from '../../types/lot.types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
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
  Calendar,
  CreditCard,
  ArrowRight,
  Eye,
  Search,
} from 'lucide-react';

export const RecyclerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [availableLots, setAvailableLots] = useState<Lot[]>([]);
  const [availableLotsCount, setAvailableLotsCount] = useState<number>(0);
  const [acceptedCount, setAcceptedCount] = useState<number>(0);
  const [scheduledPickupsCount, setScheduledPickupsCount] = useState<number>(0);
  const [totalPurchases, setTotalPurchases] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    const loadRecyclerData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch available lots in the market
        const availRes = await lotsApi.getAvailableLots({ page: 1, limit: 10 });
        if (isMounted && availRes.data) {
          const lots = availRes.data.lots || [];
          setAvailableLots(lots);
          setAvailableLotsCount(availRes.data.pagination?.totalItems || lots.length);
        }

        // 2. Fetch recycler's accepted lots
        const myLotsRes = await lotsApi.getRecyclerLots({ page: 1, limit: 50 });
        if (isMounted && myLotsRes.data) {
          const myLots = myLotsRes.data.lots || [];
          setAcceptedCount(myLots.length);
          const pickups = myLots.filter((l) => l.status === 'accepted' || l.status === 'picked').length;
          setScheduledPickupsCount(pickups);
        }

        // 3. Fetch purchases
        const txRes = await transactionsApi.getRecyclerTransactions({ page: 1, limit: 50 });
        if (isMounted && txRes.data) {
          const txs = txRes.data.transactions || [];
          const sum = txs.reduce((acc, t) => acc + (t.amount || 0), 0);
          setTotalPurchases(sum);
        }
      } catch (err) {
        console.error('Failed to load recycler dashboard data', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadRecyclerData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* ========================================================
          1. STATS ROW (4 Cards matching Mockup Screen 7)
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
            {/* Available Lots */}
            <Card className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 block">Available Lots</span>
                <span className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 block">
                  {availableLotsCount}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-saffron-50 text-saffron-600 flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
            </Card>

            {/* My Offers / Accepted */}
            <Card className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 block">My Accepted Lots</span>
                <span className="text-2xl sm:text-3xl font-black text-blue-700 mt-1 block">
                  {acceptedCount}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </Card>

            {/* Scheduled Pickups */}
            <Card className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 block">Scheduled Pickups</span>
                <span className="text-2xl sm:text-3xl font-black text-green-700 mt-1 block">
                  {scheduledPickupsCount}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </Card>

            {/* Total Purchases */}
            <Card className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-gray-500 block">Total Purchases</span>
                <span className="text-2xl sm:text-3xl font-black text-gray-900 mt-1 block">
                  {formatCurrency(totalPurchases)}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <CreditCard className="w-6 h-6" />
              </div>
            </Card>
          </>
        )}
      </div>

      {/* ========================================================
          2. LATEST AVAILABLE LOTS TABLE (Screen 7 bottom)
         ======================================================== */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 sm:px-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900">Latest Available Lots</h3>
            <p className="text-xs text-gray-500">
              Fresh scrap lots uploaded by local collectors in your region
            </p>
          </div>
          <button
            onClick={() => navigate('/recycler/lots')}
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
        ) : availableLots.length === 0 ? (
          <div className="p-10">
            <EmptyState
              icon={<Search className="w-12 h-12 text-saffron-400 stroke-[1.5]" />}
              title="No scrap lots currently listed"
              description="Check back shortly or set your buying prices so collectors can discover your profile."
              actionText="Set My Buying Prices"
              onAction={() => navigate('/recycler/prices')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-5">Lot ID</th>
                  <th className="py-3.5 px-4">Material</th>
                  <th className="py-3.5 px-4">Quantity</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Posted On</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {availableLots.map((lot) => {
                  const title =
                    lot.materialId?.name ||
                    lot.mlPrediction?.predictedCategory ||
                    lot.description ||
                    'Scrap Material';

                  return (
                    <tr key={lot._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-5 font-bold text-xs text-gray-900">
                        {formatLotId(lot._id)}
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-800">{title}</td>
                      <td className="py-4 px-4 text-xs font-medium text-gray-600">
                        {formatWeight(lot.estimatedWeight)}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-500">
                        {lot.location?.city || lot.location?.address || 'India'}
                      </td>
                      <td className="py-4 px-4 font-bold text-xs text-gray-900">
                        {formatCurrency(lot.estimatedPrice)}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-500">
                        {formatDate(lot.createdAt)}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/recycler/lots/${lot._id}`)}
                          className="text-xs py-1 px-3 border-gray-300 hover:border-saffron-500 hover:text-saffron-600"
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

