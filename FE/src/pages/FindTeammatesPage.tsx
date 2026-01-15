import { useState, useEffect } from "react";
import { Users, MapPin, Clock, Calendar, UserPlus, ArrowLeft, Trophy, Plus, Loader2 } from "lucide-react";
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
  };
  teamName?: string;
  fieldName: string;
  date: string;
  time: string;
  location: string;
  currentPlayers: number;
  neededPlayers: number;
  skillLevel: string; // Note: You might need to add this to your Post model if it's dynamic, or map it
  description: string;
  type: 'teammate' | 'opponent';
}

export function FindTeammatesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await apiService.getPosts('teammate');
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      toast.error('Không thể tải danh sách bài đăng');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đăng tin');
      navigate('/dang-nhap');
      return;
    }
    navigate('/tao-bai-dang?type=teammate');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
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

            <Button
              onClick={handleCreatePost}
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Đăng tin tìm người
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="h-14 w-14 bg-white/20 rounded-full flex items-center justify-center">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl">
                Tìm đồng đội
              </h1>
              <p className="text-lg opacity-90 mt-1">
                Tham gia các đội đang tìm thành viên
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm opacity-90">
            <Badge className="bg-white/20 hover:bg-white/30">
              {posts.length} đội đang tìm người
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              {posts.map((post) => (
                <Card key={post._id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* Left: Team Info */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="h-16 w-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 select-none">
                            {/* Simple avatar generation based on team name */}
                            {post.teamName?.charAt(0).toUpperCase() || 'T'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="mb-1 text-lg font-bold">{post.teamName || 'Đội bóng'}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              Đội trưởng: {post.user.name}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary">
                                <Users className="h-3 w-3 mr-1" />
                                {post.currentPlayers}/{post.currentPlayers + post.neededPlayers} người
                              </Badge>
                              <Badge className="bg-blue-100 text-blue-700">
                                Thiếu {post.neededPlayers} người
                              </Badge>
                              {/* Assuming skillLevel is stored or defaulting */}
                              <Badge variant="outline">
                                <Trophy className="h-3 w-3 mr-1" />
                                {post.skillLevel || 'Mọi trình độ'}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {post.description}
                        </p>

                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            <span className="line-clamp-1">{post.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            <span>{post.fieldName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            <span>{post.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                            <span>{post.time}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Action Button */}
                      <div className="flex sm:flex-col items-center justify-end gap-3">
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={() => navigate(`/chi-tiet-bai-dang/${post._id}`)}
                        >
                          Chi tiết
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {posts.length === 0 && (
                <div className="text-center py-20">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="mb-2">Chưa có đội nào cần tìm đồng đội</h3>
                  <p className="text-muted-foreground mb-6">
                    Hãy là người đầu tiên tạo bài đăng tìm đồng đội!
                  </p>
                  <Button onClick={handleCreatePost}>
                    Đăng tin ngay
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
