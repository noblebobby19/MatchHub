import { useState, useEffect } from "react";
import { Star, MapPin, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import apiService from "../services/api";

interface PopularFieldsSectionProps {
  onFieldClick?: (fieldId: string) => void;
  onViewAll?: () => void;
}

export function PopularFieldsSection({ onFieldClick, onViewAll }: PopularFieldsSectionProps) {
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Lấy dữ liệu từ API backend - lấy 3 sân đầu tiên (phổ biến nhất)
  useEffect(() => {
    const fetchFields = async () => {
      try {
        setLoading(true);
        const data = await apiService.getFields({});
        // Lấy 3 sân đầu tiên (có thể sắp xếp theo rating sau)
        setFields(data.slice(0, 3));
      } catch (err) {
        console.error("Error fetching popular fields:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, []);
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl mb-4">
            Sân bóng <span className="text-green-600">phổ biến</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Những sân bóng được đánh giá cao và yêu thích nhất
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {fields.map((field) => (
              <div 
                key={field._id}
                onClick={() => onFieldClick?.(field._id)}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <ImageWithFallback 
                    src={field.image || field.images?.[0] || ""}
                    alt={field.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 right-4 bg-green-600 hover:bg-green-700">
                    {field.type}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="mb-2 group-hover:text-green-600 transition-colors">
                      {field.name}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{field.rating || 0}</span>
                      <span className="text-sm text-muted-foreground">({field.reviews || 0})</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {field.size}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <div className="text-sm text-muted-foreground">Giá từ</div>
                      <div className="text-green-600">{field.price}/giờ</div>
                    </div>
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        onFieldClick?.(field._id);
                      }}
                    >
                      Đặt ngay
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg" 
            className="border-green-600 text-green-600 hover:bg-green-50"
            onClick={onViewAll}
          >
            Xem tất cả sân bóng
          </Button>
        </div>
      </div>
    </section>
  );
}
