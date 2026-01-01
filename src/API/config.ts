export const API_BASE_URL = 'http://localhost:3003';

export async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  // Debug logging
  console.log('🔍 API Request Debug:', {
    endpoint,
    url,
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : 'null',
    isClient: typeof window !== 'undefined'
  });

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  console.log('📤 Request Headers:', defaultHeaders);

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  });

  console.log('📥 Response Status:', response.status, response.statusText);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ API Error:', errorData);
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}
