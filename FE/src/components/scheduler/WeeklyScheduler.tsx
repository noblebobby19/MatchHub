import { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

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
    customer: string;
    date: string; // YYYY-MM-DD
    time: string;
    status: string;
    amount: string;
}

interface WeeklySchedulerProps {
    bookings: Booking[];
    loading?: boolean;
}

export function WeeklyScheduler({ bookings, loading }: WeeklySchedulerProps) {
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
            case 'confirmed': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            case 'completed': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'confirmed': return 'Đã xác nhận';
            case 'pending': return 'Chờ duyệt';
            case 'cancelled': return 'Đã hủy';
            case 'completed': return 'Hoàn thành';
            default: return status;
        }
    };

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

            {/* Week Grid */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {weekDays.map((day, idx) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const dayBookings = bookingsByDate[dateStr] || [];
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div key={idx} className={`flex flex-col gap-2 ${isToday ? 'bg-blue-50/50 -m-1 p-1 rounded-lg' : ''}`}>
                            {/* Day Header */}
                            <div className={`p-3 rounded-lg border text-center ${isToday ? 'bg-blue-100 border-blue-200 text-blue-700' : 'bg-white'}`}>
                                <div className="font-semibold">{format(day, 'EEEE', { locale: vi })}</div>
                                <div className="text-sm opacity-80">{format(day, 'dd/MM')}</div>
                            </div>

                            {/* Bookings List */}
                            <div className="space-y-2">
                                {dayBookings.length > 0 ? (
                                    dayBookings
                                        .sort((a, b) => a.time.localeCompare(b.time))
                                        .map((booking) => (
                                            <Card key={booking._id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer border-l-4" style={{ borderLeftColor: booking.status === 'confirmed' ? '#22c55e' : booking.status === 'pending' ? '#eab308' : '#94a3b8' }}>
                                                <CardContent className="p-2 space-y-1.5 text-xs">
                                                    <div className="flex items-center justify-between">
                                                        <Badge variant="secondary" className="px-1 py-0 h-5 font-normal text-[10px] bg-slate-100">
                                                            {booking.time}
                                                        </Badge>
                                                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${getStatusColor(booking.status)}`}>
                                                            {getStatusLabel(booking.status)}
                                                        </span>
                                                    </div>

                                                    <div className="font-medium truncate" title={booking.fieldName}>
                                                        {booking.fieldName}
                                                    </div>

                                                    <div className="flex items-center gap-1 text-muted-foreground truncate">
                                                        <User className="h-3 w-3" />
                                                        <span>{booking.customer}</span>
                                                    </div>

                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <span className="font-semibold text-green-600">{booking.amount}</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                ) : (
                                    <div className="h-20 flex items-center justify-center text-muted-foreground text-xs border rounded-lg border-dashed bg-gray-50/50">
                                        Trống
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
