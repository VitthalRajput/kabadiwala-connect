import React, { useState, useEffect } from 'react';
import { transactionsApi } from '../../api/transactions.api';
import { Transaction } from '../../types/transaction.types';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { TableRowSkeleton } from '../../components/common/Skeleton';
import { formatCurrency, formatWeight, formatDate } from '../../utils/formatters';
import { CreditCard } from 'lucide-react';

export const RecyclerTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadTx = async () => {
      setIsLoading(true);
      try {
        const res = await transactionsApi.getRecyclerTransactions({ page: 1, limit: 50 });
        if (isMounted && res.data) {
          setTransactions(res.data.transactions || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadTx();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900">Purchases & Settlements</h2>
        <p className="text-xs text-gray-500">
          Audited record of all lot purchases, collector payouts, and weight tickets
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
        ) : transactions.length === 0 ? (
          <div className="p-10">
            <EmptyState
              icon={<CreditCard className="w-12 h-12 text-saffron-400 stroke-[1.5]" />}
              title="No purchase transactions recorded"
              description="Completed scrap handovers and payments will be logged here for EPR compliance."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-5">TX ID</th>
                  <th className="py-3.5 px-4">Collector</th>
                  <th className="py-3.5 px-4">Calibrated Weight</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Settled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-5 font-bold text-xs text-gray-900">
                      TX-{tx._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-800">
                      {tx.collectorId?.fullName || 'Collector'}
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-600 font-medium">
                      {formatWeight(tx.weightDetails?.actualWeight || tx.weightDetails?.estimatedWeight)}
                    </td>
                    <td className="py-4 px-4 font-extrabold text-sm text-gray-900">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="py-4 px-4 text-xs uppercase font-semibold text-gray-500">
                      {tx.paymentMethod}
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={tx.paymentStatus === 'completed' ? 'green' : 'amber'}>
                        {tx.paymentStatus}
                      </Badge>
                    </td>
                    <td className="py-4 px-5 text-right text-xs text-gray-500">
                      {formatDate(tx.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

