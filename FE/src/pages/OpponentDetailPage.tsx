import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, MapPin, Calendar, Clock, Trophy, Phone, CheckCircle, XCircle, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import apiService from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export function OpponentDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [post, setPost] = useState<any>(null);
    const [requests, setRequests] = useState<any[]>([]); // Only for owner
    const [myRequest, setMyRequest] = useState<any>(null); // For non-owner
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPostDetails();
    }, [id]);

    const fetchPostDetails = async () => {
        try {
            if (!id) return;
            const data = await apiService.getPostById(id);
            setPost(data.post);
            if (data.requests) {
                setRequests(data.requests);
            }
            if (data.myRequest) {
                setMyRequest(data.myRequest);
            }
        } catch (error) {
            console.error('Failed to fetch post details:', error);
            toast.error('Không tìm thấy bài đăng');
            navigate('/tim-doi-thu');
        } finally {
            setLoading(false);
        }
    };

    const handleChallenge = () => {
        if (!user) {
            toast.error('Vui lòng đăng nhập để gửi lời thách đấu');
            navigate('/dang-nhap');
            return;
        }
        navigate(`/xin-tham-gia/${id}`);
    };

    const handleEdit = () => {
        navigate(`/tao-bai-dang?type=opponent&id=${post._id}`);
    };

    const handleDelete = async () => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bài đăng này không? Hành động này không thể hoàn tác.')) {
            try {
                await apiService.deletePost(post._id);
                toast.success('Đã xóa bài đăng');
                navigate('/tim-doi-thu');
            } catch (error) {
                toast.error('Xóa thất bại');
            }
        }
    };

    const handleRequestAction = async (requestId: string, status: 'accepted' | 'rejected') => {
        try {
            await apiService.updateJoinRequestStatus(requestId, status);
            toast.success(`Đã ${status === 'accepted' ? 'chấp nhận' : 'từ chối'} lời thách đấu`);
            fetchPostDetails(); // Refresh list
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
    if (!post) return null;

    const isOwner = user && post.user._id === user.id;

    // Simplified CTA logic specifically for Opponent
    const renderCTA = () => {
        if (isOwner) {
            return (
                <div className="space-y-3">
                    <div className="bg-yellow-50 text-yellow-800 p-3 rounded text-sm flex gap-2">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p>Bạn là chủ bài đăng. Hãy quản lý các lời thách đấu bên dưới.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="flex-1" onClick={handleEdit}>
                            <Edit className="h-4 w-4 mr-2" />
                            Sửa
                        </Button>
                        <Button variant="destructive" className="flex-1" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Xóa
                        </Button>
                    </div>
                </div>
            );
        }

        if (myRequest?.status === 'accepted') {
            return (
                <Button disabled className="w-full bg-green-600 text-white py-6 text-lg shadow-none opacity-100 cursor-not-allowed">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Đã chấp nhận đấu
                </Button>
            );
        }

        if (myRequest?.status === 'pending') {
            return (
                <Button disabled variant="outline" className="w-full border-2 border-orange-500 text-orange-600 bg-orange-50 py-6 text-lg shadow-none opacity-100 cursor-not-allowed font-medium">
                    <Clock className="mr-2 h-5 w-5" />
                    Đang chờ phản hồi
                </Button>
            );
        }

        return (
            <Button
                onClick={handleChallenge}
                variant="outline"
                className="w-full border-2 border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700 py-6 text-lg shadow-lg font-bold uppercase tracking-wide"
            >
                Thách đấu ngay
            </Button>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Quay lại tìm đối thủ
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Post Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-2xl mb-2">{post.teamName || 'Chi tiết bài đăng'}</CardTitle>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Users className="h-4 w-4" />
                                            <span>Đăng bởi: {post.user.name}</span>
                                        </div>
                                    </div>
                                    <Badge className="text-lg px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 border-red-200">
                                        Tìm đối thủ
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Ngày đá</p>
                                            <p className="font-medium">{post.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Giờ đá</p>
                                            <p className="font-medium">{post.time}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Sân bóng</p>
                                            <p className="font-medium">{post.fieldName}</p>
                                            <p className="text-xs text-muted-foreground">{post.location}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Trophy className="h-5 w-5 text-red-600" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Trình độ</p>
                                            <p className="font-medium">{post.skillLevel}</p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <h3 className="font-semibold mb-2">Thông tin trận đấu</h3>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <Badge variant="outline" className="text-base py-1">
                                            {post.matchType}
                                        </Badge>
                                        {post.competitionLevel && (
                                            <Badge variant="secondary" className="text-base py-1">
                                                {post.competitionLevel}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                                        "{post.description}"
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Challenge Requests List (Only for Owner) */}
                        {isOwner && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-xl">Lời thách đấu ({requests.length})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {requests.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-8">Chưa có lời thách đấu nào.</p>
                                    ) : (
                                        <div className="space-y-4">
                                            {requests.map((req) => (
                                                <div key={req._id} className="border rounded-lg p-4 flex justify-between items-start bg-white shadow-sm">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-lg">{req.name}</span>
                                                            <Badge variant={req.status === 'pending' ? 'outline' : req.status === 'accepted' ? 'default' : 'destructive'}>
                                                                {req.status === 'pending' ? 'Chờ phản hồi' : req.status === 'accepted' ? 'Đã chấp nhận' : 'Đã từ chối'}
                                                            </Badge>
                                                        </div>
                                                        <div className="text-sm text-muted-foreground space-y-1">
                                                            <p className="flex items-center gap-1"><Phone className="h-3 w-3" /> {req.phone}</p>
                                                            <p>Trình độ: {req.skillLevel}</p>
                                                            <p className="italic">"{req.description}"</p>
                                                        </div>
                                                    </div>

                                                    {req.status === 'pending' && (
                                                        <div className="flex gap-2">
                                                            <Button size="sm" onClick={() => handleRequestAction(req._id, 'accepted')} className="bg-green-600 hover:bg-green-700">
                                                                <CheckCircle className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="sm" variant="destructive" onClick={() => handleRequestAction(req._id, 'rejected')}>
                                                                <XCircle className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: CTA */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-24">
                            <CardContent className="p-6 space-y-4">
                                <div className="text-center">
                                    <h3 className="font-semibold text-lg mb-1">Đang tìm đối thủ</h3>
                                    <p className="text-sm text-muted-foreground">Thách đấu ngay!</p>
                                </div>

                                {renderCTA()}

                                <Separator />

                                <div className="space-y-3 pt-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Trạng thái</span>
                                        <span className="font-medium text-green-600">Đang nhận kèo</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Chi phí</span>
                                        <span className="font-medium">Thỏa thuận</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
