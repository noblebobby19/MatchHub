import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import apiService from '../services/api';
import { useAuth } from '../context/AuthContext';

export function NotificationsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const data = await apiService.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await apiService.markNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all read');
        }
    };

    const handleNotificationClick = async (notif: any) => {
        if (!notif.isRead) {
            // Ideally call API to mark single read, here we rely on refresh or bulk mark for simplicity
            // But let's optimistically update UI
            // In a real refined app, we'd have a specific endpoint for single read
        }
        if (notif.link) {
            navigate(notif.link);
        }
    };

    if (loading) return <div className="min-h-screen pt-20 flex justify-center">Đang tải...</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-3xl">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                        <CardTitle className="text-2xl flex items-center gap-2">
                            <Bell className="h-6 w-6 text-blue-600" />
                            Tất cả thông báo
                        </CardTitle>
                        {notifications.some(n => !n.isRead) && (
                            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
                                <CheckCheck className="h-4 w-4 mr-2" />
                                Đánh dấu tất cả đã đọc
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {notifications.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                <p>Bạn chưa có thông báo nào</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif._id}
                                        className={`p-4 rounded-lg cursor-pointer transition-all hover:bg-gray-100 flex gap-4 ${!notif.isRead ? 'bg-blue-100 border border-blue-200 shadow-sm' : 'bg-white border border-transparent'}`}
                                        onClick={() => handleNotificationClick(notif)}
                                    >
                                        <div className={`h-2.5 w-2.5 rounded-full mt-2 flex-shrink-0 ${!notif.isRead ? 'bg-blue-600 shadow-sm' : 'bg-transparent'}`}></div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className={`text-sm ${!notif.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                    {notif.title}
                                                </h4>
                                                <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                                    {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className={`text-sm ${!notif.isRead ? 'text-gray-800' : 'text-gray-500'}`}>
                                                {notif.message}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
