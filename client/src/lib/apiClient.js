const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export class ApiRequestError extends Error {
  constructor(status, message, body) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.body = body;
  }
}

export async function apiRequest(path, { headers, body, ...options } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = data?.error?.message ?? `Request failed with status ${response.status}`;
    throw new ApiRequestError(response.status, message, data);
  }

  return data;
}
