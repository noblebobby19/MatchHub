import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Clock, Loader2, User, Phone, Mail, Receipt } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { toast } from 'sonner';

interface BookingDetail {
  _id: string;
  fieldId: {
    _id: string;
    name: string;
    location: string;
    fullAddress?: string;
    image?: string;
    phone?: string;
    email?: string;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  date: string;
  timeSlot: string;
  status: string;
  createdAt: string;
  notes?: string;
  amountValue?: number;
  totalPrice?: number;
}

export function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!user) {
        navigate('/dang-nhap');
        return;
      }

      if (!id) {
        setError('Không tìm thấy mã đơn đặt sân');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const data = await apiService.getBookingById(id);
        setBooking(data);
      } catch (error: any) {
        console.error('Failed to fetch booking:', error);
        setError(error.message || 'Không thể tải thông tin đơn đặt sân');
        toast.error('Không thể tải thông tin đơn đặt sân');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [id, user, navigate]);

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

  const formatDateTime = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' }> = {
      pending: { label: 'Chờ xác nhận', variant: 'default' },
      confirmed: { label: 'Đã xác nhận', variant: 'default' },
      completed: { label: 'Hoàn thành', variant: 'default' },
      cancelled: { label: 'Đã hủy', variant: 'destructive' }
    };

    const statusInfo = statusMap[status] || { label: status || 'N/A', variant: 'default' as const };
    return (
      <Badge variant={statusInfo.variant} className="capitalize text-sm px-3 py-1">
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

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8 px-4">
        <div className="container mx-auto max-w-2xl">
          <Button
            variant="ghost"
            onClick={() => navigate('/lich-su-dat-san')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <Card className="shadow-xl">
            <CardContent className="p-12 text-center">
              <p className="text-red-500 text-lg mb-4">{error || 'Không tìm thấy đơn đặt sân'}</p>
              <Button
                onClick={() => navigate('/lich-su-dat-san')}
                className="bg-green-600 hover:bg-green-700"
              >
                Quay lại lịch sử
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/lich-su-dat-san')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <Card className="shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Chi tiết đơn đặt sân</CardTitle>
                  <CardDescription className="mt-1">
                    Mã đơn: {booking._id}
                  </CardDescription>
                </div>
                {getStatusBadge(booking.status)}
              </div>
            </CardHeader>
          </Card>

          {/* Thông tin sân bóng */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Thông tin sân bóng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {booking.fieldId?.name || 'Sân bóng'}
                </h3>
                <p className="text-gray-600">
                  {booking.fieldId?.fullAddress || booking.fieldId?.location || 'N/A'}
                </p>
              </div>
              {booking.fieldId?.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{booking.fieldId.phone}</span>
                </div>
              )}
              {booking.fieldId?.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4" />
                  <span>{booking.fieldId.email}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Thông tin đặt sân */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Thông tin đặt sân
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ngày đặt</p>
                  <p className="font-semibold">{formatDate(booking.date)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Giờ đặt</p>
                  <p className="font-semibold">{booking.timeSlot}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ngày tạo đơn</p>
                  <p className="font-semibold">{formatDateTime(booking.createdAt)}</p>
                </div>
              </div>
              {booking.notes && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Ghi chú</p>
                  <p className="text-gray-700">{booking.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Thông tin khách hàng */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                Thông tin khách hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Họ và tên</p>
                <p className="font-semibold">{booking.userId?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-semibold">{booking.userId?.email || 'N/A'}</p>
              </div>
              {booking.userId?.phone && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                  <p className="font-semibold">{booking.userId.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tổng tiền */}
          <Card className="shadow-xl border-2 border-green-600">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="h-6 w-6 text-green-600" />
                  <span className="text-lg font-semibold">Tổng tiền</span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {(booking.amountValue || booking.totalPrice || 0).toLocaleString('vi-VN')}đ
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

