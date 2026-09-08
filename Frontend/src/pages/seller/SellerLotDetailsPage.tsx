import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lotsApi } from '../../api/lots.api';
import { matchmakingApi } from '../../api/matchmaking.api';
import { useToast } from '../../context/ToastContext';
import { Lot } from '../../types/lot.types';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { PickupTimeline } from '../../components/recycler/PickupTimeline';
import {
  formatCurrency,
  formatWeight,
  formatDate,
  formatLotId,
} from '../../utils/formatters';
import {
  ArrowLeft,
  MapPin,
  Sparkles,
  Users,
  Trash2,
  Phone,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';

export const SellerLotDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [lot, setLot] = useState<Lot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [bestMatch, setBestMatch] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!id) return;

    const fetchLot = async () => {
      setIsLoading(true);
      try {
        const res = await lotsApi.getLotById(id);
        if (isMounted && res.data) {
          setLot(res.data);
        }

        // Also query matchmaking to check if recyclers are available
        try {
          const matchRes = await matchmakingApi.findRecyclersForLot(id);
          if (isMounted && matchRes.data?.bestMatch) {
            setBestMatch(matchRes.data.bestMatch);
          }
        } catch {
          // Non-blocking if no matches
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

  const handleDeleteLot = async () => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this pending scrap lot?')) return;

    setIsDeleting(true);
    try {
      await lotsApi.deleteLot(id);
      success('Lot deleted successfully');
      navigate('/seller/lots');
    } catch (err: any) {
      toastError(err.message || 'Failed to delete lot');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <Loader fullPage text="Loading lot details..." />;
  }

  if (!lot) {
    return (
      <div className="text-center py-16 space-y-4">
        <h3 className="text-lg font-bold text-gray-800">Scrap lot not found</h3>
        <Button variant="outline" onClick={() => navigate('/seller/lots')}>
          Back to Lots
        </Button>
      </div>
    );
  }

  const materialName =
    lot.materialId?.name ||
    lot.mlPrediction?.predictedCategory ||
    lot.description ||
    'Scrap Material';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/seller/lots')}
            className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                {formatLotId(lot._id)}
              </h2>
              <Badge variant={lot.status}>{lot.status}</Badge>
            </div>
            <p className="text-xs text-gray-500">
              Created on {formatDate(lot.createdAt)} • Pickup city: {lot.location?.city || 'Local'}
            </p>
          </div>
        </div>

        {lot.status === 'pending' && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/seller/lots/${lot._id}/matches`)}
              leftIcon={<Users className="w-4 h-4 text-saffron-600" />}
            >
              View Recycler Matches
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteLot}
              isLoading={isDeleting}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Photos & Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Images Gallery */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-gray-900">Material Photos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {lot.images && lot.images.length > 0 ? (
                lot.images.map((imgUrl, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200"
                  >
                    <img
                      src={imgUrl}
                      alt={`Lot photo ${i + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-8 text-center text-xs text-gray-400 bg-gray-50 rounded-xl">
                  No photos uploaded for this lot
                </div>
              )}
            </div>
          </div>

          {/* Specification Details Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Material Specifications</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 block font-medium">Material Name</span>
                <span className="font-bold text-gray-900 text-sm mt-0.5 block">{materialName}</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 block font-medium">Estimated Weight</span>
                <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                  {formatWeight(lot.estimatedWeight)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 block font-medium">Actual Weight</span>
                <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                  {lot.actualWeight ? formatWeight(lot.actualWeight) : 'Pending Calibration'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-saffron-50/50 border border-saffron-100">
                <span className="text-saffron-700 block font-medium">Estimated Price</span>
                <span className="font-extrabold text-saffron-600 text-sm mt-0.5 block">
                  {formatCurrency(lot.estimatedPrice)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 block font-medium">Final Agreed Price</span>
                <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                  {lot.finalPrice ? formatCurrency(lot.finalPrice) : 'Pending Match'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 block font-medium">AI Category</span>
                <span className="font-bold text-gray-900 text-sm mt-0.5 block">
                  {lot.mlPrediction?.predictedCategory || 'General E-Waste'}
                </span>
              </div>
            </div>

            {/* Description */}
            {lot.description && (
              <div className="pt-2">
                <span className="text-xs font-semibold text-gray-500 block mb-1">Description</span>
                <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  {lot.description}
                </p>
              </div>
            )}

            {/* Location */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-gray-500 block mb-1">Pickup Location</span>
              <div className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <MapPin className="w-4 h-4 text-saffron-600 shrink-0" />
                <span>
                  {lot.location?.pickupAddress ||
                    lot.location?.address ||
                    `${lot.location?.city || ''}, ${lot.location?.state || ''}`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Matched Buyer & Timeline */}
        <div className="lg:col-span-5 space-y-6">
          {/* Matched Buyer Info Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900">Recycler Match</h3>

            {lot.recyclerId ? (
              <div className="p-4 rounded-xl bg-green-50/60 border border-green-200 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-bold text-gray-900">
                    {(lot.recyclerId as any).fullName || 'Assigned Recycler'}
                  </span>
                </div>
                {(lot.recyclerId as any).phoneNumber && (
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{(lot.recyclerId as any).phoneNumber}</span>
                  </div>
                )}
                <div className="pt-2 text-xs text-green-700 font-semibold">
                  ✓ Recycler accepted lot for {formatCurrency(lot.finalPrice || lot.estimatedPrice)}
                </div>
              </div>
            ) : bestMatch ? (
              <div className="p-4 rounded-xl bg-saffron-50 border border-saffron-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-saffron-800">Top Recommended Buyer:</span>
                  <span className="text-xs font-extrabold text-saffron-600">
                    Score: {bestMatch.score}%
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-900">{bestMatch.recyclerName}</p>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>Offer: ₹{bestMatch.price}/kg</span>
                  <span>{bestMatch.distance?.toFixed(1)} km away</span>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => navigate(`/seller/lots/${lot._id}/matches`)}
                >
                  View All Matches
                </Button>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-500 text-center space-y-2">
                <p>No buyer has accepted this lot yet.</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/seller/lots/${lot._id}/matches`)}
                >
                  Find Matching Recyclers
                </Button>
              </div>
            )}
          </div>

          {/* Lifecycle progress tracker */}
          <PickupTimeline status={lot.status} />
        </div>
      </div>
    </div>
  );
};

