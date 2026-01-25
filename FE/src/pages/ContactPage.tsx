import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { useAuth } from "../context/AuthContext";
import ApiService from "../services/api";

export function ContactPage() {
  const { user } = useAuth(); // Get user from Auth Context
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Check auth on mount
  useEffect(() => {
    if (!user) {
      // If not logged in, redirect to login or show message
      navigate('/dang-nhap?redirect=/lien-he');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await ApiService.sendContact({
        subject: formData.subject,
        content: formData.message
      });
      setShowSuccess(true);
      setFormData({ subject: '', message: '' });
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi gửi tin nhắn');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null; // Or a loading spinner while redirecting

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
                {showSuccess ? (
                  <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <Send className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-green-800">Gửi liên hệ thành công!</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      Chúng tôi đã nhận được tin nhắn của bạn và sẽ phản hồi trong vòng 24 giờ.
                      Vui lòng kiểm tra email hoặc thông báo để nhận câu trả lời.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setShowSuccess(false)}
                      className="mt-4"
                    >
                      Gửi tin nhắn khác
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      {/* Auto populated user info display (optional per req, but good for UX) */}
                      <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 mb-4">
                        Bạn đang gửi tin nhắn với tư cách: <span className="font-bold text-gray-900">{user.name}</span> ({user.email})
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Chủ đề</Label>
                      <Input
                        id="subject"
                        placeholder="Tiêu đề tin nhắn"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Nội dung *</Label>
                      <Textarea
                        id="message"
                        placeholder="Nhập nội dung tin nhắn của bạn..."
                        rows={6}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">Đang gửi...</span>
                      ) : (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Gửi tin nhắn
                        </>
                      )}
                    </Button>
                  </form>
                )}
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
                    <p className="text-sm text-muted-foreground">0336743580</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Email</p>
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
                      Nguyễn Văn Cừ Nối Dài, An Bình, Bình Thủy, Cần Thơ
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
          </div>
        </div>
      </div>
    </div>
  );
}
