import { API_BASE_URL } from './config';

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

export interface Order {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email?: string;
  };
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  shippingFee: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contactNumber: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export const ordersApi = {
  getAllOrders: async (): Promise<Order[]> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/orders/admin/all`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    return response.json();
  },

  getOrderById: async (id: string): Promise<Order> => {
    const token = getAuthToken();
    console.log('Getting order by ID:', id, 'Token exists:', !!token);
    
    const response = await fetch(`${API_BASE_URL}/orders/admin/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(errorData.message || `Failed to fetch order (${response.status})`);
    }
    return response.json();
  },

  updateOrderStatus: async (id: string, status: OrderStatus): Promise<Order> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error('Failed to update order status');
    }
    return response.json();
  },

  updateShippingFee: async (id: string, shippingFee: number): Promise<Order> => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/orders/${id}/shipping-fee`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ shippingFee }),
    });
    if (!response.ok) {
      throw new Error('Failed to update shipping fee');
    }
    return response.json();
  },
};

