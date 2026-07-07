import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLE } from "../utils/authRedirect";

const InactiveBanner: React.FC = () => {
  const { isActive } = useAuth();
  const navigate = useNavigate();

  const roleId = Number(localStorage.getItem("role_id") || 0);

  // Only School Admin (role 1) sees the payment banner
  if (roleId !== ROLE.SCHOOL_ADMIN || isActive) return null;

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 9999,
        backgroundColor: "#dc3545",
        color: "#fff",
        padding: "10px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "8px",
      }}
    >
      <span>
        <strong>Account Inactive:</strong> Please complete your payment to unlock all school management features.
      </span>
      <button
        onClick={() => navigate("/payment")}
        style={{
          backgroundColor: "#fff",
          color: "#dc3545",
          border: "none",
          borderRadius: "4px",
          padding: "6px 14px",
          fontWeight: 600,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Go to Payment
      </button>
    </div>
  );
};

export default InactiveBanner;
