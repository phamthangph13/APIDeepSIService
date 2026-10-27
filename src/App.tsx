import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
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
import { Pricing } from "./pages/Pricing";
import { Register } from "./pages/Register";
import { ResetPassword } from "./pages/ResetPassword";

export function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
