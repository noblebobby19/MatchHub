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
      setNewField({ ...newField, image: response.imagePath });
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
                <Label htmlFor="price">Giá thuê (VNĐ) <span className="text-red-500">*</span></Label>
                <Input
                  id="price"
                  placeholder="Ví dụ: 200000"
                  value={newField.price}
                  onChange={(e) => setNewField({ ...newField, price: e.target.value })}
                />
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
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border"
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
                <Label htmlFor="openTime">Giờ mở cửa</Label>
                <Input
                  id="openTime"
                  placeholder="5:00 - 23:00"
                  value={newField.openTime}
                  onChange={(e) => setNewField({ ...newField, openTime: e.target.value })}
                />
              </div>
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


