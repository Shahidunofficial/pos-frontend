'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/MainLayout';
import { ordersApi, type Order, type OrderStatus, type OrderProduct } from '@/API/orders';
import toast from 'react-hot-toast';

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editingShipping, setEditingShipping] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      console.log('Fetching order with ID:', params.id);
      const data = await ordersApi.getOrderById(params.id);
      console.log('Order fetched successfully:', data);
      setOrder(data);
      setShippingFee(data.shippingFee || 0);
    } catch (error) {
      console.error('Error fetching order:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch order';
      toast.error(errorMessage);
      // Keep order as null to show "Order not found" message
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    setUpdating(true);
    try {
      const updated = await ordersApi.updateOrderStatus(params.id, newStatus);
      setOrder(updated);
      toast.success('Order status updated');
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleShippingFeeUpdate = async () => {
    setUpdating(true);
    try {
      const updated = await ordersApi.updateShippingFee(params.id, shippingFee);
      setOrder(updated);
      setEditingShipping(false);
      toast.success('Shipping fee updated');
    } catch (error) {
      toast.error('Failed to update shipping fee');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
          <p className="text-gray-600 mb-6">
            The order you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <p className="text-sm text-gray-500 mb-4">Order ID: {params.id}</p>
          <button 
            onClick={() => router.push('/orders')} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Back to Orders
          </button>
        </div>
      </MainLayout>
    );
  }

  const itemsTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <>
      <MainLayout>
        <div className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <button onClick={() => router.push('/orders')} className="mb-4 text-blue-600 hover:text-blue-900 font-medium">
              ← Back to Orders
            </button>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Order #{order._id.slice(-8)}</h1>
                  <p className="text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Customer Information</h3>
                  <p className="text-gray-600">Name: {order.userId?.name || 'N/A'}</p>
                  <p className="text-gray-600">Email: {order.userId?.email || 'N/A'}</p>
                  <p className="text-gray-600 font-medium text-blue-600">Contact: {order.contactNumber || 'N/A'}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
                  <p className="text-gray-600">{order.shippingAddress.street}</p>
                  <p className="text-gray-600">
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                  </p>
                  <p className="text-gray-600">{order.shippingAddress.country}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-3">
                  {order.items.map((item, idx) => {
                    const product = typeof item.productId === 'object' && item.productId !== null
                      ? (item.productId as OrderProduct)
                      : null;
                    const productName = product?.name || (typeof item.productId === 'string' ? `Product #${item.productId.slice(-8)}` : 'Unknown Product');
                    return (
                      <div key={idx} className="flex items-center justify-between border-b pb-3 gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          {product?.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {productName}
                            </p>
                            {product?.brand && (
                              <p className="text-sm text-gray-500">{product.brand}</p>
                            )}
                            <p className="text-sm text-gray-600">
                              Qty: {item.quantity} × LKR {item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-gray-900 flex-shrink-0">LKR {(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Items Subtotal</span>
                    <span>LKR {itemsTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Shipping Fee</span>
                    {editingShipping ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={shippingFee}
                          onChange={(e) => setShippingFee(Number(e.target.value))}
                          className="w-24 px-2 py-1 border border-gray-300 rounded"
                        />
                        <button
                          onClick={handleShippingFeeUpdate}
                          disabled={updating}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingShipping(false);
                            setShippingFee(order.shippingFee || 0);
                          }}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">LKR {order.shippingFee?.toFixed(2) || '0.00'}</span>
                        <button
                          onClick={() => setEditingShipping(true)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>LKR {order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Update Status</h3>
                <div className="flex gap-2 flex-wrap">
                  {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(status as OrderStatus)}
                      disabled={updating || order.status === status}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        order.status === status
                          ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </>
  );
}

