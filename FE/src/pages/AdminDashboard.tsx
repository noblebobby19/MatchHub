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
    Loader2,
    MessageSquare,
    Eye,
    Send
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";

export function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'users' | 'contacts'>('users');

    // Users State
    const [users, setUsers] = useState<any[]>([]);
    const [usersLoading, setUsersLoading] = useState(true);
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [userPagination, setUserPagination] = useState({ page: 1, total: 0, pages: 1 });

    // Contacts State
    const [contacts, setContacts] = useState<any[]>([]);
    const [contactsLoading, setContactsLoading] = useState(true);
    const [selectedContact, setSelectedContact] = useState<any>(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [replying, setReplying] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);

    // Fetch Users
    const fetchUsers = async () => {
        try {
            setUsersLoading(true);
            const data = await ApiService.getUsers({
                page: userPagination.page,
                search: userSearchTerm
            });
            setUsers(data.users);
            setUserPagination(data.pagination);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setUsersLoading(false);
        }
    };

    // Fetch Contacts
    const fetchContacts = async () => {
        try {
            setContactsLoading(true);
            const response = await ApiService.getContacts();
            setContacts(response.data || []);
        } catch (error) {
            console.error('Failed to fetch contacts:', error);
        } finally {
            setContactsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'contacts') {
            fetchContacts();
        }
    }, [activeTab, userPagination.page, userSearchTerm]);

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            try {
                await ApiService.deleteUser(userId);
                fetchUsers();
            } catch (error) {
                console.error('Failed to delete user:', error);
                alert('Không thể xóa người dùng này');
            }
        }
    };

    const handleDeleteContact = async (contactId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa liên hệ này?')) {
            try {
                await ApiService.deleteContact(contactId);
                fetchContacts();
            } catch (error) {
                console.error('Failed to delete contact:', error);
                alert('Không thể xóa liên hệ này');
            }
        }
    };

    const handleOpenReply = (contact: any) => {
        setSelectedContact(contact);
        setReplyMessage('');
        setOpenDialog(true);
    };

    const handleReplySubmit = async () => {
        if (!replyMessage.trim()) return;

        try {
            setReplying(true);
            await ApiService.replyContact(selectedContact._id, replyMessage);
            setOpenDialog(false);
            fetchContacts();
            alert('Đã gửi phản hồi thành công!');
        } catch (error) {
            console.error('Failed to reply:', error);
            alert('Lỗi khi gửi phản hồi');
        } finally {
            setReplying(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user || user.role !== 'admin') {
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
                        variant={activeTab === 'users' ? "secondary" : "ghost"}
                        className={`w-full justify-start gap-2 ${activeTab === 'users' ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'text-gray-600'}`}
                        onClick={() => setActiveTab('users')}
                    >
                        <Users className="w-4 h-4" />
                        Quản lý người dùng
                    </Button>
                    <Button
                        variant={activeTab === 'contacts' ? "secondary" : "ghost"}
                        className={`w-full justify-start gap-2 ${activeTab === 'contacts' ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'text-gray-600'}`}
                        onClick={() => setActiveTab('contacts')}
                    >
                        <MessageSquare className="w-4 h-4" />
                        Quản lý liên hệ
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
                            <h1 className="text-3xl font-bold text-gray-900">
                                {activeTab === 'users' ? 'Quản lý người dùng' : 'Quản lý liên hệ'}
                            </h1>
                            <p className="text-muted-foreground mt-1">
                                {activeTab === 'users'
                                    ? 'Xem và quản lý tất cả tài khoản trong hệ thống'
                                    : 'Xem và phản hồi tin nhắn từ khách hàng'
                                }
                            </p>
                        </div>

                        {activeTab === 'users' && (
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="Tìm kiếm user..."
                                        className="pl-9 w-[250px]"
                                        value={userSearchTerm}
                                        onChange={(e) => setUserSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {activeTab === 'users' ? (
                        /* User Table */
                        <Card>
                            <CardHeader className="px-6 py-4 border-b">
                                <CardTitle>Danh sách người dùng</CardTitle>
                                <CardDescription>
                                    Tổng số: {userPagination.total} tài khoản
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
                                        {usersLoading ? (
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
                    ) : (
                        /* Contact Table */
                        <Card>
                            <CardHeader className="px-6 py-4 border-b">
                                <CardTitle>Danh sách liên hệ</CardTitle>
                                <CardDescription>
                                    Tổng số: {contacts.length} tin nhắn
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50">
                                            <TableHead className="w-[200px]">Người gửi</TableHead>
                                            <TableHead className="w-[200px]">Chủ đề</TableHead>
                                            <TableHead>Trạng thái</TableHead>
                                            <TableHead>Ngày gửi</TableHead>
                                            <TableHead className="text-right">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {contactsLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center">
                                                    <div className="flex justify-center items-center gap-2 text-muted-foreground">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Đang tải dữ liệu...
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : contacts.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                    Chưa có liên hệ nào
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            contacts.map((contact) => (
                                                <TableRow key={contact._id}>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium">{contact.user?.name || 'Unknown'}</span>
                                                            <span className="text-xs text-muted-foreground">{contact.user?.email}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="max-w-[200px] truncate block" title={contact.subject}>
                                                            {contact.subject}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={contact.status === 'replied' ? 'default' : 'destructive'}
                                                            className={contact.status === 'replied' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                                                        >
                                                            {contact.status === 'replied' ? 'Đã phản hồi' : 'Chờ xử lý'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(contact.createdAt).toLocaleDateString('vi-VN')}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 w-8 p-0"
                                                                onClick={() => handleOpenReply(contact)}
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                                                onClick={() => handleDeleteContact(contact._id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}

                </div>
            </main>

            {/* Reply Dialog */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                        <DialogTitle>Chi tiết tin nhắn</DialogTitle>
                        <DialogDescription>
                            Xem tin nhắn và gửi phản hồi cho khách hàng
                        </DialogDescription>
                    </DialogHeader>

                    {selectedContact && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right font-bold text-gray-500">Người gửi:</Label>
                                <div className="col-span-3">
                                    {selectedContact.user?.name}
                                    <span className="text-xs text-gray-400 ml-2">({selectedContact.user?.email})</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right font-bold text-gray-500">Chủ đề:</Label>
                                <div className="col-span-3 font-medium">{selectedContact.subject}</div>
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                                <Label className="text-right font-bold text-gray-500 mt-2">Nội dung:</Label>
                                <div className="col-span-3 p-3 bg-gray-50 rounded-md text-sm">
                                    {selectedContact.content}
                                </div>
                            </div>

                            {selectedContact.status === 'replied' && selectedContact.replyMessage && (
                                <div className="grid grid-cols-4 gap-4">
                                    <Label className="text-right font-bold text-green-600 mt-2">Đã trả lời:</Label>
                                    <div className="col-span-3 p-3 bg-green-50 rounded-md text-sm text-green-800">
                                        {selectedContact.replyMessage}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-4 gap-4">
                                <Label htmlFor="reply" className="text-right font-bold mt-2">Phản hồi:</Label>
                                <Textarea
                                    id="reply"
                                    className="col-span-3"
                                    placeholder="Nhập nội dung phản hồi..."
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenDialog(false)}>Đóng</Button>
                        <Button onClick={handleReplySubmit} disabled={replying || !replyMessage.trim()} className="bg-green-600 hover:bg-green-700">
                            {replying ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang gửi...</>
                            ) : (
                                <><Send className="mr-2 h-4 w-4" /> Gửi phản hồi</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
