import { useEffect, useState } from "react";
import axiosInstance from "../core/api/axiosInstance";
import { mediaUrl } from "../core/api/mediaUrl";

/**
 * Compact school profile banner — shown on teacher & student dashboards.
 * Fetches GET school/profile/ once and caches in module-level variable.
 */
let _cached: any = null;

const SchoolProfileCard = () => {
  const [profile, setProfile] = useState<any>(_cached);

  useEffect(() => {
    if (_cached) return;
    axiosInstance.get("school/info/")
      .then((res) => {
        _cached = res.data;
        setProfile(res.data);
      })
      .catch(() => {});
  }, []);

  if (!profile) return null;

  const schoolName = localStorage.getItem("school_name") || "";
  const initial = (schoolName || "S")[0].toUpperCase();
  const address = [profile.address_line_1, profile.city, profile.state]
    .filter(Boolean).join(", ");

  return (
    <div className="card mb-4 border-0 shadow-sm overflow-hidden">
      {/* Gradient top strip */}
      <div style={{ height: 6, background: "linear-gradient(90deg,#4a6fa5,#6b8cce,#a8c0e8)" }} />
      <div className="card-body py-3">
        <div className="d-flex align-items-center gap-3 flex-wrap">
          {/* Logo / Initial */}
          <div className="flex-shrink-0">
            {profile.logo ? (
              <img
                src={mediaUrl(profile.logo)}
                alt="school logo"
                className="rounded-circle border"
                style={{ width: 52, height: 52, objectFit: "cover" }}
              />
            ) : (
              <div
                className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold"
                style={{ width: 52, height: 52, fontSize: 20 }}
              >
                {initial}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-grow-1 min-w-0">
            <h5 className="mb-0 text-truncate">{schoolName}</h5>
            <div className="d-flex flex-wrap gap-3 mt-1">
              {address && (
                <span className="text-muted small">
                  <i className="ti ti-map-pin me-1" />{address}
                </span>
              )}
              {profile.contact_phone && (
                <span className="text-muted small">
                  <i className="ti ti-phone me-1" />{profile.contact_phone}
                </span>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary small"
                >
                  <i className="ti ti-world me-1" />{profile.website.replace(/^https?:\/\//, "")}
                </a>
              )}
              {profile.established_year && (
                <span className="text-muted small">
                  <i className="ti ti-calendar me-1" />Est. {profile.established_year}
                </span>
              )}
            </div>
          </div>

          {/* About badge */}
          {profile.about_us && (
            <div className="d-none d-md-block flex-shrink-0" style={{ maxWidth: 220 }}>
              <p className="text-muted small mb-0 text-truncate" title={profile.about_us}>
                <i className="ti ti-info-circle me-1" />{profile.about_us}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchoolProfileCard;
