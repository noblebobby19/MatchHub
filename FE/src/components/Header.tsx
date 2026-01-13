import { Menu, Search, User } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "../context/AuthContext";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${currentPage === '/'
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
            >
              Trang chủ
            </Link>
            <Link
              to="/tim-san"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${currentPage === '/tim-san'
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
            >
              Tìm sân
            </Link>
            <Link
              to="/lien-he"
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${currentPage === '/lien-he'
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-700 hover:text-green-600 hover:bg-green-50'
                }`}
            >
              Liên hệ
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Icon */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden sm:inline-flex relative w-10 h-10 rounded-full border-2 border-transparent hover:border-green-200 hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100/50 hover:text-green-600 transition-all duration-300 hover:scale-110 hover:shadow-md group"
              onClick={() => navigate('/tim-san')}
            >
              <Search className="h-5 w-5 stroke-[2.5] group-hover:scale-110 transition-transform duration-300" />
            </Button>

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