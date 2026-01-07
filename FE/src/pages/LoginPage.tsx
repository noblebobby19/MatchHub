import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
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

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);

      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (userData.role === 'owner' || userData.role === 'admin') {
          navigate('/owner-dashboard');
        } else {
          navigate('/');
        }
      } else {
        navigate('/');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    setEmail('');
    setPassword('');
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
            <CardTitle>Đăng nhập MatchHub</CardTitle>
            <CardDescription>Đăng nhập để tiếp tục sử dụng dịch vụ</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded" />
                  Ghi nhớ đăng nhập
                </label>
                <Button variant="link" className="text-sm p-0 h-auto">
                  Quên mật khẩu?
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
                    Đang đăng nhập...
                  </>
                ) : 'Đăng nhập'}
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
              Chưa có tài khoản?{' '}
              <Button
                variant="link"
                className="p-0 h-auto text-green-600"
                onClick={() => navigate('/dang-ky')}
              >
                Đăng ký ngay
              </Button>
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Error Modal - ĐÃ BỎ DẤU X, CHỈ GIỮ NÚT QUAY LẠI */}
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
              Đăng nhập thất bại
            </DialogTitle>
            <DialogDescription className="pt-1 text-center text-sm text-gray-600">
              Tài khoản hoặc mật khẩu không đúng
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">

          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}