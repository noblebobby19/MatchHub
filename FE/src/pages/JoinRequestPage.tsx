import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import { toast } from 'sonner';

export function JoinRequestPage() {
    const { id } = useParams(); // Post ID
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [postType, setPostType] = useState<string>('teammate');

    useEffect(() => {
        const fetchPostType = async () => {
            if (id) {
                try {
                    const data = await apiService.getPostById(id);
                    if (data.post) {
                        setPostType(data.post.type);
                    }
                } catch (error) {
                    console.error("Failed to fetch post type");
                }
            }
        };
        fetchPostType();
    }, [id]);

    // Pre-fill if user info available
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: '', // Need to add phone to User model/context if we want to pre-fill
        skillLevel: 'Trung bình',
        description: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await apiService.createJoinRequest({
                postId: id,
                ...formData
            });
            toast.success('Gửi yêu cầu thành công! Chủ đội sẽ liên hệ với bạn.');
            // Navigate based on postType
            if (postType === 'opponent') {
                navigate(`/chi-tiet-doi-thu/${id}`);
            } else {
                navigate(`/chi-tiet-bai-dang/${id}`);
            }
        } catch (error: any) {
            toast.error(error.message || 'Gửi yêu cầu thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <Button variant="ghost" onClick={() => navigate(-1)} className="w-fit pl-0 mb-2 hover:bg-transparent hover:underline">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại
                    </Button>
                    <CardTitle className={`text-2xl ${postType === 'opponent' ? 'text-red-700' : 'text-blue-700'}`}>
                        {postType === 'opponent' ? 'Gửi lời thách đấu' : 'Xin tham gia đội'}
                    </CardTitle>
                    <CardDescription>
                        {postType === 'opponent'
                            ? 'Gửi thông tin đội của bạn cho đối thủ. Họ sẽ xem xét và phản hồi lại.'
                            : 'Gửi thông tin của bạn cho đội trưởng. Họ sẽ xem xét và phản hồi lại cho bạn.'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Họ và tên</Label>
                            <Input
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Số điện thoại liên hệ</Label>
                            <Input
                                required
                                type="tel"
                                placeholder="0912345678"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Trình độ đá</Label>
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
                                    <SelectItem value="Hay">Hay</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Ghi chú (Vị trí sở trường, lời nhắn...)</Label>
                            <Textarea
                                placeholder="Ví dụ: Em đá tiền vệ, chỉ đá được tối thứ 7..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                                Hủy
                            </Button>
                            <Button
                                type="submit"
                                variant={postType === 'opponent' ? 'outline' : 'default'}
                                className={`flex-1 ${postType === 'opponent'
                                    ? 'border-2 border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold uppercase tracking-wide'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                disabled={loading}
                            >
                                {loading ? 'Đang gửi...' : (postType === 'opponent' ? 'Gửi thách đấu' : 'Gửi yêu cầu')}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
