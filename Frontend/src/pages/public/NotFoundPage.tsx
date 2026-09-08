import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Recycle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-saffron-100 text-saffron-600 flex items-center justify-center mb-6 shadow-sm">
        <Recycle className="w-8 h-8" />
      </div>
      <h1 className="text-6xl font-black text-gray-900 tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-gray-800 mt-2 mb-3">Page Not Found</h2>
      <p className="text-sm text-gray-500 max-w-sm mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Button
        variant="primary"
        onClick={() => navigate('/')}
        leftIcon={<ArrowLeft className="w-4 h-4" />}
      >
        Back to Home
      </Button>
    </div>
  );
};

