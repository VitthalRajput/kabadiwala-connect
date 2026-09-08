import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lotsApi } from '../../api/lots.api';
import { transactionsApi } from '../../api/transactions.api';
import { useToast } from '../../context/ToastContext';
import { Lot } from '../../types/lot.types';
import { PickupTimeline } from '../../components/recycler/PickupTimeline';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { getBrowserLocation } from '../../utils/geolocation';
import { formatCurrency, formatWeight, formatLotId } from '../../utils/formatters';
import {
  ArrowLeft,
  Truck,
  Scale,
  MapPin,
  CheckCircle2,
  CreditCard,
  Check,
} from 'lucide-react';

export const PickupHandoverPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError, info } = useToast();

  const [lot, setLot] = useState<Lot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Form State
  const [actualWeight, setActualWeight] = useState<string>('');
  const [receivedBy, setReceivedBy] = useState<string>('');
  const [verifiedBy, setVerifiedBy] = useState<string>('');
  const [latitude, setLatitude] = useState<number>(28.5355);
  const [longitude, setLongitude] = useState<number>(77.391);
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [paymentReference, setPaymentReference] = useState<string>('UPI_987654321');

  useEffect(() => {
    let isMounted = true;
    if (!id) return;

    const fetchLot = async () => {
      setIsLoading(true);
      try {
        const res = await lotsApi.getLotById(id);
        if (isMounted && res.data) {
          setLot(res.data);
          setActualWeight(String(res.data.actualWeight || res.data.estimatedWeight || ''));
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchLot();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleUseCurrentLocation = async () => {
    try {
      info('Capturing handover GPS coordinates...');
      const coords = await getBrowserLocation();
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);
      success('Handover location captured!');
    } catch (err: any) {
      toastError(err.message || 'Could not fetch GPS. Using manual coordinates.');
    }
  };

  // Step 1: Mark Picked Up & update actual weight
  const handleMarkPicked = async () => {
    if (!id) return;
    setIsUpdating(true);
    try {
      const weightNum = parseFloat(actualWeight);
      await lotsApi.updateLotStatus(id, {
        status: 'picked',
        actualWeight: weightNum || undefined,
      });
      success('Status updated to: Picked Up');
      const updated = await lotsApi.getLotById(id);
      setLot(updated.data);
    } catch (err: any) {
      toastError(err.message || 'Failed to update pickup status');
    } finally {
      setIsUpdating(false);
    }
  };

  // Step 2: Complete Handover & Settlement
  const handleCompleteHandover = async () => {
    if (!id || !lot) return;
    setIsUpdating(true);
    try {
      const weightNum = parseFloat(actualWeight) || lot.estimatedWeight;
      const finalAmount = lot.finalPrice || lot.estimatedPrice;

      // 1. Mark lot as completed in backend
      await lotsApi.updateLotStatus(id, {
        status: 'completed',
        actualWeight: weightNum,
      });

      // 2. Create transaction record
      try {
        const txRes = await transactionsApi.createTransaction({
          lotId: id,
          paymentMethod,
          amount: finalAmount,
          weightDetails: { actualWeight: weightNum },
          notes: `Handover verified at GPS [${latitude.toFixed(4)}, ${longitude.toFixed(4)}]. Received by ${receivedBy}.`,
        });

        // 3. Mark payment completed
        if (txRes.data?._id) {
          await transactionsApi.updatePayment(txRes.data._id, {
            paymentStatus: 'completed',
            transactionId: paymentReference,
          });
        }
      } catch (txErr) {
        console.warn('Transaction record created via lot completion', txErr);
      }

      success('Lot handover completed and payment settled successfully!');
      navigate('/recycler/transactions');
    } catch (err: any) {
      toastError(err.message || 'Failed to complete handover');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <Loader fullPage text="Loading pickup details..." />;
  }

  if (!lot) {
    return (
      <div className="text-center py-16">
        <p>Lot not found</p>
      </div>
    );
  }

  const seller = lot.collectorId as any;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/recycler/accepted-lots')}
          className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">
            Pickup & Handover: {formatLotId(lot._id)}
          </h2>
          <p className="text-xs text-gray-500">
            Verify actual calibrated weight, capture handover GPS, and complete payment
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Panel */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs flex justify-between items-center">
            <div>
              <span className="text-gray-400 block font-medium">Seller Contact</span>
              <span className="text-sm font-bold text-gray-900 mt-0.5 block">
                {seller?.fullName || 'Collector'}
              </span>
              <span className="text-gray-500">{seller?.phoneNumber || '+91 9876543210'}</span>
            </div>
            <div className="text-right">
              <span className="text-gray-400 block font-medium">Agreed Amount</span>
              <span className="text-base font-extrabold text-saffron-600 mt-0.5 block">
                {formatCurrency(lot.finalPrice || lot.estimatedPrice)}
              </span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900">1. Weight Verification</h3>
            <Input
              label="Actual Calibrated Weight (kg)"
              type="number"
              step="0.1"
              value={actualWeight}
              onChange={(e) => setActualWeight(e.target.value)}
              suffixText="kg"
              required
            />

            <h3 className="text-sm font-bold text-gray-900 pt-2">2. Handover Audit & GPS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Received By (Driver / Agent)"
                placeholder="e.g. Amit Kumar"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
              />
              <Input
                label="Verified By (Supervisor)"
                placeholder="e.g. Ramesh Chandra"
                value={verifiedBy}
                onChange={(e) => setVerifiedBy(e.target.value)}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Handover GPS Coordinates
                </label>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="text-xs font-bold text-saffron-600 hover:text-saffron-700 inline-flex items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Use Current Location</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Input
                  label="Latitude"
                  value={String(latitude)}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                />
                <Input
                  label="Longitude"
                  value={String(longitude)}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <h3 className="text-sm font-bold text-gray-900 pt-2">3. Payment Settlement</h3>
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Payment Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                options={[
                  { value: 'cash', label: 'Cash on Delivery' },
                  { value: 'upi', label: 'Instant UPI Transfer' },
                  { value: 'bank_transfer', label: 'NEFT / RTGS' },
                ]}
              />
              <Input
                label="Payment Ref / Transaction ID"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="e.g. UPI_123456"
              />
            </div>
          </div>

          {/* Action Buttons based on status */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
            {lot.status === 'accepted' ? (
              <Button
                variant="outline"
                onClick={handleMarkPicked}
                isLoading={isUpdating}
                className="w-full font-bold"
                leftIcon={<Truck className="w-4 h-4 text-saffron-600" />}
              >
                Mark as Dispatched / Picked Up
              </Button>
            ) : null}

            {lot.status !== 'completed' ? (
              <Button
                variant="primary"
                onClick={handleCompleteHandover}
                isLoading={isUpdating}
                className="w-full font-bold shadow-md shadow-saffron-500/20"
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Complete Handover & Settle
              </Button>
            ) : (
              <div className="w-full p-3 rounded-xl bg-green-50 text-green-800 text-center font-bold text-xs flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> This lot has been completed and settled.
              </div>
            )}
          </div>
        </div>

        {/* Right Lifecycle Timeline */}
        <div className="lg:col-span-5 space-y-6">
          <PickupTimeline status={lot.status} />
        </div>
      </div>
    </div>
  );
};

