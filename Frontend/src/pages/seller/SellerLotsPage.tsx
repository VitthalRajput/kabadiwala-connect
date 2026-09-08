import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { lotsApi } from '../../api/lots.api';
import { Lot } from '../../types/lot.types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { TableRowSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { formatCurrency, formatWeight, formatDate, formatLotId } from '../../utils/formatters';
import { PlusCircle, Eye, Search, Filter } from 'lucide-react';

export const SellerLotsPage: React.FC = () => {
  const navigate = useNavigate();
  const [lots, setLots] = useState<Lot[]>([]);
  const [filteredLots, setFilteredLots] = useState<Lot[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchLots = async () => {
      setIsLoading(true);
      try {
        const res = await lotsApi.getCollectorLots({
          page: 1,
          limit: 50,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        });
        if (isMounted && res.data) {
          const loaded = res.data.lots || [];
          setLots(loaded);
          setFilteredLots(loaded);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLots();
    return () => {
      isMounted = false;
    };
  }, [statusFilter]);

  // Client-side search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLots(lots);
      return;
    }
    const q = searchQuery.toLowerCase();
    const result = lots.filter(
      (l) =>
        l.materialId?.name?.toLowerCase().includes(q) ||
        l.mlPrediction?.predictedCategory?.toLowerCase().includes(q) ||
        l._id.toLowerCase().includes(q) ||
        l.location?.city?.toLowerCase().includes(q)
    );
    setFilteredLots(result);
  }, [searchQuery, lots]);

  const filterTabs = [
    { label: 'All Lots', value: 'all' },
    { label: 'Available (Pending)', value: 'pending' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Picked Up', value: 'picked' },
    { label: 'Completed', value: 'completed' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">My Scrap Lots</h2>
          <p className="text-xs text-gray-500">
            Manage your created lots, track buyer matches, and monitor pickup status
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/seller/lots/create')}
          leftIcon={<PlusCircle className="w-4 h-4" />}
          className="shadow-sm"
        >
          Create New Lot
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'bg-saffron-500 text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search lot, material..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-saffron-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Lots Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <table className="w-full">
              <tbody>
                <TableRowSkeleton cols={8} />
                <TableRowSkeleton cols={8} />
                <TableRowSkeleton cols={8} />
              </tbody>
            </table>
          </div>
        ) : filteredLots.length === 0 ? (
          <div className="p-10">
            <EmptyState
              title="No lots match this filter"
              description="Try changing your search term or create a new scrap listing."
              actionText="Create Lot"
              onAction={() => navigate('/seller/lots/create')}
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
                  <th className="py-3.5 px-4">Est. Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Matched Buyer</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLots.map((lot) => {
                  const materialName =
                    lot.mlPrediction?.predictedCategory ||
                    lot.materialId?.name ||
                    lot.description ||
                    'Scrap Material';

                  const buyerName =
                    typeof lot.recyclerId === 'object' && lot.recyclerId !== null
                      ? lot.recyclerId.fullName
                      : 'None';

                  return (
                    <tr key={lot._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-5 font-bold text-xs text-gray-900">
                        {formatLotId(lot._id)}
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-800">
                        {materialName}
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-gray-600">
                        {formatWeight(lot.estimatedWeight)}
                      </td>
                      <td className="py-4 px-4 text-xs font-bold text-gray-900">
                        {formatCurrency(lot.estimatedPrice)}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={lot.status}>{lot.status}</Badge>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-600">
                        {buyerName}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-500">
                        {formatDate(lot.createdAt)}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/seller/lots/${lot._id}`)}
                          className="text-xs py-1 px-3"
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Details
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

