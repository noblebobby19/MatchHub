import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ApiService from '../services/api';
import {
    Users,
    LogOut,
    Search,
    Trash2,
    Shield,
    User,
    MoreVertical,
    Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';

export function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await ApiService.getUsers({
                page: pagination.page,
                search: searchTerm
            });
            setUsers(data.users);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [pagination.page, searchTerm]);

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            try {
                await ApiService.deleteUser(userId);
                fetchUsers(); // Refresh list
            } catch (error) {
                console.error('Failed to delete user:', error);
                alert('Không thể xóa người dùng này');
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user || user.role !== 'admin') {
        // Safety check, though routes should handle this
        return <div className="p-8">Access Denied</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r shadow-sm flex flex-col fixed h-full z-10 hidden md:flex">
                <div className="p-6 border-b flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                        <Shield className="text-white w-6 h-6" />
                    </div>
                    <span className="font-bold text-xl text-green-800">Admin Panel</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Button
                        variant="secondary"
                        className="w-full justify-start gap-2 bg-green-50 text-green-700 hover:bg-green-100"
                    >
                        <Users className="w-4 h-4" />
                        Quản lý người dùng
                    </Button>
                </nav>

                <div className="p-4 border-t">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                            {user.name?.charAt(0) || 'A'}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-medium truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-8">
                <div className="max-w-6xl mx-auto space-y-8">

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Quản lý người dùng</h1>
                            <p className="text-muted-foreground mt-1">
                                Xem và quản lý tất cả tài khoản trong hệ thống
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Tìm kiếm user..."
                                    className="pl-9 w-[250px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <Card>
                        <CardHeader className="px-6 py-4 border-b">
                            <CardTitle>Danh sách người dùng</CardTitle>
                            <CardDescription>
                                Tổng số: {pagination.total} tài khoản
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50">
                                        <TableHead className="w-[250px]">Người dùng</TableHead>
                                        <TableHead>Vai trò</TableHead>
                                        <TableHead>Ngày tham gia</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                <div className="flex justify-center items-center gap-2 text-muted-foreground">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Đang tải dữ liệu...
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : users.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                Không tìm thấy người dùng nào
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        users.map((u) => (
                                            <TableRow key={u._id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                            <User className="w-4 h-4 text-gray-500" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{u.name}</p>
                                                            <p className="text-sm text-muted-foreground">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="secondary"
                                                        className={
                                                            u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                                u.role === 'owner' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                        }
                                                    >
                                                        {u.role === 'admin' ? 'Admin' : u.role === 'owner' ? 'Chủ sân' : 'Khách hàng'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(u.createdAt).toLocaleDateString('vi-VN')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                className="text-red-600 focus:text-red-600 cursor-pointer"
                                                                onClick={() => handleDeleteUser(u._id)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Xóa tài khoản
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                </div>
            </main>
        </div>
    );
}
