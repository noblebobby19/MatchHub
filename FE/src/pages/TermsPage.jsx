export function TermsPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <div className="mb-10 text-center border-b border-gray-100 pb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Điều khoản sử dụng</h1>
            <p className="text-gray-500">Cập nhật lần cuối: 03/2026</p>
          </div>

          <div className="space-y-8 text-gray-600 leading-relaxed prose prose-green max-w-none">
            
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Giới thiệu</h2>
              <p>
                Chào mừng bạn đến với MatchHub. Bằng việc truy cập hoặc sử dụng ứng dụng web của chúng tôi, 
                bạn đồng ý tuân thủ các Điều khoản sử dụng này. Nếu bạn không đồng ý với bất kỳ phần nào của điều khoản, 
                vui lòng không sử dụng dịch vụ của chúng tôi.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Tài khoản và Bảo mật</h2>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Bạn có trách nhiệm duy trì tính bảo mật cho tài khoản và mật khẩu của mình.</li>
                <li>Bạn đồng ý cung cấp thông tin chính xác, đầy đủ khi đăng ký tài khoản.</li>
                <li>MatchHub có quyền đình chỉ hoặc chấm dứt tài khoản nếu phát hiện hành vi gian lận hoặc vi phạm điều khoản.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. Quy định về đặt sân và hủy sân</h2>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Các thông tin về lịch trống, giá cả trên hệ thống mang tính chất thời gian thực dựa theo cập nhật của chủ sân.</li>
                <li>Người dùng cần thanh toán đủ hoặc theo quy định cọc để hệ thống xác nhận đặt sân.</li>
                <li>Việc hủy sân phụ thuộc vào chính sách riêng của từng sân bóng và chính sách hoàn tiền chung của MatchHub (nếu có yêu cầu tối thiểu về thời gian hủy trước giờ đá).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Thanh toán</h2>
              <p>
                MatchHub sử dụng cổng thanh toán an toàn để xử lý giao dịch. Chúng tôi không lưu trữ trực tiếp thông tin thẻ tín dụng của bạn.
                Trách nhiệm phát sinh liên quan đến giao dịch với ngân hàng thuộc về đối tác cung cấp dịch vụ thanh toán.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Trách nhiệm người dùng</h2>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>Sử dụng dịch vụ đúng theo quy định của pháp luật.</li>
                <li>Hành xử văn minh, tôn trọng tối thiểu tài sản và quy định của chủ sân bãi khi đến thi đấu.</li>
                <li>Không thực hiện các hành vi nhằm phá hoại, can thiệp trái phép vào hệ thống phần mềm của MatchHub.</li>
              </ul>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
