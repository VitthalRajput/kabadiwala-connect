import React from 'react';
import { Check, Clock } from 'lucide-react';
import { LotStatus } from '../../types/lot.types';

interface PickupTimelineProps {
  status: LotStatus;
  paymentStatus?: string;
}

export const PickupTimeline: React.FC<PickupTimelineProps> = ({ status, paymentStatus }) => {
  const steps = [
    { key: 'accepted', title: 'Lot Accepted', desc: 'Recycler matched and accepted terms' },
    { key: 'picked', title: 'Pickup Dispatched', desc: 'Driver arrived & inspected material' },
    { key: 'handover', title: 'Weight Verified', desc: 'Actual weight calibrated & GPS recorded' },
    { key: 'payment', title: 'Payment Settled', desc: 'Direct instant payout transferred' },
    { key: 'completed', title: 'Recycled', desc: 'Audit record created in national ledger' },
  ];

  const getStepIndex = (st: LotStatus, paySt?: string): number => {
    if (st === 'completed') return 4;
    if (paySt === 'completed') return 4;
    if (st === 'delivered') return 3;
    if (st === 'picked') return 2;
    if (st === 'accepted') return 1;
    return 0;
  };

  const currentIndex = getStepIndex(status, paymentStatus);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-6">Fulfillment Lifecycle</h3>
      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
        {steps.map((step, idx) => {
          const isDone = idx <= currentIndex;
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="relative flex items-start gap-4">
              <div
                className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ring-4 ring-white ${
                  isDone
                    ? 'bg-saffron-500 text-white'
                    : 'bg-gray-100 text-gray-400 border border-gray-300'
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Clock className="w-3.5 h-3.5" />}
              </div>
              <div>
                <h4
                  className={`text-sm font-bold ${
                    isCurrent
                      ? 'text-saffron-600'
                      : isDone
                      ? 'text-gray-900'
                      : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </h4>
                <p className="text-xs text-gray-500 mt-0.5">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

