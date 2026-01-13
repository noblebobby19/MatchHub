import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { HomePage } from "../pages/HomePage";
import { FindFieldsPage } from "../pages/FindFieldsPage";
import { FieldDetailPage } from "../pages/FieldDetailPage";
import { ContactPage } from "../pages/ContactPage";
import { FindTeammatesPage } from "../pages/FindTeammatesPage";
import { FindOpponentsPage } from "../pages/FindOpponentsPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { OwnerDashboard } from "../pages/OwnerDashboard";
import { AddFieldPage } from "../pages/AddFieldPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { BookingSuccessPage } from "../pages/BookingSuccessPage";
import { ProfilePage } from "../pages/ProfilePage";
import { BookingHistoryPage } from "../pages/BookingHistoryPage";
import { BookingDetailPage } from "../pages/BookingDetailPage";
import { GoogleCallbackPage } from "../pages/GoogleCallbackPage";
import { AuthProvider } from "../context/AuthContext";

// Component để kiểm tra xem có nên hiển thị header/footer không
function Layout({ children }) {
  const location = useLocation();
  const showHeaderFooter = !location.pathname.startsWith('/owner-dashboard') &&
    location.pathname !== '/them-san-moi' &&
    location.pathname !== '/login' &&
    location.pathname !== '/register' &&
    location.pathname !== '/thanh-toan';

  return (
    <div className="min-h-screen bg-background">
      {showHeaderFooter && <Header />}
      {children}
      {showHeaderFooter && <Footer />}
    </div>
  );
}

export function AppRoutes() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tim-san" element={<FindFieldsPage />} />
            <Route path="/san-bong/:id" element={<FieldDetailPage />} />
            <Route path="/lien-he" element={<ContactPage />} />
            <Route path="/tim-dong-doi" element={<FindTeammatesPage />} />
            <Route path="/tim-doi-thu" element={<FindOpponentsPage />} />
            <Route path="/dang-nhap" element={<LoginPage />} />
            <Route path="/dang-ky" element={<RegisterPage />} />
            <Route path="/thanh-toan" element={<CheckoutPage />} />
            <Route path="/owner-dashboard" element={<OwnerDashboard />} />
            <Route path="/them-san-moi" element={<AddFieldPage />} />
            <Route path="/sua-san/:id" element={<AddFieldPage />} />
            <Route path="/dat-san-thanh-cong" element={<BookingSuccessPage />} />
            <Route path="/thong-tin-ca-nhan" element={<ProfilePage />} />
            <Route path="/lich-su-dat-san" element={<BookingHistoryPage />} />
            <Route path="/chi-tiet-don-dat-san/:id" element={<BookingDetailPage />} />
            <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

