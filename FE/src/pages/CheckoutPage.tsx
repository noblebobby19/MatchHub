import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Banknote, Building2, Clock, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import apiService from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";


export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    note: ""
  });

  // Lấy dữ liệu từ navigation state
  const bookingData = location.state as {
    fieldId: string;
    field: any;
    timeSlot: any;
    date: string;
  } | null;

  useEffect(() => {
    // Kiểm tra nếu không có dữ liệu booking, redirect về trang chủ
    if (!bookingData || !user) {
      toast.error("Vui lòng chọn sân và đăng nhập để thanh toán");
      navigate('/tim-san');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingData, user]);

  // Set form data từ user khi user thay đổi
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name || "",
        email: user.email || prev.email || ""
      }));
    }
  }, [user]);

  if (!bookingData || !user) {
    return null;
  }

  const { field, timeSlot, date } = bookingData;

  const handleConfirm = async () => {
    if (paymentMethod === "cash") {
      // Thanh toán tiền mặt - gọi API trực tiếp
      setIsProcessing(true);

      try {
        // Kiểm tra token trước khi gọi API
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Bạn cần đăng nhập để thanh toán. Đang chuyển đến trang đăng nhập...");
          setIsProcessing(false);
          setTimeout(() => {
            navigate('/dang-nhap');
          }, 1000);
          return;
        }

        // Validate form data
        if (!formData.name || !formData.email || !formData.phone) {
          toast.error("Vui lòng điền đầy đủ thông tin khách hàng");
          setIsProcessing(false);
          return;
        }

        const bookingRequestData = {
          fieldId: bookingData.fieldId,
          date: date,
          time: timeSlot.time,
          timeSlot: timeSlot.time,
          amount: timeSlot.price
        };

        console.log('📝 Creating booking with data:', bookingRequestData);
        console.log('🔑 Token exists:', !!token);
        console.log('👤 User from context:', user ? { id: user.id, email: user.email, name: user.name } : 'NO USER');
        
        // Log token để debug (chỉ log một phần để bảo mật)
        if (token) {
          console.log('🔑 Token preview:', token.substring(0, 20) + '...' + token.substring(token.length - 10));
        }
        
        const result = await apiService.createBooking(bookingRequestData);
        
        console.log('Booking created successfully:', result);
        
        // Điều hướng sang trang thành công, truyền dữ liệu booking + user + field
        setIsProcessing(false);
        navigate('/dat-san-thanh-cong', {
          state: {
            booking: result,
            user,
            field,
            timeSlot,
            date,
          }
        });
      } catch (err: any) {
        console.error("Error processing payment:", err);
        setIsProcessing(false);
        
        // Handle specific error messages
        let errorMessage = err?.message || "Thanh toán thất bại. Vui lòng thử lại.";
        
        // Check if error is about authentication
        if (errorMessage.includes('đăng nhập') || errorMessage.includes('token') || errorMessage.includes('401')) {
          toast.error(errorMessage);
          setTimeout(() => {
            navigate('/dang-nhap');
          }, 1500);
        } else {
          toast.error(errorMessage);
        }
      }
    } else {
      // Ngân hàng - chỉ hiển thị thông báo (chờ user suy nghĩ)
      toast.info("Tính năng thanh toán ngân hàng đang được phát triển");
    }
  };

  const images = field.images && field.images.length > 0 ? field.images : (field.image ? [field.image] : []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Thanh toán</h1>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Booking Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin đặt sân</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    {images[0] && (
                      <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={images[0]}
                          alt={field.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-2">{field.name}</h3>
                      <div className="flex items-start gap-2 text-muted-foreground mb-3">
                        <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span className="text-sm break-words">{field.fullAddress || field.location}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-green-600" />
                          <span className="font-medium">{timeSlot.time}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {new Date(date).toLocaleDateString('vi-VN', { 
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Phương thức thanh toán</CardTitle>
                  <CardDescription>Chọn phương thức thanh toán bạn muốn sử dụng</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 space-y-0 rounded-lg border-2 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value="cash" id="cash" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="cash" className="cursor-pointer flex items-center gap-2">
                            <Banknote className="h-5 w-5 text-green-600" />
                            <span className="font-semibold">Tiền mặt</span>
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Thanh toán trực tiếp tại sân
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3 space-y-0 rounded-lg border-2 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                        <RadioGroupItem value="banking" id="banking" className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor="banking" className="cursor-pointer flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-green-600" />
                            <span className="font-semibold">Chuyển khoản ngân hàng</span>
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Thanh toán qua Internet Banking, Mobile Banking
                          </p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Customer Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin khách hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Họ và tên *</Label>
                    <Input 
                      id="name" 
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1" 
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="mt-1" 
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <Input 
                      id="phone" 
                      placeholder="Nhập số điện thoại"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-1" 
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="note">Ghi chú</Label>
                    <Textarea 
                      id="note" 
                      placeholder="Nhập ghi chú (nếu có)"
                      value={formData.note}
                      onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                      className="mt-1 min-h-[100px]" 
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Tóm tắt đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Khung giờ:</span>
                      <span className="font-medium">{timeSlot.time}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Giá gốc:</span>
                      <span>{timeSlot.price}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Tổng cộng:</span>
                      <span className="text-2xl font-bold text-green-600">{timeSlot.price}</span>
                    </div>

                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="lg"
                      onClick={handleConfirm}
                      disabled={isProcessing || !formData.name || !formData.email || !formData.phone}
                    >
                      {isProcessing ? "Đang xử lý..." : "Xác nhận thanh toán"}
                    </Button>
                  </div>

                  <div className="border-t pt-4 space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Xác nhận tức thì</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Miễn phí hủy trong 24h</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
