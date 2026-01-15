import { useState } from 'react';
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
        fieldName: '',
        location: '',
        date: '',
        time: '',
        currentPlayers: isTeammate ? 1 : 7,
        neededPlayers: isTeammate ? 1 : 0,
        matchType: 'Sân 7 người',
        competitionLevel: 'Giao hữu',
        skillLevel: 'Trung bình',
        description: ''
    });

    // Fetch existing post if editing
    useState(() => {
        if (isEditMode && editId) {
            const fetchPost = async () => {
                try {
                    const data = await apiService.getPostById(editId);
                    const post = data.post;
                    setFormData({
                        teamName: post.teamName || '',
                        fieldName: post.fieldName,
                        location: post.location,
                        date: post.date,
                        time: post.time,
                        currentPlayers: post.currentPlayers,
                        neededPlayers: post.neededPlayers,
                        matchType: post.matchType || 'Sân 7 người',
                        competitionLevel: post.competitionLevel || 'Giao hữu',
                        skillLevel: post.skillLevel,
                        description: post.description
                    });
                } catch (error) {
                    toast.error('Không thể tải thông tin bài đăng');
                    navigate(-1);
                }
            };
            fetchPost();
        }
    }); // Run once (technically stricter react would use useEffect but useState with no deps or useEffect [] works for mount)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

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
                                    required
                                    placeholder="Ví dụ: FC Rồng Lửa"
                                    value={formData.teamName}
                                    onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Sân bóng (Dự kiến)</Label>
                                    <Input
                                        required
                                        placeholder="Ví dụ: Sân Xuân Khánh"
                                        value={formData.fieldName}
                                        onChange={(e) => setFormData({ ...formData, fieldName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Địa chỉ sân</Label>
                                    <Input
                                        required
                                        placeholder="Quận/Huyện"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Ngày đá</Label>
                                    <Input
                                        required
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Giờ đá</Label>
                                    <Input
                                        required
                                        type="time" // Simple text for range like "18:00 - 19:00" or just time input
                                        placeholder="18:00 - 19:30"
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    />
                                </div>
                            </div>

                            {isTeammate ? (
                                /* Fields specific to Teammate Finding */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Đội hiện có (người)</Label>
                                        <Input
                                            required
                                            type="number"
                                            min={1}
                                            value={formData.currentPlayers}
                                            onChange={(e) => setFormData({ ...formData, currentPlayers: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Cần thêm (người)</Label>
                                        <Input
                                            required
                                            type="number"
                                            min={1}
                                            value={formData.neededPlayers}
                                            onChange={(e) => setFormData({ ...formData, neededPlayers: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            ) : (
                                /* Fields specific to Opponent Finding */
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Số lượng người (Phe mình)</Label>
                                        <Input
                                            required
                                            type="number"
                                            min={1}
                                            value={formData.currentPlayers}
                                            onChange={(e) => setFormData({ ...formData, currentPlayers: parseInt(e.target.value) })}
                                        />
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
                                <Label>Ghi chú thêm (Yêu cầu, thái độ...)</Label>
                                <Textarea
                                    placeholder="Ví dụ: Đá vui vẻ, không chơi xấu, share tiền sân..."
                                    className="min-h-[100px]"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
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
