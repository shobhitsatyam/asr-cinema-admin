import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AdminProvider } from './context/AdminContext';
import { AppRoutes } from './routes';

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AdminProvider>
          <AppRoutes />
        </AdminProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
