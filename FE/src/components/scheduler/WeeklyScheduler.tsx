import { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, Ban, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';

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
        phone?: string;
    };
    fieldName: string;
    customerPhone?: string;
    customerEmail?: string;
    note?: string;
    customer: string;
    date: string; // YYYY-MM-DD
    time: string;
    status: string;
    amount: string;
    paymentMethod?: string;
}

interface WeeklySchedulerProps {
    bookings: Booking[];
    loading?: boolean;
    onUpdateStatus?: (id: string, status: 'confirmed' | 'cancelled') => void;
}

export function WeeklyScheduler({ bookings, loading, onUpdateStatus }: WeeklySchedulerProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Calculate week range
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
    const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });

    // Generate days for the header
    const weekDays = useMemo(() => {
        const days = [];
        let day = startDate;
        for (let i = 0; i < 7; i++) {
            days.push(day);
            day = addDays(day, 1);
        }
        return days;
    }, [startDate]);

    // Group bookings by date
    const bookingsByDate = useMemo(() => {
        const grouped: Record<string, Booking[]> = {};
        bookings.forEach(booking => {
            // Ensure date matches format or handle legacy data
            const dateKey = booking.date;
            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(booking);
        });
        return grouped;
    }, [bookings]);

    const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const goToToday = () => setCurrentDate(new Date());

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
            case 'CONFIRMED': return 'bg-green-100 text-green-700';
            case 'pending':
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'cancelled':
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            case 'REFUND_PENDING':
            case 'REFUNDED': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'confirmed':
            case 'CONFIRMED': return 'Đã xác nhận';
            case 'pending':
            case 'PENDING': return 'Chờ duyệt';
            case 'cancelled':
            case 'CANCELLED': return 'Đã hủy';
            case 'completed': return 'Hoàn thành';
            case 'REFUND_PENDING': return 'Chờ hoàn tiền';
            case 'REFUNDED': return 'Đã hoàn tiền';
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border shadow-sm">
                <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-4" />
                <p className="text-sm text-muted-foreground font-medium">Đang tải lịch đặt sân...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={prevWeek}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-medium min-w-[200px] text-center">
                        {format(startDate, 'dd/MM/yyyy')} - {format(endDate, 'dd/MM/yyyy')}
                    </span>
                    <Button variant="outline" size="icon" onClick={nextWeek}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                <Button variant="outline" onClick={goToToday} className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Hôm nay
                </Button>
            </div>

            {/* Week List - Vertical Layout */}
            <div className="flex flex-col gap-6">
                {weekDays.map((day, idx) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const dayBookings = bookingsByDate[dateStr] || [];
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div key={idx} className={`flex flex-col rounded-xl border shadow-sm overflow-hidden ${isToday ? 'border-green-200 ring-1 ring-green-100' : 'border-gray-200'}`}>
                            {/* Day Header - Banner Style */}
                            <div className={`px-4 py-3 flex items-center justify-between ${isToday ? 'bg-green-600 text-white' : 'bg-gray-50 border-b'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`text-lg font-bold ${isToday ? 'text-white' : 'text-gray-900'}`}>
                                        {format(day, 'EEEE', { locale: vi })}
                                    </div>
                                    <div className={`text-sm px-2 py-0.5 rounded-full ${isToday ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                        {format(day, 'dd/MM/yyyy')}
                                    </div>
                                    {isToday && (
                                        <Badge className="bg-white text-green-700 hover:bg-white/90 border-none text-[10px] h-5">HÔM NAY</Badge>
                                    )}
                                </div>
                                <div className="text-xs opacity-80">
                                    {dayBookings.length} đơn đặt sân
                                </div>
                            </div>

                            {/* Bookings List Area */}
                            <div className="p-4 bg-white min-h-[60px]">
                                {dayBookings.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {dayBookings
                                            .sort((a, b) => a.time.localeCompare(b.time))
                                            .map((booking) => (
                                                <Card key={booking._id} className="relative overflow-hidden hover:shadow-md transition-all border-l-4 group" style={{ borderLeftColor: (booking.status === 'confirmed' || booking.status === 'CONFIRMED') ? '#22c55e' : (booking.status === 'pending' || booking.status === 'PENDING') ? '#eab308' : '#ef4444' }}>
                                                    <CardContent className="p-4">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                                                                    <CalendarIcon className="h-3.5 w-3.5 text-green-600" />
                                                                    {booking.time}
                                                                    {booking.paymentMethod && (
                                                                        <span className={`ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold border ${booking.paymentMethod === 'banking'
                                                                                ? 'bg-blue-50 text-blue-600 border-blue-100'
                                                                                : 'bg-orange-50 text-orange-600 border-orange-100'
                                                                            }`}>
                                                                            {booking.paymentMethod === 'banking' ? 'BANKING' : 'TIỀN MẶT'}
                                                                        </span>
                                                                    )}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground font-medium mt-0.5">
                                                                    {booking.fieldName}
                                                                </span>
                                                            </div>
                                                            <Badge className={`text-[10px] uppercase font-bold tracking-wider rounded-md py-0.5 ${getStatusColor(booking.status)}`}>
                                                                {getStatusLabel(booking.status)}
                                                            </Badge>
                                                        </div>

                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                                                                {booking.customer.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-xs font-semibold truncate text-gray-800">{booking.customer}</p>
                                                                <p className="text-[10px] text-muted-foreground truncate">{booking.customerPhone || booking.userId?.phone || 'Chưa có SĐT'}</p>
                                                                {booking.note && <p className="text-[9px] text-orange-600 truncate mt-0.5">Note: {booking.note}</p>}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-between pt-3 border-t">
                                                            <span className="text-sm font-bold text-green-700">{booking.amount}</span>

                                                            {(booking.status === 'pending' || booking.status === 'PENDING') && onUpdateStatus && (
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="outline" size="sm" className="h-8 px-3 text-xs gap-1.5 hover:bg-green-50 hover:text-green-700 border-gray-200">
                                                                            Thao tác
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end" className="w-40">
                                                                        <DropdownMenuItem
                                                                            className="text-green-600 focus:text-green-600 cursor-pointer flex items-center gap-2 font-medium"
                                                                            onClick={() => onUpdateStatus(booking._id, 'confirmed')}
                                                                        >
                                                                            <CheckCircle2 className="h-4 w-4" />
                                                                            Xác nhận
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem
                                                                            className="text-red-600 focus:text-red-600 cursor-pointer flex items-center gap-2 font-medium"
                                                                            onClick={() => onUpdateStatus(booking._id, 'cancelled')}
                                                                        >
                                                                            <Ban className="h-4 w-4" />
                                                                            Từ chối
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-lg">
                                        Không có lịch đặt sân cho ngày này
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
