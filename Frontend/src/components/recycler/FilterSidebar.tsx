import React from 'react';
import { Button } from '../common/Button';
import { Select } from '../common/Select';
import { Input } from '../common/Input';
import { Filter, RotateCcw } from 'lucide-react';

export interface LotFilters {
  category: string;
  location: string;
  minWeight: string;
  maxWeight: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
}

interface FilterSidebarProps {
  filters: LotFilters;
  onFilterChange: (newFilters: Partial<LotFilters>) => void;
  onApply: () => void;
  onReset: () => void;
  categoryOptions: Array<{ value: string; label: string }>;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  onApply,
  onReset,
  categoryOptions,
}) => {
  const locationOptions = [
    { value: '', label: 'All Locations' },
    { value: 'Noida', label: 'Noida' },
    { value: 'Ghaziabad', label: 'Ghaziabad' },
    { value: 'Delhi', label: 'Delhi' },
    { value: 'Gurugram', label: 'Gurugram' },
    { value: 'Mumbai', label: 'Mumbai' },
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'weight_desc', label: 'Quantity: High to Low' },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-5">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-saffron-500" />
          <h3 className="text-sm font-bold text-gray-900">Filters</h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 font-medium"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Material Category */}
      <div>
        <Select
          label="Material Category"
          value={filters.category}
          onChange={(e) => onFilterChange({ category: e.target.value })}
          options={[{ value: '', label: 'All Categories' }, ...categoryOptions]}
        />
      </div>

      {/* Location */}
      <div>
        <Select
          label="Location"
          value={filters.location}
          onChange={(e) => onFilterChange({ location: e.target.value })}
          options={locationOptions}
        />
      </div>

      {/* Quantity Range (kg) */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Quantity Range (kg)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minWeight}
            onChange={(e) => onFilterChange({ minWeight: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxWeight}
            onChange={(e) => onFilterChange({ maxWeight: e.target.value })}
          />
        </div>
      </div>

      {/* Price Range (₹) */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Price Range (₹)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => onFilterChange({ minPrice: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
          />
        </div>
      </div>

      {/* Sort By */}
      <div>
        <Select
          label="Sort By"
          value={filters.sortBy}
          onChange={(e) => onFilterChange({ sortBy: e.target.value })}
          options={sortOptions}
        />
      </div>

      {/* Apply Button */}
      <Button variant="primary" className="w-full mt-2" onClick={onApply}>
        Apply Filters
      </Button>
    </div>
  );
};

