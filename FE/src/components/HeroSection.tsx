import { Search, MapPin, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface HeroSectionProps {
  onSearchClick?: () => void;
}

export function HeroSection({ onSearchClick }: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-br from-green-50 to-emerald-50 py-20 lg:py-32 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full">
                ⚽ Đặt sân nhanh, tiện lợi
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl">
                Đặt lịch sân bóng
                <span className="block text-green-600">chỉ trong 30 giây</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Hệ thống quản lý và đặt sân bóng đá hàng đầu Việt Nam với sân bóng chất lượng, giá tốt nhất thị trường.
              </p>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1709431511180-f941cbd6db7d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMGZpZWxkJTIwc3RhZGl1bXxlbnwxfHx8fDE3NjA2OTA4Njh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Football Field"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#16a34a" stroke="#16a34a" strokeWidth="1.5"/>
                </svg>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Đánh giá</div>
                <div>4.8/5.0 ⭐</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
