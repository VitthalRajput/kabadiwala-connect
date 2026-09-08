import React, { useState, useEffect } from 'react';
import { transactionsApi } from '../../api/transactions.api';
import { Transaction } from '../../types/transaction.types';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { TableRowSkeleton } from '../../components/common/Skeleton';
import { formatCurrency, formatWeight, formatDate } from '../../utils/formatters';
import { CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';

export const SellerTransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadTransactions = async () => {
      setIsLoading(true);
      try {
        const res = await transactionsApi.getCollectorTransactions({ page: 1, limit: 50 });
        if (isMounted && res.data) {
          setTransactions(res.data.transactions || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadTransactions();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-gray-900">Seller Transactions & Payouts</h2>
        <p className="text-xs text-gray-500">
          Complete ledger of scrap lot sales, payments received, and verified weights
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
              title="No transactions completed yet"
              description="When recyclers complete pickups and settle payments, your ledger records will appear here."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <tr>
                  <th className="py-3.5 px-5">Transaction ID</th>
                  <th className="py-3.5 px-4">Recycler Buyer</th>
                  <th className="py-3.5 px-4">Verified Weight</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4">Payment Status</th>
                  <th className="py-3.5 px-5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-5 font-bold text-xs text-gray-900">
                      TX-{tx._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-800">
                      {tx.recyclerId?.fullName || 'Verified Recycler'}
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-600 font-medium">
                      {formatWeight(tx.weightDetails?.actualWeight || tx.weightDetails?.estimatedWeight)}
                    </td>
                    <td className="py-4 px-4 font-extrabold text-sm text-green-700">
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

