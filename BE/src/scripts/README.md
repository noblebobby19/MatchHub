# Scripts

## Tạo Admin User

Script này tạo một tài khoản admin mặc định trong database.

### Cách sử dụng:

```bash
npm run create-admin
```

Hoặc chạy trực tiếp:

```bash
node src/scripts/createAdmin.js
```

### Thông tin đăng nhập mặc định:

- **Email**: admin@matchhub.vn
- **Password**: admin123
- **Role**: admin

⚠️ **Lưu ý**: Vui lòng đổi mật khẩu sau lần đăng nhập đầu tiên!

### Chức năng:

- Tự động kiểm tra xem admin đã tồn tại chưa
- Nếu đã tồn tại nhưng chưa có role 'admin', sẽ tự động cập nhật role
- Nếu chưa tồn tại, sẽ tạo mới với thông tin mặc định

