import { Menu, User, Bell } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import apiService from "../services/api";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname;
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll for notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await apiService.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n: any) => !n.isRead).length);
    } catch (error) {
      console.error('Failed to fetch notifications');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      // Ideally we mark single as read, but for now we have mark all read or we can rely on next fetch
      // Or just update local state
      const newNotifs = notifications.map(n => n._id === notif._id ? { ...n, isRead: true } : n);
      setNotifications(newNotifs);
      setUnreadCount(prev => Math.max(0, prev - 1));

      await apiService.markNotificationsRead(); // Simplification: mark all read for now or update backend API for single
    }
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const handleProtectedNavigation = (path: string) => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để sử dụng tính năng này');
      navigate('/dang-nhap');
    } else {
      navigate(path);
    }
  };

  const isPathActive = (path: string) => currentPage === path;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/90 border-b border-gray-200/60 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 hover:opacity-90 transition-all duration-200 group"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-105">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-sm">
                <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1.5" />
                <path d="M12 4v16M4 12h16" stroke="white" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">MatchHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isPathActive('/')
                ? 'text-green-600 bg-green-50'
                : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
            >
              Trang chủ
            </Link>
            <Link
              to="/tim-san"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isPathActive('/tim-san')
                ? 'text-green-600 bg-green-50'
                : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
            >
              Tìm sân
            </Link>
            <button
              onClick={() => handleProtectedNavigation('/tim-dong-doi')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isPathActive('/tim-dong-doi')
                ? 'text-green-600 bg-green-50'
                : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
            >
              Tìm đội
            </button>
            <button
              onClick={() => handleProtectedNavigation('/tim-doi-thu')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isPathActive('/tim-doi-thu')
                ? 'text-red-600 bg-red-50'
                : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                }`}
            >
              Tìm đối thủ
            </button>
            <Link
              to="/lien-he"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${isPathActive('/lien-he')
                ? 'text-green-600 bg-green-50'
                : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
            >
              Liên hệ
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Notifications */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative hidden sm:inline-flex items-center gap-1 px-3 hover:bg-gray-100">
                    <Bell className="h-6 w-6 text-gray-700" />
                    {unreadCount > 0 && (
                      <span className="font-bold text-red-600 text-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 shadow-lg border-gray-200">
                  <div className="px-4 py-3 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                    <h3 className="font-semibold text-sm">Thông báo</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs text-blue-600 cursor-pointer hover:underline" onClick={() => apiService.markNotificationsRead().then(fetchNotifications)}>
                        Đánh dấu đã đọc
                      </span>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">Chưa có thông báo nào</p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-0 transition-colors duration-200 ${!notif.isRead ? 'bg-blue-100' : 'bg-white'}`}
                          onClick={() => handleNotificationClick(notif)}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <p className={`text-sm ${!notif.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-600'}`}>{notif.title}</p>
                            {!notif.isRead && <span className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1.5 shadow-sm"></span>}
                          </div>
                          <p className={`text-xs mt-1 line-clamp-2 ${!notif.isRead ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>{notif.message}</p>
                          <p className={`text-[10px] mt-1 ${!notif.isRead ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
                            {new Date(notif.createdAt).toLocaleDateString() + ' ' + new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="justify-center text-xs text-blue-600 cursor-pointer font-medium py-2 hover:bg-blue-50" onClick={() => navigate('/thong-bao')}>
                    Xem tất cả
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Notifications */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative w-10 h-10 rounded-full border-2 border-transparent hover:border-green-200 hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100/50 hover:text-green-600 transition-all duration-300 hover:scale-110 hover:shadow-md group"
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-green-100 to-green-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <User className="h-5 w-5 stroke-[2.5] relative z-10 group-hover:scale-110 transition-transform duration-300" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 shadow-lg border-gray-200">
                  <div className="px-3 py-2.5 bg-gradient-to-r from-green-50 to-transparent">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/thong-tin-ca-nhan')} className="cursor-pointer hover:bg-green-50 focus:bg-green-50">
                    Thông tin cá nhân
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/lich-su-dat-san')} className="cursor-pointer hover:bg-green-50 focus:bg-green-50">
                    Lịch sử đặt sân
                  </DropdownMenuItem>
                  {(user.role === 'owner' || user.role === 'admin') && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate('/owner-dashboard')} className="cursor-pointer hover:bg-green-50 focus:bg-green-50">
                        Quản lý sân (Admin/Owner)
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 hover:bg-red-50">
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  className="hidden sm:inline-flex bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-lg px-4 py-2 font-medium"
                  onClick={() => navigate('/dang-nhap')}
                >
                  Đăng nhập
                </Button>
              </>
            )}

            {!user && (
              <Button
                className="hidden sm:inline-flex bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-lg px-4 py-2 font-medium"
                onClick={() => navigate('/dang-ky')}
              >
                Đăng ký
              </Button>
            )}

            {user && user.role === 'user' && (
              <Button
                className="hidden sm:inline-flex bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-lg px-4 py-2 font-medium"
                onClick={() => navigate('/tim-san')}
              >
                Đặt sân ngay
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-green-50 hover:text-green-600 transition-all duration-200 rounded-lg"
            >
              <Menu className="h-5 w-5 stroke-[2]" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}