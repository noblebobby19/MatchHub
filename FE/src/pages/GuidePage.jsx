import { Link } from "react-router-dom";
import { Search, Calendar, CreditCard, Play } from "lucide-react";

export function GuidePage() {
  const steps = [
    {
      icon: <Search className="w-8 h-8 text-white" />,
      color: "#3b82f6", // tailwind bg-blue-500
      title: "Bước 1: Tìm kiếm & Chọn sân",
      description: "Truy cập mục 'Tìm sân' hoặc sử dụng thanh tìm kiếm. Lọc các sân bóng theo khu vực, thời gian và loại sân dự định đá (sân 5, sân 7). Xem chi tiết hình ảnh, giá cả và đánh giá.",
    },
    {
      icon: <Calendar className="w-8 h-8 text-white" />,
      color: "#22c55e", // tailwind bg-green-500
      title: "Bước 2: Chọn lịch & Đặt chỗ",
      description: "Chọn ngày và khung giờ trống bạn muốn đá. Kiểm tra lại thông tin tổng tiền và bấm nút 'Đặt sân ngay'. Hệ thống sẽ giữ chỗ cho bạn trong thời gian quy định.",
    },
    {
      icon: <CreditCard className="w-8 h-8 text-white" />,
      color: "#f97316", // tailwind bg-orange-500
      title: "Bước 3: Thanh toán",
      description: "Lựa chọn hình thức thanh toán trực tuyến hoặc chuyển khoản ngân hàng qua mã QR. Sau khi thanh toán thành công, hệ thống sẽ gửi Email và Thông báo xác nhận đặt sân.",
    },
    {
      icon: <Play className="w-8 h-8 text-white" />,
      color: "#a855f7", // tailwind bg-purple-500
      title: "Bước 4: Đến sân & Trải nghiệm",
      description: "Đến sân bóng theo đúng thời gian đã đặt. Bạn chỉ cần báo thông tin (tên/số điện thoại) hoặc đưa mã đặt sân cho chủ sân để nhận sân và bắt đầu trận đấu.",
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          
          <div className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Hướng dẫn đặt sân trên <span className="text-green-600">MatchHub</span>
            </h1>
            <p className="text-lg text-gray-600">
              Quy trình đặt sân bóng nhanh chóng, minh bạch chỉ với 4 bước đơn giản.
            </p>
          </div>

          <div className="relative">
            {/* Cột mốc dọc viền nối */}
            <div className="hidden md:block absolute left-8 top-8 bottom-8 w-0.5 bg-gray-200"></div>

            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={index} className="relative flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                  {/* Icon */}
                    <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 mx-auto md:mx-0 shadow-md`} style={{ backgroundColor: step.color }}>
                      {step.icon}
                    </div>
                  
                  {/* Content */}
                  <div className="flex-1 bg-gray-50 rounded-xl p-6 border border-gray-100 mt-2 md:mt-0 w-full text-center md:text-left">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 text-center border-t border-gray-100 pt-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Bạn đã sẵn sàng ra sân?</h2>
            <Link to="/tim-san" className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg transition-colors shadow-sm">
              Tìm sân trống ngay
            </Link>
          </div>
          
        </div>
      </div>
    </div>
  );
}
