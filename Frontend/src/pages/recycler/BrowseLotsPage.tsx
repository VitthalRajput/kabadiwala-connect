import React, { useState, useEffect, useMemo } from 'react';
import { lotsApi } from '../../api/lots.api';
import { materialsApi } from '../../api/materials.api';
import { mlApi } from '../../api/ml.api';
import { Lot } from '../../types/lot.types';
import { FilterSidebar, LotFilters } from '../../components/recycler/FilterSidebar';
import { LotCard } from '../../components/recycler/LotCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Loader } from '../../components/common/Loader';
import { Search, LayoutGrid, LayoutList } from 'lucide-react';

export const BrowseLotsPage: React.FC = () => {
  const [lots, setLots] = useState<Lot[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [filters, setFilters] = useState<LotFilters>({
    category: '',
    location: '',
    minWeight: '',
    maxWeight: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'latest',
  });

  const [categoryOptions, setCategoryOptions] = useState<Array<{ value: string; label: string }>>([]);

  // Load category options
  useEffect(() => {
    mlApi
      .getValidCategories()
      .then((cats) => {
        if (cats && cats.length > 0) {
          setCategoryOptions(cats.map((c) => ({ value: c, label: c })));
        } else {
          setCategoryOptions([
            { value: 'Plastic', label: 'Plastic' },
            { value: 'Wires', label: 'Wires' },
            { value: 'PCB', label: 'PCB' },
            { value: 'Motors', label: 'Motors' },
            { value: 'CRT', label: 'CRT' },
            { value: 'Battery', label: 'Battery' },
          ]);
        }
      })
      .catch(() => {
        setCategoryOptions([
          { value: 'Plastic', label: 'Plastic' },
          { value: 'Wires', label: 'Wires' },
          { value: 'PCB', label: 'PCB' },
          { value: 'Motors', label: 'Motors' },
          { value: 'CRT', label: 'CRT' },
          { value: 'Battery', label: 'Battery' },
        ]);
      });
  }, []);

  // Fetch available lots
  const fetchLots = async () => {
    setIsLoading(true);
    try {
      const res = await lotsApi.getAvailableLots({
        page: 1,
        limit: 50,
        minWeight: filters.minWeight ? parseFloat(filters.minWeight) : undefined,
        maxWeight: filters.maxWeight ? parseFloat(filters.maxWeight) : undefined,
      });

      if (res.data) {
        setLots(res.data.lots || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  // Filtered & Sorted Lots
  const displayedLots = useMemo(() => {
    return lots
      .filter((lot) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const title = (
            lot.materialId?.name ||
            lot.mlPrediction?.predictedCategory ||
            lot.description ||
            ''
          ).toLowerCase();
          const location = (lot.location?.city || lot.location?.address || '').toLowerCase();
          if (!title.includes(q) && !location.includes(q)) return false;
        }

        // Category filter
        if (filters.category) {
          const cat = (lot.materialId?.category || lot.mlPrediction?.predictedCategory || '').toLowerCase();
          if (cat !== filters.category.toLowerCase()) return false;
        }

        // Location filter
        if (filters.location) {
          const loc = (lot.location?.city || lot.location?.address || '').toLowerCase();
          if (!loc.includes(filters.location.toLowerCase())) return false;
        }

        // Price range
        if (filters.minPrice && lot.estimatedPrice < parseFloat(filters.minPrice)) return false;
        if (filters.maxPrice && lot.estimatedPrice > parseFloat(filters.maxPrice)) return false;

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price_asc') return a.estimatedPrice - b.estimatedPrice;
        if (filters.sortBy === 'price_desc') return b.estimatedPrice - a.estimatedPrice;
        if (filters.sortBy === 'weight_desc') return b.estimatedWeight - a.estimatedWeight;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [lots, searchQuery, filters]);

  const handleFilterChange = (newFilters: Partial<LotFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      category: '',
      location: '',
      minWeight: '',
      maxWeight: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'latest',
    });
    setSearchQuery('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900">Browse Available Lots</h2>
        <p className="text-xs text-gray-500">
          Source quality e-waste and scrap lots verified with AI classification
        </p>
      </div>

      {/* Main Layout Grid matching Mockup Screen 8 (Left filter sidebar, Right content) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3 sticky top-24">
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onApply={fetchLots}
            onReset={handleResetFilters}
            categoryOptions={categoryOptions}
          />
        </div>

        {/* Right Main Content */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          {/* Search bar & View Toggle */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search material, location, or purity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-saffron-500"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title="List View"
              >
                <LayoutList className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>
              Showing <strong>{displayedLots.length}</strong> available lots
            </span>
          </div>

          {/* Lots Feed */}
          {isLoading ? (
            <div className="p-12">
              <Loader text="Fetching marketplace lots..." />
            </div>
          ) : displayedLots.length === 0 ? (
            <div className="p-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <EmptyState
                title="No lots matched your filters"
                description="Try clearing some filter criteria to discover more available materials."
                actionText="Reset Filters"
                onAction={handleResetFilters}
              />
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                  : 'space-y-3.5'
              }
            >
              {displayedLots.map((lot) => (
                <LotCard key={lot._id} lot={lot} viewMode={viewMode} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

