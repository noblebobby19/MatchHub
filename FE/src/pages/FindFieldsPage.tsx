import { useState, useEffect } from "react";
import { Search, MapPin, Calendar, Clock, Users, Filter, Star, ChevronDown } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import apiService from "../services/api";

import { useNavigate } from "react-router-dom";

export function FindFieldsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSize, setSelectedSize] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy dữ liệu từ API backend
  useEffect(() => {
    const fetchFields = async () => {
      try {
        setLoading(true);
        const filters: any = {};
        if (selectedSize !== "all") filters.size = selectedSize;
        if (selectedType !== "all") filters.type = selectedType;
        if (searchQuery) filters.search = searchQuery;
        
        const data = await apiService.getFields(filters);
        setFields(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Không thể tải dữ liệu");
        console.error("Error fetching fields:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, [searchQuery, selectedSize, selectedType]);

  const filteredFields = fields.filter(field => {
    const matchesSearch = !searchQuery || 
                         field.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         field.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSize = selectedSize === "all" || field.size === selectedSize;
    const matchesType = selectedType === "all" || field.type === selectedType;
    return matchesSearch && matchesSize && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-green-600 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl mb-6 text-center">
            Tìm sân bóng phù hợp
          </h1>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto bg-white rounded-lg p-4 shadow-lg">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Tìm theo tên hoặc địa điểm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedSize} onValueChange={setSelectedSize}>
                <SelectTrigger>
                  <Users className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Loại sân" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại sân</SelectItem>
                  <SelectItem value="Sân 5 người">Sân 5 người</SelectItem>
                  <SelectItem value="Sân 7 người">Sân 7 người</SelectItem>
                  <SelectItem value="Sân 11 người">Sân 11 người</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Loại mặt sân" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="Cỏ nhân tạo">Cỏ nhân tạo</SelectItem>
                  <SelectItem value="Trong nhà">Trong nhà</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-lg">
              Tìm thấy <span className="text-green-600">{filteredFields.length}</span> sân bóng
            </p>
          </div>
        </div>

        {/* Fields Grid */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-lg text-red-600">{error}</p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFields.map((field) => (
                <div
                  key={field._id}
                  onClick={() => navigate(`/san-bong/${field._id}`)}
                  className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src={field.image || field.images?.[0] || ""}
                      alt={field.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <Badge className="absolute top-4 right-4 bg-green-600 hover:bg-green-700">
                      {field.type}
                    </Badge>
                    {!field.available && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="destructive" className="text-lg px-4 py-2">
                          Đã đầy
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3">
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

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div>
                        <div className="text-sm text-muted-foreground">Giá từ</div>
                        <div className="text-green-600">{field.price}/giờ</div>
                      </div>
                      <Button 
                        className="bg-green-600 hover:bg-green-700"
                        disabled={!field.available}
                      >
                        {field.available ? "Xem chi tiết" : "Đã đầy"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredFields.length === 0 && (
              <div className="text-center py-20">
                <p className="text-lg text-muted-foreground">
                  Không tìm thấy sân bóng phù hợp. Vui lòng thử lại với từ khóa khác.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
