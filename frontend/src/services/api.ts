import {
  mockOwnerUser,
  mockBusiness,
  initialServices,
  initialAvailability,
  initialBookings,
  initialReviews,
  initialAnalytics,
} from './mockData';
import type {
  User,
  Business,
  Service,
  AvailabilitySettings,
  Booking,
  Review,
  AnalyticsSummary,
  BookingStatus,
} from '../types';

const STORAGE_KEYS = {
  USER: 'sb_user',
  TOKEN: 'sb_access_token',
  REFRESH_TOKEN: 'sb_refresh_token',
  BUSINESS: 'sb_business',
  SERVICES: 'sb_services',
  AVAILABILITY: 'sb_availability',
  BOOKINGS: 'sb_bookings',
  REVIEWS: 'sb_reviews',
  USE_MOCK: 'sb_use_mock',
  API_URL: 'sb_api_url',
};

// Initialize localStorage with mock defaults if empty
function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockOwnerUser));
    localStorage.setItem(STORAGE_KEYS.TOKEN, 'mock_jwt_access_token_owner_apex');
  }
  if (!localStorage.getItem(STORAGE_KEYS.BUSINESS)) {
    localStorage.setItem(STORAGE_KEYS.BUSINESS, JSON.stringify(mockBusiness));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(initialServices));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AVAILABILITY)) {
    localStorage.setItem(STORAGE_KEYS.AVAILABILITY, JSON.stringify(initialAvailability));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(initialBookings));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(initialReviews));
  }
  if (localStorage.getItem(STORAGE_KEYS.USE_MOCK) === null) {
    localStorage.setItem(STORAGE_KEYS.USE_MOCK, 'true');
  }
  if (!localStorage.getItem(STORAGE_KEYS.API_URL)) {
    localStorage.setItem(STORAGE_KEYS.API_URL, import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api');
  }
}

initializeStorage();

export const isMockMode = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.USE_MOCK) !== 'false';
};

export const setMockMode = (enabled: boolean) => {
  localStorage.setItem(STORAGE_KEYS.USE_MOCK, enabled ? 'true' : 'false');
};

export const getApiUrl = (): string => {
  return localStorage.getItem(STORAGE_KEYS.API_URL) || 'http://127.0.0.1:8000/api';
};

export const setApiUrl = (url: string) => {
  localStorage.setItem(STORAGE_KEYS.API_URL, url);
};

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

// ========================
// Real Backend API Client
// ========================
export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const baseUrl = getApiUrl();
  const url = `${baseUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
}

// ========================
// Data Access Layer
// ========================
export const api = {
  // Auth
  async login(email: string): Promise<{ user: User; token: string; business: Business }> {
    if (isMockMode()) {
      await delay(250);
      const user = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || JSON.stringify(mockOwnerUser));
      const business = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUSINESS) || JSON.stringify(mockBusiness));
      user.email = email || user.email;
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.TOKEN, 'mock_jwt_access_token_' + Date.now());
      return { user, token: 'mock_jwt_token', business };
    }
    return request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async register(data: { email: string; first_name: string; last_name: string; business_name: string; category: string }): Promise<{ user: User; token: string; business: Business }> {
    if (isMockMode()) {
      await delay(300);
      const newUser: User = {
        id: `usr_${Date.now()}`,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        role: 'business_owner',
      };
      const newBusiness: Business = {
        id: `biz_${Date.now()}`,
        owner_id: newUser.id,
        name: data.business_name,
        slug: data.business_name.toLowerCase().replace(/\s+/g, '-'),
        category: data.category,
        description: `Welcome to ${data.business_name}!`,
        phone: '+1 (555) 000-0000',
        email: data.email,
        address: '100 Main Street',
        city: 'Austin',
        state: 'TX',
        postal_code: '78701',
        rating: 5.0,
        review_count: 0,
        is_active: true,
        created_at: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(newUser));
      localStorage.setItem(STORAGE_KEYS.BUSINESS, JSON.stringify(newBusiness));
      localStorage.setItem(STORAGE_KEYS.TOKEN, 'mock_jwt_token_' + Date.now());
      return { user: newUser, token: 'mock_jwt_token', business: newBusiness };
    }
    return request('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getCurrentUser(): { user: User | null; business: Business | null; token: string | null } {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    const bizStr = localStorage.getItem(STORAGE_KEYS.BUSINESS);
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    return {
      user: userStr ? JSON.parse(userStr) : null,
      business: bizStr ? JSON.parse(bizStr) : null,
      token,
    };
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  // Business
  async getBusiness(): Promise<Business> {
    if (isMockMode()) {
      await delay(150);
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.BUSINESS) || JSON.stringify(mockBusiness));
    }
    return request('/business/profile/');
  },

  async updateBusiness(data: Partial<Business>): Promise<Business> {
    if (isMockMode()) {
      await delay(200);
      const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.BUSINESS) || JSON.stringify(mockBusiness));
      const updated = { ...current, ...data };
      localStorage.setItem(STORAGE_KEYS.BUSINESS, JSON.stringify(updated));
      return updated;
    }
    return request('/business/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Services
  async getServices(): Promise<Service[]> {
    if (isMockMode()) {
      await delay(150);
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICES) || '[]');
    }
    return request('/services/');
  },

  async createService(data: Omit<Service, 'id' | 'business_id' | 'created_at'>): Promise<Service> {
    if (isMockMode()) {
      await delay(200);
      const services: Service[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICES) || '[]');
      const newService: Service = {
        ...data,
        id: `srv_${Date.now()}`,
        business_id: 'biz_apex_01',
        created_at: new Date().toISOString(),
      };
      services.unshift(newService);
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
      return newService;
    }
    return request('/services/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateService(id: string, data: Partial<Service>): Promise<Service> {
    if (isMockMode()) {
      await delay(200);
      const services: Service[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICES) || '[]');
      const index = services.findIndex((s) => s.id === id);
      if (index === -1) throw new Error('Service not found');
      services[index] = { ...services[index], ...data };
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
      return services[index];
    }
    return request(`/services/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteService(id: string): Promise<void> {
    if (isMockMode()) {
      await delay(200);
      const services: Service[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICES) || '[]');
      const filtered = services.filter((s) => s.id !== id);
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(filtered));
      return;
    }
    return request(`/services/${id}/`, {
      method: 'DELETE',
    });
  },

  // Availability
  async getAvailability(): Promise<AvailabilitySettings> {
    if (isMockMode()) {
      await delay(150);
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.AVAILABILITY) || JSON.stringify(initialAvailability));
    }
    return request('/availability/');
  },

  async updateAvailability(settings: AvailabilitySettings): Promise<AvailabilitySettings> {
    if (isMockMode()) {
      await delay(250);
      localStorage.setItem(STORAGE_KEYS.AVAILABILITY, JSON.stringify(settings));
      return settings;
    }
    return request('/availability/', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  // Bookings
  async getBookings(): Promise<Booking[]> {
    if (isMockMode()) {
      await delay(150);
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
    }
    return request('/bookings/');
  },

  async updateBookingStatus(id: string, status: BookingStatus, reason?: string): Promise<Booking> {
    if (isMockMode()) {
      await delay(200);
      const bookings: Booking[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
      const index = bookings.findIndex((b) => b.id === id);
      if (index === -1) throw new Error('Booking not found');
      bookings[index].status = status;
      if (reason) bookings[index].cancellation_reason = reason;
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
      return bookings[index];
    }
    return request(`/bookings/${id}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status, cancellation_reason: reason }),
    });
  },

  // Reviews
  async getReviews(): Promise<Review[]> {
    if (isMockMode()) {
      await delay(150);
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
    }
    return request('/reviews/');
  },

  async replyToReview(id: string, reply: string): Promise<Review> {
    if (isMockMode()) {
      await delay(200);
      const reviews: Review[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.REVIEWS) || '[]');
      const index = reviews.findIndex((r) => r.id === id);
      if (index === -1) throw new Error('Review not found');
      reviews[index].reply = reply;
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
      return reviews[index];
    }
    return request(`/reviews/${id}/reply/`, {
      method: 'POST',
      body: JSON.stringify({ reply }),
    });
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsSummary> {
    if (isMockMode()) {
      await delay(200);
      const bookings: Booking[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.BOOKINGS) || '[]');
      const completed = bookings.filter((b) => b.status === 'completed');
      const pending = bookings.filter((b) => b.status === 'pending');
      const confirmed = bookings.filter((b) => b.status === 'confirmed');
      const cancelled = bookings.filter((b) => b.status === 'cancelled');

      const totalRevenue = completed.reduce((sum, b) => sum + (b.total_price || 0), 0) +
        confirmed.reduce((sum, b) => sum + (b.total_price || 0), 0) + 2400;

      return {
        ...initialAnalytics,
        total_revenue: totalRevenue,
        pending_bookings: pending.length,
        total_bookings: bookings.length + 75,
        status_distribution: [
          { status: 'confirmed', count: confirmed.length + 40 },
          { status: 'completed', count: completed.length + 26 },
          { status: 'pending', count: pending.length },
          { status: 'cancelled', count: cancelled.length },
        ],
      };
    }
    return request('/analytics/summary/');
  },

  // Reset to initial mock data
  resetMockData() {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockOwnerUser));
    localStorage.setItem(STORAGE_KEYS.BUSINESS, JSON.stringify(mockBusiness));
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(initialServices));
    localStorage.setItem(STORAGE_KEYS.AVAILABILITY, JSON.stringify(initialAvailability));
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(initialBookings));
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(initialReviews));
  },
};
