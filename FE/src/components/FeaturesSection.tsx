import { Clock, Shield, CreditCard, Smartphone, MapPin, Headphones } from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Đặt sân 24/7",
    description: "Hệ thống hoạt động liên tục, đặt sân mọi lúc mọi nơi"
  },
  {
    icon: Shield,
    title: "Bảo mật tuyệt đối",
    description: "Thông tin cá nhân và giao dịch được bảo vệ an toàn"
  },
  {
    icon: CreditCard,
    title: "Thanh toán linh hoạt",
    description: "Hỗ trợ thức thanh toán qua ngân hàng"
  },
  {
    icon: Smartphone,
    title: "Giao diện thân thiện",
    description: "Thiết kế đơn giản, dễ sử dụng trên mọi thiết bị"
  },
  {
    icon: Headphones,
    title: "Hỗ trợ 24/7",
    description: "Đội ngũ CSKH luôn sẵn sàng hỗ trợ bạn"
  }
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl mb-4">
            Tại sao chọn <span className="text-green-600">MatchHub</span>?
          </h2>
          <p className="text-lg text-muted-foreground">
            Chúng tôi mang đến trải nghiệm đặt sân tốt nhất với các tính năng vượt trội
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="group p-6 rounded-xl border border-border hover:border-green-600 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
                  <Icon className="h-6 w-6 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
