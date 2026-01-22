import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, CheckCircle, Loader2, KeyRound, Timer } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import apiService from '../services/api';
import { toast } from 'sonner';

export function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [countdown, setCountdown] = useState(0);

    // Focus OTP input
    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) return; // Prevent multiple chars
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
        const newOtp = [...otp];
        pastedData.forEach((char, index) => {
            if (index < 6) newOtp[index] = char;
        });
        setOtp(newOtp);
    };

    // Countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return toast.error('Vui lòng nhập email');

        setLoading(true);
        try {
            await apiService.forgotPassword(email);
            setStep(2);
            setCountdown(60);
            toast.success('Mã OTP đã được gửi đến email của bạn');
        } catch (error: any) {
            toast.error(error.message || 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        const otpString = otp.join('');
        if (otpString.length !== 6) return toast.error('Vui lòng nhập đủ mã OTP');

        setLoading(true);
        try {
            await apiService.verifyOtp(email, otpString);
            setStep(3);
            toast.success('Xác thực thành công');
        } catch (error: any) {
            toast.error(error.message || 'Mã OTP không đúng');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) return toast.error('Mật khẩu phải có ít nhất 8 ký tự');
        if (password !== confirmPassword) return toast.error('Mật khẩu nhập lại không khớp');

        setLoading(true);
        try {
            await apiService.resetPassword(email, otp.join(''), password);
            setStep(4);
            toast.success('Đặt lại mật khẩu thành công');
        } catch (error: any) {
            toast.error(error.message || 'Không thể đặt lại mật khẩu');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (countdown > 0) return;
        setLoading(true);
        try {
            await apiService.forgotPassword(email);
            setCountdown(60);
            toast.success('Đã gửi lại mã OTP');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <Card className="shadow-xl w-full max-w-md">
            <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <KeyRound className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Quên mật khẩu</CardTitle>
                <CardDescription>Nhập email đã đăng ký để nhận mã xác thực</CardDescription>
            </CardHeader>
            <form onSubmit={handleSendOtp}>
                <CardContent className="space-y-4">
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
                                autoFocus
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Gửi mã OTP'}
                    </Button>
                    <Button variant="ghost" type="button" className="w-full" onClick={() => navigate('/dang-nhap')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Quay về đăng nhập
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );

    const renderStep2 = () => (
        <Card className="shadow-xl w-full max-w-md">
            <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Mail className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Xác thực Email</CardTitle>
                <CardDescription>
                    Mã OTP đã được gửi đến <span className="font-medium text-green-700">{email}</span>
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleVerifyOtp}>
                <CardContent className="space-y-6">
                    <div className="flex justify-center gap-2">
                        {otp.map((digit, index) => (
                            <Input
                                key={index}
                                id={`otp-${index}`}
                                className="w-12 h-12 text-center text-lg font-bold"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                autoFocus={index === 0}
                            />
                        ))}
                    </div>
                    <div className="text-center">
                        {countdown > 0 ? (
                            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                                <Timer className="w-4 h-4" /> Gửi lại mã sau {countdown}s
                            </p>
                        ) : (
                            <Button
                                type="button"
                                variant="link"
                                className="text-green-600 h-auto p-0"
                                onClick={handleResendOtp}
                                disabled={loading}
                            >
                                Gửi lại mã mới
                            </Button>
                        )}
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading || otp.join('').length !== 6}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Xác nhận'}
                    </Button>
                    <Button variant="ghost" type="button" className="w-full" onClick={() => setStep(1)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại bước 1
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );

    const renderStep3 = () => (
        <Card className="shadow-xl w-full max-w-md">
            <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Lock className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Đặt lại mật khẩu</CardTitle>
                <CardDescription>Nhập mật khẩu mới cho tài khoản của bạn</CardDescription>
            </CardHeader>
            <form onSubmit={handleResetPassword}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Mật khẩu mới</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="Ít nhất 8 ký tự"
                                className="pl-10"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Nhập lại mật khẩu</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Xác nhận mật khẩu"
                                className="pl-10"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Đặt lại mật khẩu'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );

    const renderStep4 = () => (
        <Card className="shadow-xl w-full max-w-md">
            <CardContent className="pt-8 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Thành công!</h2>
                <p className="text-muted-foreground">
                    Mật khẩu của bạn đã được đặt lại thành công. Hãy sử dụng mật khẩu mới để đăng nhập.
                </p>
                <Button
                    className="w-full bg-green-600 hover:bg-green-700 mt-4"
                    onClick={() => navigate('/dang-nhap')}
                >
                    Đăng nhập ngay
                </Button>
            </CardContent>
        </Card>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
        </div>
    );
}
