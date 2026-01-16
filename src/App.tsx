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
import Stock from './pages/Stock';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ThemeProvider } from './components/ui/theme-provider';
import './styles/soft-dark-mode.css';
import './styles/soft-dark-mode-overrides.css';
import './styles/test-tools-dark-mode-fixes.css';

const queryClient = new QueryClient();

// Define roles for easier management
const ADMIN_ROLE = ['admin'];
const USER_ADMIN_ROLES = ['user', 'admin'];

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
                  
                  {/* Routes accessible to all authenticated users (client, user, admin) */}
                  <Route path="/" element={<ProtectedRoute>{<Home />}</ProtectedRoute>} />
                  <Route path="/drivers" element={<ProtectedRoute>{<Drivers />}</ProtectedRoute>} />
                  <Route path="/guides" element={<ProtectedRoute>{<Guides />}</ProtectedRoute>} />
                  <Route path="/requests" element={<ProtectedRoute>{<Requests />}</ProtectedRoute>} />

                  {/* Routes accessible only to 'user' and 'admin' roles */}
                  <Route path="/windows" element={<ProtectedRoute allowedRoles={USER_ADMIN_ROLES}>{<Windows />}</ProtectedRoute>} />
                  <Route path="/windows10" element={<ProtectedRoute allowedRoles={USER_ADMIN_ROLES}>{<Navigate to="/windows" state={{ tab: "win10" }} />}</ProtectedRoute>} />
                  <Route path="/windows11" element={<ProtectedRoute allowedRoles={USER_ADMIN_ROLES}>{<Navigate to="/windows" state={{ tab: "win11" }} />}</ProtectedRoute>} />
                  <Route path="/docs" element={<ProtectedRoute allowedRoles={USER_ADMIN_ROLES}>{<Docs />}</ProtectedRoute>} />
                  <Route path="/test-tools" element={<ProtectedRoute allowedRoles={USER_ADMIN_ROLES}>{<TestTools />}</ProtectedRoute>} />
                  <Route path="/disassembly-guides" element={<ProtectedRoute allowedRoles={USER_ADMIN_ROLES}>{<DisassemblyGuides />}</ProtectedRoute>} />
                  <Route path="/disassembly/:id" element={<ProtectedRoute allowedRoles={USER_ADMIN_ROLES}>{<DisassemblyGuideDetail />}</ProtectedRoute>} />
				  <Route path="/stock" element={<ProtectedRoute allowedRoles={USER_ADMIN_ROLES}>{<stock />}</ProtectedRoute>} />
                  
                  {/* Admin-only routes */}
                  <Route path="/admin" element={<ProtectedRoute allowedRoles={ADMIN_ROLE}>{<Admin />}</ProtectedRoute>} />
                  <Route path="/admin/guides" element={<ProtectedRoute allowedRoles={ADMIN_ROLE}>{<Admin />}</ProtectedRoute>} />
                  <Route path="/admin/guides/new" element={<ProtectedRoute allowedRoles={ADMIN_ROLE}>{<GuideEditor />}</ProtectedRoute>} />
                  <Route path="/admin/guides/edit/:id" element={<ProtectedRoute allowedRoles={ADMIN_ROLE}>{<GuideEditor />}</ProtectedRoute>} />
                  <Route path="/admin/drivers/new" element={<ProtectedRoute allowedRoles={ADMIN_ROLE}>{<DriverEditor />}</ProtectedRoute>} />
                  <Route path="/admin/drivers/edit/:id" element={<ProtectedRoute allowedRoles={ADMIN_ROLE}>{<DriverEditor />}</ProtectedRoute>} />
                  <Route path="/admin/users/new" element={<ProtectedRoute allowedRoles={ADMIN_ROLE}>{<UserEditor />}</ProtectedRoute>} />
                  <Route path="/admin/users/edit/:id" element={<ProtectedRoute allowedRoles={ADMIN_ROLE}>{<UserEditor />}</ProtectedRoute>} />
                  
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