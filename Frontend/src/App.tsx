import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { OfflineProvider } from './context/OfflineContext';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <OfflineProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </OfflineProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;

