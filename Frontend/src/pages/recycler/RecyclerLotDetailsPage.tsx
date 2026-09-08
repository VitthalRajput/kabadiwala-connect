import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lotsApi } from '../../api/lots.api';
import { useToast } from '../../context/ToastContext';
import { Lot } from '../../types/lot.types';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';
import { formatCurrency, formatWeight, formatDate, formatLotId } from '../../utils/formatters';
import {
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Star,
  Clock,
  Send,
  CheckCircle2,
  Phone,
  Layers,
} from 'lucide-react';

export const RecyclerLotDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [lot, setLot] = useState<Lot | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [offerPrice, setOfferPrice] = useState<string>('');
  const [offerMessage, setOfferMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAccepting, setIsAccepting] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    if (!id) return;

    const fetchLot = async () => {
      setIsLoading(true);
      try {
        const res = await lotsApi.getLotById(id);
        if (isMounted && res.data) {
          setLot(res.data);
          setOfferPrice(String(res.data.finalPrice || res.data.estimatedPrice || ''));
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

  const handleAcceptOrOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const numericPrice = parseFloat(offerPrice);
    if (!numericPrice || numericPrice <= 0) {
      toastError('Please enter a valid offer price');
      return;
    }

    setIsAccepting(true);
    try {
      await lotsApi.acceptLot(id, numericPrice);
      success('Lot accepted! Pickup dispatch created in your accepted lots.');
      navigate('/recycler/accepted-lots');
    } catch (err: any) {
      toastError(err.message || 'Failed to accept lot. It may have been claimed.');
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) {
    return <Loader fullPage text="Loading lot specifications..." />;
  }

  if (!lot) {
    return (
      <div className="text-center py-16 space-y-4">
        <h3 className="text-lg font-bold text-gray-800">Scrap lot not found</h3>
        <Button variant="outline" onClick={() => navigate('/recycler/lots')}>
          Back to Browse Lots
        </Button>
      </div>
    );
  }

  const title =
    lot.materialId?.name ||
    lot.mlPrediction?.predictedCategory ||
    lot.description ||
    'Scrap Lot';

  const category =
    lot.materialId?.category ||
    lot.mlPrediction?.predictedCategory ||
    'Electronics';

  const subCategory = lot.materialId?.subCategory || 'General';

  const photos =
    lot.images && lot.images.length > 0
      ? lot.images
      : ['https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=80'];

  const askingPrice = lot.finalPrice || lot.estimatedPrice;
  const ratePerKg =
    lot.estimatedWeight > 0 ? Math.round(askingPrice / lot.estimatedWeight) : 0;

  const seller = lot.collectorId as any;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/recycler/lots')}
          className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Back to lots"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs text-gray-400">Back to Browse</span>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900">Lot Details & Offer</h2>
        </div>
      </div>

      {/* Main Two-Column Grid matching Mockup Screen 9 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Gallery, Specs, Seller info (Screen 9 left) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Photo Gallery with Thumbnails */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              <img
                src={photos[selectedPhotoIndex] || photos[0]}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>

            {photos.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {photos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedPhotoIndex(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      selectedPhotoIndex === i
                        ? 'border-saffron-500 ring-2 ring-saffron-100'
                        : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={photo} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Metadata Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-saffron-600">
                  {category} {subCategory ? `> ${subCategory}` : ''}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                  Verified Seller
                </span>
              </div>
              <h3 className="text-2xl font-black text-gray-900">{title}</h3>
              <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                <span>Posted on {formatDate(lot.createdAt)}</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {lot.location?.city || lot.location?.address || 'India'}
                </span>
              </div>
            </div>

            {/* Spec Badges Row matching Mockup Screen 9 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 text-[11px] font-medium block">Quantity</span>
                <span className="font-extrabold text-gray-900 text-sm mt-0.5 block">
                  {formatWeight(lot.estimatedWeight)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                <span className="text-gray-400 text-[11px] font-medium block">Condition</span>
                <span className="font-extrabold text-gray-900 text-sm mt-0.5 block">
                  Used (Good)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 col-span-2 sm:col-span-1">
                <span className="text-gray-400 text-[11px] font-medium block">AI Verified</span>
                <span className="font-extrabold text-green-700 text-sm mt-0.5 block">
                  {lot.mlPrediction?.confidenceScore
                    ? `${Math.round(lot.mlPrediction.confidenceScore * 100)}% Match`
                    : 'Verified'}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-gray-700 mb-1">Description</h4>
              <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed">
                {lot.description || 'Mixed scrap material in good condition ready for immediate pickup.'}
              </p>
            </div>

            {/* Seller Box matching Screen 9 */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-saffron-100 border border-saffron-300 flex items-center justify-center text-saffron-800 font-bold text-sm">
                  {seller?.fullName?.charAt(0) || 'R'}
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 block font-medium">Seller</span>
                  <span className="text-sm font-bold text-gray-900">
                    {seller?.fullName || 'Ramesh Kumar'}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-amber-600 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span className="font-bold">4.8</span>
                    <span className="text-gray-400">(12 reviews)</span>
                  </div>
                </div>
              </div>

              {seller?.phoneNumber && (
                <div className="text-right">
                  <span className="text-[11px] text-gray-400 block font-medium">Contact</span>
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-gray-400" />
                    {seller.phoneNumber}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Price Details & Make an Offer (Screen 9 right) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Price Details Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <span className="text-xs font-semibold text-gray-500">Price Details</span>
              <span className="text-xs text-gray-400 font-medium">Asking Rate</span>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-sm font-bold text-gray-700">Asking Price:</span>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-black text-gray-900">
                  {formatCurrency(askingPrice)}
                </span>
                <span className="text-xs text-gray-500 block font-medium">
                  (₹{ratePerKg}/kg)
                </span>
              </div>
            </div>

            {/* Make an Offer / Accept Form */}
            <form onSubmit={handleAcceptOrOffer} className="pt-4 border-t border-gray-100 space-y-4">
              <h4 className="text-sm font-bold text-gray-900">Make an Offer / Accept</h4>

              <Input
                label="Your Offer (₹)"
                type="number"
                prefixText="₹"
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder="Enter offer amount"
                required
              />

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Message to Seller (Optional)
                </label>
                <textarea
                  rows={3}
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                  placeholder="e.g. Can dispatch vehicle tomorrow morning 10 AM..."
                  className="w-full rounded-xl border border-gray-300 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 shadow-xs"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-md shadow-saffron-500/20"
                isLoading={isAccepting}
                loadingText="Sending Offer..."
                rightIcon={<Send className="w-4 h-4" />}
              >
                Send Offer / Accept Lot
              </Button>

              <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                By accepting, you commit to inspecting and picking up this lot at the specified
                location within 48 hours.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

