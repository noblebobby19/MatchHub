import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Loader2,
  XIcon
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { toast } from 'sonner';
import { getImageUrl } from '../utils/image';

export function AddFieldPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL if editing
  const isEditMode = !!id;
  const { user } = useAuth();
  const [isCreatingField, setIsCreatingField] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [newField, setNewField] = useState({
    name: '',
    fullAddress: '',
    price: '',
    image: '',
    size: '',
    type: '',
    description: '',
    phone: '',
    email: '',
    openTime: '5:00 - 23:00',
    available: true,
    status: 'active',
    features: [] as string[],
    timeSlots: [] as Array<{ time: string; price: string; available: boolean }>
  });
  const [featureInput, setFeatureInput] = useState('');

  // Parse openTime thành start/end hours
  const parseOpenTime = (openTime: string) => {
    const match = openTime.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (match) {
      return { start: match[1].padStart(2, '0'), end: match[3].padStart(2, '0') };
    }
    return { start: '05', end: '23' };
  };

  const parsedTime = parseOpenTime(newField.openTime);
  const [openTimeStart, setOpenTimeStart] = useState(parsedTime.start);
  const [openTimeEnd, setOpenTimeEnd] = useState(parsedTime.end);

  // Tạo danh sách giờ từ 00 đến 23
  const hourOptions = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));

  const handleOpenTimeChange = (start: string, end: string) => {
    setOpenTimeStart(start);
    setOpenTimeEnd(end);
    const newOpenTime = `${start}:00 - ${end}:00`;
    setNewField(prev => {
      // Tự động sinh lại timeSlots khi đổi giờ (giữ nguyên giá của các slot cũ nếu trùng giờ)
      const newSlots = generateTimeSlots(newOpenTime, prev.price);
      const mergedSlots = newSlots.map(newSlot => {
        const existingSlot = prev.timeSlots.find(s => s.time === newSlot.time);
        return existingSlot ? { ...newSlot, price: existingSlot.price } : newSlot;
      });
      return { ...prev, openTime: newOpenTime, timeSlots: mergedSlots };
    });
  };

  const handlePriceChange = (newPrice: string) => {
    setNewField(prev => {
      // Khi đổi giá gốc, cập nhật lại giá cho các timeSlots chưa bị sửa tay (đang bằng giá cũ)
      const oldFormattedPrice = formatPrice(prev.price);
      const newFormattedPrice = formatPrice(newPrice);
      
      const updatedSlots = prev.timeSlots.map(slot => {
        if (slot.price === oldFormattedPrice || !slot.price) {
          return { ...slot, price: newFormattedPrice };
        }
        return slot; // Giữ nguyên giá nếu chủ sân đã từng sửa tay khác với giá gốc
      });

      // Nếu chưa có slot nào, sinh mới
      const finalSlots = updatedSlots.length > 0 ? updatedSlots : generateTimeSlots(prev.openTime, newPrice);

      return { ...prev, price: newPrice, timeSlots: finalSlots };
    });
  };

  const handleTimeSlotPriceChange = (index: number, newPrice: string) => {
    setNewField(prev => {
      const updatedSlots = [...prev.timeSlots];
      updatedSlots[index] = { ...updatedSlots[index], price: newPrice };
      return { ...prev, timeSlots: updatedSlots };
    });
  };

  const formatPrice = (priceStr: string) => {
    let formattedPrice = priceStr || '200.000đ';
    const numericPrice = parseInt(String(priceStr).replace(/[^0-9]/g, ''), 10);
    if (!isNaN(numericPrice) && numericPrice > 0) {
      formattedPrice = numericPrice.toLocaleString('vi-VN') + 'đ';
    }
    return formattedPrice;
  };

  const generateTimeSlots = (openTime: string, defaultPrice: string) => {
    const match = openTime.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (!match) return [];

    const startHour = parseInt(match[1], 10);
    const endHour = parseInt(match[3], 10);
    const startTotal = startHour * 60;
    const endTotal = endHour * 60;

    if (endTotal <= startTotal) return [];

    const formattedPrice = formatPrice(defaultPrice);
    const slots = [];
    const SLOT_DURATION = 120; // 2 tiếng = 120 phút
    let cursor = startTotal;

    while (cursor < endTotal) {
      const slotEnd = Math.min(cursor + SLOT_DURATION, endTotal);
      const fromH = String(Math.floor(cursor / 60)).padStart(2, '0');
      const fromM = String(cursor % 60).padStart(2, '0');
      const toH = String(Math.floor(slotEnd / 60)).padStart(2, '0');
      const toM = String(slotEnd % 60).padStart(2, '0');

      slots.push({
        time: `${fromH}:${fromM} - ${toH}:${toM}`,
        price: formattedPrice,
        available: true
      });
      cursor = slotEnd;
    }
    return slots;
  };

  // UseEffect to fetch field data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchFieldData = async () => {
        setIsLoading(true);
        try {
          const fieldData = await apiService.getFieldById(id);
          setNewField({
            name: fieldData.name || '',
            fullAddress: fieldData.fullAddress || fieldData.location || '',
            price: fieldData.price || '',
            image: fieldData.image || '',
            size: fieldData.size || '',
            type: fieldData.type || '',
            description: fieldData.description || '',
            phone: fieldData.phone || '',
            email: fieldData.email || '',
            openTime: fieldData.openTime || '5:00 - 23:00',
            available: fieldData.available !== false,
            status: fieldData.status || 'active',
            features: fieldData.features || [],
            timeSlots: fieldData.timeSlots || []
          });
          if (fieldData.image) {
            setImagePreview(getImageUrl(fieldData.image));
          }
        } catch (error) {
          console.error("Failed to fetch field:", error);
          toast.error("Không thể tải thông tin sân");
          navigate('/owner-dashboard');
        } finally {
          setIsLoading(false);
        }
      };

      fetchFieldData();
    }
  }, [isEditMode, id, navigate]);

  // Sync openTimeStart/End khi newField.openTime thay đổi (từ fetch edit mode)
  useEffect(() => {
    const parsed = parseOpenTime(newField.openTime);
    setOpenTimeStart(parsed.start);
    setOpenTimeEnd(parsed.end);
  }, [newField.openTime]);

  // Redirect if not owner/admin
  if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
    navigate('/owner-dashboard');
    return null;
  }

  const handleAddField = async () => {
    // Validate required fields
    if (!newField.name || !newField.price || !newField.size || !newField.type) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }

    setIsCreatingField(true);
    try {
      const fieldData = {
        ...newField,
        features: newField.features.filter(f => f.trim() !== '')
      };

      if (isEditMode && id) {
        await apiService.updateField(id, fieldData);
        toast.success('Cập nhật thông tin sân thành công!');
      } else {
        await apiService.createField(fieldData);
        toast.success('Thêm sân mới thành công!');
      }

      navigate('/owner-dashboard');
    } catch (error: any) {
      console.error('Failed to save field:', error);
      toast.error(error.message || (isEditMode ? 'Cập nhật thất bại' : 'Thêm sân thất bại'));
    } finally {
      setIsCreatingField(false);
    }
  };

  const handleAddFeature = () => {
    if (featureInput.trim() && !newField.features.includes(featureInput.trim())) {
      setNewField({
        ...newField,
        features: [...newField.features, featureInput.trim()]
      });
      setFeatureInput('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setNewField({
      ...newField,
      features: newField.features.filter((_, i) => i !== index)
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      // Tạo preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedImage) {
      toast.error('Vui lòng chọn ảnh');
      return;
    }

    setIsUploadingImage(true);
    try {
      const response = await apiService.uploadImage(selectedImage);
      setNewField(prev => ({ ...prev, image: response.imagePath }));
      // Cập nhật imagePreview thành URL thực từ server
      setImagePreview(getImageUrl(response.imagePath));
      toast.success('Upload ảnh thành công!');
      setSelectedImage(null); // Hide button after upload
    } catch (error: any) {
      console.error('Failed to upload image:', error);
      toast.error(error.message || 'Upload ảnh thất bại');
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-border">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/owner-dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1.5" />
                  <path d="M12 4v16M4 12h16" stroke="white" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.5" />
                </svg>
              </div>
              <span className="font-semibold text-xl">MatchHub</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{isEditMode ? 'Chỉnh sửa thông tin sân' : 'Thêm sân mới'}</h1>
          <p className="text-muted-foreground">
            {isEditMode ? 'Cập nhật thông tin sân bóng' : 'Điền thông tin để thêm sân bóng mới vào hệ thống'}
          </p>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>Nhập thông tin cơ bản về sân bóng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên sân <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  placeholder="Ví dụ: Sân bóng ABC"
                  value={newField.name}
                  onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size">Kích thước <span className="text-red-500">*</span></Label>
                  <Select value={newField.size} onValueChange={(value) => setNewField({ ...newField, size: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn kích thước" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sân 5 người">Sân 5 người</SelectItem>
                      <SelectItem value="Sân 7 người">Sân 7 người</SelectItem>
                      <SelectItem value="Sân 11 người">Sân 11 người</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Loại sân <span className="text-red-500">*</span></Label>
                  <Select value={newField.type} onValueChange={(value) => setNewField({ ...newField, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại sân" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cỏ nhân tạo">Cỏ nhân tạo</SelectItem>
                      <SelectItem value="Trong nhà">Trong nhà</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullAddress">Địa chỉ đầy đủ</Label>
                <Input
                  id="fullAddress"
                  placeholder="Ví dụ: 123 Đường ABC, Quận XYZ, TP.HCM"
                  value={newField.fullAddress}
                  onChange={(e) => setNewField({ ...newField, fullAddress: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Giá thuê cơ bản (VNĐ) <span className="text-red-500">*</span></Label>
                <Input
                  id="price"
                  placeholder="Ví dụ: 200000"
                  value={newField.price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Giá này sẽ được áp dụng mặc định cho các khung giờ khi tạo mới.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Hình ảnh chính</Label>
                <div className="space-y-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="cursor-pointer"
                  />
                  {(imagePreview || newField.image) && (
                    <div className="mt-2">
                      <img
                        src={imagePreview || getImageUrl(newField.image)}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          // Thử lại với URL fallback nếu URL chính bị lỗi
                          if (newField.image && target.src !== getImageUrl(newField.image)) {
                            target.src = getImageUrl(newField.image);
                          } else {
                            target.style.display = 'none';
                          }
                        }}
                      />
                    </div>
                  )}
                  {selectedImage && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleUploadImage}
                      disabled={isUploadingImage}
                      className="w-full"
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang upload...
                        </>
                      ) : (
                        'Upload ảnh'
                      )}
                    </Button>
                  )}
                  {newField.image && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                      ✓ Ảnh đã được upload: {newField.image}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả về sân bóng..."
                  value={newField.description}
                  onChange={(e) => setNewField({ ...newField, description: e.target.value })}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin liên hệ</CardTitle>
              <CardDescription>Thông tin liên hệ của sân bóng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    placeholder="0123456789"
                    value={newField.phone}
                    onChange={(e) => setNewField({ ...newField, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={newField.email}
                    onChange={(e) => setNewField({ ...newField, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Giờ mở cửa</Label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="openTimeStart" className="text-xs text-muted-foreground">Giờ bắt đầu</Label>
                    <Select
                      value={openTimeStart}
                      onValueChange={(val) => handleOpenTimeChange(val, openTimeEnd)}
                    >
                      <SelectTrigger id="openTimeStart">
                        <SelectValue placeholder="Chọn giờ" />
                      </SelectTrigger>
                      <SelectContent>
                        {hourOptions.map((h) => (
                          <SelectItem key={h} value={h}>{h}:00</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="mt-5 text-muted-foreground font-medium">–</span>
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="openTimeEnd" className="text-xs text-muted-foreground">Giờ kết thúc</Label>
                    <Select
                      value={openTimeEnd}
                      onValueChange={(val) => handleOpenTimeChange(openTimeStart, val)}
                    >
                      <SelectTrigger id="openTimeEnd">
                        <SelectValue placeholder="Chọn giờ" />
                      </SelectTrigger>
                      <SelectContent>
                        {hourOptions.map((h) => (
                          <SelectItem key={h} value={h}>{h}:00</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {newField.openTime && (
                  <p className="text-xs text-muted-foreground">Giờ hoạt động: <span className="text-green-600 font-medium">{newField.openTime}</span></p>
                )}
              </div>

              {/* Time Slots Table */}
              {newField.timeSlots.length > 0 && (
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label>Cài đặt giá theo khung giờ</Label>
                    <Badge variant="outline" className="text-xs">
                      {newField.timeSlots.length} khung giờ
                    </Badge>
                  </div>
                  <div className="rounded-md border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="py-2 px-4 text-left font-medium text-gray-500">Khung giờ</th>
                          <th className="py-2 px-4 text-left font-medium text-gray-500">Giá thuê (VNĐ hoặc chữ có 'đ')</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {newField.timeSlots.map((slot, index) => (
                          <tr key={index} className="hover:bg-gray-50/50">
                            <td className="py-2 px-4 font-medium text-gray-900">{slot.time}</td>
                            <td className="py-2 px-4">
                              <Input
                                value={slot.price}
                                onChange={(e) => handleTimeSlotPriceChange(index, e.target.value)}
                                className="h-8 max-w-[200px]"
                                placeholder="Ví dụ: 300.000đ"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground">Bạn có thể tùy chỉnh giá riêng biệt cho từng khung giờ ở trên (ví dụ giờ vàng giá cao hơn).</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Tiện ích</CardTitle>
              <CardDescription>Thêm các tiện ích có sẵn tại sân bóng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Thêm tiện ích (ví dụ: Bãi đỗ xe, Quán nước...)"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddFeature();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddFeature}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm
                </Button>
              </div>

              {newField.features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newField.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 py-1 px-3">
                      {feature}
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(index)}
                        className="ml-1 hover:text-red-600"
                      >
                        <XIcon className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái</CardTitle>
              <CardDescription>Thiết lập trạng thái hoạt động của sân</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Trạng thái hoạt động</Label>
                  <Select value={newField.status} onValueChange={(value) => setNewField({ ...newField, status: value as 'active' | 'maintenance' })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="maintenance">Bảo trì</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="available">Có sẵn</Label>
                  <Select
                    value={newField.available ? 'true' : 'false'}
                    onValueChange={(value) => setNewField({ ...newField, available: value === 'true' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Có sẵn</SelectItem>
                      <SelectItem value="false">Không có sẵn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/owner-dashboard')}
              disabled={isCreatingField}
            >
              Hủy
            </Button>
            <Button
              type="button"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleAddField}
              disabled={isCreatingField}
            >
              {isCreatingField ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditMode ? 'Đang cập nhật...' : 'Đang thêm...'}
                </>
              ) : (
                isEditMode ? 'Lưu thay đổi' : 'Thêm sân'
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}


