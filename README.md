# Phiếu Chấm Điểm - Hội Thi Nấu Ăn (Công đoàn NETCO)

App chấm điểm điện tử cho **Hội thi Nấu Ăn: Mâm Cơm Sum Vầy Cuối Tuần** - Công đoàn Công ty Cổ phần Bột giặt NET. Tổ chức ngày Thứ Ba 20/10/2026 tại Nhà Ăn.

## Tính năng
- **Phiếu chấm điểm** (`index.html`): BGK chọn đội, chấm 5 tiêu chí (tổng 100đ), ghi nhận xét, submit.
- **Tổng hợp kết quả** (`tong-hop.html`): bảng xếp hạng Nhất/Nhì/Ba, điểm trung bình theo tiêu chí, chi tiết các phiếu.
- **Tải PDF** có thiết kế đẹp (dùng jsPDF + html2canvas, chạy offline từ thư mục `vendor/`).
- **Xuất CSV** mở bằng Excel.
- Dữ liệu dùng chung qua **Supabase** để nhiều BGK chấm trên nhiều thiết bị vẫn xem được toàn bộ kết quả.
- Nếu chưa điền cấu hình Supabase, app tự chuyển về localStorage để chạy thử trên một máy.

## Thang điểm (100đ)
| Tiêu chí | Điểm |
|---|---|
| Hương vị món ăn | 40 |
| Sự hợp lý & Cân đối dinh dưỡng | 20 |
| Trình bày & Thẩm mỹ | 20 |
| Thuyết trình | 10 |
| An toàn vệ sinh & Dọn dẹp | 10 |

## 4 đội thi
A. CĐBP Khối Văn phòng · B. CĐBP Xưởng Bột giặt · C. CĐBP Xưởng Tẩy Rửa Lỏng · D. CĐBP Kho vận

## Chạy thử tại máy
Mở trực tiếp `index.html` bằng trình duyệt, hoặc chạy server tĩnh:
```
python -m http.server 5500
```
Rồi truy cập http://localhost:5500

## Deploy Vercel
Đây là static site (HTML/CSS/JS thuần), không cần build. Chỉ cần import repo vào Vercel, framework chọn **Other**, mọi thứ còn lại để mặc định.

## Lưu ý
Dữ liệu chấm điểm lưu cục bộ theo từng thiết bị/trình duyệt. Để tổng hợp đúng kết quả chung cuộc, nên cho tất cả BGK chấm trên **cùng một thiết bị/trình duyệt**.

## Cấu hình database dùng chung

### 1. Tạo Supabase project
1. Vào https://supabase.com và tạo project mới.
2. Mở **SQL Editor**, dán toàn bộ file `supabase-schema.sql`, rồi bấm **Run**.
3. Vào **Project Settings → API**, lấy:
   - Project URL
   - Publishable/anon key
4. Mở `supabase-config.js` và điền:

```js
window.SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT.supabase.co',
  anonKey: 'YOUR_SUPABASE_ANON_KEY'
};
```

5. Commit và push lại lên GitHub. Vercel sẽ tự deploy phiên bản mới.
6. Tất cả BGK truy cập cùng `https://hoainamit.cloud`; phiếu submit sẽ lưu trên Supabase và trang tổng hợp sẽ đọc dữ liệu chung.

`anonKey` được phép xuất hiện ở frontend. Không đưa `service_role` key vào website. RLS đã được bật trong SQL và chỉ cho phép đọc/thêm, không cho xóa công khai.

## Tài khoản sử dụng

- Ông Mai Đức Lâm — Ban Giám Khảo
- Bà Nguyễn Thị Sương — Ban Giám Khảo
- Bà Ngô Thị Quỳnh Như — Ban Giám Khảo
- Ông Phan Hoàng Trung Hiếu — Ban Giám Khảo
- Ông Phạm Đức Trường — Quản trị hệ thống

Bốn tài khoản BGK chỉ chấm và submit. Tài khoản Ông Phạm Đức Trường được xem tổng hợp, in và tải PDF/CSV.
Lưu ý: màn hình chọn tên là phân quyền giao diện; nếu cần bảo mật chống người khác giả danh, cần bổ sung mật khẩu/Supabase Auth.
