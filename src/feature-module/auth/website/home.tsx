import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [counters, setCounters] = useState({ schools: 0, students: 0, teachers: 0 });
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

 const scrollRef = useRef(null);

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      // Ek baar mein 2 cards jitna scroll karega
      const scrollAmount = current.offsetWidth / 2;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const loginOptions = [
    { title: "Admin Portal", role: "Admin", icon: "🛡️", path: "/admin-login", color: "#1e3a8a" },
    { title: "Teacher Portal", role: "Teacher", icon: "👨‍🏫", path: "/login", color: "#2563eb" },
    { title: "Student/Parent", role: "User", icon: "🎓", path: "/student-parent-login", color: "#f97316" }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-in");
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll(".fade-section");
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  // Animated counters
  useEffect(() => {
    const target = { schools: 20, students: 5000, teachers: 300 };
    const increment = { schools: 1, students: 50, teachers: 3 };
    const interval = setInterval(() => {
      setCounters((prev) => ({
        schools: prev.schools < target.schools ? prev.schools + increment.schools : target.schools,
        students: prev.students < target.students ? prev.students + increment.students : target.students,
        teachers: prev.teachers < target.teachers ? prev.teachers + increment.teachers : target.teachers,
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

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
          <a className="nav-link fw-600 nav-hover-effect" href="#features">Features</a>
        </li>
        <li className="nav-item">
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
        </li>
        
        {/* Login Button with Premium Styling */}
        <li className="nav-item ms-lg-3">
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
        </li>
      </ul>
    </div>
  </div>
</nav>

{/* Enhanced Styles */}
<style>{`
  .nav-hover-effect {
    color: #475569 !important;
    font-size: 1rem;
    padding: 10px 18px !important;
    border-radius: 50px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .nav-hover-effect:hover {
    color: var(--brand-blue) !important;
    background: rgba(37, 99, 235, 0.08);
  }

  .navbar-toggler-icon {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba(37, 99, 235, 0.7)' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e") !important;
  }

  @media (max-width: 991px) {
    .navbar-collapse {
      background: white;
      margin-top: 15px;
      padding: 20px;
      border-radius: 20px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    .nav-item { width: 100%; text-align: center; }
    .btn-brand-3d { width: 100%; margin-top: 10px; }
  }
`}</style>
      {/* --- HERO --- */}
      {/* --- IMPROVED HERO SECTION --- */}
<section className="hero-section fade-section" style={{ 
  position: 'relative', 
  minHeight: '100vh', // Full screen height ke liye
  display: 'flex',
  alignItems: 'center',
  overflow: 'hidden',
  color: 'white'
}}>
  
  {/* --- Background Video Section --- */}
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0
  }}>
    {/* Video Overlay (Darkness badhane ke liye taki text saaf dikhe) */}
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(30, 58, 138, 0.6)', // Blueish overlay
      zIndex: 1
    }}></div>

    <video 
      src="/assets/img/v1.mp4" 
      autoPlay 
      muted 
      loop 
      playsInline
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover', // Isse video stretch nahi hogi aur poore area ko cover karegi
      }}
    />
  </div>

  {/* --- Content Section (Ab ye video ke upar aayega) --- */}
  <div className="container position-relative" style={{ zIndex: 2 }}>
    <div className="row align-items-center g-5">
      <div className="col-lg-8 text-center text-lg-start">
        
        {/* Animated Badge */}
        <div className="d-inline-flex align-items-center bg-white bg-opacity-10 border border-white border-opacity-20 rounded-pill px-3 py-2 mb-4 animate-fadeInUp">
          <span className="badge bg-orange-gradient rounded-pill me-2">NEW</span>
          <span className="text-white fw-600 small letter-spacing-1">✨ NEXT-GEN SCHOOL MANAGEMENT</span>
        </div>

        {/* Main Heading */}
        <h1 className="display-1 fw-800 text-white mb-4 animate-fadeInUp" style={{ lineHeight: 1, letterSpacing: '-2px' }}>
          Simplify <span className="text-gradient-orange">Schooling.</span><br/>
          Empower <span className="text-white opacity-75">Futures.</span>
        </h1>

        <p className="lead fs-4 text-white opacity-75 mb-5 pe-lg-5 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            SchoolCaddie is a comprehensive cloud based application designed to facilitate better school management. It provides a user-friendly platform for schools, teachers, and parents to effectively communicate, collaborate, and manage various aspects of the school ecosystem.
        </p>

        {/* Action Buttons */}
        <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
          {/* --- UPDATED ACTION BUTTONS --- */}
<div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
  
  <button 
    className="btn btn-hero-primary shadow-orange" 
    onClick={() => navigate("/admin-login")}
  >
    Admin Portal <i className="bi bi-arrow-right ms-2"></i>
  </button>

  <button 
    className="btn btn-hero-primary shadow-orange" 
    onClick={() => navigate("/login")}
  >
    Teacher Portal <i className="bi bi-arrow-right ms-2"></i>
  </button>

  <button 
    className="btn btn-hero-primary shadow-orange" 
    onClick={() => navigate("/student-parent-login")}
  >
    Parents/Student Portal <i className="bi bi-arrow-right ms-2"></i>
  </button>

</div>
        </div>

      </div>
    </div>
  </div>
</section>



{/* --- HIFZ TRACKER (Spotlight) --- */}
      <section className="py-5 fade-section">
  <div className="container">
    {/* Main Container - Position Relative zaroori hai */}
    <div className="row align-items-center g-5 p-5 rounded-5 overflow-hidden position-relative" style={{ minHeight: '500px' }}>
      
      {/* --- Background Video --- */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0
      }}>
        {/* Overlay: Video ke upar halka black parda taaki text dikhe */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, rgba(12,23,25,0.9) 0%, rgba(12,23,25,0.4) 100%)',
          zIndex: 1
        }}></div>

        <video 
          src="/assets/img/v2.mp4" 
          autoPlay 
          muted 
          loop 
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      </div>

      {/* --- Content (Foreground) --- */}
      <div
  id="about"   // 👈 Header se yahin jump karega
  className="col-lg-7 position-relative"
  style={{ zIndex: 2 }}
>
  {/* Best Title */}
  <span className="text-warning fw-bold text-uppercase tracking-widest">
    About SchoolCaddie
  </span>

  <h2 className="display-4 fw-800 mt-3 mb-4">
    <span style={{ color: "#ffffff" }}>Smart.</span>{" "}
    <span style={{ color: "var(--brand-orange)" }}>Simple.</span>{" "}
    <span style={{ color: "#ffffff" }}>Connected.</span>
  </h2>

  {/* EXACT CONTENT (no change) */}
  <p className="fs-41 text-white opacity-75 mb-4">
    SchoolCaddie is a comprehensive cloud based application designed to
    facilitate better school management. It provides a user-friendly platform
    for schools, teachers, and parents to effectively communicate, collaborate,
    and manage various aspects of the school ecosystem. With features tailored
    for academic, administrative, and communication purposes, SchoolCaddie aims
    to streamline operations and enhance the overall productivity of educational
    institutions. Our goal is to empower schools to efficiently handle daily
    tasks, improve communication, and ensure a conducive learning environment for
    students.
  </p>

  {/* Highlight Tiles (same UI style) */}
  
</div>

      {/* --- Floating Image on Top of Video --- */}
     

    </div>
  </div>
</section>

{/* Extra Styles for Hero Section */}
<style>{`
  .bg-orange-gradient { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); }
  .text-gradient-orange { background: linear-gradient(135deg, #fb923c 0%, #f97316 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  
  .btn-hero-primary {
    background: #f97316;
    color: white;
    font-weight: 700;
    padding: 18px 40px;
    border-radius: 16px;
    border: none;
    transition: all 0.3s ease;
  }
  .btn-hero-primary:hover { transform: translateY(-5px); background: #ea580c; box-shadow: 0 15px 30px rgba(249, 115, 22, 0.4); }

  .play-btn-pulse {
    width: 60px;
    height: 60px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--brand-blue);
    font-size: 1.5rem;
    box-shadow: 0 0 0 0 rgba(255,255,255,0.4);
    animation: pulse-white 2s infinite;
  }

  @keyframes pulse-white {
    0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.4); }
    70% { box-shadow: 0 0 0 20px rgba(255,255,255,0); }
    100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
  }

  .floating-card {
    position: absolute;
    bottom: 20%;
    right: -10%;
    background: rgba(255,255,255,0.9);
    backdrop-filter: blur(10px);
    padding: 15px 20px;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    z-index: 3;
    animation: float3d 4s ease-in-out infinite alternate;
  }

  .x-small { font-size: 10px; }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeInUp { animation: fadeInUp 0.8s ease forwards; }
`}</style>

     
<section id="mission" className="py-5 fade-section">
  <div className="container py-5">
    <div className="row g-5">

      {/* Mission */}
      <div className="col-md-6">
        <div className="mv-card mv-mission">
          <h2 className="display-5 fw-800 mb-4">🎯 Our Mission</h2>
          <p className="fs-411 opacity-75">
Our mission is to simplify schooling for busy families and educators by providing an all-in-one, reliable platform that strengthens communication, improves transparency, and supports student progress — academically and spiritually.
SchoolCaddie helps schools operate efficiently while keeping parents informed, engaged, and confident in their child’s journey.          </p>
        </div>
      </div>

      {/* Vision */}
      <div className="col-md-6">
        <div className="mv-card mv-vision">
          <h2 className="display-5 fw-800 mb-4">🌍 Our Vision</h2>
          <p className="fs-411 opacity-75">
Our vision is to become a trusted digital companion for schools worldwide, where technology enhances education, collaboration, and growth.
We aspire to create a future where every school — Islamic or non-Islamic — can manage learning effortlessly, every parent stays connected, and every student is supported to reach their full potential.          </p>
        </div>
      </div>

    </div>
  </div>

  <style>{`

    h2.display-5{
      color: white;
    }
    .mv-card {
      height: 100%;
      padding: 60px 45px;
      border-radius: 36px;
      color: white;
      box-shadow: 0 30px 80px rgba(0,0,0,0.6);
      position: relative;
      overflow: hidden;
    }

    .mv-card::before {
      content: "";
      position: absolute;
      inset: 0;
      opacity: 0.15;
      pointer-events: none;
    }

    .mv-mission {
      background: linear-gradient(135deg, #1e3a8a, #2563eb);
    }

    .mv-vision {
      background: linear-gradient(135deg, #f97316, #ea580c);
    }

    .mv-card:hover {
      transform: translateY(-10px);
      transition: all 0.35s ease;
    }

    @media (max-width: 768px) {
      .mv-card {
        padding: 40px 30px;
      }
    }
  `}</style>
</section>

      {/* --- WHAT WE DO SECTION --- */}
      <section id="what-we-do" className="py-5 fade-section position-relative" 
      style={{ 
        minHeight: '80vh', 
        overflow: 'hidden', 
        background: '#000000', // Deep Blue Base
        display: 'flex', 
        alignItems: 'center' 
      }}>
      
      {/* --- Background Video v3 with Blue Overlay --- */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          // Blue Gradient Overlay
          background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.8))', 
          zIndex: 1
        }}></div>

        <video 
          src="/assets/img/v3.mp4" 
          autoPlay 
          muted 
          loop 
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* --- Content --- */}
      <div className="container py-5 position-relative" style={{ zIndex: 2 }}>

        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-end mb-5">
          <div className="text-start">
            <span className="section-tag" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '5px 15px', borderRadius: '50px', fontWeight: 'bold' }}>
              What we do
            </span>
            <h2 className="display-4 fw-800 mt-3 mb-3 text-white">Strengthening Connections</h2>
            <p className="fs-411 text-white opacity-75 mb-0" style={{ fontSize: '16px' }}>
              One platform designed to simplify operations and connect every stakeholder.
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="d-flex gap-3 mb-2">
            <button onClick={() => scroll('left')} className="nav-btn-blue">←</button>
            <button onClick={() => scroll('right')} className="nav-btn-blue">→</button>
          </div>
        </div>

        {/* --- 4 Cards Slider --- */}
        <div className="custom-slider-row" ref={scrollRef}>
          {whatWeDo.map((item, i) => (
            <div className="col-lg-3 col-md-6 col-sm-10 flex-shrink-0 p-2" key={i}>
              <div className="wwd-card-blue">
                <div className="wwd-icon">{item.emoji}</div>
                <h4 className="fw-800 mt-4 text-white">{item.title}</h4>
                <p className="text-white-50 mt-2" style={{ fontSize: '16px' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .custom-slider-row {
          display: flex;
          overflow-x: auto;
          scroll-behavior: smooth;
          scrollbar-width: none;
          -ms-overflow-style: none;
          padding: 15px 0;
        }

        .custom-slider-row::-webkit-scrollbar {
          display: none;
        }

        .wwd-card-blue {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          border-radius: 28px;
          padding: 45px 30px;
          height: 100%;
          border: 1px solid rgba(255,255,255,0.15);
          transition: all 0.4s ease;
          text-align: center;
        }

        .wwd-card-blue:hover {
          transform: translateY(-12px);
          background: rgba(255, 255, 255, 0.18);
          border-color: #f97316; /* Orange highlight on hover */
        }

        .wwd-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto;
          border-radius: 50%;
          background: linear-gradient(135deg, #f46a12, #1f3e92);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          color: white;
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }

        .nav-btn-blue {
          width: 55px;
          height: 55px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.3);
          background: rgba(255,255,255,0.1);
          color: white;
          font-size: 1.3rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-btn-blue:hover {
          background: #fff;
          color: #001d3d;
          transform: scale(1.1);
        }

        @media (max-width: 991px) {
          .flex-shrink-0 { width: 50% !important; }
        }
        @media (max-width: 575px) {
          .flex-shrink-0 { width: 85% !important; }
        }
      `}</style>
    </section>

<section id="features" className="py-5 position-relative" style={{ background: "#0f172a", overflow: "hidden" }}>
  {/* Ambient Background Decoration matching Why Choose Us */}
  <div style={{ position: 'absolute', top: 0, right: 0, width: '30%', height: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', zIndex: 0 }}></div>
  
  <div className="container py-5 position-relative" style={{ zIndex: 1 }}>

    {/* Header */}
    <div className="text-center mb-5">
      <span className="badge rounded-pill px-3 py-2 mb-3" style={{ background: 'rgba(255,255,255,0.05)', color: '#60a5fa', border: '1px solid rgba(255,255,255,0.1)', fontWeight: '700', fontSize: '13px', letterSpacing: '1px' }}>
        WHAT WE OFFER
      </span>
      <h2 className="display-4 fw-800 mt-2 text-white" style={{ letterSpacing: '-1px' }}>Core Management Modules</h2>
      <p className="fs-411 text-light opacity-75 mt-3 mx-auto" style={{ maxWidth: '650px' }}>
        Powerful tools designed to manage every aspect of modern schooling.
      </p>
    </div>

    {/* Feature Cards Grid */}
    <div className="row g-5">
      {featureData.map((f, i) => (
        <div className="col-md-6 col-lg-4" key={i} style={{ marginTop: '100px' }}>
          <div className="modern-card-dark">
            
            {/* Top Image Frame */}
            <div className="img-frame-dark">
              <img src={f.image} alt={f.title} className="card-image" />
              <div className="image-overlay-dark"></div>
            </div>

            {/* Card Content */}
            <div className="card-body-custom p-4 pt-5">
              <h4 className="fw-800 text-white mb-3" style={{ fontSize: '22px' }}>{f.title}</h4>
              <p className="text-light opacity-75" style={{ fontSize: '15px', lineHeight: '1.7' }}>
                {f.desc}
              </p>
              
              {/* Card Line matching Why Choose Us */}
              <div className="card-line-sync"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>

  <style>{`
    .modern-card-dark {
      background: rgba(255, 110, 25, 0.03);
      backdrop-filter: blur(10px);
      border-radius: 40px;
      height: 100%;
      border: 1px solid rgba(255, 255, 255, 0.08);
      transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
      position: relative;
      display: flex;
      flex-direction: column;
    }

    .img-frame-dark {
      width: 88%;
      height: 230px;
      margin: -50px auto 0;
      border-radius: 30px;
      overflow: hidden;
      box-shadow: 0 25px 50px rgba(0,0,0,0.4);
      position: relative;
      z-index: 2;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .card-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.8s ease;
    }

    .image-overlay-dark {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(15, 23, 42, 0.6), transparent);
    }

    .card-line-sync {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0%;
      height: 4px;
      background: linear-gradient(90deg, #2563eb, #f97316);
      transition: width 0.4s ease;
      border-radius: 0 0 40px 40px;
    }

    /* Hover State */
    .modern-card-dark:hover {
      transform: translateY(-15px);
      background: rgba(255, 255, 255, 0.07);
      box-shadow: 0 40px 80px rgba(0,0,0,0.4);
      border-color: rgba(37, 99, 235, 0.4);
    }

    .modern-card-dark:hover .card-line-sync {
      width: 100%;
    }

    .modern-card-dark:hover .card-image {
      transform: scale(1.15);
    }

    .modern-card-dark:hover .img-frame-dark {
      transform: translateY(-10px);
      box-shadow: 0 30px 60px rgba(37, 99, 235, 0.3);
    }

    .fw-800 { font-weight: 800; }

    @media (max-width: 991px) {
      .modern-card-dark { margin-top: 40px; }
      .img-frame-dark { height: 200px; }
    }
  `}</style>
</section>


      

      {/* --- WHY CHOOSE US --- */}
      <section id="why-us" className="py-5 position-relative" style={{ background: "#1e3a8a", overflow: "hidden" }}>
  {/* Abstract Background Glows */}
  <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', zIndex: 0 }}></div>
  <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)', zIndex: 0 }}></div>

  <div className="container py-5 position-relative" style={{ zIndex: 1 }}>

    {/* Heading */}
    <div className="text-center mb-5 pb-3">
      <span className="section-tag" style={{ background: 'rgba(255,255,255,0.05)', color: '#60a5fa', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 20px', borderRadius: '50px', fontSize: '13px', fontWeight: '700', letterSpacing: '1px' }}>
        THE ADVANTAGE
      </span>
      <h2 className="display-4 fw-800 mt-3 text-white">Why Choose SchoolCaddie</h2>
      <p className="fs-5 text-light opacity-75 mt-3 mx-auto" style={{ maxWidth: '700px' }}>
        Built with purpose, designed for trust, and crafted for modern schools.
      </p>
    </div>

    {/* Advantage Cards */}
    <div className="row g-4 mb-5">
      {whyChooseData.map((w, i) => (
        <div className="col-md-4" key={i}>
          <div className="dark-adv-card">
            <div className="icon-badge-glow mb-4">
              <span className="fs-4">{i === 0 ? '🛡️' : i === 1 ? '⚡' : '🤝'}</span>
            </div>
            <h5 className="fw-800 mb-3 text-white" style={{ fontSize: '22px' }}>{w.title}</h5>
            <p className="text-light opacity-75 mb-0" style={{ fontSize: '16px', lineHeight: '1.7' }}>
              {w.desc}
            </p>
            <div className="card-line"></div>
          </div>
        </div>
      ))}
    </div>
  </div>

  <style>{`
    .dark-adv-card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      padding: 45px 35px;
      height: 100%;
      border-radius: 32px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      position: relative;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      overflow: hidden;
    }

    .icon-badge-glow {
      width: 60px;
      height: 60px;
      background: rgba(37, 99, 235, 0.1);
      border-radius: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(37, 99, 235, 0.2);
    }

    .card-line {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0%;
      height: 4px;
      background: linear-gradient(90deg, #2563eb, #f97316);
      transition: width 0.4s ease;
    }

    /* Hover Effects */
    .dark-adv-card:hover {
      background: rgba(255, 255, 255, 0.07);
      transform: translateY(-15px);
      border-color: rgba(37, 99, 235, 0.4);
      box-shadow: 0 30px 60px rgba(0,0,0,0.3);
    }

    .dark-adv-card:hover .card-line {
      width: 100%;
    }

    .dark-adv-card:hover .icon-badge-glow {
      background: #2563eb;
      transform: scale(1.1) rotate(5deg);
      box-shadow: 0 0 20px rgba(37, 99, 235, 0.4);
    }

    .fw-800 { font-weight: 800; }

    @media (max-width: 768px) {
      .display-4 { font-size: 2.5rem; }
    }
  `}</style>
</section>

 {/* --- STATISTICS SECTION --- */}
      <section className="py-5 fade-section" style={{ background: "#f8fafc" }}>
  <div className="container py-5">
    
    {/* Heading */}
    <div className="text-center mb-5">
      <span className="section-tag">Our Reach</span>
      <h2 className="display-4 fw-800 mt-2">Our Impact</h2>
      <p className="text-muted fs-41 mt-3">
        Numbers that reflect trust, growth, and transformation in education.
      </p>
    </div>

    {/* Cards */}
    <div className="row g-4">
      
      {/* Schools */}
      <div className="col-md-4">
        <div className="impact-card">
          <div className="impact-icon bg-primary">🏫</div>
          <h3 className="impact-number">
            {counters.schools}<span>+</span>
          </h3>
          <p className="impact-label">Schools Connected</p>
        </div>
      </div>

      {/* Students */}
      <div className="col-md-4">
        <div className="impact-card">
          <div className="impact-icon bg-success">🎓</div>
          <h3 className="impact-number">
            {counters.students.toLocaleString()}<span>+</span>
          </h3>
          <p className="impact-label">Students Enrolled</p>
        </div>
      </div>

      {/* Teachers */}
      <div className="col-md-4">
        <div className="impact-card">
          <div className="impact-icon bg-warning">👩‍🏫</div>
          <h3 className="impact-number">
            {counters.teachers}<span>+</span>
          </h3>
          <p className="impact-label">Teachers Empowered</p>
        </div>
      </div>

    </div>
  </div>

  {/* Styles */}
  <style>{`
    .impact-card {
      background: rgba(255,255,255,0.85);
      backdrop-filter: blur(12px);
      border-radius: 28px;
      padding: 50px 30px;
      text-align: center;
      height: 100%;
      border: 1px solid rgba(0,0,0,0.05);
      box-shadow: 0 20px 50px rgba(0,0,0,0.06);
      transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .impact-card::before {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(
        135deg,
        rgba(37,99,235,0.08),
        rgba(249,115,22,0.08)
      );
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .impact-card:hover::before {
      opacity: 1;
    }

    .impact-card:hover {
      transform: translateY(-15px) scale(1.02);
      box-shadow: 0 35px 70px rgba(37,99,235,0.15);
    }

    .impact-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 25px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      color: white;
      box-shadow: 0 12px 30px rgba(0,0,0,0.15);
    }

    .impact-number {
      font-size: 3.5rem;
      font-weight: 800;
      margin-bottom: 10px;
      background: linear-gradient(135deg, #2563eb, #f97316);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .impact-number span {
      font-size: 1.5rem;
      margin-left: 4px;
    }

    .impact-label {
      font-size: 1.1rem;
      font-weight: 600;
      color: #475569;
    }

    @media (max-width: 768px) {
      .impact-number {
        font-size: 2.8rem;
      }
    }
  `}</style>
</section>



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

{/* --- PREMIUM LOGIN POPUP --- */}
{showLoginPopup && (
  <div style={{
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
    padding: '20px'
  }} onClick={() => setShowLoginPopup(false)}>
    
    <div 
      className="fade-in"
      style={{
        background: 'white', borderRadius: '40px', width: '100%', maxWidth: '900px',
        padding: '50px', position: 'relative', boxShadow: '0 50px 100px rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.2)'
      }} 
      onClick={(e) => e.stopPropagation()}
    >
      {/* Close Button */}
      <button 
        onClick={() => setShowLoginPopup(false)}
        style={{
          position: 'absolute', top: '25px', right: '25px', border: 'none',
          background: '#f1f5f9', width: '45px', height: '45px', borderRadius: '50%',
          fontSize: '20px', cursor: 'pointer', transition: '0.3s'
        }}
      >✕</button>

      <div className="text-center mb-5">
        <h2 className="fw-800 display-6" style={{ color: '#0f172a' }}>Select Your Portal</h2>
        <p className="text-muted">Welcome back! Please select your account type to continue.</p>
      </div>

      <div className="row g-4">
        {loginOptions.map((opt, i) => (
          <div className="col-md-4" key={i}>
            <div 
              className="login-card-3d"
              onClick={() => {
                setShowLoginPopup(false);
                navigate(opt.path);
              }}
            >
              <div className="login-icon-wrap" style={{ backgroundColor: opt.color + '15', color: opt.color }}>
                {opt.icon}
              </div>
              <h5 className="fw-700 mb-2">{opt.title}</h5>
              <span className="badge rounded-pill" style={{ backgroundColor: opt.color + '20', color: opt.color, fontSize: '10px' }}>
                ACCESS PORTAL
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)}

<style>{`
  .login-card-3d {
    background: #ffffff;
    border: 2px solid #f1f5f9;
    border-radius: 30px;
    padding: 40px 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    overflow: hidden;
  }

  .login-card-3d:hover {
    transform: translateY(-12px);
    border-color: #2563eb;
    box-shadow: 0 25px 50px rgba(37, 99, 235, 0.1);
  }

  .login-icon-wrap {
    width: 80px;
    height: 80px;
    font-size: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    border-radius: 24px;
    transition: 0.3s;
  }

  .login-card-3d:hover .login-icon-wrap {
    transform: scale(1.1) rotate(5deg);
  }
`}</style>




      {/* --- FOOTER --- */}
      <footer className="footer-wrap fade-section">
  <div className="container py-5">
    <div className="row g-5 align-items-start">

      {/* BRAND */}
      <div className="col-lg-3 col-md-3">
        <h6 className="footer-title">Support</h6>
<div className="footer-contact-info">
  <p>📞 Contact: +91 XXXXX XXXXX</p>
  <p>✉️ Support: support@schoolcaddie.com</p>
</div>

       
        
      </div>

      {/* QUICK LINKS */}
      <div className="col-lg-3 col-md-3">
        <h6 className="footer-title">Social Media</h6>
          <div className="d-flex gap-3 mt-4">
  {/* Facebook */}
  <a className="social-btn" href="#" target="_blank" rel="noopener noreferrer">
    <img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" style={{ width: '22px', height: '22px' }} />
  </a>

  {/* Twitter (X) */}
  <a className="social-btn" href="#" target="_blank" rel="noopener noreferrer">
    <img src="https://cdn-icons-png.flaticon.com/512/5969/5969020.png" alt="Twitter X" style={{ width: '20px', height: '20px' }} />
  </a>

  {/* Instagram */}
  <a className="social-btn" href="#" target="_blank" rel="noopener noreferrer">
    <img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram" style={{ width: '22px', height: '22px' }} />
  </a>

  {/* LinkedIn */}
  <a className="social-btn" href="#" target="_blank" rel="noopener noreferrer">
    <img src="https://cdn-icons-png.flaticon.com/512/145/145807.png" alt="LinkedIn" style={{ width: '22px', height: '22px' }} />
  </a>
</div>
        </div>


       {/* QUICK LINKS */}
      {/* --- UPDATED FOOTER PLATFORM LINKS --- */}
<div className="col-lg-2 col-md-2">
  <h6 className="footer-title">Platform</h6>
  <ul className="footer-links">
    <li onClick={() => navigate("/admin-login")}>Admin Login</li>
    <li onClick={() => navigate("/student-parent-login")}>Student/Parents Login</li>
    <li onClick={() => navigate("/login")}>Teacher Login</li>
  </ul>
</div>

    

      <div className="col-lg-2 col-md-2">
  <h6 className="footer-title">Company</h6>
  <ul className="footer-links">
    <li><a href="#about">About</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#why-us">Why Us</a></li>
   
  </ul>
</div>


<div className="col-lg-2 col-md-2">
  <h6 className="footer-title">Subscription</h6>
  <ul className="footer-links">
     <li>
      <Link to="/pricing">
        Pricing <span className="badge rounded-pill ms-1" style={{ fontSize: '8px', background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)', color: 'white' }}>New</span>
      </Link>
    </li>
    <li><a href="#mission">Mission</a></li>
  </ul>
</div>

      
      
    </div>

    {/* Divider */}
    <div className="footer-divider my-5"></div>

    {/* Bottom */}
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

  {/* Styles */}
  <style>{`
    .footer-wrap {
      background: linear-gradient(135deg, #020617, #020617);
      color: white;
      border-top-left-radius: 120px;
      position: relative;
      overflow: hidden;
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

    .brand-accent {
      color: var(--brand-orange);
    }

    .footer-tagline {
      color: rgba(255,255,255,0.6);
      font-size: 1.05rem;
      max-width: 360px;
    }

    .footer-title {
      font-weight: 700;
      letter-spacing: 1px;
      margin-bottom: 18px;
      text-transform: uppercase;
      font-size: 0.85rem;
      color: rgba(255,255,255,0.9);
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-links li {
      margin-bottom: 12px;
      font-size: 0.95rem;
      color: rgba(255,255,255,0.6);
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .footer-links li:hover {
      color: #f97316;
      transform: translateX(6px);
    }

    .footer-links li a {
      margin-bottom: 12px;
      font-size: 0.95rem;
      color: rgba(255,255,255,0.6);
      cursor: pointer;
      transition: all 0.25s ease;
    }

    .footer-links li a:hover {
      color: #f97316;
      transform: translateX(6px);
    }

    .social-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.1);
      color: white;
      font-size: 1.1rem;
      transition: all 0.3s ease;
    }

    .social-btn:hover {
      background: #f97316;
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(249,115,22,0.4);
    }

    .footer-divider {
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255,255,255,0.15),
        transparent
      );
    }

    .footer-copy {
      color: rgba(255,255,255,0.4);
      font-size: 0.9rem;
      margin: 0;
    }

    .footer-policy span {
      color: rgba(255,255,255,0.5);
      font-size: 0.9rem;
      cursor: pointer;
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


    </div>
  );
};

// --- DATA ---
// ...existing code...
const whatWeDo = [
  {
    emoji: "🚀",
    title: "Simplify School Management",
    desc: "SchoolCaddie brings admissions, academics, attendance, grading, and reporting into one centralized platform — reducing paperwork and saving valuable administrative time."
  },
  {
    emoji: "💬",
    title: "Strengthen Parent–Teacher Communication",
    desc: "With dedicated parent and teacher portals, SchoolCaddie creates clear, secure, and consistent communication — keeping everyone aligned on student progress and well-being."
  },
  {
    emoji: "📊",
    title: "Track Academic & Student Progress",
    desc: "Monitor subject-wise academic performance, assignments, grades, and report cards with real-time insights that help schools support every learner effectively."
  },
  {
    emoji: "📖",
    title: "Support Hifz & Holistic Growth",
    desc: "Our built-in Hifz tracker allows Islamic schools to log Qur’an memorization by surah, juz, or ayah — supporting spiritual development alongside academic excellence."
  },
  {
    emoji: "👥",
    title: "Empower Educators & Administrators",
    desc: "Equip teachers and school leaders with intuitive tools that simplify daily tasks, reduce workload, and enable data-driven decision-making."
  },
  {
    emoji: "🔐",
    title: "Secure & Scalable for Growing Schools",
    desc: "SchoolCaddie is cloud-based, secure, and designed to scale — whether you manage one school or multiple campuses."
  }
];


const featureData = [
  {
    title: "📊 Admin Dashboard",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    desc: "Get a complete overview of your school in one centralized dashboard. Monitor attendance, academics, user activity, and performance insights in real time to make informed decisions quickly and efficiently."
  },
  {
  title: "👨‍🎓 Student Portal",
  // High-quality student using tablet/laptop for a portal feel
  image: "https://images.pexels.com/photos/4144101/pexels-photo-4144101.jpeg?auto=compress&cs=tinysrgb&w=800",
  desc: "Provide students with a personalized space to view their academic progress, assignments, attendance, grades, and Hifz updates — all in one easy-to-use portal."
},
  {
    title: "👩‍🏫 Teacher Portal",
    image: "https://i.ytimg.com/vi/adUKf9p_jJA/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAGLCcdiPHhz-HbFsQP60lROzAQMQ",
    desc: "Empower teachers with tools to manage classes, assign tasks, mark attendance, track progress, and communicate seamlessly with parents and administrators."
  },
  {
    title: "📝 Task Assignments",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80",
    desc: "Create, assign, and manage homework, classwork, and tasks digitally. Teachers can track submissions and provide feedback while students stay organized and accountable."
  },
  {
    title: "📅 Daily Attendance Logging",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=800&q=80",
    desc: "Record and monitor student attendance effortlessly on a daily basis. Attendance data is instantly accessible to admins and parents, improving transparency and accountability."
  },
  {
    title: "📚 Academics Management",
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
    desc: "Manage subjects, classes, timetables, and curriculum efficiently. SchoolCaddie keeps academic information structured and accessible for teachers, students, and parents."
  },
  {
  title: "🏫 Admissions Management",
  // Image showing a professional school admission/enrollment process
  image: "https://telecrm.in/blog/wp-content/uploads/2025/07/admission-management-software-5.png",
  desc: "Simplify the admissions process with digital applications, organized records, and streamlined workflows — saving time for school administrators and parents alike."
},
  {
  title: "🧮 Grading & Report Cards",
  // Image showing a student's grade tracking and structured academic reports
  image: "https://isminc-public-assets.s3.amazonaws.com/public/2019-03/article-page-desktop-1440x470-source-academic.png",
  desc: "Easily record grades and generate structured report cards. Parents receive clear insights into student performance, making progress tracking simple and transparent."
},
  {
    title: "📈 Student Progress Tracking",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    desc: "Track each student’s academic performance subject-wise with visual insights. Identify strengths, address gaps early, and support better learning outcomes."
  },
  {
    title: "📖 Quran Memorization Logging",
    // Image of a student or teacher with a Quran in a focused environment
    image: "https://images.pexels.com/photos/8164381/pexels-photo-8164381.jpeg?auto=compress&cs=tinysrgb&w=800",
    desc: "Allow teachers and students to log daily Quran memorization activities accurately, ensuring consistent tracking and accountability."
  },
  {
    title: "🕌 Hifz Tracker",
    // Image of a beautiful Mushaf (Quran) or Islamic learning setting
    image: "https://images.pexels.com/photos/8164742/pexels-photo-8164742.jpeg?auto=compress&cs=tinysrgb&w=800",
    desc: "A dedicated Hifz tracking module for Islamic schools to monitor memorization by surah, juz, or ayah — supporting both students and teachers in their Hifz journey."
  },
  {
    title: "👥 User Management",
    image: "https://www.loginradius.com/assets/blog/identity/what-is-user-management/user-mngmnt.webp",
    desc: "Manage students, teachers, parents, and administrators with role-based access. Ensure everyone sees exactly what they need — nothing more, nothing less."
  },
  {
  title: "💬 Parent–Teacher Communication",
  // Image showing a positive interaction between a teacher and a parent
  image: "https://verticalelevation.com/wp-content/uploads/2016/05/Talk-blue-768x528-1.png",
  desc: "Strengthen collaboration with direct, secure communication between parents and teachers. Share updates, progress, and concerns without relying on scattered messaging apps."
},
{
  "title": "📊 Data-Driven Insights",
  "image": "https://www.supplychainbrain.com/ext/resources/2023/07/11/DATA-ANALYSIS-iStock--NicoElNino--1425235289.webp?t=1689307461&width=1080",
  "desc": "Gain valuable insights into student progress and engagement through data visualizations and comprehensive graphs. Make informed decisions and track academic trends with ease."
},
  {
    title: "🔐 Secure Data Import",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
    desc: "Safely import existing school data with secure systems designed to protect sensitive information while ensuring a smooth onboarding experience."
  }
];



const whyChooseData = [
  {
    title: "One Platform, Every School",
    desc: "A complete LMS + SMS designed for both non-Islamic and Islamic schools, with flexible modules that adapt to your institution’s needs."
  },
  {
    title: "Built for Busy Parents",
    desc: "All essential updates — attendance, grades, progress, and messages — in one place, saving time and reducing daily follow-ups."
  },
  {
    title: "Strong Parent–Teacher Connection",
    desc: "Secure, direct communication keeps parents and teachers aligned, informed, and focused on student success."
  },
  {
    title: "Clear Student Progress Tracking",
    desc: "Track academic performance subject-wise with easy-to-understand insights that support timely intervention and growth."
  },
  {
    title: "Hifz Tracking Made Simple",
    desc: "A dedicated Hifz module to log Qur’an memorization by surah, juz, or ayah — supporting spiritual growth alongside academics."
  },
  {
    title: "Secure, Simple & Scalable",
    desc: "Cloud-based, user-friendly, and built to grow with your school — whether you manage one campus or many."
  }
];




export default Home;