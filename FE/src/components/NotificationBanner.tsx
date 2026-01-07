import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Swords, ChevronLeft, ChevronRight, Bell } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

const notifications = [
  {
    id: 1,
    team: "Đội Phượng Hoàng",
    type: "opponent",
    message: "tìm đối thủ cho trận giao hữu",
    time: "Thứ 7, 18:00",
    location: "Sân Xuân Khánh"
  },
  {
    id: 2,
    team: "Đội Rồng Xanh",
    type: "teammate",
    message: "cần tìm 2 đồng đội",
    time: "Chủ nhật, 17:00",
    location: "Sân An Hòa"
  },
  {
    id: 3,
    team: "Đội Hổ Vàng",
    type: "opponent",
    message: "tìm đối thủ cho giải nội bộ",
    time: "Thứ 6, 19:00",
    location: "Sân Hưng Lợi"
  },
  {
    id: 4,
    team: "Đội Báo Đen",
    type: "teammate",
    message: "thiếu 3 người chơi sân 7",
    time: "Hôm nay, 20:00",
    location: "Sân Tân An"
  }
];

export function NotificationBanner() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notifications.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + notifications.length) % notifications.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % notifications.length);
  };

  const current = notifications[currentIndex];

  return (
    <section className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Notification Content */}
          <div className="flex-1 flex items-center gap-4">
            <div className="hidden sm:flex h-12 w-12 bg-white/20 rounded-full items-center justify-center flex-shrink-0">
              <Bell className="h-6 w-6" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  className={`${
                    current.type === 'opponent' 
                      ? 'bg-orange-500 hover:bg-orange-600' 
                      : 'bg-blue-500 hover:bg-blue-600'
                  }`}
                >
                  {current.type === 'opponent' ? (
                    <>
                      <Swords className="h-3 w-3 mr-1" />
                      Tìm đối thủ
                    </>
                  ) : (
                    <>
                      <Users className="h-3 w-3 mr-1" />
                      Tìm đồng đội
                    </>
                  )}
                </Badge>
                <span className="text-sm opacity-90">{current.time}</span>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold">{current.team}</span>
                <span className="opacity-90">{current.message}</span>
                <span className="text-sm opacity-75">• {current.location}</span>
              </div>
            </div>

            {/* Navigation Arrows */}
            <div className="hidden md:flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handlePrev}
                className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="Previous notification"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNext}
                className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="Next notification"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-shrink-0">
            <Button 
              variant="secondary" 
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => navigate('/tim-dong-doi')}
            >
              <Users className="h-4 w-4 mr-2" />
              Tìm đồng đội
            </Button>
            <Button 
              variant="secondary" 
              className="bg-white text-orange-600 hover:bg-gray-100"
              onClick={() => navigate('/tim-doi-thu')}
            >
              <Swords className="h-4 w-4 mr-2" />
              Tìm đối thủ
            </Button>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {notifications.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex 
                  ? 'w-8 bg-white' 
                  : 'w-1.5 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to notification ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
