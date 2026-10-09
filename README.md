# Phiếu Chấm Điểm - Hội Thi Nấu Ăn (Công đoàn NETCO)

App chấm điểm điện tử cho **Hội thi Nấu Ăn: Mâm Cơm Sum Vầy Cuối Tuần** - Công đoàn Công ty Cổ phần Bột giặt NET. Tổ chức ngày Thứ Ba 20/10/2026 tại Nhà Ăn.

## Tính năng
- **Phiếu chấm điểm** (`index.html`): BGK chọn đội, chấm 5 tiêu chí (tổng 100đ), ghi nhận xét, submit.
- **Tổng hợp kết quả** (`tong-hop.html`): bảng xếp hạng Nhất/Nhì/Ba, điểm trung bình theo tiêu chí, chi tiết các phiếu.
- **Tải PDF** có thiết kế đẹp (dùng jsPDF + html2canvas, chạy offline từ thư mục `vendor/`).
- **Xuất CSV** mở bằng Excel.
- Dữ liệu lưu trên trình duyệt (localStorage).

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
