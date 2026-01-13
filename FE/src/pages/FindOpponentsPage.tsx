import { Swords, MapPin, Clock, Calendar, Users, ArrowLeft, Trophy, Shield } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

const opponentRequests = [
  {
    id: 1,
    teamName: "Đội Phượng Hoàng",
    leader: "Phạm Văn D",
    players: 7,
    fieldType: "Sân 7 người",
    location: "Sân Xuân Khánh, Quận Ninh Kiều",
    date: "Thứ 7, 07/12/2024",
    time: "18:00 - 19:00",
    skillLevel: "Trung bình",
    matchType: "Giao hữu",
    description: "Tìm đối thủ để giao lưu cuối tuần, chơi vui vẻ, không cạnh tranh quá cao.",
    avatar: "🔥"
  },
  {
    id: 2,
    teamName: "Đội Hổ Vàng",
    leader: "Võ Văn E",
    players: 7,
    fieldType: "Sân 7 người",
    location: "Sân Hưng Lợi, Quận Ninh Kiều",
    date: "Thứ 6, 06/12/2024",
    time: "19:00 - 20:00",
    skillLevel: "Cao",
    matchType: "Giải nội bộ",
    description: "Cần đối thủ mạnh cho vòng loại giải nội bộ công ty, đòi hỏi kỹ thuật tốt.",
    avatar: "🐯"
  },
  {
    id: 3,
    teamName: "Đội Đại Bàng",
    leader: "Hoàng Văn F",
    players: 11,
    fieldType: "Sân 11 người",
    location: "Sân An Nghiệp, Quận Ninh Kiều",
    date: "Chủ nhật, 08/12/2024",
    time: "16:00 - 17:30",
    skillLevel: "Trung bình",
    matchType: "Giao hữu",
    description: "Trận đấu lớn sân 11 người, có trọng tài, tìm đội có đủ số người để thi đấu.",
    avatar: "🦅"
  }
];

import { useNavigate } from "react-router-dom";

export function FindOpponentsPage() {
  const navigate = useNavigate();
  const handleConfirm = (teamName: string) => {
    alert(`Bạn đã gửi yêu cầu thách đấu ${teamName}. Đội trưởng sẽ liên hệ với bạn sớm!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-12">
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
              <Swords className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl">
                Tìm đối thủ
              </h1>
              <p className="text-lg opacity-90 mt-1">
                Thách đấu các đội đang tìm đối thủ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm opacity-90">
            <Badge className="bg-white/20 hover:bg-white/30">
              {opponentRequests.length} đội đang tìm đối thủ
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {opponentRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Left: Team Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 bg-gradient-to-br from-orange-100 to-red-200 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                        {request.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="mb-1">{request.teamName}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Đội trưởng: {request.leader}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">
                            <Shield className="h-3 w-3 mr-1" />
                            {request.players} cầu thủ
                          </Badge>
                          <Badge className="bg-orange-100 text-orange-700">
                            {request.matchType}
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
                        <MapPin className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        <span className="line-clamp-1">{request.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        <span>{request.fieldType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        <span>{request.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 text-orange-600 flex-shrink-0" />
                        <span>{request.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Action Button */}
                  <div className="flex sm:flex-col items-center justify-end gap-3">
                    <Button
                      onClick={() => handleConfirm(request.teamName)}
                      className="bg-orange-600 hover:bg-orange-700 w-full sm:w-auto"
                      size="lg"
                    >
                      <Swords className="h-5 w-5 mr-2" />
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

          {opponentRequests.length === 0 && (
            <div className="text-center py-20">
              <Swords className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="mb-2">Chưa có đội nào cần tìm đối thủ</h3>
              <p className="text-muted-foreground">
                Hãy quay lại sau để tìm đối thủ phù hợp.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
