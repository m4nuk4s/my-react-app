import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import Home from './pages/Home';
import Windows from './pages/Windows';
import Drivers from './pages/Drivers';
import Guides from './pages/Guides';
import TestTools from './pages/TestTools';
import Requests from './pages/Requests';
import Docs from './pages/Docs';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import DisassemblyGuides from './pages/DisassemblyGuides';
import DisassemblyGuideDetail from './pages/DisassemblyGuideDetail';
import Admin from './pages/Admin';
import GuideEditor from './pages/GuideEditor';
import DriverEditor from './pages/DriverEditor';
import UserEditor from './pages/UserEditor';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ThemeProvider } from './components/ui/theme-provider';
import './styles/soft-dark-mode.css';
import './styles/soft-dark-mode-overrides.css';
import './styles/test-tools-dark-mode-fixes.css';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider defaultTheme="light" storageKey="tech-support-theme">
        <Toaster />
        <AuthProvider>
          <SettingsProvider>
            <BrowserRouter>
              <Layout>
                <Routes>
                  {/* Public route with authentication check */}
                  <Route path="/login" element={<PublicRoute restricted>{<Login />}</PublicRoute>} />
                  
                  {/* Protected routes - require authentication */}
                  <Route path="/" element={<ProtectedRoute>{<Home />}</ProtectedRoute>} />
                  <Route path="/windows" element={<ProtectedRoute>{<Windows />}</ProtectedRoute>} />
                  <Route path="/windows10" element={<ProtectedRoute>{<Navigate to="/windows" state={{ tab: "win10" }} />}</ProtectedRoute>} />
                  <Route path="/windows11" element={<ProtectedRoute>{<Navigate to="/windows" state={{ tab: "win11" }} />}</ProtectedRoute>} />
                  <Route path="/drivers" element={<ProtectedRoute>{<Drivers />}</ProtectedRoute>} />
                  <Route path="/guides" element={<ProtectedRoute>{<Guides />}</ProtectedRoute>} />
                  <Route path="/docs" element={<ProtectedRoute>{<Docs />}</ProtectedRoute>} />
                  <Route path="/test-tools" element={<ProtectedRoute>{<TestTools />}</ProtectedRoute>} />
                  <Route path="/requests" element={<ProtectedRoute>{<Requests />}</ProtectedRoute>} />
                  <Route path="/disassembly-guides" element={<ProtectedRoute>{<DisassemblyGuides />}</ProtectedRoute>} />
                  <Route path="/disassembly/:id" element={<ProtectedRoute>{<DisassemblyGuideDetail />}</ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute>{<Admin />}</ProtectedRoute>} />
                  <Route path="/admin/guides" element={<ProtectedRoute>{<Admin />}</ProtectedRoute>} />
                  <Route path="/admin/guides/new" element={<ProtectedRoute>{<GuideEditor />}</ProtectedRoute>} />
                  <Route path="/admin/guides/edit/:id" element={<ProtectedRoute>{<GuideEditor />}</ProtectedRoute>} />
                  <Route path="/admin/drivers/new" element={<ProtectedRoute>{<DriverEditor />}</ProtectedRoute>} />
                  <Route path="/admin/drivers/edit/:id" element={<ProtectedRoute>{<DriverEditor />}</ProtectedRoute>} />
                  <Route path="/admin/users/new" element={<ProtectedRoute>{<UserEditor />}</ProtectedRoute>} />
                  <Route path="/admin/users/edit/:id" element={<ProtectedRoute>{<UserEditor />}</ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </BrowserRouter>
          </SettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;