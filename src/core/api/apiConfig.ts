// Base URL of your Django backend
// export const API_BASE_URL = "http://localhost:8000/school/";

export const API_BASE_URL = "https://api.schoolcaddie.com/school/";

// Helper function to make GET/POST/etc requests easily
export const apiRequest = async (
  endpoint: string,
  method: string = "GET",
  body: any = null,
  token: string | null = null
): Promise<any> => {
  // ✅ Explicitly define header type as Record<string, string>
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "API request failed");
  }

  return response.json();
};
