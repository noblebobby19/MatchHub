import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, User as UserIcon, Loader2, Eye, EyeOff, MapPin, CheckCircle, XCircle, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
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
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // 1. HỌ VÀ TÊN
    const nameStr = name;
    if (!nameStr) {
      newErrors.name = 'Họ và tên không được để trống';
    } else if (nameStr.startsWith(' ') || nameStr.endsWith(' ')) {
      newErrors.name = 'Họ và tên không được có khoảng trắng ở đầu hoặc cuối';
    } else if (nameStr.length < 5) {
      newErrors.name = 'Họ và tên phải có ít nhất 5 ký tự';
    } else if (nameStr.length > 100) {
      newErrors.name = 'Họ và tên không được vượt quá 100 ký tự';
    } else if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(nameStr)) {
      newErrors.name = 'Họ và tên không được chứa số hoặc ký tự đặc biệt';
    } else if (/\s{2,}/.test(nameStr)) {
      newErrors.name = 'Họ và tên không được có khoảng trắng liên tiếp';
    }

    // 2. EMAIL
    const emailStr = email;
    if (!emailStr) {
      newErrors.email = 'Email không được để trống';
    } else if (emailStr.length > 254) {
      newErrors.email = 'Email không được vượt quá 254 ký tự';
    } else if (emailStr.includes(' ')) {
      newErrors.email = 'Email không được chứa khoảng trắng';
    } else {
      const emailParts = emailStr.split('@');
      if (emailParts.length !== 2) {
        newErrors.email = 'Email không đúng định dạng (ví dụ: ten@email.com)';
      } else {
        const [localPart, domainPart] = emailParts;
        if (!localPart || !domainPart) {
           newErrors.email = 'Email không đúng định dạng (ví dụ: ten@email.com)';
        } else if (localPart.startsWith('.') || localPart.endsWith('.')) {
          newErrors.email = 'Phần tên email không được bắt đầu hoặc kết thúc bằng dấu chấm';
        } else if (localPart.includes('..')) {
          newErrors.email = 'Phần tên email không được có dấu chấm liên tiếp';
        } else if (domainPart.startsWith('.') || domainPart.endsWith('.')) {
          newErrors.email = 'Tên miền không được bắt đầu hoặc kết thúc bằng dấu chấm';
        } else if (domainPart.includes('..')) {
          newErrors.email = 'Tên miền không được có dấu chấm liên tiếp';
        } else if (!/^[a-zA-Z0-9.-]+$/.test(domainPart) || /[^a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]/.test(localPart)) {
          newErrors.email = 'Email chứa ký tự không hợp lệ';
        } else if (!domainPart.includes('.')) {
          newErrors.email = 'Email không đúng định dạng (ví dụ: ten@email.com)';
        }
      }
    }

    // 3. ĐỊA CHỈ
    const addressStr = address;
    if (!addressStr) {
      newErrors.address = 'Địa chỉ không được để trống';
    } else if (addressStr.trim().length < 10) {
      newErrors.address = 'Địa chỉ phải có ít nhất 10 ký tự';
    } else if (addressStr.length > 200) {
      newErrors.address = 'Địa chỉ không được vượt quá 200 ký tự';
    } else if (/\s{2,}/.test(addressStr)) {
      newErrors.address = 'Địa chỉ có quá nhiều khoảng trắng liên tiếp';
    } else if (/[!@#$%^&*_=+|<>?]/.test(addressStr)) {
      newErrors.address = 'Địa chỉ chứa ký tự không hợp lệ';
    }

    // 4. MẬT KHẨU
    const passStr = password;
    if (!passStr) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (passStr.includes(' ')) {
      newErrors.password = 'Mật khẩu không được chứa khoảng trắng';
    } else if (passStr.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    } else if (passStr.length > 128) {
      newErrors.password = 'Mật khẩu không được vượt quá 128 ký tự';
    } else if (!/[A-Z]/.test(passStr)) {
      newErrors.password = 'Mật khẩu phải có ít nhất 1 chữ cái in hoa';
    } else if (!/[a-z]/.test(passStr)) {
      newErrors.password = 'Mật khẩu phải có ít nhất 1 chữ cái thường';
    } else if (!/[0-9]/.test(passStr)) {
      newErrors.password = 'Mật khẩu phải có ít nhất 1 chữ số';
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passStr)) {
      newErrors.password = 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*...)';
    }

    // 5. XÁC NHẬN MẬT KHẨU
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await register(name, email, password, 'user', address);

      localStorage.removeItem('token');
      localStorage.removeItem('user');

      setShowSuccessAlert(true);
      setShowErrorAlert(false);
    } catch (error: any) {
      console.error('Registration failed:', error);
      setErrorMessage(error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      setShowErrorAlert(true);
      setShowSuccessAlert(false);
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
            <CardTitle>Đăng ký tài khoản</CardTitle>
            <CardDescription>Tạo tài khoản để bắt đầu sử dụng MatchHub</CardDescription>
          </CardHeader>

          <CardContent>
            {/* Success Alert */}
            {showSuccessAlert && (
              <div className="mb-4 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-700">Đăng ký thành công!</p>
                  <p className="mt-0.5 text-sm text-green-600">
                    Tài khoản của bạn đã được tạo. Vui lòng đăng nhập để tiếp tục.
                  </p>
                  <Button
                    onClick={() => navigate('/dang-nhap')}
                    className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    Đăng nhập ngay
                  </Button>
                </div>
                <button
                  onClick={() => setShowSuccessAlert(false)}
                  className="text-green-400 hover:text-green-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Error Alert */}
            {showErrorAlert && (
              <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-700">Đăng ký thất bại</p>
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
                <Label htmlFor="name" className={errors.name ? "text-red-500" : ""}>Họ và tên</Label>
                <div className="relative">
                  <UserIcon className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.name ? 'text-red-500' : 'text-muted-foreground'}`} />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className={`pl-10 ${errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    aria-invalid={!!errors.name}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) {
                        setErrors(prev => ({ ...prev, name: '' }));
                      }
                    }}
                  />
                </div>
                {errors.name && <p className="text-sm font-medium text-red-500 mt-1 flex items-center" style={{ color: '#ef4444' }}><XCircle className="h-4 w-4 mr-1" color="#ef4444" />{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className={errors.email ? "text-red-500" : ""}>Email</Label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.email ? 'text-red-500' : 'text-muted-foreground'}`} />
                  <Input
                    id="email"
                    type="text"
                    placeholder="abc123@email.com"
                    className={`pl-10 ${errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    aria-invalid={!!errors.email}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        setErrors(prev => ({ ...prev, email: '' }));
                      }
                    }}
                  />
                </div>
                {errors.email && <p className="text-sm font-medium text-red-500 mt-1 flex items-center" style={{ color: '#ef4444' }}><XCircle className="h-4 w-4 mr-1" color="#ef4444" />{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className={errors.address ? "text-red-500" : ""}>Địa chỉ</Label>
                <div className="relative">
                  <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${errors.address ? 'text-red-500' : 'text-muted-foreground'}`} />
                  <Input
                    id="address"
                    type="text"
                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    className={`pl-10 ${errors.address ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                    aria-invalid={!!errors.address}
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (errors.address) {
                        setErrors(prev => ({ ...prev, address: '' }));
                      }
                    }}
                  />
                </div>
                {errors.address && <p className="text-sm font-medium text-red-500 mt-1 flex items-center" style={{ color: '#ef4444' }}><XCircle className="h-4 w-4 mr-1" color="#ef4444" />{errors.address}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className={errors.password ? "text-red-500" : ""}>Mật khẩu</Label>
                <div className={`flex items-center rounded-md border bg-background px-3 focus-within:ring-2 focus-within:ring-ring ${errors.password ? 'border-red-500 focus-within:ring-red-500' : ''}`}>
                  <Lock className={`mr-2 h-4 w-4 ${errors.password ? 'text-red-500' : 'text-muted-foreground'}`} />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors(prev => ({ ...prev, password: '' }));
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="ml-2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm font-medium text-red-500 mt-1 flex items-start" style={{ color: '#ef4444' }}><XCircle className="h-4 w-4 mr-1 mt-0.5 shrink-0" color="#ef4444" /><span>{errors.password}</span></p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className={errors.confirmPassword ? "text-red-500" : ""}>Xác nhận mật khẩu</Label>
                <div className={`flex items-center rounded-md border bg-background px-3 focus-within:ring-2 focus-within:ring-ring ${errors.confirmPassword ? 'border-red-500 focus-within:ring-red-500' : ''}`}>
                  <Lock className={`mr-2 h-4 w-4 ${errors.confirmPassword ? 'text-red-500' : 'text-muted-foreground'}`} />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                         setErrors(prev => ({ ...prev, confirmPassword: '' }));
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="ml-2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm font-medium text-red-500 mt-1 flex items-start" style={{ color: '#ef4444' }}><XCircle className="h-4 w-4 mr-1 mt-0.5 shrink-0" color="#ef4444" /><span>{errors.confirmPassword}</span></p>}
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
                onClick={() => window.location.href = 'http://localhost:8000/api/auth/google'}
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
                Đăng ký bằng Google
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
    </div>
  );
}
