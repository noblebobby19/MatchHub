import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Loader2, Eye, EyeOff, XCircle, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState<any>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: any = {};
    if (!email) {
      newErrors.email = 'Email không được để trống';
    } else {
      const emailParts = email.split('@');
      if (emailParts.length !== 2) {
        newErrors.email = 'Email không đúng định dạng (ví dụ: ten@email.com)';
      } else {
        const [localPart, domainPart] = emailParts;
        if (!localPart || !domainPart) newErrors.email = 'Email không đúng định dạng (ví dụ: ten@email.com)';
        else if (localPart.startsWith('.') || localPart.endsWith('.')) newErrors.email = 'Phần tên email không được bắt đầu hoặc kết thúc bằng dấu chấm';
        else if (localPart.includes('..')) newErrors.email = 'Phần tên email không được có dấu chấm liên tiếp';
        else if (domainPart.startsWith('.') || domainPart.endsWith('.')) newErrors.email = 'Tên miền không được bắt đầu hoặc kết thúc bằng dấu chấm';
        else if (domainPart.includes('..')) newErrors.email = 'Tên miền không được có dấu chấm liên tiếp';
        else if (!/^[a-zA-Z0-9.-]+$/.test(domainPart) || /[^a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]/.test(localPart)) newErrors.email = 'Email chứa ký tự không hợp lệ';
        else if (!domainPart.includes('.')) newErrors.email = 'Email không đúng định dạng (ví dụ: ten@email.com)';
      }
    }

    if (!password) {
      newErrors.password = 'Mật khẩu không được để trống';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);
    setShowErrorAlert(false);

    try {
      await login(email, password);

      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        if (userData.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (userData.role === 'owner') {
          navigate('/owner-dashboard');
        } else {
          navigate('/');
        }
      } else {
        navigate('/');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      setErrorMessage(error.message || 'Tài khoản hoặc mật khẩu không đúng.');
      setShowErrorAlert(true);
    } finally {
      setIsLoading(false);
    }
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
            {/* Error Alert - inline, không có backdrop */}
            {showErrorAlert && (
              <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-700">Đăng nhập thất bại</p>
                  <p className="mt-0.5 text-sm text-red-600">{errorMessage}</p>
                </div>
                <button
                  onClick={() => setShowErrorAlert(false)}
                  className="text-red-400 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className={errors.email ? "text-[#ef4444]" : ""}>Email</Label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.email ? "text-[#ef4444]" : "text-muted-foreground"}`} />
                  <Input
                    id="email"
                    type="text"
                    placeholder="abc123@email.com"
                    className={`pl-10 ${errors.email ? "border-[#ef4444] focus-visible:ring-[#ef4444]" : ""}`}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    required={false}
                    aria-invalid={errors.email ? "true" : "false"}
                  />
                </div>
                {errors.email && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-[#ef4444]">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm font-medium" style={{ color: '#ef4444' }}>{errors.email}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className={errors.password ? "text-[#ef4444]" : ""}>Mật khẩu</Label>
                <div style={errors.password ? { borderColor: '#ef4444' } : {}} className={`flex items-center rounded-md border bg-background px-3 focus-within:ring-2 ${errors.password ? "border-[#ef4444] focus-within:ring-[#ef4444]" : "focus-within:ring-ring"}`}>
                  <Lock className={`mr-2 h-4 w-4 ${errors.password ? "text-[#ef4444]" : "text-muted-foreground"}`} />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: '' });
                    }}
                    required={false}
                    aria-invalid={errors.password ? "true" : "false"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="ml-2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-[#ef4444]">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm font-medium" style={{ color: '#ef4444' }}>{errors.password}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded" />
                  Ghi nhớ đăng nhập
                </label>
                <Button
                  type="button"
                  variant="link"
                  className="text-sm p-0 h-auto"
                  onClick={() => navigate('/quen-mat-khau')}
                >
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

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Hoặc</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => window.location.href = 'https://matchhub-be.onrender.com/api/auth/google'}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Đăng nhập bằng Google
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
    </div>
  );
}
