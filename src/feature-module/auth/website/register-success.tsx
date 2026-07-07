import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const RegisterSuccess: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const sessionId = params.get("session_id");
    // Thoda delay add kiya hai taaki user ko "Processing" feel aaye (Professional UX)
    const timer = setTimeout(() => {
      if (sessionId) {
        navigate(`/register?session_id=${sessionId}`);
      }
    }, 2000); 

    return () => clearTimeout(timer);
  }, [params, navigate]);

  return (
    <div style={{ 
      fontFamily: "'Poppins', sans-serif", 
      backgroundColor: "#f8f9fa", 
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card border-0 shadow-lg rounded-4 p-5 text-center">
              
              {/* --- ANIMATED LOADER --- */}
              <div className="mb-4">
                <div className="spinner-border text-primary" role="status" style={{ width: "4rem", height: "4rem", borderWidth: "0.3em" }}>
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>

              {/* --- TEXT CONTENT --- */}
              <h2 className="fw-bold mb-3 text-dark">Processing Payment</h2>
              <p className="text-muted mb-4">
                Please wait while we verify your transaction. <br />
                <strong>Do not refresh or close this window.</strong>
              </p>

              {/* --- PROGRESS BAR --- */}
              <div className="progress mb-4" style={{ height: "8px", borderRadius: "10px" }}>
                <div 
                  className="progress-bar progress-bar-striped progress-bar-animated bg-success" 
                  role="progressbar" 
                  style={{ width: "100%" }}
                ></div>
              </div>

              {/* --- SECURITY FOOTER --- */}
              <div className="d-flex align-items-center justify-content-center gap-3 pt-3 border-top">
                <div className="small text-muted d-flex align-items-center">
                  <i className="ti ti-shield-check text-success fs-4 me-2"></i>
                  Secure Encryption
                </div>
                <div className="small text-muted d-flex align-items-center border-start ps-3">
                  <i className="ti ti-lock text-primary fs-4 me-2"></i>
                  SSL Verified
                </div>
              </div>

            </div>

            {/* --- BACKUP LINK --- */}
            <p className="text-center mt-4 small text-muted">
              Taking too long? <span className="text-primary style-pointer" onClick={() => navigate('/')}>Click here to return</span>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .style-pointer { cursor: pointer; text-decoration: underline; }
        .rounded-4 { border-radius: 1.5rem !important; }
        .text-primary { color: #0d6efd !important; }
        .spinner-border { color: #0d6efd !important; }
      `}</style>
    </div>
  );
};

export default RegisterSuccess;