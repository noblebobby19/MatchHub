import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, Clock, MapPin, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

interface BookingSuccessState {
  booking: any;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  field: any;
  timeSlot: any;
  date: string;
}

export function BookingSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as BookingSuccessState | null;

  // Nếu không có dữ liệu thì quay về trang chủ
  if (!state || !state.booking) {
    navigate("/");
    return null;
  }

  const { booking, user, field, timeSlot, date } = state;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
            <h1 className="text-3xl font-bold">Thanh toán thành công!</h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl">
              Đơn đặt sân của bạn đã được xác nhận thành công. Chúc bạn có một trận đấu thật vui vẻ.
            </p>
          </div>

          {/* Thông tin đặt sân */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin đặt sân</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm sm:text-base">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 text-green-600" />
                <div>
                  <p className="font-semibold">{field?.name || booking.fieldName}</p>
                  <p className="text-muted-foreground">
                    {field?.fullAddress || field?.location}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-1 text-green-600" />
                <div>
                  <p className="font-semibold">{timeSlot?.time || booking.time}</p>
                  <p className="text-muted-foreground">
                    {new Date(date || booking.date).toLocaleDateString("vi-VN", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t mt-2">
                <span className="font-semibold">Tổng tiền</span>
                <span className="text-lg font-bold text-green-600">
                  {booking.amount || timeSlot?.price}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Thông tin khách hàng */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin khách hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-green-600" />
                <span className="font-semibold">
                  {user?.name || booking.customer}
                </span>
              </div>
              <p className="text-muted-foreground">
                Email: {user?.email || "-"}
              </p>
            </CardContent>
          </Card>

          <div className="flex justify-center pt-2">
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => navigate("/")}
            >
              Quay về trang chủ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


