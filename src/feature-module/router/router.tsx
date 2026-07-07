import { Route, Routes } from "react-router";
import { authRoutes, publicRoutes } from "./router.link";
import Feature from "../feature";
import AuthFeature from "../authFeature";
import Home from "../auth/website/home";
import ProtectedRoute from "../../components/ProtectedRoute";
import PaymentPage from "../auth/payment/PaymentPage";
import PaymentSuccessPage from "../auth/payment/PaymentSuccessPage";

const ALLRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Standalone payment routes — no layout wrapper, always accessible */}
      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/payment-success" element={<PaymentSuccessPage />} />

      {/* Protected app routes (require login + active subscription) */}
      <Route
        element={
          <ProtectedRoute>
            <Feature />
          </ProtectedRoute>
        }
      >
        {publicRoutes.map((route, idx) => (
          <Route path={route.path} element={route.element} key={idx} />
        ))}
      </Route>

      {/* Auth routes (login, register, etc.) */}
      <Route element={<AuthFeature />}>
        {authRoutes.map((route, idx) => (
          <Route path={route.path} element={route.element} key={idx} />
        ))}
      </Route>
    </Routes>
  );
};

export default ALLRoutes;
