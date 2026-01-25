import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Clock, Loader2, Eye } from 'lucide-react';
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
}

export function BookingHistoryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    fetchBookings();
  }, [user, navigate]);

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
      confirmed: { label: 'Đã xác nhận', className: 'bg-green-100 text-green-800 hover:bg-green-200' },
      completed: { label: 'Hoàn thành', className: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
      cancelled: { label: 'Đã hủy', className: 'bg-red-100 text-red-800 hover:bg-red-200' }
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
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking._id || Math.random()} className="border-l-4 border-l-green-600">
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
                              <span className="font-semibold text-green-600">
                                {(booking.amountValue || booking.totalPrice || 0).toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {booking._id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/chi-tiet-don-dat-san/${booking._id}`)}
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

