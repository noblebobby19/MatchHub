import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";

export function ContactPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-green-600 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl mb-4">
            Liên hệ với chúng tôi
          </h1>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            Bạn có câu hỏi hoặc cần hỗ trợ? Chúng tôi luôn sẵn sàng lắng nghe và giúp đỡ bạn.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Gửi tin nhắn cho chúng tôi</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Họ và tên *</Label>
                      <Input
                        id="name"
                        placeholder="Nguyễn Văn A"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Số điện thoại *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="0939 xxx xxx"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Chủ đề</Label>
                    <Input
                      id="subject"
                      placeholder="Tiêu đề tin nhắn"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Nội dung *</Label>
                    <Textarea
                      id="message"
                      placeholder="Nhập nội dung tin nhắn của bạn..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    Gửi tin nhắn
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin liên hệ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Điện thoại</p>
                    <p className="text-sm text-muted-foreground">0939 123 456</p>
                    <p className="text-sm text-muted-foreground">0938 765 432</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Email</p>
                    <p className="text-sm text-muted-foreground">contact@matchhub.vn</p>
                    <p className="text-sm text-muted-foreground">support@matchhub.vn</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Địa chỉ</p>
                    <p className="text-sm text-muted-foreground">
                      123 Đường 30/4, Quận Ninh Kiều, Thành phố Cần Thơ
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Giờ làm việc</p>
                    <p className="text-sm text-muted-foreground">Thứ 2 - Thứ 6: 8:00 - 18:00</p>
                    <p className="text-sm text-muted-foreground">Thứ 7 - CN: 9:00 - 17:00</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <h3 className="mb-2 text-green-900">Hỗ trợ khẩn cấp</h3>
                <p className="text-sm text-green-800 mb-4">
                  Nếu bạn cần hỗ trợ khẩn cấp, vui lòng gọi hotline 24/7:
                </p>
                <div className="text-2xl text-green-600">
                  1900 xxxx
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12 max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-0">
              <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-2" />
                  <p>Bản đồ vị trí văn phòng</p>
                  <p className="text-sm">123 Đường 30/4, Quận Ninh Kiều, Cần Thơ</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
