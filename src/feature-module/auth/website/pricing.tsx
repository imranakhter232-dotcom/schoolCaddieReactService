import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import RegisterModal from "./RegisterModal";

interface Plan {
  price_id: string;
  product_name: string;
  amount: number;
  currency: string;
  interval: string;
  description: string;
}

const Pricing: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  useEffect(() => {
    axios
      // .get("http://127.0.0.1:8000/school/payments/get-plans/")
      .get("https://api.schoolcaddie.com/school/payments/get-plans/")
      .then((res) => {
        setPlans(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubscribe = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowRegisterModal(true);
  };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: "#f8fafc", color: "#0f172a", overflowX: 'hidden' }}>
          
          {/* --- ADVANCED 3D & BRANDING STYLES --- */}
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
            
            :root {
              --brand-blue: #2563eb;
              --brand-orange: #f97316;
              --deep-blue: #1e3a8a;
              --glass: rgba(255, 255, 255, 0.7);
            }
    
            @keyframes float3d {
              0%, 100% { transform: translateY(0) rotate(0deg); }
              50% { transform: translateY(-20px) rotate(2deg); }
            }
            .animate-float { animation: float3d 6s ease-in-out infinite; }
    
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(30px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .fade-section { opacity: 0; transition: opacity 0.8s ease, transform 0.8s ease; }
            .fade-in { animation: fadeIn 0.8s ease forwards; }
    
            @keyframes ripple {
              0% { transform: scale(0); opacity: 1; }
              100% { transform: scale(4); opacity: 0; }
            }
            .btn-ripple:hover::after {
              animation: ripple 0.6s linear;
            }
    
            .card-perspective {
              background: white;
              border-radius: 28px;
              border: 1px solid rgba(0,0,0,0.05);
              box-shadow: 12px 12px 30px #d1d9e6, -12px -12px 30px #ffffff;
              transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
              padding: 40px 30px;
              height: 100%;
              cursor: pointer;
              position: relative;
              overflow: hidden;
            }
    
            .card-perspective::before {
              content: '';
              position: absolute;
              top: 0; left: 0; right: 0; bottom: 0;
              background: linear-gradient(135deg, rgba(37,99,235,0.05), rgba(249,115,22,0.05));
              opacity: 0;
              transition: opacity 0.3s;
            }
    
            .card-perspective:hover::before { opacity: 1; }
    
            .card-perspective:hover {
              transform: translateY(-15px) rotateX(10deg) rotateY(-5deg);
              box-shadow: 0 40px 70px rgba(37, 99, 235, 0.1), 0 0 20px rgba(249, 115, 22, 0.3);
              border-top: 5px solid var(--brand-orange);
            }
    
            .hero-section {
              background: radial-gradient(circle at top left, var(--deep-blue), var(--brand-blue));
              color: white;
              padding: 140px 0 100px 0;
              border-bottom-left-radius: 100px;
              position: relative;
              overflow: hidden;
            }
    
            .hero-section::before {
              content: '';
              position: absolute;
              top: 0; left: 0; width: 100%; height: 100%;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.1)"/></svg>') repeat;
              animation: float3d 10s ease-in-out infinite;
            }
    
            .btn-brand-3d {
              background: linear-gradient(135deg, var(--brand-orange) 0%, #ea580c 100%);
              color: white; font-weight: 700; padding: 16px 42px;
              border-radius: 16px; border: none;
              box-shadow: 0 10px 25px rgba(249, 115, 22, 0.35);
              transition: 0.3s;
              text-transform: uppercase; letter-spacing: 1.5px;
              position: relative;
              overflow: hidden;
            }
    
            .btn-brand-3d::after {
              content: '';
              position: absolute;
              top: 50%; left: 50%;
              width: 0; height: 0;
              background: rgba(255,255,255,0.3);
              border-radius: 50%;
              transform: translate(-50%, -50%);
            }
    
            .btn-brand-3d:hover { transform: translateY(-4px) scale(1.03); box-shadow: 0 20px 40px rgba(249, 115, 22, 0.5); }
            .btn-brand-3d:hover::after { width: 300px; height: 300px; }
    
            .section-tag { color: var(--brand-orange); font-weight: 800; text-transform: uppercase; letter-spacing: 2px; font-size: 0.85rem; }
    
            @media (max-width: 768px) {
              .hero-section { padding: 80px 0 60px 0; }
              .display-1 { font-size: 2.5rem; }
              .display-4 { font-size: 2rem; }
              .card-perspective { padding: 20px; }
              .btn-brand-3d { padding: 12px 30px; font-size: 0.9rem; }
            }
    
            .fs-41 {
      font-size: 1.2rem !important;
      line-height: 1.6;
    }
    
    .fs-411 {
      font-size: 17px !important;
      line-height: 1.8;
    }
    
    @media (max-width: 768px) {
      .fs-41 {
        font-size: 1.1rem !important;
      }
    
      .fs-411 {
        font-size: .9rem !important;
      }
    }
          `}</style>
    
          {/* --- NAVIGATION --- */}
          {/* --- NAVIGATION --- */}
    {/* --- IMPROVED PREMIUM NAVBAR --- */}
    <nav className="navbar navbar-expand-lg sticky-top" style={{ 
      background: '#fef7f1', 
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
      padding: '12px 0',
      zIndex: 1000,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
    }}>
      <div className="container">
        {/* Logo Section - Scaled Properly */}
        <Link className="navbar-brand d-flex align-items-center" to="/" style={{ padding: '0' }}>
          <img 
            src="/assets/img/logo.PNG" 
            alt="SchoolCaddie Logo" 
            style={{ height: '130px', width: 'auto', objectFit: 'contain' }} 
            onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150x50?text=SchoolCaddie'; }}
          />
        </Link>
    
        {/* Mobile Toggle Custom Button */}
        <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
    
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-center gap-1 gap-lg-3">
            <li className="nav-item">
              <a className="nav-link fw-600 nav-hover-effect" href="/">Home</a>
            </li>
            {/* <li className="nav-item">
              <a className="nav-link fw-600 nav-hover-effect" href="#why-us">Why Us</a>
            </li>
            <li className="nav-item">
              <Link className="nav-link fw-600 nav-hover-effect d-flex align-items-center" to="/pricing">
                Pricing 
                <span className="ms-2 badge rounded-pill" style={{ 
                  fontSize: '9px', 
                  background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
                  color: 'white',
                  padding: '4px 8px',
                  textTransform: 'uppercase'
                }}>New</span>
              </Link>
            </li>
            <li className="nav-item">
              <a className="nav-link fw-600 nav-hover-effect" href="#about">About</a>
            </li>
    
            <li className="nav-item">
              <a className="nav-link fw-600 nav-hover-effect" href="#mission">Mission</a>
            </li> */}
            
            {/* Login Button with Premium Styling */}
            {/* <li className="nav-item ms-lg-3">
              <button 
                className="btn btn-brand-3d" 
                onClick={() => setShowLoginPopup(true)}
                style={{ 
                  borderRadius: '50px', 
                  padding: '10px 28px', 
                  fontSize: '0.9rem',
                  background: 'var(--brand-orange)',
                  border: 'none',
                  boxShadow: '0 8px 15px rgba(249, 115, 22, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                LOGIN PORTAL
              </button>
            </li> */}
          </ul>
        </div>
      </div>
    </nav>


      {/* --- HERO SECTION WITH IMAGE BACKGROUND --- */}
      <section className="py-5 position-relative" style={{ 
          backgroundImage: `linear-gradient(rgba(13, 110, 253, 0.85), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          paddingTop: '100px',
          paddingBottom: '120px'
      }}>
        <div className="container text-center text-white">
          <h1 className="display-4 fw-bold mb-3 text-white" style={{ letterSpacing: '1px' }}>
      Choose Your Perfect Plan
    </h1>
          <p className="lead opacity-90 mx-auto" style={{ maxWidth: "700px" }}>
            Invest in the future of your institution with our scalable and secure management solutions.
          </p>
        </div>
      </section>

      {/* --- PRICING CARDS --- */}
      <div className="container" style={{ marginTop: "-50px" }}>
        <div className="row justify-content-center g-4 mb-5">
          {loading ? (
            <div className="text-center py-5 bg-white rounded-4 shadow-sm w-100">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-3 text-muted fw-bold">Fetching latest plans...</p>
            </div>
          ) : (
            plans.map((plan) => (
              <div className="col-lg-4 col-md-6" key={plan.price_id}>
                <div className="card border-0 shadow-lg rounded-4 h-100 pricing-card overflow-hidden">
                  
                  {/* Badge for Pro plans */}
                  {plan.product_name.toLowerCase().includes("pro") && (
                    <div className="bg-warning text-center py-1 fw-bold small text-uppercase" style={{letterSpacing:'1px'}}>
                      Most Popular
                    </div>
                  )}

                  <div className="card-body p-4 p-xl-5">
                    <h5 className="text-primary fw-bold mb-2">{plan.product_name}</h5>
                    <div className="d-flex align-items-end mb-4">
                      <h2 className="display-5 fw-bold mb-0">${plan.amount}</h2>
                      <span className="text-muted ms-2 pb-1">/ {plan.interval}</span>
                    </div>
                    
                    <p className="text-muted mb-4 small border-bottom pb-4" style={{ minHeight: "60px" }}>
                      {plan.description || "Premium features to manage your school operations smoothly."}
                    </p>

                    <ul className="list-unstyled mb-5 fw-medium">
                      <li className="mb-3 d-flex align-items-center">
                        <i className="ti ti-check text-success me-2 border rounded-circle p-1" style={{fontSize: '0.8rem'}}></i>
                        <span>Unlimited Student Records</span>
                      </li>
                      <li className="mb-3 d-flex align-items-center">
                        <i className="ti ti-check text-success me-2 border rounded-circle p-1" style={{fontSize: '0.8rem'}}></i>
                        <span>Fee & Receipt Module</span>
                      </li>
                      <li className="mb-3 d-flex align-items-center">
                        <i className="ti ti-check text-success me-2 border rounded-circle p-1" style={{fontSize: '0.8rem'}}></i>
                        <span>Quran & Hifz Progress</span>
                      </li>
                      <li className="mb-3 d-flex align-items-center">
                        <i className="ti ti-check text-success me-2 border rounded-circle p-1" style={{fontSize: '0.8rem'}}></i>
                        <span>Exam Result Portal</span>
                      </li>
                    </ul>

                    <button
                      onClick={() => handleSubscribe(plan)}
                      className="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-sm mt-auto transition-all"
                    >
                      Subscribe Now
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>



      {/* --- FOOTER --- */}
<footer className="footer-wrap"> {/* fade-section class hata di taki hamesha dikhe */}
  <div className="container py-5">
    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-center gap-3">
      <p className="footer-copy">
        © {new Date().getFullYear()} SchoolCaddie. All rights reserved.
      </p>
      <div className="d-flex gap-4 footer-policy">
        <span style={{ cursor: 'pointer' }} onClick={() => setShowPrivacy(true)}>Privacy Policy</span>
        <span style={{ cursor: 'pointer' }} onClick={() => setShowTerms(true)}>Terms of Service</span>
        <span style={{ cursor: 'pointer' }} onClick={() => setShowSupport(true)}>Support</span>
      </div>
    </div>
  </div>

  <style>{`
    .footer-wrap {
      background: linear-gradient(135deg, #020617, #020617);
      color: white;
      border-top-left-radius: 120px;
      position: relative;
      overflow: hidden;
      margin-top: 50px; /* Thoda space dene ke liye */
      z-index: 10;
    }

    .footer-wrap::before {
      content: "";
      position: absolute;
      inset: 0;
      background: radial-gradient(
        circle at top left,
        rgba(249,115,22,0.35),
        transparent 55%
      );
      pointer-events: none;
    }

    .footer-copy {
      color: rgba(255,255,255,0.4);
      font-size: 0.9rem;
      margin: 0;
    }

    .footer-policy span {
      color: rgba(255,255,255,0.5);
      font-size: 0.9rem;
      transition: color 0.25s ease;
    }

    .footer-policy span:hover {
      color: #f97316;
    }

    @media (max-width: 768px) {
      .footer-wrap {
        border-top-left-radius: 60px;
      }
    }
  `}</style>
</footer>



{/* --- PRIVACY POLICY POPUP --- */}
{showPrivacy && (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }} onClick={() => setShowPrivacy(false)}>
    <div className="fade-in" style={{ background: 'white', borderRadius: '40px', width: '100%', maxWidth: '800px', padding: '50px', position: 'relative', boxShadow: '0 50px 100px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)' }} onClick={(e) => e.stopPropagation()}>
      <button onClick={() => setShowPrivacy(false)} style={{ position: 'absolute', top: '25px', right: '25px', border: 'none', background: '#f1f5f9', width: '45px', height: '45px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer' }}>✕</button>
      <div className="text-center mb-4">
        <div className="login-icon-wrap" style={{ backgroundColor: '#1e3a8a15', color: '#1e3a8a', margin: '0 auto 20px' }}>🛡️</div>
        <h2 className="fw-800 display-6" style={{ color: '#0f172a' }}>Privacy Policy</h2>
        <p className="text-muted">How we handle and protect your data</p>
      </div>
      <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '10px', color: '#475569', lineHeight: '1.8', fontSize: '1.1rem' }}>
        At SchoolCaddie, your privacy is our top priority. We implement industry-standard encryption to protect all academic and personal data. We collect information solely for school administration purposes. Your information is stored on secure cloud servers with 24/7 monitoring.
      </div>
      <button className="btn btn-brand-3d w-100 mt-4" onClick={() => setShowPrivacy(false)}>I UNDERSTAND</button>
    </div>
  </div>
)}

{/* --- TERMS OF SERVICE POPUP --- */}
{showTerms && (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }} onClick={() => setShowTerms(false)}>
    <div className="fade-in" style={{ background: 'white', borderRadius: '40px', width: '100%', maxWidth: '800px', padding: '50px', position: 'relative', boxShadow: '0 50px 100px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)' }} onClick={(e) => e.stopPropagation()}>
      <button onClick={() => setShowTerms(false)} style={{ position: 'absolute', top: '25px', right: '25px', border: 'none', background: '#f1f5f9', width: '45px', height: '45px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer' }}>✕</button>
      <div className="text-center mb-4">
        <div className="login-icon-wrap" style={{ backgroundColor: '#2563eb15', color: '#2563eb', margin: '0 auto 20px' }}>📜</div>
        <h2 className="fw-800 display-6" style={{ color: '#0f172a' }}>Terms of Service</h2>
        <p className="text-muted">Guidelines for using our platform</p>
      </div>
      <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '10px', color: '#475569', lineHeight: '1.8', fontSize: '1.1rem' }}>
        By accessing SchoolCaddie, you agree to comply with our usage guidelines. Users are responsible for maintaining account confidentiality. Any unauthorized attempt to access data will result in immediate termination of service. We reserve the right to update features to improve efficiency.
      </div>
      <button className="btn btn-brand-3d w-100 mt-4" style={{ background: '#2563eb' }} onClick={() => setShowTerms(false)}>ACCEPT TERMS</button>
    </div>
  </div>
)}

{/* --- SUPPORT POPUP --- */}
{showSupport && (
  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }} onClick={() => setShowSupport(false)}>
    <div className="fade-in" style={{ background: 'white', borderRadius: '40px', width: '100%', maxWidth: '800px', padding: '50px', position: 'relative', boxShadow: '0 50px 100px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.2)' }} onClick={(e) => e.stopPropagation()}>
      <button onClick={() => setShowSupport(false)} style={{ position: 'absolute', top: '25px', right: '25px', border: 'none', background: '#f1f5f9', width: '45px', height: '45px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer' }}>✕</button>
      <div className="text-center mb-5">
        <div className="login-icon-wrap" style={{ backgroundColor: '#f9731615', color: '#f97316', margin: '0 auto 20px' }}>🎧</div>
        <h2 className="fw-800 display-6" style={{ color: '#0f172a' }}>Support Center</h2>
        <p className="text-muted">We are here to help you</p>
      </div>
      <div className="row g-4 text-center">
        <div className="col-md-4">
          <div className="p-4 rounded-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div className="fs-2 mb-2">📧</div>
            <h6 className="fw-bold">Email</h6>
            <p className="small text-muted mb-0">support@schoolcaddie.com</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-4 rounded-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div className="fs-2 mb-2">📞</div>
            <h6 className="fw-bold">WhatsApp</h6>
            <p className="small text-muted mb-0">+91 XXXXX XXXXX</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-4 rounded-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div className="fs-2 mb-2">🕒</div>
            <h6 className="fw-bold">Hours</h6>
            <p className="small text-muted mb-0">Mon-Sat (9AM-6PM)</p>
          </div>
        </div>
      </div>
      <button className="btn btn-brand-3d w-100 mt-5" onClick={() => setShowSupport(false)}>CLOSE CENTER</button>
    </div>
  </div>
)}

      <style>{`
        .pricing-card {
          transition: all 0.3s ease;
          border: 1px solid #eee !important;
        }
        .pricing-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 1rem 3rem rgba(0,0,0,0.175) !important;
        }
        .transition-all {
          transition: 0.3s;
        }
        .btn-primary { background-color: #0d6efd; border: none; }
        .bg-primary-soft { background-color: rgba(13, 110, 253, 0.1); }
      `}</style>

      {/* --- REGISTER MODAL --- */}
      {showRegisterModal && selectedPlan && (
        <RegisterModal
          plan={selectedPlan}
          onClose={() => setShowRegisterModal(false)}
        />
      )}
    </div>
  );
};

export default Pricing;