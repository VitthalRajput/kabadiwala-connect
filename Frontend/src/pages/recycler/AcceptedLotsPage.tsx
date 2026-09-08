import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { lotsApi } from '../../api/lots.api';
import { Lot } from '../../types/lot.types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { TableRowSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatWeight, formatDate, formatLotId } from '../../utils/formatters';
import { CheckCircle2, Truck, ArrowRight, Eye, MapPin } from 'lucide-react';

export const AcceptedLotsPage: React.FC = () => {
  const navigate = useNavigate();
  const [lots, setLots] = useState<Lot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAccepted = async () => {
      setIsLoading(true);
      try {
        const res = await lotsApi.getRecyclerLots({ page: 1, limit: 50 });
        if (isMounted && res.data) {
          setLots(res.data.lots || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchAccepted();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900">My Accepted Lots</h2>
        <p className="text-xs text-gray-500">
          Manage fulfillment, dispatch vehicles, record verified weight, and settle payments
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <table className="w-full">
              <tbody>
                <TableRowSkeleton cols={7} />
                <TableRowSkeleton cols={7} />
              </tbody>
            </table>
          </div>
        ) : lots.length === 0 ? (
          <div className="p-10">
            <EmptyState
              icon={<CheckCircle2 className="w-12 h-12 text-saffron-400 stroke-[1.5]" />}
              title="No accepted lots yet"
              description="Browse the marketplace for available scrap lots and make offers to start purchasing."
              actionText="Browse Lots"
              onAction={() => navigate('/recycler/lots')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-5">Lot ID</th>
                  <th className="py-3.5 px-4">Material</th>
                  <th className="py-3.5 px-4">Seller</th>
                  <th className="py-3.5 px-4">Weight</th>
                  <th className="py-3.5 px-4">Agreed Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lots.map((lot) => {
                  const seller = lot.collectorId as any;
                  return (
                    <tr key={lot._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-5 font-bold text-xs text-gray-900">
                        {formatLotId(lot._id)}
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-800">
                        {lot.materialId?.name || lot.mlPrediction?.predictedCategory || 'Scrap Material'}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-600 font-medium">
                        {seller?.fullName || 'Verified Seller'}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-600 font-medium">
                        {formatWeight(lot.actualWeight || lot.estimatedWeight)}
                      </td>
                      <td className="py-4 px-4 font-bold text-xs text-gray-900">
                        {formatCurrency(lot.finalPrice || lot.estimatedPrice)}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={lot.status}>{lot.status}</Badge>
                      </td>
                      <td className="py-4 px-5 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/recycler/pickups/${lot._id}`)}
                          className="text-xs py-1 px-3 border-gray-300 hover:border-saffron-500 hover:text-saffron-600"
                          leftIcon={<Truck className="w-3.5 h-3.5 text-saffron-600" />}
                        >
                          Pickup & Handover
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

