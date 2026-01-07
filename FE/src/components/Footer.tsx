import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react";

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
                  <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1.5"/>
                  <path d="M12 4v16M4 12h16" stroke="white" strokeWidth="1.5"/>
                  <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.5"/>
                </svg>
              </div>
              <span className="font-semibold text-xl text-white">MatchHub</span>
            </div>
            <p className="text-sm">
              Hệ thống đặt lịch và quản lý sân bóng đá hàng đầu Việt Nam. Đặt sân dễ dàng, nhanh chóng và tiện lợi.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-green-400 transition-colors">Trang chủ</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Tìm sân</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Giá sân</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Về chúng tôi</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Liên hệ</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-green-400 transition-colors">Câu hỏi thường gặp</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Hướng dẫn đặt sân</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Chính sách hoàn tiền</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Điều khoản sử dụng</a></li>
              <li><a href="#" className="hover:text-green-400 transition-colors">Chính sách bảo mật</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white mb-4">Liên hệ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span>123 Đường Nguyễn Huệ, Quận 1, TP.HCM</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span>1900 xxxx</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span>support@matchhub.vn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
          <p>&copy; 2025 MatchHub. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-green-400 transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-green-400 transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-green-400 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
