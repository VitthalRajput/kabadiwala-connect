import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { lotsApi } from '../../api/lots.api';
import { Lot } from '../../types/lot.types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { TableRowSkeleton } from '../../components/common/Skeleton';
import { formatDate, formatWeight, formatCurrency, formatLotId } from '../../utils/formatters';
import { Truck, MapPin, Phone, Eye, Calendar } from 'lucide-react';

export const SellerPickupsPage: React.FC = () => {
  const navigate = useNavigate();
  const [lots, setLots] = useState<Lot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadPickups = async () => {
      setIsLoading(true);
      try {
        const res = await lotsApi.getCollectorLots({ page: 1, limit: 50 });
        if (isMounted && res.data) {
          const pickupEligible = (res.data.lots || []).filter(
            (l) => l.status === 'accepted' || l.status === 'picked'
          );
          setLots(pickupEligible);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadPickups();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900">Scheduled Pickups</h2>
        <p className="text-xs text-gray-500">
          Track buyer vehicle dispatches, pickup time windows, and scale inspections
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <table className="w-full">
              <tbody>
                <TableRowSkeleton cols={6} />
                <TableRowSkeleton cols={6} />
              </tbody>
            </table>
          </div>
        ) : lots.length === 0 ? (
          <div className="p-10">
            <EmptyState
              icon={<Truck className="w-12 h-12 text-saffron-400 stroke-[1.5]" />}
              title="No active pickups scheduled"
              description="Once a certified recycler accepts your scrap lot, the pickup dispatch details will appear here."
              actionText="View My Lots"
              onAction={() => navigate('/seller/lots')}
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
                  <th className="py-3.5 px-4">Recycler Buyer</th>
                  <th className="py-3.5 px-4">Pickup Address</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lots.map((lot) => {
                  const recycler = lot.recyclerId as any;
                  return (
                    <tr key={lot._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-5 font-bold text-xs text-gray-900">
                        {formatLotId(lot._id)}
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-800">
                        {lot.materialId?.name || lot.mlPrediction?.predictedCategory || 'Scrap Material'}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-600 font-medium">
                        {formatWeight(lot.estimatedWeight)}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-900 font-medium">
                        {recycler?.fullName || 'Assigned Driver'}
                        {recycler?.phoneNumber && (
                          <span className="block text-[11px] text-gray-400">
                            {recycler.phoneNumber}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-500 max-w-xs truncate">
                        {lot.location?.pickupAddress || lot.location?.address || 'Pickup Point'}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={lot.status}>{lot.status}</Badge>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/seller/lots/${lot._id}`)}
                          className="text-xs py-1 px-3"
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

