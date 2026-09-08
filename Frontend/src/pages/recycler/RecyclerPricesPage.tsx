import React, { useState, useEffect } from 'react';
import { pricesApi } from '../../api/prices.api';
import { materialsApi } from '../../api/materials.api';
import { MaterialPrice } from '../../types/price.types';
import { Material } from '../../types/material.types';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { TableRowSkeleton } from '../../components/common/Skeleton';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Tag, PlusCircle, Trash2, Edit2 } from 'lucide-react';

export const RecyclerPricesPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [prices, setPrices] = useState<MaterialPrice[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Modal Form State
  const [materialId, setMaterialId] = useState<string>('');
  const [pricePerKg, setPricePerKg] = useState<string>('45');
  const [minQty, setMinQty] = useState<string>('1');
  const [maxQty, setMaxQty] = useState<string>('500');
  const [specialNotes, setSpecialNotes] = useState<string>('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch recycler prices
      const pricesRes = await pricesApi.getMyPrices(1, 50);
      if (pricesRes.data?.prices) {
        setPrices(pricesRes.data.prices);
      }

      // 2. Fetch catalog materials
      const matRes = await materialsApi.getAllMaterials(1, 50);
      if (matRes.data) {
        setMaterials(matRes.data);
        if (matRes.data.length > 0 && !materialId) {
          setMaterialId(matRes.data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSetPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialId || !pricePerKg) {
      toastError('Material and Price per kg are required');
      return;
    }

    setIsSubmitting(true);
    try {
      await pricesApi.setPrice({
        materialId,
        pricePerKg: parseFloat(pricePerKg),
        minQuantity: parseInt(minQty) || 1,
        maxQuantity: parseInt(maxQty) || 1000,
        specialNotes,
      });

      success('Buying price updated successfully');
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to update price');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (priceId: string) => {
    if (!window.confirm('Are you sure you want to deactivate this price card?')) return;
    try {
      await pricesApi.deactivatePrice(priceId);
      success('Price deactivated');
      loadData();
    } catch (err: any) {
      toastError(err.message || 'Failed to deactivate price');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">My Buying Prices</h2>
          <p className="text-xs text-gray-500">
            Publish your live buying rates per kg so nearby collectors can match with your yard
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Set New Material Price
        </Button>
      </div>

      {/* Prices Table */}
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
        ) : prices.length === 0 ? (
          <div className="p-10">
            <EmptyState
              icon={<Tag className="w-12 h-12 text-saffron-400 stroke-[1.5]" />}
              title="No price cards published yet"
              description="Configure the scrap material categories and rates per kg you accept."
              actionText="Publish First Price"
              onAction={() => setIsModalOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-5">Material</th>
                  <th className="py-3.5 px-4">Price / kg</th>
                  <th className="py-3.5 px-4">Min Quantity</th>
                  <th className="py-3.5 px-4">Max Quantity</th>
                  <th className="py-3.5 px-4">Special Notes</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {prices.map((p) => {
                  const matName = typeof p.materialId === 'object' ? (p.materialId as any).name : 'Material';

                  return (
                    <tr key={p._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-5 font-bold text-xs text-gray-900">{matName}</td>
                      <td className="py-4 px-4 font-black text-sm text-saffron-600">
                        ₹{p.pricePerKg} / kg
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-600">{p.minQuantity} kg</td>
                      <td className="py-4 px-4 text-xs text-gray-600">{p.maxQuantity} kg</td>
                      <td className="py-4 px-4 text-xs text-gray-500 max-w-xs truncate">
                        {p.specialNotes || '—'}
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={p.isActive ? 'green' : 'gray'}>
                          {p.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={() => handleDeactivate(p._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Deactivate price"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Set Price Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Set Material Buying Rate"
      >
        <form onSubmit={handleSetPrice} className="space-y-4">
          <Select
            label="Material"
            required
            value={materialId}
            onChange={(e) => setMaterialId(e.target.value)}
            options={
              materials.length > 0
                ? materials.map((m) => ({ value: m._id, label: `${m.name} (${m.category})` }))
                : [
                    { value: '64e8b3f11223344556677881', label: 'Copper Wire (Metal)' },
                    { value: '64e8b3f11223344556677882', label: 'Printed Circuit Boards (E-Waste)' },
                    { value: '64e8b3f11223344556677883', label: 'CRT Monitors (Glass/Metal)' },
                    { value: '64e8b3f11223344556677884', label: 'Plastic Scrap (PET/HDPE)' },
                  ]
            }
          />

          <Input
            label="Buying Price (₹ / kg)"
            type="number"
            required
            prefixText="₹"
            value={pricePerKg}
            onChange={(e) => setPricePerKg(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Min Qty (kg)"
              type="number"
              value={minQty}
              onChange={(e) => setMinQty(e.target.value)}
            />
            <Input
              label="Max Qty (kg)"
              type="number"
              value={maxQty}
              onChange={(e) => setMaxQty(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Special Notes / Volume Discount
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Extra 5% bonus for bulk lots over 200 kg..."
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-saffron-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              loadingText="Saving..."
            >
              Publish Buying Price
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

