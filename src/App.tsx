
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Auth from '@/pages/Auth';
import Index from '@/pages/Index';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SubscriptionStatusIndicator } from '@/components/common/SubscriptionStatusIndicator';

function App() {
  const queryClient = new QueryClient();

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
