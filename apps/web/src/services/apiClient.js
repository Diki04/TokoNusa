/**
 * TokoNusa Unified API Client
 * Handles base URL, auth token injection, normalized JSON parsing, and unified error handling.
 */

const BASE_URL = typeof window !== 'undefined' && window.__VITE_API_BASE_URL__
  ? window.__VITE_API_BASE_URL__
  : (import.meta.env?.VITE_API_BASE_URL || '/api');

export class ApiError extends Error {
  constructor(message, status = 500, code = 'API_ERROR', details = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

class ApiClient {
  constructor(baseUrl = BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.token = null;
    this.unauthorizedHandlers = new Set();

    if (typeof window !== 'undefined' && window.localStorage) {
      this.token = window.localStorage.getItem('tokonusa_token');
    }
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== 'undefined' && window.localStorage) {
      if (token) {
        window.localStorage.setItem('tokonusa_token', token);
      } else {
        window.localStorage.removeItem('tokonusa_token');
      }
    }
  }

  getToken() {
    if (!this.token && typeof window !== 'undefined' && window.localStorage) {
      this.token = window.localStorage.getItem('tokonusa_token');
    }
    return this.token;
  }

  clearToken() {
    this.setToken(null);
  }

  onUnauthorized(handler) {
    this.unauthorizedHandlers.add(handler);
    return () => this.unauthorizedHandlers.delete(handler);
  }

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers = {
      'Accept': 'application/json',
      ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);

      let payload = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        payload = await response.json();
      } else {
        payload = { text: await response.text() };
      }

      if (!response.ok) {
        if (response.status === 401) {
          this.unauthorizedHandlers.forEach((handler) => handler());
        }

        const errorMessage = payload?.error?.message || payload?.message || `HTTP error ${response.status}`;
        const errorCode = payload?.error?.code || 'REQUEST_FAILED';
        const errorDetails = payload?.error?.details || payload?.details || null;

        throw new ApiError(errorMessage, response.status, errorCode, errorDetails);
      }

      // Return unpacked data or whole payload
      return payload?.data !== undefined ? payload.data : payload;
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError(err.message || 'Network error occurred', 0, 'NETWORK_ERROR');
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // Pre-configured resource methods for seamless integration
  auth = {
    login: (credentials) => this.post('/auth/login', credentials),
    register: (userData) => this.post('/auth/register', userData),
    getProfile: () => this.get('/auth/profile'),
  };

  catalog = {
    getProducts: (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.set(key, val);
        }
      });
      const qStr = query.toString();
      return this.get(`/catalog/products${qStr ? `?${qStr}` : ''}`);
    },
    getProductDetail: (idOrSlug) => this.get(`/catalog/products/${idOrSlug}`),
    getCategories: () => this.get('/catalog/categories'),
    createProduct: (productData) => this.post('/catalog/products', productData),
    addReview: (productId, reviewData) => this.post(`/catalog/products/${productId}/reviews`, reviewData),
  };

  cart = {
    getCart: () => this.get('/cart'),
    addItem: (item) => this.post('/cart/items', item),
    updateQuantity: (itemId, quantity) => this.put(`/cart/items/${itemId}`, { quantity }),
    removeItem: (itemId) => this.delete(`/cart/items/${itemId}`),
    toggleSelect: (itemId, isSelected) => this.put(`/cart/items/${itemId}/select`, { isSelected }),
  };

  orders = {
    create: (orderData) => this.post('/orders', orderData),
    getMyOrders: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return this.get(`/orders${query ? `?${query}` : ''}`);
    },
    getDetail: (orderId) => this.get(`/orders/${orderId}`),
    pay: (orderId, paymentData = {}) => this.post(`/orders/${orderId}/pay`, paymentData),
  };
}

export const apiClient = new ApiClient();
export default apiClient;
