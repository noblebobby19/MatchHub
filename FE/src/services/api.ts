const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint: string, options: RequestOptions = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;

    // Add auth token if available
    const token = localStorage.getItem('token');

    // Build headers object
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🔑 Adding Authorization header to request:', endpoint);
    } else {
      console.warn('⚠️ No token found for request to:', endpoint);
    }

    const config: RequestInit = {
      method: options.method || 'GET',
      headers,
      body: options.body,
    };

    console.log('📤 Request config:', {
      url,
      method: config.method,
      hasAuth: !!headers['Authorization'],
      body: options.body ? JSON.parse(options.body) : null
    });

    try {
      const response = await fetch(url, config);

      // Handle network errors
      if (!response.ok) {
        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        let errorData;

        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          const text = await response.text();
          errorData = { message: text || `HTTP ${response.status}: ${response.statusText}` };
        }

        // Handle specific error cases
        if (response.status === 401) {
          // For login endpoint, return invalid credentials message
          if (endpoint.includes('/auth/login')) {
            throw new Error('Tài khoản hoặc mật khẩu không đúng');
          }
          // Token invalid or missing for other endpoints
          if (!token) {
            throw new Error('Bạn cần đăng nhập để thực hiện thao tác này');
          } else {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
          }
        }

        throw new Error(errorData.message || `Lỗi: ${response.status} ${response.statusText}`);
      }

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        // If no content, return empty object
        data = text ? JSON.parse(text) : {};
      }

      return data;
    } catch (error: any) {
      // Handle network connection errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc đảm bảo server đang chạy.');
      }
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string, role?: string): Promise<any> {
    const body: any = { email, password };
    if (role) {
      body.role = role;
    }
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async register(name: string, email: string, password: string, role?: string, address?: string): Promise<any> {
    const body: any = { name, email, password };
    if (role) {
      body.role = role;
    }
    if (address) {
      body.address = address;
    }
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // Fields endpoints
  async getFields(filters: Record<string, any> = {}): Promise<any[]> {
    const queryParams = new URLSearchParams(filters).toString();
    return this.request(`/fields?${queryParams}`);
  }

  async getFieldById(id: string): Promise<any> {
    return this.request(`/fields/${id}`);
  }

  async getMyFields(): Promise<any[]> {
    return this.request('/fields/my');
  }

  async createField(fieldData: any): Promise<any> {
    return this.request('/fields', {
      method: 'POST',
      body: JSON.stringify(fieldData),
    });
  }

  async updateField(id: string, fieldData: any): Promise<any> {
    return this.request(`/fields/${id}`, {
      method: 'PUT',
      body: JSON.stringify(fieldData),
    });
  }

  async deleteField(id: string): Promise<any> {
    return this.request(`/fields/${id}`, {
      method: 'DELETE',
    });
  }

  async uploadImage(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem('token');
    const url = `${this.baseURL}/upload/image`;

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      let errorData;

      if (contentType && contentType.includes('application/json')) {
        errorData = await response.json();
      } else {
        const text = await response.text();
        errorData = { message: text || `HTTP ${response.status}: ${response.statusText}` };
      }

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại');
      }

      throw new Error(errorData.message || `Lỗi: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  // Bookings endpoints
  async createBooking(bookingData: any): Promise<any> {
    return this.request('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  }

  async getBookings(): Promise<any[]> {
    return this.request('/bookings');
  }

  async getBookingById(id: string): Promise<any> {
    return this.request(`/bookings/${id}`);
  }

  async checkAvailability(fieldId: string, date: string): Promise<any[]> {
    return this.request(`/bookings/availability?fieldId=${fieldId}&date=${date}`);
  }

  // Profile endpoints
  async getProfile(): Promise<any> {
    return this.request('/auth/profile');
  }

  async updateProfile(profileData: any): Promise<any> {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }
}

export default new ApiService();

