export function PrivacyPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          
          <div className="mb-10 text-center border-b border-gray-100 pb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Chính sách Bảo mật</h1>
            <p className="text-gray-500">Cập nhật lần cuối: 03/2026</p>
          </div>

          <div className="space-y-8 text-gray-600 leading-relaxed prose prose-green max-w-none">
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Thu thập thông tin cá nhân</h2>
              <p>
                Chúng tôi thu thập các thông tin cá nhân của bạn, bao gồm: Họ tên, Số điện thoại, Địa chỉ email
                khi bạn đăng ký tài khoản hoặc sử dụng dịch vụ trên nền tảng MatchHub.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Mục đích sử dụng thông tin</h2>
              <p>Thông tin của bạn sẽ được sử dụng cho các mục đích:</p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Cung cấp, duy trì và cá nhân hóa trải nghiệm sử dụng dịch vụ.</li>
                <li>Hỗ trợ khách hàng trong quá trình tìm kiếm và đặt lịch sân bóng.</li>
                <li>Xử lý giao dịch thanh toán (thông qua đối tác trung gian).</li>
                <li>Gửi thông báo về xác nhận đặt sân, bản tin hoặc các cập nhật quan trọng từ hệ thống.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Chia sẻ thông tin</h2>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Chúng tôi cam kết không bán, cho thuê hoặc chia sẻ dữ liệu cá nhân của bạn cho bên thứ ba vì mục đích thương mại.</li>
                <li>Thông tin đặt sân (Tên, Số điện thoại) chỉ được cung cấp cho Chủ sân bóng để phục vụ mục đích duy nhất là xác nhận và quản lý lịch thi đấu của bạn tại sân.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Bảo mật dữ liệu</h2>
              <p>
                MatchHub sử dụng các tiêu chuẩn mã hóa và bảo mật hiện đại nhằm bảo vệ thông tin của bạn khỏi nguy cơ
                truy cập, sử dụng hoặc tiết lộ trái phép. Tuy nhiên, lưu ý rằng không có phương thức truyền tải dữ liệu
                trên internet hoặc lưu trữ điện tử nào an toàn tuyệt đối 100%.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Quyền lợi của bạn</h2>
              <p>
                Bạn có thể truy cập, chỉnh sửa, hoặc yêu cầu xóa các thông tin cá nhân trên nền tảng của chúng tôi 
                bất cứ lúc nào tại mục Cài đặt Tài khoản.
              </p>
            </section>

            <section className="mt-8 pt-8 border-t border-gray-100 text-sm">
              <p>
                Mọi thắc mắc về các điều khoản bảo mật liên hệ tại email: <a href="mailto:support@matchhub.vn" className="text-green-600 hover:underline">support@matchhub.vn</a>
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
