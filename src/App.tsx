import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PlansProvider } from "./context/PlansContext";
import { ToastProvider } from "./context/ToastContext";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminOrders } from "./pages/AdminOrders";
import { AdminOverview } from "./pages/AdminOverview";
import { AdminUsage } from "./pages/AdminUsage";
import { AdminUsers } from "./pages/AdminUsers";
import { DashboardBilling } from "./pages/DashboardBilling";
import { DashboardKeys } from "./pages/DashboardKeys";
import { DashboardOverview } from "./pages/DashboardOverview";
import { DashboardUsage } from "./pages/DashboardUsage";
import { Docs } from "./pages/Docs";
import { ForgotPassword } from "./pages/ForgotPassword";
import { Home } from "./pages/Home";
import { LegalPrivacy, LegalSecurity, LegalSla, LegalTerms } from "./pages/Legal";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { OAuthCallback } from "./pages/OAuthCallback";
import { Pricing } from "./pages/Pricing";
import { Register } from "./pages/Register";
import { ResetPassword } from "./pages/ResetPassword";
import { VerifyEmail } from "./pages/VerifyEmail";

export function App() {
  return (
    <BrowserRouter>
      <PlansProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/docs" element={<Docs />} />

              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/auth/callback" element={<OAuthCallback />} />

              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminOverview />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/usage" element={<AdminUsage />} />

              <Route path="/dashboard" element={<DashboardOverview />} />
              <Route path="/dashboard/keys" element={<DashboardKeys />} />
              <Route path="/dashboard/usage" element={<DashboardUsage />} />
              <Route path="/dashboard/billing" element={<DashboardBilling />} />

              <Route path="/terms" element={<LegalTerms />} />
              <Route path="/privacy" element={<LegalPrivacy />} />
              <Route path="/sla" element={<LegalSla />} />
              <Route path="/security" element={<LegalSecurity />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </PlansProvider>
    </BrowserRouter>
  );
}
