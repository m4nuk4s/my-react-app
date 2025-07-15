import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Windows10 from './pages/Windows10';
import Windows11 from './pages/Windows11';
import Drivers from './pages/Drivers';
import Guides from './pages/Guides';
import TestTools from './pages/TestTools';
import Requests from './pages/Requests';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import DisassemblyGuides from './pages/DisassemblyGuides';
import DisassemblyGuideDetail from './pages/DisassemblyGuideDetail';
import Admin from './pages/Admin';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <AuthProvider>
        <SettingsProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/windows10" element={<Windows10 />} />
                <Route path="/windows11" element={<Windows11 />} />
                <Route path="/drivers" element={<Drivers />} />
                <Route path="/guides" element={<Guides />} />
                <Route path="/test-tools" element={<TestTools />} />
                <Route path="/requests" element={<Requests />} />
                <Route path="/login" element={<Login />} />
                <Route path="/disassembly-guides" element={<DisassemblyGuides />} />
                <Route path="/disassembly/:id" element={<DisassemblyGuideDetail />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/guides" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </SettingsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;