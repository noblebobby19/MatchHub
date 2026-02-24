import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Loader2, Eye, Ban } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { toast } from 'sonner';

interface Booking {
  _id: string;
  fieldId: {
    _id: string;
    name: string;
    location: string;
    image?: string;
  };
  date: string;
  timeSlot: string;
  status: string;
  createdAt: string;
  amountValue?: number;
  totalPrice?: number;
  paymentMethod?: string;
}

export function BookingHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isCancelling, setIsCancelling] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!user) {
      navigate('/dang-nhap');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Failed to fetch bookings:', error);
      setError(error.message || 'Không thể tải lịch sử đặt sân');
      toast.error('Không thể tải lịch sử đặt sân');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user, navigate]);

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn đặt sân này?')) return;

    setIsCancelling(id);
    try {
      await apiService.cancelBooking(id);
      toast.success('Hủy đơn đặt sân thành công');
      await fetchBookings();
    } catch (error: any) {
      toast.error(error.message || 'Không thể hủy đơn đặt sân');
    } finally {
      setIsCancelling(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeSlot: string) => {
    return timeSlot;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
      PENDING: { label: 'Chờ xác nhận', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
      confirmed: { label: 'Đã xác nhận', className: 'bg-green-100 text-green-800 hover:bg-green-200' },
      CONFIRMED: { label: 'Đã xác nhận', className: 'bg-green-100 text-green-800 hover:bg-green-200' },
      completed: { label: 'Hoàn thành', className: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
      cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-800 hover:bg-red-200' },
      CANCELLED: { label: 'Đã hủy', className: 'bg-red-100 text-red-800 hover:bg-red-200' },
      REFUND_PENDING: { label: 'Chờ hoàn tiền', className: 'bg-orange-100 text-orange-800 hover:bg-orange-200' },
      REFUNDED: { label: 'Đã hoàn tiền', className: 'bg-purple-100 text-purple-800 hover:bg-purple-200' },
    };

    const statusInfo = statusMap[status] || { label: status || 'N/A', className: 'bg-gray-100 text-gray-800' };
    return (
      <Badge variant="outline" className={`capitalize border-0 ${statusInfo.className}`}>
        {statusInfo.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Lịch sử đặt sân</CardTitle>
            <CardDescription>Xem tất cả các đặt sân của bạn</CardDescription>
          </CardHeader>

          <CardContent>
            {error ? (
              <div className="text-center py-12">
                <p className="text-red-500 text-lg mb-4">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Thử lại
                </Button>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Chưa có lịch sử đặt sân</p>
                <Button
                  onClick={() => navigate('/tim-san')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Đặt sân ngay
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Logic phân trang */}
                {(() => {
                  const totalPages = Math.ceil(bookings.length / itemsPerPage);
                  const currentBookings = bookings.slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  );

                  return (
                    <>
                      <div className="space-y-4">
                        {currentBookings.map((booking) => (
                          <Card key={booking._id || Math.random()} className="border-l-4 border-l-green-600 hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="flex-1 space-y-3">
                                  <div className="flex items-start justify-between">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                      {booking.fieldId?.name || 'Sân bóng'}
                                    </h3>
                                    {getStatusBadge(booking.status || 'pending')}
                                  </div>

                                  <div className="space-y-2 text-sm text-gray-600">

                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-green-600" />
                                      <span>{formatDate(booking.date || '')}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <Clock className="h-4 w-4 text-green-600" />
                                      <span>
                                        {formatTime(booking.timeSlot || '')}
                                      </span>
                                    </div>

                                    <div className="pt-2">
                                      <span className="font-semibold text-green-600 text-base">
                                        {(booking.amountValue || booking.totalPrice || 0).toLocaleString('vi-VN')}đ
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex gap-2 flex-wrap md:flex-nowrap">
                                  {['pending', 'confirmed', 'PENDING', 'CONFIRMED'].includes(booking.status) && booking.paymentMethod === 'banking' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleCancelBooking(booking._id)}
                                      disabled={isCancelling === booking._id}
                                      className="text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                      {isCancelling === booking._id ? (
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                      ) : (
                                        <Ban className="h-4 w-4 mr-2" />
                                      )}
                                      Hủy đơn
                                    </Button>
                                  )}
                                  {booking._id && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => navigate(`/chi-tiet-don-dat-san/${booking._id}`)}
                                      className="border-green-200 hover:bg-green-50 text-green-700 hover:text-green-800"
                                    >
                                      <Eye className="h-4 w-4 mr-2" />
                                      Xem chi tiết
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {/* Phân trang căn giữa */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center pt-6 border-t mt-6">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCurrentPage(p => Math.max(1, p - 1));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              disabled={currentPage === 1}
                              className="px-4"
                            >
                              Trước
                            </Button>
                            <div className="flex gap-1 items-center">
                              {[...Array(totalPages)].map((_, i) => (
                                <Button
                                  key={i}
                                  variant={currentPage === i + 1 ? "default" : "outline"}
                                  size="sm"
                                  className={`w-9 h-9 p-0 ${currentPage === i + 1 ? "bg-green-600 hover:bg-green-700" : ""}`}
                                  onClick={() => {
                                    setCurrentPage(i + 1);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                  }}
                                >
                                  {i + 1}
                                </Button>
                              ))}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCurrentPage(p => Math.min(totalPages, p + 1));
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              disabled={currentPage === totalPages}
                              className="px-4"
                            >
                              Sau
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

