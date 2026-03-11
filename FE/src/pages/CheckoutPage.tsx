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

  const [errors, setErrors] = useState({
    name: "",
    email: "",
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

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: "",
      email: "",
      phone: "",
      note: ""
    };

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Họ và tên không được để trống";
      isValid = false;
    } else if (formData.name.trim().length < 2 || formData.name.trim().length > 50) {
      newErrors.name = "Họ và tên phải từ 2 đến 50 ký tự";
      isValid = false;
    } else if (!/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỮỰỲỴÝỶỸửữựỳỵỷỹ\s]+$/.test(formData.name)) {
      newErrors.name = "Họ và tên chỉ được chứa chữ cái và khoảng trắng";
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email không đúng định dạng";
      isValid = false;
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Số điện thoại không được để trống";
      isValid = false;
    } else if (!/^\d+$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại chỉ được chứa số";
      isValid = false;
    } else if (!formData.phone.startsWith("0")) {
      newErrors.phone = "Số điện thoại phải bắt đầu bằng 0";
      isValid = false;
    } else if (formData.phone.length < 10 || formData.phone.length > 11) {
      newErrors.phone = "Số điện thoại phải có 10-11 số";
      isValid = false;
    }

    // Note validation
    if (formData.note) {
      if (formData.note.length > 200) {
        newErrors.note = "Ghi chú không được vượt quá 200 ký tự";
        isValid = false;
      }
      if (/<[^>]*>?/gm.test(formData.note) || formData.note.toLowerCase().includes('script')) {
        newErrors.note = "Ghi chú không cho phép chứa script hoặc HTML";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleConfirm = async () => {
    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin khách hàng");
      return;
    }

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
      // Chuyển khoản ngân hàng – tạo banking booking và chuyển sang trang QR
      setIsProcessing(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Bạn cần đăng nhập để thanh toán.");
          setIsProcessing(false);
          navigate('/dang-nhap');
          return;
        }

        const result = await apiService.createBankingBooking({
          fieldId: bookingData.fieldId,
          date,
          time: timeSlot.time,
          timeSlot: timeSlot.time,
          amount: timeSlot.price
        });

        setIsProcessing(false);
        navigate('/thanh-toan-qr', {
          state: {
            bookingCode: result.bookingCode,
            depositAmount: result.depositAmount,
            expireAt: result.expireAt,
            bookingId: result.booking._id,
            bankConfig: result.bankConfig,
            bookingInfo: {
              fieldName: field.name,
              date,
              time: timeSlot.time,
              amountValue: result.booking.amountValue
            }
          }
        });
      } catch (err: any) {
        setIsProcessing(false);
        toast.error(err?.message || "Tạo đơn thất bại. Vui lòng thử lại.");
      }
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
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, name: e.target.value }));
                        if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                      }}
                      className={`mt-1 ${errors.name ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors.name && <p className="text-sm text-red-500 mt-1" style={{ color: '#ef4444' }}>{errors.name}</p>}
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, email: e.target.value }));
                        if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                      }}
                      className={`mt-1 ${errors.email ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors.email && <p className="text-sm text-red-500 mt-1" style={{ color: '#ef4444' }}>{errors.email}</p>}
                  </div>
                  <div>
                    <Label htmlFor="phone">Số điện thoại *</Label>
                    <Input
                      id="phone"
                      placeholder="Nhập số điện thoại"
                      value={formData.phone}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, phone: e.target.value }));
                        if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }));
                      }}
                      className={`mt-1 ${errors.phone ? 'border-red-500' : ''}`}
                      required
                    />
                    {errors.phone && <p className="text-sm text-red-500 mt-1" style={{ color: '#ef4444' }}>{errors.phone}</p>}
                  </div>
                  <div>
                    <Label htmlFor="note">Ghi chú</Label>
                    <Textarea
                      id="note"
                      placeholder="Nhập ghi chú (nếu có)"
                      value={formData.note}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, note: e.target.value }));
                        if (errors.note) setErrors(prev => ({ ...prev, note: "" }));
                      }}
                      className={`mt-1 min-h-[100px] ${errors.note ? 'border-red-500' : ''}`}
                      rows={4}
                    />
                    {errors.note && <p className="text-sm text-red-500 mt-1" style={{ color: '#ef4444' }}>{errors.note}</p>}
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
                      disabled={isProcessing}
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
