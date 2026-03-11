import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, Star, Users, Clock, Calendar as CalendarIcon, Phone, Mail, CheckCircle2, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import apiService from "../services/api";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Calendar } from "../components/ui/calendar";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function FieldDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [field, setField] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("info");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [bookedSlots, setBookedSlots] = useState<any[]>([]);
  const scheduleRef = useRef<HTMLDivElement>(null);

  // Lấy dữ liệu từ API backend
  useEffect(() => {
    const fetchField = async () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/fc4eb483-7452-4d20-a72d-7b0d8b4bf359', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'FieldDetailPage.tsx:21', message: 'fetchField started', data: { fieldId: id }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'initial', hypothesisId: 'A' }) }).catch(() => { });
      // #endregion
      try {
        setLoading(true);
        if (!id) {
          setError("Không tìm thấy ID sân bóng");
          setLoading(false);
          return;
        }
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/fc4eb483-7452-4d20-a72d-7b0d8b4bf359', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'FieldDetailPage.tsx:30', message: 'Calling apiService.getFieldById', data: { fieldId: id }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'initial', hypothesisId: 'A' }) }).catch(() => { });
        // #endregion
        const data = await apiService.getFieldById(id);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/fc4eb483-7452-4d20-a72d-7b0d8b4bf359', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'FieldDetailPage.tsx:33', message: 'API response received', data: { fieldId: id, hasData: !!data, fieldName: data?.name, hasFeatures: Array.isArray(data?.features), featuresLength: data?.features?.length }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'initial', hypothesisId: 'A' }) }).catch(() => { });
        // #endregion
        setField(data);
        setError(null);
      } catch (err: any) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/fc4eb483-7452-4d20-a72d-7b0d8b4bf359', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'FieldDetailPage.tsx:36', message: 'Error fetching field', data: { fieldId: id, errorMessage: err?.message, errorType: err?.constructor?.name }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'initial', hypothesisId: 'A' }) }).catch(() => { });
        // #endregion
        setError(err.message || "Không thể tải dữ liệu");
        console.error("Error fetching field:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchField();
    }
  }, [id]);

  // Fetch availability when date or field changes
  useEffect(() => {
    let isActive = true;

    const fetchAvailability = async () => {
      if (!id || !date) return;
      try {
        setBookedSlots([]); // Clear old data first
        const formattedDate = format(date, 'yyyy-MM-dd');
        console.log('📅 Checking availability for:', formattedDate);
        const slots = await apiService.checkAvailability(id, formattedDate, user?.id);

        if (isActive) {
          setBookedSlots(slots);
          console.log('🔒 Booked slots:', slots);
        }
      } catch (err) {
        if (isActive) {
          console.error("Error fetching availability:", err);
        }
      }
    };

    fetchAvailability();
    // Reset selected slot when date changes
    setSelectedTimeSlot(null);

    return () => {
      isActive = false;
    };
  }, [id, date]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error || !field) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Button variant="ghost" onClick={() => navigate('/tim-san')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-lg text-red-600">{error || "Không tìm thấy sân bóng"}</p>
        </div>
      </div>
    );
  }

  const images = field.images && field.images.length > 0 ? field.images : (field.image ? [field.image] : []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative h-96 overflow-hidden rounded-t-lg">
                  <ImageWithFallback
                    src={images[selectedImage] || ""}
                    alt={field.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {images.length > 1 && (
                  <div className="flex gap-2 p-4">
                    {images.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`relative h-20 w-20 rounded-lg overflow-hidden border-2 ${selectedImage === idx ? 'border-green-600' : 'border-transparent'
                          }`}
                      >
                        <ImageWithFallback
                          src={img}
                          alt={`${field.name} ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Tabs */}
            <Card>
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="info">Thông tin</TabsTrigger>
                    <TabsTrigger value="schedule">Lịch đặt sân</TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="space-y-4 mt-6">
                    <div>
                      <h3 className="mb-3">Mô tả</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {field.description}
                      </p>
                    </div>

                    <div>
                      <h3 className="mb-3">Tiện nghi</h3>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {(field.features && Array.isArray(field.features) && field.features.length > 0) ? (
                          field.features.map((feature: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-2">
                              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">{feature}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-muted-foreground">Chưa có thông tin tiện nghi</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-3">Thông tin liên hệ</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-5 w-5 text-green-600" />
                          <span>{field.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-5 w-5 text-green-600" />
                          <span>{field.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-5 w-5 text-green-600" />
                          <span>Giờ mở cửa: {field.openTime}</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="schedule" className="space-y-4 mt-6">
                    <div ref={scheduleRef} className="space-y-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="bg-white p-4 rounded-lg border shadow-sm w-fit mx-auto md:mx-0">
                          <h4 className="font-medium mb-2 text-center">Chọn ngày</h4>
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            locale={vi}
                            className="rounded-md border"
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          />
                        </div>

                        <div className="flex-1">
                          <h4 className="font-medium mb-3">
                            Khung giờ ngày: {date ? format(date, 'dd/MM/yyyy') : 'Chưa chọn'}
                          </h4>

                          {selectedTimeSlot && (
                            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-sm text-green-700">
                                Đã chọn: <strong>{selectedTimeSlot.time}</strong> - {selectedTimeSlot.price}
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {(field.timeSlots || []).map((slot: any, idx: number) => {
                              const isSelected = selectedTimeSlot?.time === slot.time;
                              // Check if slot is booked
                              const isBooked = bookedSlots.some(
                                b => b.time === slot.time && ['pending', 'confirmed', 'completed', 'PENDING', 'CONFIRMED'].includes(b.status)
                              );
                              const isAvailable = !isBooked;

                              return (
                                <div
                                  key={idx}
                                  onClick={() => {
                                    if (isAvailable) {
                                      setSelectedTimeSlot(slot);
                                    }
                                  }}
                                  className={`p-3 rounded-lg border text-sm transition-all flex flex-col items-center justify-center text-center gap-1 min-h-[80px] ${isAvailable
                                    ? isSelected
                                      ? 'border-green-600 bg-green-50 cursor-pointer shadow-sm'
                                      : 'border-gray-200 hover:border-green-600 hover:bg-green-50/50 cursor-pointer'
                                    : 'border-gray-100 bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                  <span className="font-medium">{slot.time}</span>
                                  <span className={`text-xs ${isAvailable ? 'text-green-600' : 'text-gray-400'}`}>
                                    {slot.price}
                                  </span>
                                  {!isAvailable && isBooked && (
                                    <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">Đã đặt</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h2 className="mb-2">{field.name}</h2>
                  <div className="flex items-start gap-2 text-muted-foreground mb-3">
                    <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>{field.fullAddress || field.location}</span>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span>{field.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({field.reviews} đánh giá)
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <Badge className="bg-green-100 text-green-700">
                      <Users className="h-3 w-3 mr-1" />
                      {field.size}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-700">
                      {field.type}
                    </Badge>
                  </div>
                </div>

                <div className="border-t pt-6">
                  {selectedTimeSlot ? (
                    <>
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Khung giờ đã chọn:</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-green-600" />
                          <span className="font-semibold">{selectedTimeSlot.time}</span>
                        </div>
                      </div>
                      <div className="flex items-baseline justify-between mb-4">
                        <span className="text-muted-foreground">Giá:</span>
                        <div>
                          <span className="text-2xl text-green-600 font-bold">{selectedTimeSlot.price}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-baseline justify-between mb-4">
                      <span className="text-muted-foreground">Giá từ</span>
                      <div>
                        <span className="text-2xl text-green-600">{field.price}</span>
                        <span className="text-muted-foreground">/giờ</span>
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    size="lg"
                    onClick={() => {
                      // Nếu chưa chọn khung giờ, chuyển sang tab schedule và scroll
                      if (!selectedTimeSlot) {
                        setActiveTab("schedule");
                        // Scroll đến phần schedule sau một chút để tab chuyển xong
                        setTimeout(() => {
                          scheduleRef.current?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                          });
                        }, 100);
                        toast.info("Vui lòng chọn khung giờ để đặt sân");
                        return;
                      }

                      // Nếu chưa đăng nhập
                      if (!user) {
                        toast.error("Vui lòng đăng nhập để đặt sân");
                        navigate('/dang-nhap');
                        return;
                      }

                      // Nếu đã chọn khung giờ và đã đăng nhập, chuyển đến trang thanh toán
                      navigate('/thanh-toan', {
                        state: {
                          fieldId: id,
                          field: field,
                          timeSlot: selectedTimeSlot,
                          date: date ? format(date, 'yyyy-MM-dd') : ''
                        }
                      });
                    }}
                  >
                    <CalendarIcon className="h-5 w-5 mr-2" />
                    {selectedTimeSlot ? "Đặt sân ngay" : "Chọn khung giờ"}
                  </Button>
                </div>

                <div className="border-t pt-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Xác nhận tức thì</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>Miễn phí hủy trong 24h</span>
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
