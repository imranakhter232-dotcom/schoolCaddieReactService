import React, { useState } from "react";
import axios from "axios";

interface Plan {
  price_id: string;
  product_name: string;
  amount: number;
  currency: string;
  interval: string;
  description: string;
}

interface Props {
  plan: Plan;
  onClose: () => void;
}

const RegisterModal: React.FC<Props> = ({ plan, onClose }) => {
  const [form, setForm] = useState({
    school_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startPayment = async (userId: number) => {
  const res = await axios.post(
    "https://api.schoolcaddie.com/school/payments/create-checkout-session/",
    { 
      price_id: plan.price_id,
      user_id: userId   // 🔥 IMPORTANT
    }
  );

    window.location.href = res.data.checkout_url;
  };

  const extractError = (data: any): string => {
    if (!data) return "Registration failed. Please try again.";
    if (typeof data === "string") return data;
    // Flatten all field errors into one message
    const messages: string[] = [];
    for (const key of Object.keys(data)) {
      const val = data[key];
      if (Array.isArray(val)) messages.push(...val);
      else if (typeof val === "string") messages.push(val);
    }
    return messages.join(" ") || "Registration failed. Please try again.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  if (form.password !== form.confirm_password) {
    setError("Passwords do not match.");
    return;
  }

  setLoading(true);

  try {

    const res = await axios.post(
      "https://api.schoolcaddie.com/school/register/",
      {
        school_name: form.school_name,
        email: form.email,
        password: form.password,
      }
    );

    // 🔥 get user id from response
    const userId = res.data.id;

    // start payment with user id
    await startPayment(userId);

  } catch (err: any) {

    setError(extractError(err.response?.data));
    setLoading(false);

  }
};

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "white",
          borderRadius: "28px",
          width: "100%",
          maxWidth: "500px",
          padding: "40px",
          position: "relative",
          boxShadow: "0 40px 80px rgba(0,0,0,0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          disabled={loading}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            border: "none",
            background: "#f1f5f9",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            fontSize: "18px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>

        <div className="text-center mb-4">
          <h4 className="fw-bold mb-1">Create Your Account</h4>
          <p className="text-muted small mb-0">
            Registering for{" "}
            <strong style={{ color: "#f97316" }}>{plan.product_name}</strong> —
            ${plan.amount}/{plan.interval}
          </p>
        </div>

        {error && (
          <div className="alert alert-danger rounded-3 py-2 small">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold small">School Name</label>
            <input
              type="text"
              className="form-control rounded-3 bg-light border-0 shadow-sm"
              placeholder="Enter school name"
              required
              value={form.school_name}
              onChange={(e) => setForm({ ...form, school_name: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small">Email</label>
            <input
              type="email"
              className="form-control rounded-3 bg-light border-0 shadow-sm"
              placeholder="admin@school.com"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold small">Password</label>
            <input
              type="password"
              className="form-control rounded-3 bg-light border-0 shadow-sm"
              placeholder="Create a password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold small">Confirm Password</label>
            <input
              type="password"
              className="form-control rounded-3 bg-light border-0 shadow-sm"
              placeholder="Repeat your password"
              required
              value={form.confirm_password}
              onChange={(e) =>
                setForm({ ...form, confirm_password: e.target.value })
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn w-100 py-3 rounded-pill fw-bold text-white"
            style={{
              background: loading
                ? "#94a3b8"
                : "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
              border: "none",
              boxShadow: "0 8px 20px rgba(249,115,22,0.35)",
              transition: "0.3s",
            }}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Processing...
              </>
            ) : (
              "Register & Proceed to Payment"
            )}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn w-100 mt-2 py-2 rounded-pill text-muted"
            style={{ background: "transparent", border: "1px solid #e2e8f0" }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;
