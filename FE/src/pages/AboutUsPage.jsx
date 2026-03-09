import { Shield, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";

export function AboutUsPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Về <span className="text-green-600">MatchHub</span>
            </h1>
            <p className="text-lg text-gray-600">
              Nền tảng kết nối đam mê bóng đá, giúp bạn đặt sân và tìm đối tác dễ dàng.
            </p>
          </div>

          {/* Câu chuyện của chúng tôi */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 border-b pb-2 border-gray-100">Câu chuyện của chúng tôi</h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                Xuất phát từ niềm đam mê với trái bóng tròn, đội ngũ phát triển MatchHub nhận thấy một vấn đề bức thiết: 
                việc đặt sân bóng và tìm kiếm đối tác thi đấu thường gặp nhiều khó khăn, thủ công và mất nhiều thời gian.
              </p>
              <p>
                MatchHub được ra đời với sứ mệnh giải quyết những trở ngại đó. Chúng tôi xây dựng một nền tảng công nghệ
                hiện đại, kết nối trực tiếp những người yêu bóng đá với các chủ sân, giúp quá trình đặt lịch trở nên
                nhanh chóng, minh bạch và hiệu quả 100% qua môi trường trực tuyến.
              </p>
            </div>
          </div>

          {/* Sứ mệnh & Tầm nhìn */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-green-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sứ mệnh</h3>
              <p className="text-gray-600">
                Đơn giản hóa trải nghiệm đặt sân thể thao, xây dựng cộng đồng gắn kết những cá nhân và tập thể đam mê bóng đá trên toàn quốc.
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tầm nhìn</h3>
              <p className="text-gray-600">
                Trở thành nền tảng đặt lịch thể thao số 1 tại Việt Nam, mở rộng ra nhiều môn thể thao khác trong tương lai.
              </p>
            </div>
          </div>

          {/* Giá trị cốt lõi */}
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 border-b pb-2 border-gray-100">Giá trị cốt lõi</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <UserCheck className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Lấy người dùng làm trung tâm</h4>
                  <p className="text-gray-600 mt-1">Mọi tính năng đều được thiết kế để mang lại sự tiện lợi tối đa cho người chơi và chủ sân.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <Shield className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Minh bạch & Tin cậy</h4>
                  <p className="text-gray-600 mt-1">Hệ thống đánh giá chân thực, thông tin giá cả rõ ràng, chính sách thanh toán bảo mật.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12 bg-gray-50 rounded-xl p-8 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Cùng chúng tôi tạo nên những trận cầu đỉnh cao</h3>
            <Link to="/tim-san" className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition-colors">
              Tìm sân ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
