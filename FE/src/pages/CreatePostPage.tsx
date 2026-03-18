import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Users, Save, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { toast } from 'sonner';

export function CreatePostPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const type = searchParams.get('type') || 'teammate';
    const isTeammate = type === 'teammate';
    const editId = searchParams.get('id');
    const isEditMode = !!editId;

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        teamName: '',
        fieldId: '',
        fieldName: '',
        location: '',
        date: '',
        time: '',
        currentPlayers: isTeammate ? 1 : 7,
        neededPlayers: isTeammate ? 1 : 0,
        matchType: 'Sân 7 người',
        competitionLevel: 'Giao hữu',
        skillLevel: 'Trung bình',
        description: '',
        phone: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [fields, setFields] = useState<any[]>([]);

    useEffect(() => {
        const fetchFields = async () => {
            try {
                const data = await apiService.getFields();
                setFields(data || []);
            } catch (error) {
                console.error('Lỗi khi tải danh sách sân:', error);
            }
        };
        fetchFields();
    }, []);

    // Fetch existing post if editing
    useState(() => {
        if (isEditMode && editId) {
            const fetchPost = async () => {
                try {
                    const data = await apiService.getPostById(editId);
                    const post = data.post;
                    setFormData({
                        teamName: post.teamName || '',
                        fieldId: post.fieldId?._id || post.fieldId || '',
                        fieldName: post.fieldName,
                        location: post.location,
                        date: post.date,
                        time: post.time,
                        currentPlayers: post.currentPlayers,
                        neededPlayers: post.neededPlayers,
                        matchType: post.matchType || 'Sân 7 người',
                        competitionLevel: post.competitionLevel || 'Giao hữu',
                        skillLevel: post.skillLevel,
                        description: post.description,
                        phone: post.phone || ''
                    });
                } catch (error) {
                    toast.error('Không thể tải thông tin bài đăng');
                    navigate(-1);
                }
            };
            fetchPost();
        }
    }); // Run once (technically stricter react would use useEffect but useState with no deps or useEffect [] works for mount)

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.teamName?.trim()) {
            newErrors.teamName = "Vui lòng nhập tên đội";
        } else if (formData.teamName.trim().length < 3) {
            newErrors.teamName = "Tên đội phải có ít nhất 3 ký tự";
        } else if (formData.teamName.trim().length > 100) {
            newErrors.teamName = "Tên đội không được vượt quá 100 ký tự";
        }

        if (!formData.fieldId) {
            newErrors.fieldId = "Vui lòng chọn sân bóng";
        }

        if (!formData.date) {
            newErrors.date = "Vui lòng chọn ngày đá";
        } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selectedDate = new Date(formData.date);
            selectedDate.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                newErrors.date = "Ngày đá không được nhỏ hơn ngày hiện tại";
            }
        }

        if (!formData.time) {
            newErrors.time = "Vui lòng chọn giờ đá";
        } else {
            // Basic check for time format, allowing standard HH:MM
            const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](\s*-\s*([01]?[0-9]|2[0-3]):[0-5][0-9])?$/;
            if (!timeRegex.test(formData.time.trim())) {
                newErrors.time = "Giờ đá không hợp lệ";
            }
        }

        if ((formData.currentPlayers as any) === '' || formData.currentPlayers === null || formData.currentPlayers === undefined) {
            newErrors.currentPlayers = "Vui lòng nhập số người hiện có";
        } else if (isNaN(Number(formData.currentPlayers))) {
            newErrors.currentPlayers = "Số người phải là số";
        } else if (Number(formData.currentPlayers) <= 0) {
            newErrors.currentPlayers = "Số người không được nhỏ hơn 1";
        }

        if (isTeammate) {
            if ((formData.neededPlayers as any) === '' || formData.neededPlayers === null || formData.neededPlayers === undefined) {
                newErrors.neededPlayers = "Vui lòng nhập số người cần thêm";
            } else if (isNaN(Number(formData.neededPlayers))) {
                newErrors.neededPlayers = "Số người phải là số";
            } else if (Number(formData.neededPlayers) < 1) {
                newErrors.neededPlayers = "Số người không được nhỏ hơn 1";
            }
        }

        // Phone Validation (10 digits Vietnamese phone format prefix 03/05/07/08/09)
        const phoneRegex = /^(03|05|07|08|09)+([0-9]{8})$/;
        if (!formData.phone?.trim()) {
            newErrors.phone = "Vui lòng nhập số điện thoại";
        } else if (formData.phone.trim().length !== 10) {
            newErrors.phone = "Số điện thoại phải có đúng 10 số";
        } else if (!phoneRegex.test(formData.phone.trim())) {
            newErrors.phone = "Số điện thoại không hợp lệ";
        }

        if (formData.description && formData.description.length > 200) {
            newErrors.description = "Ghi chú không được vượt quá 200 ký tự";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (!validateForm()) return;

        setIsLoading(true);
        try {
            let redirectId;
            if (isEditMode && editId) {
                await apiService.updatePost(editId, { ...formData, type });
                toast.success('Cập nhật bài đăng thành công!');
                redirectId = editId;
            } else {
                const res = await apiService.createPost({ ...formData, type });
                toast.success('Đăng bài thành công!');
                redirectId = res._id || res.post?._id;
            }

            if (redirectId) {
                navigate(type === 'opponent' ? `/chi-tiet-doi-thu/${redirectId}` : `/chi-tiet-bai-dang/${redirectId}`);
            } else {
                navigate(isTeammate ? '/tim-dong-doi' : '/tim-doi-thu');
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || (isEditMode ? 'Cập nhật thất bại' : 'Đăng bài thất bại'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-2xl">
                <Button
                    variant="ghost"
                    onClick={() => navigate(-1)}
                    className="mb-6 hover:bg-gray-100"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Quay lại
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <Users className="h-6 w-6 text-blue-600" />
                            {isEditMode ? 'Cập nhật bài đăng' : (isTeammate ? 'Đăng tin tìm đồng đội' : 'Đăng tin tìm đối thủ')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label>Tên đội / Nhóm</Label>
                                <Input
                                    required={false}
                                    placeholder="Ví dụ: FC Rồng Lửa"
                                    value={formData.teamName}
                                    onChange={(e) => {
                                        setFormData({ ...formData, teamName: e.target.value });
                                        if (errors.teamName) setErrors({ ...errors, teamName: '' });
                                    }}
                                />
                                {errors.teamName && <p style={{ color: 'red' }} className="text-sm mt-1">{errors.teamName}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Sân bóng (Dự kiến)</Label>
                                <Select
                                    value={formData.fieldId}
                                    onValueChange={(val) => {
                                        const selectedField = fields.find(f => f._id === val);
                                        setFormData({
                                            ...formData,
                                            fieldId: val,
                                            fieldName: selectedField ? selectedField.name : (fields.length === 0 ? formData.fieldName : ''),
                                            location: selectedField ? (selectedField.fullAddress || selectedField.location || '') : (fields.length === 0 ? formData.location : '')
                                        });
                                        if (errors.fieldId) setErrors({ ...errors, fieldId: '' });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn sân bóng..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {fields.length === 0 && formData.fieldId && (
                                            <SelectItem value={formData.fieldId}>
                                                {formData.fieldName}
                                            </SelectItem>
                                        )}
                                        {fields.map(field => (
                                            <SelectItem key={field._id} value={field._id}>
                                                {field.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.fieldId && <p style={{ color: 'red' }} className="text-sm mt-1">{errors.fieldId}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Ngày đá</Label>
                                    <Input
                                        required={false}
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => {
                                            setFormData({ ...formData, date: e.target.value });
                                            if (errors.date) setErrors({ ...errors, date: '' });
                                        }}
                                    />
                                    {errors.date && <p style={{ color: 'red' }} className="text-sm mt-1">{errors.date}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Giờ đá</Label>
                                    <Input
                                        required={false}
                                        type="time" // Simple text for range like "18:00 - 19:00" or just time input
                                        placeholder="18:00 - 19:30"
                                        value={formData.time}
                                        onChange={(e) => {
                                            setFormData({ ...formData, time: e.target.value });
                                            if (errors.time) setErrors({ ...errors, time: '' });
                                        }}
                                    />
                                    {errors.time && <p style={{ color: 'red' }} className="text-sm mt-1">{errors.time}</p>}
                                </div>
                            </div>

                            {isTeammate ? (
                                /* Fields specific to Teammate Finding */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Đội hiện có (người)</Label>
                                        <Input
                                            required={false}
                                            type="number"
                                            min={0}
                                            value={formData.currentPlayers}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFormData({ ...formData, currentPlayers: val === '' ? '' as any : parseInt(val) });
                                                if (errors.currentPlayers) setErrors({ ...errors, currentPlayers: '' });
                                            }}
                                        />
                                        {errors.currentPlayers && <p style={{ color: 'red' }} className="text-sm mt-1">{errors.currentPlayers}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Cần thêm (người)</Label>
                                        <Input
                                            required={false}
                                            type="number"
                                            min={0}
                                            value={formData.neededPlayers}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFormData({ ...formData, neededPlayers: val === '' ? '' as any : parseInt(val) });
                                                if (errors.neededPlayers) setErrors({ ...errors, neededPlayers: '' });
                                            }}
                                        />
                                        {errors.neededPlayers && <p style={{ color: 'red' }} className="text-sm mt-1">{errors.neededPlayers}</p>}
                                    </div>
                                </div>
                            ) : (
                                /* Fields specific to Opponent Finding */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Số lượng người (Phe mình)</Label>
                                        <Input
                                            required={false}
                                            type="number"
                                            min={0}
                                            value={formData.currentPlayers}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFormData({ ...formData, currentPlayers: val === '' ? '' as any : parseInt(val) });
                                                if (errors.currentPlayers) setErrors({ ...errors, currentPlayers: '' });
                                            }}
                                        />
                                        {errors.currentPlayers && <p style={{ color: 'red' }} className="text-sm mt-1">{errors.currentPlayers}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Hình thức đấu</Label>
                                        <Select
                                            value={formData.competitionLevel}
                                            onValueChange={(val) => setFormData({ ...formData, competitionLevel: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Giao hữu">Giao hữu</SelectItem>
                                                <SelectItem value="Giải đấu">Giải đấu</SelectItem>
                                                <SelectItem value="Kèo căng">Kèo căng</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Loại sân</Label>
                                    <Select
                                        value={formData.matchType} // Reusing matchType mostly for 'Sân 5/7/11'
                                        onValueChange={(val) => setFormData({ ...formData, matchType: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn loại sân" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Sân 5 người">Sân 5 người</SelectItem>
                                            <SelectItem value="Sân 7 người">Sân 7 người</SelectItem>
                                            <SelectItem value="Sân 11 người">Sân 11 người</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Trình độ mong muốn</Label>
                                    <Select
                                        value={formData.skillLevel}
                                        onValueChange={(val) => setFormData({ ...formData, skillLevel: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Mới bắt đầu">Mới bắt đầu</SelectItem>
                                            <SelectItem value="Trung bình">Trung bình</SelectItem>
                                            <SelectItem value="Khá">Khá</SelectItem>
                                            <SelectItem value="Vui là chính">Vui là chính</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Số điện thoại liên hệ</Label>
                                <Input
                                    required={false}
                                    maxLength={10}
                                    placeholder="Ví dụ: 0912345678"
                                    value={formData.phone}
                                    onChange={(e) => {
                                        // Chỉ cho phép nhập số
                                        const val = e.target.value.replace(/[^0-9]/g, '');
                                        setFormData({ ...formData, phone: val });
                                        if (errors.phone) setErrors({ ...errors, phone: '' });
                                    }}
                                />
                                {errors.phone && <p style={{ color: 'red' }} className="text-sm mt-1">{errors.phone}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label>Ghi chú thêm (Yêu cầu, thái độ...)</Label>
                                <Textarea
                                    placeholder="Ví dụ: Đá vui vẻ, không chơi xấu, share tiền sân..."
                                    className="min-h-[100px]"
                                    value={formData.description}
                                    onChange={(e) => {
                                        setFormData({ ...formData, description: e.target.value });
                                        if (errors.description) setErrors({ ...errors, description: '' });
                                    }}
                                />
                                {errors.description && <p style={{ color: 'red' }} className="text-sm mt-1">{errors.description}</p>}
                            </div>

                            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {isEditMode ? 'Đang cập nhật...' : 'Đang đăng tin...'}
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        {isEditMode ? 'Lưu thay đổi' : 'Đăng tin ngay'}
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
