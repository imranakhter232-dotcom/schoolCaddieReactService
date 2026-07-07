import React, { useEffect, useState } from "react";
import axiosInstance from "../core/api/axiosInstance";
import Swal from "sweetalert2";

/**
 * Shows on first login for school admin (role 1) if profile is incomplete.
 * Uses PATCH school/profile/ — matches SchoolProfile model fields.
 */
const SchoolProfileSetupModal: React.FC = () => {
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    contact_phone: "",
    alternate_phone: "",
    website: "",
    established_year: "",
    address_line_1: "",
    city: "",
    state: "",
    zip_code: "",
    about_us: "",
  });

  useEffect(() => {
    const roleId = localStorage.getItem("role_id");
    if (roleId !== "1") return;

    const done = localStorage.getItem("profile_setup_done");
    if (done === "true") return;

    axiosInstance.get("school/profile/")
      .then((res) => {
        const d = res.data;
        // Consider complete if at least phone or address is filled
        const isComplete = d?.contact_phone || d?.address_line_1;
        if (isComplete) {
          localStorage.setItem("profile_setup_done", "true");
        } else {
          // Pre-fill whatever exists
          setForm({
            contact_phone: d?.contact_phone || "",
            alternate_phone: d?.alternate_phone || "",
            website: d?.website || "",
            established_year: d?.established_year ? String(d.established_year) : "",
            address_line_1: d?.address_line_1 || "",
            city: d?.city || "",
            state: d?.state || "",
            zip_code: d?.zip_code || "",
            about_us: d?.about_us || "",
          });
          setShow(true);
        }
      })
      .catch(() => setShow(true));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      if (logoFile) fd.append("logo", logoFile);
      await axiosInstance.patch("school/profile/", fd);
      localStorage.setItem("profile_setup_done", "true");
      setShow(false);
      Swal.fire({ icon: "success", title: "Profile Saved!", text: "Your school profile is set up.", timer: 1800, showConfirmButton: false });
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to save profile. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  const schoolInitial = (localStorage.getItem("school_name") || "S")[0].toUpperCase();

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.65)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem",
    }}>
      <div style={{
        background: "#fff", borderRadius: 16, width: "100%", maxWidth: 660,
        maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
      }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#4a6fa5,#6b8cce)", borderRadius: "16px 16px 0 0", padding: "22px 28px" }}>
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle bg-white d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 48, height: 48 }}>
              <i className="ti ti-building-school text-primary fs-4" />
            </div>
            <div className="text-white">
              <h4 className="mb-0 text-white">Complete Your School Profile</h4>
              <p className="mb-0 opacity-75 small">Add your contact and location details to get started</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4">
          {/* Logo */}
          <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded" style={{ background: "#f8f9fa" }}>
            <div className="flex-shrink-0">
              {logoPreview ? (
                <img src={logoPreview} className="rounded-circle border" style={{ width: 68, height: 68, objectFit: "cover" }} alt="logo" />
              ) : (
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                  style={{ width: 68, height: 68, fontSize: 22 }}>
                  {schoolInitial}
                </div>
              )}
            </div>
            <div>
              <p className="fw-semibold mb-1">{localStorage.getItem("school_name") || "Your School"}</p>
              <label className="btn btn-outline-primary btn-sm">
                <i className="ti ti-upload me-1" />Upload Logo
                <input type="file" accept="image/*" className="d-none" onChange={handleLogoChange} />
              </label>
              <p className="text-muted small mb-0 mt-1">JPG, PNG — max 4MB</p>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Contact Phone</label>
              <input type="text" name="contact_phone" className="form-control"
                value={form.contact_phone} onChange={handleChange} placeholder="+1 234 567 8900" />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Alternate Phone</label>
              <input type="text" name="alternate_phone" className="form-control"
                value={form.alternate_phone} onChange={handleChange} placeholder="Optional" />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Website</label>
              <input type="url" name="website" className="form-control"
                value={form.website} onChange={handleChange} placeholder="https://yourschool.com" />
            </div>
            <div className="col-md-6">
              <label className="form-label fw-semibold">Established Year</label>
              <input type="number" name="established_year" className="form-control"
                value={form.established_year} onChange={handleChange} placeholder="e.g. 2005" />
            </div>
            <div className="col-md-12">
              <label className="form-label fw-semibold">Address</label>
              <input type="text" name="address_line_1" className="form-control"
                value={form.address_line_1} onChange={handleChange} placeholder="123 School Street" />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">City</label>
              <input type="text" name="city" className="form-control"
                value={form.city} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">State</label>
              <input type="text" name="state" className="form-control"
                value={form.state} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label fw-semibold">Zip Code</label>
              <input type="text" name="zip_code" className="form-control"
                value={form.zip_code} onChange={handleChange} />
            </div>
            <div className="col-md-12">
              <label className="form-label fw-semibold">About Us</label>
              <textarea name="about_us" className="form-control" rows={2}
                value={form.about_us} onChange={handleChange}
                placeholder="Brief description of your school..." />
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
            <button type="button" className="btn btn-link text-muted p-0"
              onClick={() => { localStorage.setItem("profile_setup_done", "true"); setShow(false); }}>
              Skip for now
            </button>
            <button type="submit" className="btn btn-primary px-4" disabled={saving}>
              {saving
                ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                : <><i className="ti ti-check me-2" />Complete Setup</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SchoolProfileSetupModal;
