const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/* =========================
   SAFE JSON PARSER
========================= */
function safeParseJson(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function parseResponse(response: Response) {
  const text = await response.text();
  return text ? safeParseJson(text) ?? text : null;
}

/* =========================
   TOKEN HANDLING
========================= */
function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

/* =========================
   FRIENDLY ERROR HANDLER
========================= */
function getFriendlyError(status: number, data: any) {
  const detail =
    typeof data?.detail === "string"
      ? data.detail
      : "Something went wrong";

  if (status === 401) {
    if (
      detail.toLowerCase().includes("invalid") ||
      detail.toLowerCase().includes("credentials") ||
      detail.toLowerCase().includes("incorrect")
    ) {
      return "Invalid credentials";
    }

    return "Your session has expired. Please log in again.";
  }

  if (status === 403) {
    if (detail.toLowerCase().includes("admin")) {
      return "Only admins can use this route.";
    }

    if (detail.toLowerCase().includes("merchant")) {
      return "Only merchants can use this route.";
    }

    if (
      detail.toLowerCase().includes("delivery") ||
      detail.toLowerCase().includes("driver")
    ) {
      return "Only delivery partners can use this route.";
    }

    if (detail.toLowerCase().includes("customer")) {
      return "Only customers can use this route.";
    }

    return "You do not have permission to perform this action.";
  }

  return detail;
}

/* =========================
   PUBLIC REQUEST
========================= */
export async function fetchPublic(
  endpoint: string,
  options: RequestInit = {}
) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    throw new Error(getFriendlyError(response.status, data));
  }

  return data;
}

/* =========================
   AUTH REQUEST
========================= */
export async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = getToken();

  if (!token) {
    throw new Error("Please log in to continue");
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const message = getFriendlyError(response.status, data);

    if (response.status === 401) {
      // 🔥 AUTO LOGOUT ON EXPIRED TOKEN
      localStorage.removeItem("access_token");
      localStorage.removeItem("role");
      localStorage.removeItem("partner_id");

      window.location.href = "/";
    }

    throw new Error(message);
  }

  return data;
}