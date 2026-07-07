import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "../../../core/api/axiosInstance";

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [statusMsg, setStatusMsg] = useState("Activating your subscription...");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const sessionId = searchParams.get("session_id");

        if (!sessionId) {
          alert("Session ID missing. Please contact support.");
          navigate("/payment");
          return;
        }

        const token = localStorage.getItem("token");

        const response = await fetch(`${API_BASE_URL}payments/verify-payment/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ session_id: sessionId }),
        });

        const data = await response.json();

        if (response.ok) {
          // Mark active in localStorage, then force re-login
          localStorage.setItem("is_active", "true");
          localStorage.removeItem("token");

          setStatusMsg("Subscription activated! Redirecting to login...");
          alert(data.message || "Subscription activated successfully. Please login.");
          navigate("/admin-login");
        } else {
          alert(data.error || "Payment verification failed.");
          navigate("/payment");
        }
      } catch (error) {
        console.error("Verification error:", error);
        navigate("/payment");
      }
    };

    verifyPayment();
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>{statusMsg}</h2>
      <div className="spinner-border text-primary mt-3" role="status" />
    </div>
  );
};

export default PaymentSuccessPage;
