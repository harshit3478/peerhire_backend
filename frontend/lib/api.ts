import { toast } from "@/components/ui/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

interface ApiOptions {
  method?: string
  body?: any
  token?: string
}

export async function apiRequest(endpoint: string, options: ApiOptions = {}) {
  const { method = "GET", body, token } = options

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong")
    }

    return data
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    })
    throw error
  }
}

// Auth API
export const authAPI = {
  register: (userData: any) => apiRequest("/auth/register", { method: "POST", body: userData }),
  login: (credentials: any) => apiRequest("/auth/login", { method: "POST", body: credentials }),
}

// Jobs API
export const jobsAPI = {
  getJobs: (token: string, skills?: string[]) => {
    const query = skills && skills.length > 0 ? `?skills=${skills.join(",")}` : ""
    return apiRequest(`/jobs${query}`, { token })
  },
  getJob: (token: string, jobId: string) => apiRequest(`/jobs/${jobId}`, { token }),
  createJob: (token: string, jobData: any) =>
    apiRequest("/jobs/create", {
      method: "POST",
      body: jobData,
      token,
    }),
}

// Bids API
export const bidsAPI = {
  getBids: (token: string, jobId: string) => apiRequest(`/bids/${jobId}`, { token }),
  createBid: (token: string, jobId: string, bidData: any) =>
    apiRequest(`/bids/${jobId}`, {
      method: "POST",
      body: bidData,
      token,
    }),
  acceptBid: (token: string, bidId: string) =>
    apiRequest(`/bids/${bidId}/accept`, {
      method: "PATCH",
      token,
    }),
  rejectBid: (token: string, bidId: string) =>
    apiRequest(`/bids/${bidId}/reject`, {
      method: "PATCH",
      token,
    }),
}

