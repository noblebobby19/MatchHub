import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  DollarSign,
  Settings,
  LogOut,
  Plus,
  Search,
  MoreVertical,
  Users,
  MapPin,
  Edit,
  Loader2,
  Ban,
  CheckCircle,
  Home,
  Banknote,
  CheckCircle2
} from 'lucide-react';
import { WeeklyScheduler } from '../components/scheduler/WeeklyScheduler';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";

interface Field {
  _id: string;
  name: string;
  size: string;
  status: string;
  available: boolean;
  location?: string;
  fullAddress?: string;
}

interface Booking {
  _id: string;
  fieldId: {
    _id: string;
    name: string;
    location: string;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  fieldName: string;
  customer: string;
  date: string;
  time: string;
  timeSlot: string;
  status: string;
  amountValue?: number;
  depositAmount?: number;
  bookingCode?: string;
  paymentMethod?: string;
  expireAt?: string;
  amount: string;
  createdAt: string;
}

export function OwnerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'fields' | 'bookings' | 'banking' | 'settings'>('overview');
  const [fields, setFields] = useState<Field[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !['owner', 'admin'].includes(user.role)) {
        navigate('/');
        return;
      }

      setIsLoading(true);
      try {
        console.log('🔍 Fetching data for user:', user?.role, user?.email);
        const [fieldsData, bookingsData, profileData] = await Promise.all([
          apiService.getMyFields(),
          apiService.getBookings(),
          apiService.getProfile()
        ]);
        console.log('✅ Fields data received:', Array.isArray(fieldsData) ? fieldsData.length : 'not array', fieldsData);
        console.log('✅ Bookings data received:', Array.isArray(bookingsData) ? bookingsData.length : 'not array', bookingsData);
        console.log('✅ Profile data:', profileData);

        // Đảm bảo fields và bookings là array
        const fieldsArray = Array.isArray(fieldsData) ? fieldsData : [];
        const bookingsArray = Array.isArray(bookingsData) ? bookingsData : [];

        console.log(`📊 Setting ${fieldsArray.length} fields and ${bookingsArray.length} bookings`);

        setFields(fieldsArray);
        setBookings(bookingsArray);
        setProfile({
          name: profileData.name || '',
          email: profileData.email || '',
          phone: profileData.phone || ''
        });
      } catch (error: any) {
        console.error('❌ Failed to fetch data:', error);
        console.error('Error details:', error.message, error.stack);
        toast.error(error.message || 'Không thể tải dữ liệu');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Tính toán stats từ data thực tế
  const calculateStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Bookings trong tháng này
    const currentMonthBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    });

    // Bookings tháng trước
    const lastMonthBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return bookingDate.getMonth() === lastMonth && bookingDate.getFullYear() === lastMonthYear;
    });

    // Tổng doanh thu tháng này
    const currentMonthRevenue = currentMonthBookings
      .filter(b => b.status !== 'cancelled')
      .reduce((sum, b) => sum + (b.amountValue || 0), 0);

    // Tổng doanh thu tháng trước
    const lastMonthRevenue = lastMonthBookings
      .filter(b => b.status !== 'cancelled')
      .reduce((sum, b) => sum + (b.amountValue || 0), 0);

    // Tính % tăng trưởng
    const revenueGrowth = lastMonthRevenue > 0
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
      : '0';

    // Bookings tuần này
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const currentWeekBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt);
      return bookingDate >= weekAgo;
    });

    // Bookings tuần trước
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const lastWeekBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.createdAt);
      return bookingDate >= twoWeeksAgo && bookingDate < weekAgo;
    });

    const bookingGrowth = lastWeekBookings.length > 0
      ? ((currentWeekBookings.length - lastWeekBookings.length) / lastWeekBookings.length * 100).toFixed(0)
      : '0';

    // Số sân hoạt động
    const activeFields = fields.filter(f => f.status === 'active' && f.available).length;
    const totalFields = fields.length;
    const maintenanceFields = fields.filter(f => f.status === 'maintenance' || !f.available).length;

    // Khách hàng mới trong tháng
    const currentMonthCustomers = new Set(
      currentMonthBookings.map(b => b.userId._id || b.userId.email)
    ).size;

    return {
      totalRevenue: currentMonthRevenue,
      revenueGrowth,
      totalBookings: currentWeekBookings.length,
      bookingGrowth,
      activeFields,
      totalFields,
      maintenanceFields,
      newCustomers: currentMonthCustomers
    };
  };

  const stats = calculateStats();
  const filteredFields = fields.filter(field =>
    field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (field.fullAddress || field.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  );
  const recentBookings = bookings.slice(0, 5);

  const handleToggleStatus = async (field: Field) => {
    try {
      const newStatus = field.status === 'active' ? 'maintenance' : 'active';
      const newAvailable = newStatus === 'active'; // If active, set available to true. If maintenance, set false.

      await apiService.updateField(field._id, {
        status: newStatus,
        available: newAvailable
      });

      setFields(fields.map(f =>
        f._id === field._id
          ? { ...f, status: newStatus, available: newAvailable }
          : f
      ));

      toast.success(newStatus === 'active' ? 'Đã kích hoạt sân' : 'Đã tạm ngưng hoạt động sân');
    } catch (error: any) {
      console.error('Failed to update field status:', error);
      toast.error('Cập nhật trạng thái thất bại');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        if (isLoading) {
          return (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          );
        }

        return (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Tổng doanh thu</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{stats.totalRevenue.toLocaleString('vi-VN')}đ</div>
                  <p className="text-xs text-muted-foreground">
                    {parseFloat(stats.revenueGrowth) >= 0 ? (
                      <span className="text-green-600">+{stats.revenueGrowth}%</span>
                    ) : (
                      <span className="text-red-600">{stats.revenueGrowth}%</span>
                    )} so với tháng trước
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Số lượt đặt sân</CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">+{stats.totalBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    {parseFloat(stats.bookingGrowth) >= 0 ? (
                      <span className="text-green-600">+{stats.bookingGrowth}%</span>
                    ) : (
                      <span className="text-red-600">{stats.bookingGrowth}%</span>
                    )} so với tuần trước
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Số sân hoạt động</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{stats.activeFields}/{stats.totalFields}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.maintenanceFields > 0 ? `${stats.maintenanceFields} sân đang bảo trì` : 'Tất cả sân đang hoạt động'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Khách hàng mới</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">+{stats.newCustomers}</div>
                  <p className="text-xs text-muted-foreground">
                    Trong tháng này
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <CardTitle>Đặt sân gần đây</CardTitle>
                <CardDescription>
                  Tất cả các đơn đặt sân mới nhất trong hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentBookings.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Chưa có đơn đặt sân nào</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Sân</TableHead>
                        <TableHead>Ngày</TableHead>
                        <TableHead>Giờ</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Số tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentBookings.map((booking) => (
                        <TableRow key={booking._id}>
                          <TableCell>{booking.userId?.name || 'N/A'}</TableCell>
                          <TableCell>{booking.fieldId?.name || 'N/A'}</TableCell>
                          <TableCell>{new Date(booking.date).toLocaleDateString('vi-VN')}</TableCell>
                          <TableCell>{booking.timeSlot}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                booking.status === 'confirmed' ? 'default' :
                                  booking.status === 'pending' ? 'secondary' :
                                    'destructive'
                              }
                            >
                              {booking.status === 'confirmed' ? 'Đã xác nhận' :
                                booking.status === 'pending' ? 'Chờ xác nhận' :
                                  'Đã hủy'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {(booking.amountValue || 0).toLocaleString('vi-VN')}đ
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'fields':
        if (isLoading) {
          return (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          );
        }

        // Tính số lượt đặt cho mỗi sân
        const getFieldBookingsCount = (fieldId: string) => {
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          return bookings.filter(booking => {
            if (booking.fieldId?._id !== fieldId) return false;
            const bookingDate = new Date(booking.date);
            return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
          }).length;
        };

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl">Quản lý sân</h2>
                <p className="text-muted-foreground">
                  Quản lý tất cả các sân bóng trong hệ thống
                </p>
              </div>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => navigate('/them-san-moi')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm sân mới
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm sân..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {filteredFields.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">
                    {searchQuery ? 'Không tìm thấy sân nào' : 'Chưa có sân bóng nào. Hãy thêm sân mới!'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredFields.map((field) => (
                  <Card key={field._id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{field.name}</CardTitle>
                          <CardDescription>{field.size}</CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/sua-san/${field._id}`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            {field.status === 'active' ? (
                              <DropdownMenuItem
                                className="text-orange-600 focus:text-orange-600"
                                onClick={() => handleToggleStatus(field)}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Ngừng hoạt động
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                className="text-green-600 focus:text-green-600"
                                onClick={() => handleToggleStatus(field)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Kích hoạt
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Trạng thái</span>
                          <Badge variant={field.status === 'active' && field.available ? 'default' : 'secondary'}>
                            {field.status === 'active' && field.available ? 'Hoạt động' : 'Bảo trì'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Lượt đặt tháng này</span>
                          <span>{getFieldBookingsCount(field._id)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{field.fullAddress || field.location || 'Chưa có địa chỉ'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 'bookings':
        if (isLoading) {
          return (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          );
        }

        const handleUpdateBookingStatus = async (id: string, status: 'confirmed' | 'cancelled') => {
          try {
            await apiService.updateBookingStatus(id, status);
            toast.success(status === 'confirmed' ? 'Đã duyệt đơn đặt sân' : 'Đã từ chối đơn đặt sân');

            // Refresh bookings
            const updatedBookings = await apiService.getBookings();
            setBookings(Array.isArray(updatedBookings) ? updatedBookings : []);
          } catch (error: any) {
            console.error('Failed to update booking status:', error);
            toast.error(error.message || 'Cập nhật trạng thái thất bại');
          }
        };

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl">Quản lý đặt sân</h2>
                <p className="text-muted-foreground">Xem lịch đặt sân theo khung giờ</p>
              </div>
            </div>

            <WeeklyScheduler bookings={bookings} loading={isLoading} onUpdateStatus={handleUpdateBookingStatus} />
          </div>
        );

      case 'settings':
        const handleUpdateProfile = async () => {
          setIsSavingProfile(true);
          try {
            await apiService.updateProfile(profile);
            toast.success('Cập nhật thông tin thành công!');
            // Reload profile
            const updatedProfile = await apiService.getProfile();
            setProfile({
              name: updatedProfile.name || '',
              email: updatedProfile.email || '',
              phone: updatedProfile.phone || ''
            });
          } catch (error: any) {
            console.error('Failed to update profile:', error);
            toast.error(error.message || 'Cập nhật thông tin thất bại');
          } finally {
            setIsSavingProfile(false);
          }
        };

        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl">Cài đặt</h2>
              <p className="text-muted-foreground">Quản lý thông tin tài khoản và cài đặt hệ thống</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin tài khoản</CardTitle>
                  <CardDescription>Cập nhật thông tin cá nhân</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm">Tên chủ sân</label>
                    <Input
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Email</label>
                    <Input
                      value={profile.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Số điện thoại</label>
                    <Input
                      placeholder="0123456789"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    />
                  </div>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleUpdateProfile}
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang lưu...
                      </>
                    ) : (
                      'Cập nhật thông tin'
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Đổi mật khẩu</CardTitle>
                  <CardDescription>Thay đổi mật khẩu tài khoản</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm">Mật khẩu hiện tại</label>
                    <Input type="password" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Mật khẩu mới</label>
                    <Input type="password" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm">Xác nhận mật khẩu mới</label>
                    <Input type="password" />
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700">Đổi mật khẩu</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'banking': {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          );
        }

        const bankingBookings = bookings.filter((b: any) => b.paymentMethod === 'banking');

        const statusConfig: Record<string, { label: string; className: string }> = {
          PENDING: { label: '⏳ Chờ CK', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
          CONFIRMED: { label: '✅ Đã xác nhận', className: 'bg-green-100 text-green-800 border-green-300' },
          EXPIRED: { label: '⏰ Hết hạn', className: 'bg-gray-100 text-gray-600 border-gray-300' },
          CANCELLED: { label: '❌ Đã hủy', className: 'bg-red-100 text-red-800 border-red-300' },
          REFUND_PENDING: { label: '💸 Chờ hoàn TM', className: 'bg-orange-100 text-orange-800 border-orange-300' },
          REFUNDED: { label: '✅ Đã hoàn TM', className: 'bg-purple-100 text-purple-800 border-purple-300' },
        };

        const handleConfirmPayment = async (id: string) => {
          try {
            await apiService.confirmPayment(id);
            toast.success('Đã xác nhận thanh toán! Email xác nhận đã gửi cho khách.');
            const updated = await apiService.getBookings();
            setBookings(Array.isArray(updated) ? updated : []);
          } catch (err: any) {
            toast.error(err.message || 'Xác nhận thất bại');
          }
        };

        const handleMarkRefunded = async (id: string) => {
          try {
            await apiService.markRefunded(id);
            toast.success('Đã đánh dấu hoàn tiền! Email thông báo đã gửi cho khách.');
            const updated = await apiService.getBookings();
            setBookings(Array.isArray(updated) ? updated : []);
          } catch (err: any) {
            toast.error(err.message || 'Cập nhật thất bại');
          }
        };

        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl">Thanh toán chuyển khoản</h2>
              <p className="text-muted-foreground">Xác nhận các đơn đặt sân đã chuyển khoản MB Bank</p>
            </div>

            {/* Stats nhanh */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['PENDING', 'CONFIRMED', 'REFUND_PENDING', 'REFUNDED'] as const).map(s => (
                <div key={s} className={`rounded-lg border p-3 text-center ${statusConfig[s]?.className || ''}`}>
                  <div className="text-2xl font-bold">{bankingBookings.filter((b: any) => b.status === s).length}</div>
                  <div className="text-xs mt-0.5">{statusConfig[s]?.label}</div>
                </div>
              ))}
            </div>

            {bankingBookings.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">Chưa có đơn chuyển khoản nào</CardContent></Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b bg-gray-50">
                        <tr>
                          <th className="text-left p-3 font-medium">Mã đơn</th>
                          <th className="text-left p-3 font-medium">Khách</th>
                          <th className="text-left p-3 font-medium">Sân / Giờ</th>
                          <th className="text-left p-3 font-medium">Tiền cọc</th>
                          <th className="text-left p-3 font-medium">Trạng thái</th>
                          <th className="text-left p-3 font-medium">Hành động</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {bankingBookings.map((b: any) => {
                          const cfg = statusConfig[b.status] || { label: b.status, className: 'bg-gray-100 text-gray-700' };
                          return (
                            <tr key={b._id} className="hover:bg-gray-50">
                              <td className="p-3">
                                <span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">{b.bookingCode || '—'}</span>
                              </td>
                              <td className="p-3">
                                <div className="font-medium">{b.userId?.name || b.customer}</div>
                                <div className="text-xs text-muted-foreground">{b.userId?.email}</div>
                              </td>
                              <td className="p-3">
                                <div>{b.fieldName}</div>
                                <div className="text-xs text-muted-foreground">{b.date} – {b.time}</div>
                              </td>
                              <td className="p-3 font-semibold text-green-700">
                                {(b.depositAmount || 0).toLocaleString('vi-VN')}đ
                              </td>
                              <td className="p-3">
                                <span className={`text-xs px-2 py-1 rounded border font-medium ${cfg.className}`}>{cfg.label}</span>
                              </td>
                              <td className="p-3">
                                {b.status === 'PENDING' && (
                                  <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs h-7"
                                    onClick={() => handleConfirmPayment(b._id)}>
                                    <CheckCircle2 className="h-3 w-3 mr-1" />Xác nhận tiền
                                  </Button>
                                )}
                                {b.status === 'REFUND_PENDING' && (
                                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs h-7"
                                    onClick={() => handleMarkRefunded(b._id)}>
                                    <Banknote className="h-3 w-3 mr-1" />Đã hoàn tiền
                                  </Button>
                                )}
                                {!['PENDING', 'REFUND_PENDING'].includes(b.status) && (
                                  <span className="text-xs text-muted-foreground">—</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-border">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1.5" />
                <path d="M12 4v16M4 12h16" stroke="white" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="font-semibold text-xl">MatchHub</span>
            <Badge variant="secondary" className="ml-2">Chủ sân</Badge>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Xin chào, {user?.name}</span>
            <Button variant="outline" onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" />
              Về trang chủ
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-white min-h-[calc(100vh-4rem)] p-4">
          <nav className="space-y-2">
            <Button
              variant={activeTab === 'overview' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'overview' ? 'bg-green-600 hover:bg-green-700' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Tổng quan
            </Button>
            <Button
              variant={activeTab === 'fields' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'fields' ? 'bg-green-600 hover:bg-green-700' : ''}`}
              onClick={() => setActiveTab('fields')}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Quản lý sân
            </Button>
            <Button
              variant={activeTab === 'bookings' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'bookings' ? 'bg-green-600 hover:bg-green-700' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Đặt sân
            </Button>
            <Button
              variant={activeTab === 'banking' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'banking' ? 'bg-green-600 hover:bg-green-700' : ''}`}
              onClick={() => setActiveTab('banking')}
            >
              <Banknote className="h-4 w-4 mr-2" />
              Thanh toán CK
              {bookings.filter((b: any) => b.paymentMethod === 'banking' && b.status === 'PENDING').length > 0 && (
                <span className="ml-auto bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {bookings.filter((b: any) => b.paymentMethod === 'banking' && b.status === 'PENDING').length}
                </span>
              )}
            </Button>
            <Button
              variant={activeTab === 'settings' ? 'default' : 'ghost'}
              className={`w-full justify-start ${activeTab === 'settings' ? 'bg-green-600 hover:bg-green-700' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="h-4 w-4 mr-2" />
              Cài đặt
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}