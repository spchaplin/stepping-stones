import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AuthProvider } from './firebase/AuthContext';
import { SyncStatusProvider } from './firebase/SyncStatusContext';
import AuthErrorToast from './components/AuthErrorToast';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SyncStatusProvider>
        <RouterProvider router={router} />
        <AuthErrorToast />
      </SyncStatusProvider>
    </AuthProvider>
  </StrictMode>,
);
