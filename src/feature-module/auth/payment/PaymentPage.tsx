import React, { useEffect, useState } from "react";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { API_BASE_URL } from "../../../core/api/axiosInstance";

interface Plan {
  price_id: string;
  product_name: string;
  amount: number;
  currency: string;
  interval: string;
}

const PaymentPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Fetch available subscription plans on mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          alert("Session expired. Please login again.");
          window.location.href = "/admin-login";
          return;
        }

        const response = await fetch(`${API_BASE_URL}payments/get-plans/`, {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        if (response.ok && Array.isArray(data) && data.length > 0) {
          setPlans(data);
          setSelectedPlan(data[0]); // auto-select first plan
        } else {
          setErrorMsg("No subscription plans available. Please contact support.");
        }
      } catch (err) {
        console.error("Failed to fetch plans:", err);
        setErrorMsg("Failed to load subscription plans. Please refresh.");
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, []);

  const handlePayNow = async () => {
    if (!selectedPlan?.price_id) {
      setErrorMsg("Please select a plan before proceeding.");
      return;
    }

    setLoadingPayment(true);
    setErrorMsg("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Session expired. Please login again.");
        window.location.href = "/admin-login";
        return;
      }

      const response = await fetch(`${API_BASE_URL}payments/create-checkout-session/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ price_id: selectedPlan.price_id }),
      });

      const data = await response.json();

      if (response.ok && data.url) {
        window.location.href = data.url;
      } else {
        setErrorMsg(data.error || data.message || "Payment initiation failed. Please try again.");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setErrorMsg("Payment failed. Please try again.");
    } finally {
      setLoadingPayment(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="login-wrapper w-100 overflow-hidden position-relative flex-wrap d-block vh-100">
        <div className="row justify-content-center align-items-center vh-100">
          <div className="col-md-8 col-lg-5 p-4">
            <div className="text-center mb-4">
              <ImageWithBasePath
                src="assets/img/authentication/authentication-logo.png"
                className="img-fluid"
                alt="Logo"
              />
            </div>

            <div className="card shadow-sm">
              <div className="card-body p-4">
                <div className="text-center mb-3">
                  <i className="ti ti-credit-card" style={{ fontSize: "48px", color: "#4a90e2" }} />
                </div>
                <h3 className="text-center mb-1">Activate Your Subscription</h3>
                <p className="text-muted text-center mb-4">
                  Your account is inactive. Complete payment to unlock all features.
                </p>

                {errorMsg && (
                  <div className="alert alert-danger mb-3">{errorMsg}</div>
                )}

                {/* Plan selection */}
                {loadingPlans ? (
                  <div className="text-center py-3">
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Loading plans...
                  </div>
                ) : (
                  <div className="mb-4">
                    {plans.map((plan) => (
                      <div
                        key={plan.price_id}
                        onClick={() => setSelectedPlan(plan)}
                        className={`border rounded p-3 mb-2 d-flex justify-content-between align-items-center`}
                        style={{
                          cursor: "pointer",
                          borderColor: selectedPlan?.price_id === plan.price_id ? "#4a90e2" : "#dee2e6",
                          backgroundColor: selectedPlan?.price_id === plan.price_id ? "#f0f7ff" : "#fff",
                        }}
                      >
                        <div>
                          <strong>{plan.product_name}</strong>
                          <div className="text-muted small">Billed {plan.interval}ly</div>
                        </div>
                        <div className="text-end">
                          <strong>
                            {plan.amount} {plan.currency.toUpperCase()}
                          </strong>
                          <div className="text-muted small">/{plan.interval}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  className="btn btn-primary w-100 btn-lg"
                  onClick={handlePayNow}
                  disabled={loadingPayment || loadingPlans || !selectedPlan}
                >
                  {loadingPayment ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      Redirecting to Payment...
                    </>
                  ) : (
                    "Pay Now"
                  )}
                </button>

                <p className="text-muted text-center mt-3 small">
                  You will be redirected to Stripe's secure checkout page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
