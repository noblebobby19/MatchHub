import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Clock, Copy, CheckCircle2, ArrowLeft, XCircle, Banknote, RefreshCw } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";

export function BankingPaymentPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // State từ navigate
    const paymentData = location.state as {
        bookingCode: string;
        depositAmount: number;
        expireAt: string;
        bookingId: string;
        bankConfig: {
            bankCode: string;
            accountNumber: string;
            accountName: string;
        };
        bookingInfo: {
            fieldName: string;
            date: string;
            time: string;
            amountValue: number;
        };
    } | null;

    const [timeLeft, setTimeLeft] = useState(0);
    const [isExpired, setIsExpired] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (!paymentData) {
            toast.error("Không tìm thấy thông tin thanh toán");
            navigate('/tim-san');
            return;
        }

        const expire = new Date(paymentData.expireAt).getTime();

        const updateTimer = () => {
            const remaining = Math.max(0, Math.floor((expire - Date.now()) / 1000));
            setTimeLeft(remaining);
            if (remaining <= 0) {
                setIsExpired(true);
                if (timerRef.current) clearInterval(timerRef.current);
            }
        };

        updateTimer();
        timerRef.current = setInterval(updateTimer, 1000);
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!paymentData) return null;

    const { bookingCode, depositAmount, bankConfig, bookingInfo } = paymentData;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const countdownColor = timeLeft < 60 ? "text-red-500" : timeLeft < 180 ? "text-orange-500" : "text-green-600";

    // URL QR VietQR
    const qrUrl = `https://img.vietqr.io/image/${bankConfig.bankCode}-${bankConfig.accountNumber}-compact.png?amount=${depositAmount}&addInfo=${encodeURIComponent(bookingCode)}&accountName=${encodeURIComponent(bankConfig.accountName)}`;

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            if (label === "code") setCopiedCode(true);
            toast.success(`Đã copy ${label === "code" ? "mã đặt sân" : "số tiền"}!`);
            setTimeout(() => setCopiedCode(false), 2000);
        });
    };

    const handleDone = () => {
        toast.info("Đơn của bạn đang chờ chủ sân xác nhận. Chúng tôi sẽ thông báo qua email khi xác nhận xong.");
        navigate('/lich-su-dat-san');
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/lich-su-dat-san')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Thanh toán chuyển khoản</h1>
                        <p className="text-sm text-muted-foreground">Quét QR để chuyển tiền cọc</p>
                    </div>
                </div>

                {/* Countdown */}
                <Card className={`mb-4 border-2 ${isExpired ? "border-red-400 bg-red-50" : timeLeft < 60 ? "border-orange-400 bg-orange-50" : "border-green-300 bg-green-50"}`}>
                    <CardContent className="py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {isExpired ? <XCircle className="h-5 w-5 text-red-500" /> : <Clock className="h-5 w-5 text-green-600" />}
                            <span className="font-medium text-sm">
                                {isExpired ? "Đã hết hạn thanh toán" : "Thời gian còn lại:"}
                            </span>
                        </div>
                        {!isExpired && (
                            <span className={`font-mono font-bold text-2xl ${countdownColor}`}>
                                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                            </span>
                        )}
                    </CardContent>
                </Card>

                {isExpired ? (
                    /* Hết hạn */
                    <Card className="text-center py-8">
                        <CardContent>
                            <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-red-600 mb-2">Đã hết hạn thanh toán</h2>
                            <p className="text-muted-foreground mb-6">Đơn đặt sân đã bị hủy do không thanh toán trong 15 phút. Vui lòng tạo đơn mới để tiếp tục.</p>
                            <Button onClick={() => navigate('/tim-san')} className="bg-green-600 hover:bg-green-700 gap-2">
                                <RefreshCw className="h-4 w-4" />
                                Đặt sân lại
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* QR Code */}
                        <Card className="mb-4">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-center text-base">Quét mã QR để thanh toán</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center gap-4">
                                <div className="border-4 border-green-500 rounded-2xl p-2 bg-white shadow-lg">
                                    <img
                                        src={qrUrl}
                                        alt="QR chuyển khoản MB Bank"
                                        className="w-56 h-56 object-contain"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/224x224?text=QR+Error';
                                        }}
                                    />
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Banknote className="h-4 w-4 text-green-600" />
                                    <span>MB Bank – {bankConfig.accountName}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thông tin chuyển khoản */}
                        <Card className="mb-4">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Thông tin chuyển khoản</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <InfoRow label="Ngân hàng" value="MB Bank" />
                                <InfoRow label="Số tài khoản" value={bankConfig.accountNumber} />
                                <InfoRow label="Chủ tài khoản" value={bankConfig.accountName} />
                                <div className="flex items-center justify-between py-2 border rounded-lg px-3 bg-yellow-50 border-yellow-300">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Số tiền cọc</p>
                                        <p className="font-bold text-lg text-yellow-700">{depositAmount.toLocaleString('vi-VN')}đ</p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleCopy(String(depositAmount), "số tiền")}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex items-center justify-between py-2 border rounded-lg px-3 bg-blue-50 border-blue-300">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Nội dung chuyển khoản (bắt buộc)</p>
                                        <p className="font-bold text-blue-700 font-mono">{bookingCode}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => handleCopy(bookingCode, "code")}>
                                        {copiedCode ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thông tin đặt sân */}
                        <Card className="mb-4 bg-gray-50">
                            <CardContent className="pt-4 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Sân:</span>
                                    <span className="font-medium">{bookingInfo.fieldName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Ngày:</span>
                                    <span className="font-medium">{bookingInfo.date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Giờ:</span>
                                    <span className="font-medium">{bookingInfo.time}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Tổng tiền sân:</span>
                                    <span className="font-medium">{bookingInfo.amountValue?.toLocaleString('vi-VN')}đ</span>
                                </div>
                                <div className="flex justify-between border-t pt-2">
                                    <span className="font-semibold">Tiền cọc cần chuyển:</span>
                                    <span className="font-bold text-green-600">{depositAmount.toLocaleString('vi-VN')}đ</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Hướng dẫn */}
                        <Card className="mb-6 border-blue-200 bg-blue-50">
                            <CardContent className="pt-4">
                                <p className="text-sm font-semibold text-blue-800 mb-2">📋 Lưu ý quan trọng:</p>
                                <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                                    <li>Nhập đúng <strong>nội dung chuyển khoản</strong> là mã đặt sân</li>
                                    <li>Chuyển đúng số tiền cọc: <strong>{depositAmount.toLocaleString('vi-VN')}đ</strong></li>
                                    <li>Chủ sân sẽ xác nhận trong vòng vài phút sau khi nhận tiền</li>
                                    <li>Bạn sẽ nhận email xác nhận khi đơn được duyệt</li>
                                </ul>
                            </CardContent>
                        </Card>

                        {/* CTA */}
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700 h-12 text-base"
                            onClick={handleDone}
                        >
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            Tôi đã chuyển khoản – Xem lịch sử đặt sân
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}

// Helper component
function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{label}:</span>
            <span className="text-sm font-medium">{value}</span>
        </div>
    );
}
