import { Users, MapPin, Clock, Calendar, UserPlus, ArrowLeft, Trophy } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

const teammateRequests = [
  {
    id: 1,
    teamName: "Đội Rồng Xanh",
    leader: "Nguyễn Văn A",
    currentPlayers: 4,
    neededPlayers: 3,
    fieldType: "Sân 7 người",
    location: "Sân An Hòa, Quận Ninh Kiều",
    date: "Chủ nhật, 08/12/2024",
    time: "17:00 - 18:00",
    skillLevel: "Trung bình",
    description: "Cần 3 người chơi cho trận giao hữu cuối tuần, ai có hứng thú liên hệ nhé!",
    avatar: "🐉"
  },
  {
    id: 2,
    teamName: "Đội Báo Đen",
    leader: "Trần Văn B",
    currentPlayers: 5,
    neededPlayers: 2,
    fieldType: "Sân 7 người",
    location: "Sân Tân An, Quận Ninh Kiều",
    date: "Hôm nay, 05/12/2024",
    time: "20:00 - 21:00",
    skillLevel: "Cao",
    description: "Thiếu 2 tiền đạo cho trận tối nay, yêu cầu có kinh nghiệm chơi bóng.",
    avatar: "🐆"
  },
  {
    id: 3,
    teamName: "Đội Sư Tử Vàng",
    leader: "Lê Văn C",
    currentPlayers: 6,
    neededPlayers: 1,
    fieldType: "Sân 7 người",
    location: "Sân Xuân Khánh, Quận Ninh Kiều",
    date: "Thứ 7, 07/12/2024",
    time: "18:00 - 19:00",
    skillLevel: "Mới bắt đầu",
    description: "Cần thêm 1 thủ môn, chơi vui vẻ không cạnh tranh cao.",
    avatar: "🦁"
  }
];

import { useNavigate } from "react-router-dom";

export function FindTeammatesPage() {
  const navigate = useNavigate();
  const handleConfirm = (teamName: string) => {
    alert(`Bạn đã gửi yêu cầu tham gia ${teamName}. Đội trưởng sẽ liên hệ với bạn sớm!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="gap-2 mb-6 text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </Button>
          
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
              {teammateRequests.length} đội đang tìm người
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {teammateRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Left: Team Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                        {request.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="mb-1">{request.teamName}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Đội trưởng: {request.leader}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            <Users className="h-3 w-3 mr-1" />
                            {request.currentPlayers}/{request.currentPlayers + request.neededPlayers} người
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-700">
                            Thiếu {request.neededPlayers} người
                          </Badge>
                          <Badge variant="outline">
                            <Trophy className="h-3 w-3 mr-1" />
                            {request.skillLevel}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {request.description}
                    </p>

                    <div className="grid sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <span className="line-clamp-1">{request.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <span>{request.fieldType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <span>{request.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <span>{request.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Button */}
                  <div className="flex sm:flex-col items-center justify-end gap-3">
                    <Button
                      onClick={() => handleConfirm(request.teamName)}
                      className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                      size="lg"
                    >
                      <UserPlus className="h-5 w-5 mr-2" />
                      Xác nhận
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      Chi tiết
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {teammateRequests.length === 0 && (
            <div className="text-center py-20">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="mb-2">Chưa có đội nào cần tìm đồng đội</h3>
              <p className="text-muted-foreground">
                Hãy quay lại sau để tìm đội phù hợp với bạn.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
