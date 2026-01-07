import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User as UserIcon, Loader2, Eye, EyeOff, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu không khớp!');
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);

    try {
      // Không cần truyền role, backend sẽ tự động xác định từ database hoặc mặc định là 'user'
      await register(name, email, password, 'user', address);
      
      // Xóa token và user để người dùng phải đăng nhập lại
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Hiển thị modal thành công
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Registration failed:', error);
      setErrorMessage(error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/dang-nhap');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1.5" />
                <path d="M12 4v16M4 12h16" stroke="white" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.5" />
              </svg>
            </div>
            <CardTitle>Đăng ký tài khoản</CardTitle>
            <CardDescription>Tạo tài khoản để bắt đầu sử dụng MatchHub</CardDescription>
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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
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
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="flex items-center rounded-md border bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
                  <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="ml-2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Xác nhận mật khẩu</Label>
                <div className="flex items-center rounded-md border bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
                  <Lock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="ml-2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Bằng cách đăng ký, bạn đồng ý với{' '}
                <Button variant="link" className="p-0 h-auto text-green-600">
                  Điều khoản sử dụng
                </Button>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng ký...
                  </>
                ) : (
                  'Đăng ký'
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate('/')}
                className="w-full mt-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Đã có tài khoản?{' '}
              <Button
                variant="link"
                className="p-0 h-auto text-green-600"
                onClick={() => navigate('/dang-nhap')}
              >
                Đăng nhập ngay
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent
          className="bg-white rounded-lg p-6 shadow-lg [&>button]:hidden"
          style={{
            zIndex: 1000,
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '400px',
            width: '90vw',
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-green-600 text-center text-lg font-semibold">
              Đăng ký thành công!
            </DialogTitle>
            <DialogDescription className="pt-1 text-center text-sm text-gray-600">
              Tài khoản của bạn đã được tạo thành công. Vui lòng đăng nhập để tiếp tục.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              onClick={handleSuccessModalClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Đăng nhập ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent
          className="bg-white rounded-lg p-6 shadow-lg [&>button]:hidden"
          style={{
            zIndex: 1000,
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '400px',
            width: '90vw',
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-red-600 text-center text-lg font-semibold">
              Đăng ký thất bại
            </DialogTitle>
            <DialogDescription className="pt-1 text-center text-sm text-gray-600">
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              onClick={handleCloseErrorModal}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
