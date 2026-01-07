import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User as UserIcon, Mail, MapPin, Loader2, Save } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { toast } from 'sonner';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    address: '',
    phone: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        navigate('/dang-nhap');
        return;
      }

      setIsLoading(true);
      try {
        const data = await apiService.getProfile();
        setProfile({
          name: data.name || '',
          email: data.email || '',
          address: data.address || '',
          phone: data.phone || ''
        });
      } catch (error: any) {
        console.error('Failed to fetch profile:', error);
        toast.error('Không thể tải thông tin cá nhân');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await apiService.updateProfile(profile);
      toast.success('Cập nhật thông tin thành công!');
      // Reload user data
      const updatedProfile = await apiService.getProfile();
      setProfile({
        name: updatedProfile.name || '',
        email: updatedProfile.email || '',
        address: updatedProfile.address || '',
        phone: updatedProfile.phone || ''
      });
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      toast.error(error.message || 'Cập nhật thông tin thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <UserIcon className="h-8 w-8 text-white" />
            </div>
            <CardTitle>Thông tin cá nhân</CardTitle>
            <CardDescription>Cập nhật thông tin tài khoản của bạn</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="pl-10"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10 bg-gray-50"
                    value={profile.email}
                    disabled
                  />
                </div>
                <p className="text-xs text-muted-foreground">Email không thể thay đổi</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0123456789"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    type="text"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    className="pl-10"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="flex-1"
                >
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


