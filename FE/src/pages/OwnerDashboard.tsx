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
  TrendingUp,
  Users,
  MapPin,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';
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
  location: string;
}

interface Booking {
  _id: string;
  fieldId: {
    _id: string;
    name: string;
  };
  userId: {
    _id?: string;
    name: string;
    email: string;
  };
  date: string;
  timeSlot: string;
  status: string;
  amountValue?: number;
  amount?: string;
  createdAt: string;
}

export function OwnerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'fields' | 'bookings' | 'settings'>('overview');
  const [fields, setFields] = useState<Field[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [profile, setProfile] = useState({ name: '', email: '', phone: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
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
    field.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const recentBookings = bookings.slice(0, 5);

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
                  {user?.role === 'admin' 
                    ? 'Tất cả các đơn đặt sân mới nhất trong hệ thống' 
                    : 'Các đơn đặt sân mới nhất'}
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
                  {user?.role === 'admin' 
                    ? 'Quản lý tất cả các sân bóng trong hệ thống' 
                    : 'Quản lý tất cả các sân bóng của bạn'}
                </p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700">
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
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Xóa
                            </DropdownMenuItem>
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
                          <span className="truncate">{field.location}</span>
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

        // Tạo lịch tuần hiện tại
        const getWeekDates = () => {
          const today = new Date();
          const dayOfWeek = today.getDay();
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
          
          const weekDates = [];
          for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            weekDates.push(date);
          }
          return weekDates;
        };

        const weekDates = getWeekDates();
        const formatWeekDate = (date: Date) => {
          const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
          return `${days[date.getDay()]}\n${date.getDate()}/${date.getMonth() + 1}`;
        };

        // Group bookings theo field, date và timeSlot
        const getBookingForSlot = (fieldId: string, date: Date, timeSlot: string) => {
          const dateStr = date.toISOString().split('T')[0];
          return bookings.find(b => 
            b.fieldId?._id === fieldId &&
            b.date === dateStr &&
            b.timeSlot === timeSlot
          );
        };

        // Lấy các time slots từ bookings hoặc dùng mặc định
        const getTimeSlots = () => {
          const slots = new Set<string>();
          bookings.forEach(b => {
            if (b.timeSlot) slots.add(b.timeSlot);
          });
          // Nếu không có booking, dùng time slots mặc định
          if (slots.size === 0) {
            return ['06:00-07:00', '07:00-08:00', '08:00-09:00', '17:00-18:00', '18:00-19:00', '19:00-20:00', '20:00-21:00'];
          }
          return Array.from(slots).sort();
        };

        const timeSlots = getTimeSlots();

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl">Quản lý đặt sân</h2>
                <p className="text-muted-foreground">Xem lịch đặt sân theo khung giờ</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline">Hôm nay</Button>
                <Button variant="outline">Tuần này</Button>
              </div>
            </div>

            {/* Legend */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 border-2 border-dashed border-gray-300 rounded"></div>
                    <span>Trống</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-600 rounded"></div>
                    <span>Đã đặt</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white">!</div>
                    <span>Đã hủy</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Lịch đặt sân - Tuần {weekDates[0].getDate()}/{weekDates[0].getMonth() + 1} - {weekDates[6].getDate()}/{weekDates[6].getMonth() + 1}/{weekDates[6].getFullYear()}</CardTitle>
                <CardDescription>Click vào ô để xem chi tiết hoặc thêm đặt sân mới</CardDescription>
              </CardHeader>
              <CardContent>
                {fields.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Chưa có sân bóng nào</p>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                      {/* Header - Days */}
                      <div className="grid grid-cols-8 gap-2 mb-2">
                        <div className="p-2"></div>
                        {weekDates.map((date, idx) => (
                          <div key={idx} className="p-2 text-center bg-gray-50 rounded">
                            <div className="whitespace-pre-line text-sm">{formatWeekDate(date)}</div>
                          </div>
                        ))}
                      </div>

                      {/* Render từng sân */}
                      {fields.map((field) => {
                        const isMaintenance = field.status === 'maintenance' || !field.available;
                        
                        return (
                          <div key={field._id} className={isMaintenance ? '' : 'mb-6'}>
                            <div className="mb-2 flex items-center gap-2">
                              <h3>{field.name}</h3>
                              <Badge variant="secondary">{field.size}</Badge>
                              {isMaintenance && (
                                <Badge variant="destructive">Bảo trì</Badge>
                              )}
                            </div>
                            
                            {/* Time slots cho từng sân */}
                            {timeSlots.map((timeSlot) => (
                              <div key={timeSlot} className="grid grid-cols-8 gap-2 mb-2">
                                <div className="p-2 text-sm text-muted-foreground flex items-center">
                                  {timeSlot}
                                </div>
                                {weekDates.map((date, dateIdx) => {
                                  if (isMaintenance) {
                                    return (
                                      <div
                                        key={dateIdx}
                                        className="p-3 rounded bg-gray-200 text-gray-400 flex items-center justify-center text-xs"
                                      >
                                        Bảo trì
                                      </div>
                                    );
                                  }

                                  const booking = getBookingForSlot(field._id, date, timeSlot);
                                  const status = booking 
                                    ? (booking.status === 'cancelled' ? 'cancelled' : 'booked')
                                    : 'empty';

                                  return (
                                    <button
                                      key={dateIdx}
                                      onClick={() => booking && navigate(`/chi-tiet-don-dat-san/${booking._id}`)}
                                      className={`
                                        p-3 rounded transition-all hover:scale-105 hover:shadow-md relative
                                        ${status === 'empty' ? 'border-2 border-dashed border-gray-300 hover:border-green-400' : ''}
                                        ${status === 'booked' ? 'bg-green-600 text-white cursor-pointer' : ''}
                                        ${status === 'cancelled' ? 'bg-orange-500 text-white cursor-pointer' : ''}
                                      `}
                                    >
                                      {status === 'booked' && booking && (
                                        <div className="text-xs">
                                          <div className="truncate max-w-[60px]">
                                            {booking.userId?.name?.split(' ').slice(-1)[0] || 'N/A'}
                                          </div>
                                          <div className="opacity-80">
                                            {((booking.amountValue || 0) / 1000).toFixed(0)}k
                                          </div>
                                        </div>
                                      )}
                                      {status === 'cancelled' && (
                                        <div className="text-xl">!</div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
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
                <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1.5"/>
                <path d="M12 4v16M4 12h16" stroke="white" strokeWidth="1.5"/>
                <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.5"/>
              </svg>
            </div>
            <span className="font-semibold text-xl">MatchHub</span>
            <Badge variant="secondary" className="ml-2">Chủ sân</Badge>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Xin chào, {user?.name}</span>
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