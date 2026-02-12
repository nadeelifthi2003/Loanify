import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from '@/pages/Landing';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { Login } from '@/features/auth/components/Login';
import { Register } from '@/features/auth/components/Register';
import { ForgotPassword } from '@/features/auth/components/ForgotPassword';
import { CustomerDashboard } from '@/features/customer/pages/CustomerDashboard';
import { MyLoans } from '@/features/customer/pages/MyLoans';
import { LoanApplication } from '@/features/customer/pages/LoanApplication';
import { EMICalculator } from '@/features/customer/pages/EMICalculator';
import { Settings } from '@/features/customer/pages/Settings';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

import { OfficerDashboard } from '@/features/officer/pages/OfficerDashboard';
import { ApplicationsList } from '@/features/officer/pages/ApplicationsList';
import { ApplicationVerification } from '@/features/officer/pages/ApplicationVerification';

import { AdminDashboard } from '@/features/admin/pages/AdminDashboard';
import { UserManagement } from '@/features/admin/pages/UserManagement';
import { SystemSettings } from '@/features/admin/pages/SystemSettings';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Landing />} />

            {/* Auth Routes */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
            </Route>

            {/* Customer Routes */}
            <Route path="/customer" element={<DashboardLayout role="customer" />}>
              <Route index element={<CustomerDashboard />} />
              <Route path="loans" element={<MyLoans />} />
              <Route path="apply" element={<LoanApplication />} />
              <Route path="calculator" element={<EMICalculator />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Officer Routes */}
            <Route path="/officer" element={<DashboardLayout role="officer" />}>
              <Route index element={<OfficerDashboard />} />
              <Route path="applications" element={<ApplicationsList />} />
              <Route path="application/:id" element={<ApplicationVerification />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={<DashboardLayout role="admin" />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="settings" element={<SystemSettings />} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
