import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient } from 'react-query';
import { Auth } from '@/pages/Auth';
import { Index } from '@/pages';
import { Admin } from '@/pages/Admin';
import { NotFound } from '@/pages/NotFound';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SubscriptionStatusIndicator } from '@/components/common/SubscriptionStatusIndicator';

function App() {
  return (
    <BrowserRouter>
      <QueryClient>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="/*" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Add subscription status indicator */}
          <SubscriptionStatusIndicator showDetails={process.env.NODE_ENV === 'development'} />
        </div>
      </QueryClient>
    </BrowserRouter>
  );
}

export default App;
