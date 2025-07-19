import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Windows from './pages/Windows';
import Drivers from './pages/Drivers';
import Guides from './pages/Guides';
import TestTools from './pages/TestTools';
import Requests from './pages/Requests';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import DisassemblyGuides from './pages/DisassemblyGuides';
import DisassemblyGuideDetail from './pages/DisassemblyGuideDetail';
import Admin from './pages/Admin';
import GuideEditor from './pages/GuideEditor';
import DriverEditor from './pages/DriverEditor';
import UserEditor from './pages/UserEditor';
import DocumentEditor from './pages/DocumentEditor';
import Documents from './pages/Documents';
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
                <Route path="/windows" element={<Windows />} />
                <Route path="/windows10" element={<Navigate to="/windows" state={{ tab: "win10" }} />} />
                <Route path="/windows11" element={<Navigate to="/windows" state={{ tab: "win11" }} />} />
                <Route path="/drivers" element={<Drivers />} />
                <Route path="/guides" element={<Guides />} />
                <Route path="/test-tools" element={<TestTools />} />
                <Route path="/requests" element={<Requests />} />
                <Route path="/login" element={<Login />} />
                <Route path="/disassembly-guides" element={<DisassemblyGuides />} />
                <Route path="/disassembly/:id" element={<DisassemblyGuideDetail />} />
                <Route path="/documents" element={<Documents />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/admin/guides" element={<Admin />} />
                <Route path="/admin/guides/new" element={<GuideEditor />} />
                <Route path="/admin/guides/edit/:id" element={<GuideEditor />} />
                <Route path="/admin/drivers/new" element={<DriverEditor />} />
                <Route path="/admin/drivers/edit/:id" element={<DriverEditor />} />
                <Route path="/admin/users/new" element={<UserEditor />} />
                <Route path="/admin/users/edit/:id" element={<UserEditor />} />
                <Route path="/admin/documents" element={<Admin />} />
                <Route path="/admin/documents/new" element={<DocumentEditor />} />
                <Route path="/admin/documents/edit/:id" element={<DocumentEditor />} />
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