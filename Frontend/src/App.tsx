import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { OfflineProvider } from './context/OfflineContext';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <ToastProvider>
          <OfflineProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </OfflineProvider>
        </ToastProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;
