import { useState, useEffect } from "react";
import {
  Swords, MapPin, Clock, Calendar, Users, ArrowLeft, Trophy,
  Shield, Plus, Loader2, History, Trash2, Eye, UserCheck, Phone
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useNavigate } from "react-router-dom";
import apiService from "../services/api";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

interface Post {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
    phone?: string;
  };
  teamName?: string;
  fieldName: string;
  date: string;
  time: string;
  location: string;
  currentPlayers?: number;
  neededPlayers?: number;
  skillLevel: string;
  description: string;
  type: 'teammate' | 'opponent';
  status?: string;
  createdAt?: string;
  competitionLevel?: string;
  matchType?: string;
}

// JoinRequest da duoc chap nhan
interface JoinedTeam {
  _id: string;
  post: Post;
  status: string;
  updatedAt: string;
}

type TabType = 'browse' | 'history' | 'joined';

export function FindOpponentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [joinedTeams, setJoinedTeams] = useState<JoinedTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [myPostsLoading, setMyPostsLoading] = useState(false);
  const [joinedLoading, setJoinedLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('browse');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  // Fetch khi chuyen tab
  useEffect(() => {
    if (activeTab === 'history' && user) {
      fetchMyPosts();
    }
    if (activeTab === 'joined' && user) {
      fetchJoinedTeams();
    }
  }, [activeTab, user]);

  const fetchPosts = async () => {
    try {
      const data = await apiService.getPosts('opponent');
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      toast.error('Không thể tải danh sách đối thủ');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPosts = async () => {
    setMyPostsLoading(true);
    try {
      const data = await apiService.getMyPosts('opponent');
      setMyPosts(data);
    } catch (error) {
      console.error('Failed to fetch my posts:', error);
      toast.error('Không thể tải lịch sử bài đăng');
    } finally {
      setMyPostsLoading(false);
    }
  };

  const fetchJoinedTeams = async () => {
    setJoinedLoading(true);
    try {
      const data = await apiService.getJoinedTeams();
      // Loc cac post co type la opponent
      const opponentTeams = data.filter((item: any) => item.post && item.post.type === 'opponent');
      setJoinedTeams(opponentTeams);
    } catch (error) {
      console.error('Failed to fetch challenged teams:', error);
      toast.error('Không thể tải danh sách đội đã thách đấu');
    } finally {
      setJoinedLoading(false);
    }
  };

  const handleCreatePost = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đăng tin');
      navigate('/dang-nhap');
      return;
    }
    navigate('/tao-bai-dang?type=opponent');
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài đăng này không?')) return;
    setDeletingId(postId);
    try {
      await apiService.deletePost(postId);
      setPosts(prev => prev.filter(p => p._id !== postId));
      setMyPosts(prev => prev.filter(p => p._id !== postId));
      toast.success('Đã xóa bài đăng thành công');
    } catch (error: any) {
      toast.error(error.message || 'Không thể xóa bài đăng');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-start">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="gap-2 mb-6 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleCreatePost}
                className="bg-white text-orange-700 hover:bg-orange-50 font-semibold shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Đăng tin tìm đối thủ
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="h-14 w-14 bg-white/20 rounded-full flex items-center justify-center">
              {activeTab === 'history' ? (
                <History className="h-7 w-7" />
              ) : (
                <Swords className="h-7 w-7" />
              )}
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl">
                {activeTab === 'history' ? 'Lịch sử tìm đối'
                  : activeTab === 'joined' ? 'Đội đã thách đấu'
                    : 'Tìm đối thủ'}
              </h1>
              <p className="text-lg opacity-90 mt-1">
                {activeTab === 'history'
                  ? 'Các bài đăng tìm đối thủ của bạn'
                  : activeTab === 'joined'
                    ? 'Những đội bạn đã được chấp nhận thách đối'
                    : 'Thách đấu các đội đang tìm đối thủ'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab switcher */}
            <div className="flex bg-white/10 rounded-lg p-1 gap-1">
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'browse'
                  ? 'bg-white text-orange-700 shadow-sm'
                  : 'text-white/80 hover:text-white'
                  }`}
              >
                Tất cả bài đăng
              </button>
              {user && (
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'history'
                    ? 'bg-white text-orange-700 shadow-sm'
                    : 'text-white/80 hover:text-white'
                    }`}
                >
                  <History className="h-3.5 w-3.5" />
                  Lịch sử của tôi
                </button>
              )}
              {user && (
                <button
                  onClick={() => setActiveTab('joined')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'joined'
                    ? 'bg-white text-orange-700 shadow-sm'
                    : 'text-white/80 hover:text-white'
                    }`}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  Đội đã thách đấu
                </button>
              )}
            </div>
            <Badge className="bg-white/20 hover:bg-white/30">
              {activeTab === 'browse'
                ? `${posts.length} đội đang tìm đối`
                : activeTab === 'history'
                  ? `${myPosts.length} bài đăng của bạn`
                  : `${joinedTeams.length} đội đã thách đấu`}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
          ) : (
            <>
              {activeTab === 'browse' && (
                <>
                  {posts.map((post) => (
                    <PostCard
                      key={post._id}
                      post={post}
                      onView={() => navigate(`/chi-tiet-doi-thu/${post._id}`)}
                    />
                  ))}
                  {posts.length === 0 && (
                    <div className="text-center py-20">
                      <Swords className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="mb-2">Chưa có đội nào cần tìm đối thủ</h3>
                      <p className="text-muted-foreground mb-6">
                        Hãy tạo bài đăng để các đội khác thách đấu bạn!
                      </p>
                      <Button onClick={handleCreatePost}>Tạo bài ngay</Button>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'history' && (
                <>
                  {myPostsLoading ? (
                    <div className="flex justify-center py-20">
                      <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                    </div>
                  ) : !user ? (
                    <div className="text-center py-20">
                      <History className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="mb-2">Bạn chưa đăng nhập</h3>
                      <p className="text-muted-foreground mb-6">
                        Đăng nhập để xem lịch sử các bài đăng của bạn.
                      </p>
                      <Button onClick={() => navigate('/dang-nhap')}>Đăng nhập</Button>
                    </div>
                  ) : myPosts.length === 0 ? (
                    <div className="text-center py-20">
                      <History className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="mb-2">Bạn chưa có bài đăng nào</h3>
                      <p className="text-muted-foreground mb-6">
                        Hãy tạo bài đăng để tìm đối thủ!
                      </p>
                      <Button
                        onClick={handleCreatePost}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Đăng tin ngay
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-muted-foreground">
                          Bạn có <strong>{myPosts.length}</strong> bài đăng
                        </p>
                        <Button
                          size="sm"
                          onClick={handleCreatePost}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Đăng thêm
                        </Button>
                      </div>

                      {myPosts.map((post) => (
                        <Card key={post._id} className="hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-4 flex-1 min-w-0">
                                <div className="h-12 w-12 bg-gradient-to-br from-orange-100 to-red- relative rounded-xl flex items-center justify-center text-xl font-bold text-orange-700 flex-shrink-0">
                                  {post.teamName?.charAt(0).toUpperCase() || 'T'}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3 className="font-bold text-base">{post.teamName || 'Đội bóng'}</h3>
                                    {post.status === 'closed' ? (
                                      <Badge className="bg-gray-100 text-gray-600 text-xs">Đã đóng</Badge>
                                    ) : (
                                      <Badge className="bg-green-100 text-green-700 text-xs">Đang tìm</Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                                    {post.description}
                                  </p>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                    <div className="flex flex-col gap-2">
                                      <span className="flex items-center gap-1 ">
                                        <MapPin className="h-3 w-3" /> {post.location}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" /> {post.date}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" /> {post.time}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Shield className="h-3 w-3" /> {post.competitionLevel || 'Cấp độ'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 flex-shrink-0">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                  onClick={() => navigate(`/chi-tiet-doi-thu/${post._id}`)}
                                >
                                  <Eye className="h-3.5 w-3.5 mr-1" />
                                  Xem
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-500 border-red-200 hover:bg-red-50"
                                  disabled={deletingId === post._id}
                                  onClick={() => handleDeletePost(post._id)}
                                >
                                  {deletingId === post._id ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                                  )}
                                  Xóa
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'joined' && (
                <>
                  {joinedLoading ? (
                    <div className="flex justify-center py-20">
                      <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                    </div>
                  ) : !user ? (
                    <div className="text-center py-20">
                      <UserCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="mb-2">Bạn chưa đăng nhập</h3>
                      <p className="text-muted-foreground mb-6">Đăng nhập để xem đội đã thách đấu.</p>
                      <Button onClick={() => navigate('/dang-nhap')}>Đăng nhập</Button>
                    </div>
                  ) : joinedTeams.length === 0 ? (
                    <div className="text-center py-20">
                      <UserCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="mb-2">Bạn chưa thách đấu đội nào</h3>
                      <p className="text-muted-foreground mb-6">
                        Vào xem các bài đăng và gửi yêu cầu thách đấu!
                      </p>
                      <Button onClick={() => setActiveTab('browse')} className="bg-orange-600 hover:bg-orange-700">
                        Xem bài đăng
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        Bạn đã thách đấu và được chấp nhận <strong>{joinedTeams.length}</strong> đội
                      </p>
                      {joinedTeams.map((item) => {
                        const joinedPost = item.post;
                        if (!joinedPost) return null;
                        const leader = joinedPost.user;
                        return (
                          <Card key={item._id} className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                            <CardContent className="p-5">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                  <div className="h-12 w-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center text-xl font-bold text-green-700 flex-shrink-0">
                                    {joinedPost.teamName?.charAt(0).toUpperCase() || 'T'}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex wrap items-center gap-2 mb-1">
                                      <h3 className="font-bold text-base">{joinedPost.teamName || 'Đội bóng'}</h3>
                                      <Badge className="bg-green-100 text-green-700 text-xs">Đã thách đấu</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-1">
                                      Đội trưởng: {leader?.name || 'Không rõ'}
                                    </p>
                                    {(leader as any)?.phone && (
                                      <p className="text-sm font-medium text-orange-600 flex items-center gap-1 mb-2">
                                        <Phone className="h-3 w-3" />
                                        {(leader as any).phone}
                                      </p>
                                    )}
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                      <div className="flex flex-col gap-2">
                                        <span className="flex items-center gap-1">
                                          <MapPin className="h-3 w-3" /> {joinedPost.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Calendar className="h-3 w-3" /> {joinedPost.date}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" /> {joinedPost.time}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex-shrink-0">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                    onClick={() => navigate(`/chi-tiet-doi-thu/${joinedPost._id}`)}
                                  >
                                    <Eye className="h-3.5 w-3.5 mr-1" />
                                    Xem chi tiết
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-component: PostCard (tab Tất cả bài đăng) ─── */
function PostCard({
  post,
  onView,
}: {
  post: Post;
  onView: () => void;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Left: Team Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 bg-gradient-to-br from-orange-100 to-red-200 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 select-none">
                {post.teamName?.charAt(0).toUpperCase() || 'T'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="mb-1 text-lg font-bold">{post.teamName}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Đội trưởng: {post.user?.name}
                </p>
                <div className="flex flex-wrap gap-2">
                  {post.competitionLevel && (
                    <Badge variant="secondary">
                      <Shield className="h-3 w-3 mr-1" />
                      {post.competitionLevel}
                    </Badge>
                  )}
                  <Badge className="bg-orange-100 text-orange-700">
                    {post.matchType}
                  </Badge>
                  <Badge variant="outline">
                    <Trophy className="h-3 w-3 mr-1" />
                    {post.skillLevel}
                  </Badge>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {post.description}
            </p>

            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-orange-600 flex-shrink-0" />
                <span className="line-clamp-1">{post.location}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4 text-orange-600 flex-shrink-0" />
                <span>{post.fieldName}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 text-orange-600 flex-shrink-0" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 text-orange-600 flex-shrink-0" />
                <span>{post.time}</span>
              </div>
            </div>
          </div>

          {/* Right: Action Button */}
          <div className="flex sm:flex-col items-center justify-end gap-3">
            <Button
              onClick={onView}
              className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
              size="lg"
            >
              <Swords className="h-5 w-5 mr-2" />
              Thách đấu
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
