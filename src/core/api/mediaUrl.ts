import { API_BASE_URL } from "./axiosInstance";

// Django serves media files from the root, not under /school/
// API_BASE_URL = "http://127.0.0.1:8000/school/" → media root = "http://127.0.0.1:8000/"
const MEDIA_BASE = API_BASE_URL.replace(/\/school\/?$/, "/");

/**
 * Converts a relative media path from the DB (e.g. "students/documents/file.pdf")
 * into a full URL (e.g. "http://127.0.0.1:8000/students/documents/file.pdf").
 *
 * Django MEDIA_ROOT = BASE_DIR (no /media/ subfolder), MEDIA_URL = "/"
 * so files are served directly from the root.
 *
 * If the value is already a full URL (starts with http), it is returned as-is.
 */
export function mediaUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // Remove leading slash if present
  const clean = path.replace(/^\/+/, "");
  return `${MEDIA_BASE}${clean}`;
}
