import { Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1.5" />
                  <path d="M12 4v16M4 12h16" stroke="white" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.5" />
                </svg>
              </div>
              <span className="font-semibold text-xl text-white">MatchHub</span>
            </div>
            <p className="text-sm">
              Hệ thống đặt lịch và quản lý sân bóng đá hàng đầu Việt Nam. Đặt sân dễ dàng, nhanh chóng và tiện lợi.
            </p>
            <div className="flex gap-3">
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-green-400 transition-colors">Trang chủ</Link></li>
              <li><Link to="/ve-chung-toi" className="hover:text-green-400 transition-colors">Về chúng tôi</Link></li>
              <li><Link to="/lien-he" className="hover:text-green-400 transition-colors">Liên hệ</Link></li>
              <li><a href="https://www.facebook.com/share/17QwGQa2z5/" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">Facebook</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/huong-dan" className="hover:text-green-400 transition-colors">Hướng dẫn đặt sân</Link></li>
              <li><Link to="/dieu-khoan" className="hover:text-green-400 transition-colors">Điều khoản</Link></li>
              <li><Link to="/bao-mat" className="hover:text-green-400 transition-colors">Bảo mật</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>600 Nguyễn Văn Cừ Nối Dài, An Bình, Bình Thủy, Cần Thơ, Việt Nam</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span>0336743580</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span>support@matchhub.vn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col sm:flex-row justify-center items-center gap-4 text-sm">
          <p>&copy; 2026 MatchHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
