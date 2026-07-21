---
name: code-review-pr
description: Review code diff trước khi tạo Pull Request — phát hiện bug logic, vấn đề bảo mật (security issue), và code style không nhất quán, đóng vai trò như "reviewer vòng 1" trước khi gửi cho reviewer thật. LUÔN dùng skill này khi người dùng dán một đoạn diff/code thay đổi và yêu cầu review, khi họ nói "review code", "review trước khi tạo PR", "check code trước khi push", "xem giúp code này có bug không", hoặc dán output của `git diff`/`git diff main...HEAD` mà không giải thích thêm. Cũng dùng khi người dùng hỏi "code này có an toàn không", "có lỗi bảo mật không". Không dùng skill này cho việc viết code mới từ đầu hoặc debug lỗi runtime cụ thể có traceback (đó là task khác).
---

# Skill: Review Code Trước Khi Tạo PR

## Mục tiêu

Đóng vai trò senior developer review code — đọc diff và trả về danh sách vấn đề đã phân loại rõ ràng, để người dùng sửa trước khi gửi PR cho reviewer thật. Mục tiêu là giảm số vòng review qua lại với con người.

---

## Input cần có

- **Bắt buộc:** Đoạn code thay đổi (diff, hoặc toàn bộ file nếu không có diff)
- **Nếu người dùng chưa cung cấp diff:** Hỏi họ dán output của lệnh sau, hoặc tự chạy nếu đang có quyền truy cập terminal trong repo của họ:
  ```bash
  git diff main...HEAD
  ```
- **Tùy chọn nhưng nên hỏi nếu chưa rõ:** Ngôn ngữ/framework đang dùng, có convention riêng gì của dự án không (ví dụ: bắt buộc dùng `camelCase`, không được dùng `any` trong TypeScript, v.v.)

Nếu người dùng chỉ dán code mà không nói gì thêm, mặc định hiểu là họ muốn review đầy đủ theo checklist bên dưới — không cần hỏi lại trừ khi diff quá ngắn/không rõ ngữ cảnh để review.

---

## Quy trình review

Đọc kỹ diff, sau đó phân tích theo đúng 4 nhóm — không bỏ nhóm nào kể cả khi không tìm thấy vấn đề (ghi rõ "Không phát hiện vấn đề" cho nhóm đó):

### 1. Bug logic (ưu tiên cao nhất)
Xem chi tiết checklist tại `references/checklist.md`. Tóm tắt các điểm cần soi:
- Điều kiện biên (off-by-one, `<` vs `<=`)
- Xử lý `null`/`undefined`/giá trị rỗng
- Async/await dùng sai (quên `await`, race condition, promise không được catch)
- Logic ngược (đảo điều kiện if/else, return sai giá trị)
- Vòng lặp/đệ quy có khả năng vô hạn hoặc sai điều kiện dừng

### 2. Security issue (ưu tiên cao, luôn kiểm tra kể cả khi không được yêu cầu)
- Hardcode secret: API key, password, token ngay trong code
- SQL Injection: nối chuỗi trực tiếp vào query thay vì dùng parameterized query
- Thiếu validate/sanitize input từ người dùng (đặc biệt input đi vào DB, shell command, hoặc render ra HTML — nguy cơ XSS)
- Lộ thông tin nhạy cảm qua log, error message trả về client
- Thiếu kiểm tra quyền (authorization) trước khi thực hiện hành động nhạy cảm

### 3. Code style & đặt tên
- Đặt tên biến/hàm không rõ nghĩa hoặc sai chính tả
- Không nhất quán với convention hiện có trong dự án (nếu người dùng đã cho biết convention)
- Code trùng lặp (duplicate) có thể tách hàm dùng chung
- Comment thừa/thiếu (thiếu comment cho logic phức tạp, hoặc comment thừa cho code đã rõ nghĩa)

### 4. Đề xuất cải thiện khác (không bắt buộc phải sửa)
- Performance có thể tối ưu (N+1 query, loop lồng nhau không cần thiết)
- Có thể đơn giản hóa logic

---

## Format output (luôn theo cấu trúc này)

```markdown
## Kết quả review

### 🐛 Bug logic
- [Dòng/đoạn code cụ thể] — [Mô tả vấn đề] → **Đề xuất:** [cách sửa]
(hoặc: Không phát hiện vấn đề)

### 🔒 Security issue
- [Dòng/đoạn code cụ thể] — [Mô tả vấn đề] → **Đề xuất:** [cách sửa]
(hoặc: Không phát hiện vấn đề)

### 🎨 Code style
- [Dòng/đoạn code cụ thể] — [Mô tả vấn đề] → **Đề xuất:** [cách sửa]
(hoặc: Không phát hiện vấn đề)

### 💡 Đề xuất khác (không bắt buộc)
- [Gợi ý]

---
**Tổng kết:** X vấn đề nghiêm trọng (bug/security), Y vấn đề style. 
[1 câu nhận xét tổng quan: code đã sẵn sàng tạo PR chưa, hay cần sửa gì trước]
```

Luôn trích dẫn đúng dòng code hoặc đoạn code cụ thể (copy nguyên văn ngắn gọn) để người dùng biết chính xác vị trí — không nói chung chung kiểu "có vài chỗ chưa ổn".

---

## Nguyên tắc khi review

- **Không tự sửa code khi chưa được yêu cầu.** Chỉ liệt kê vấn đề + đề xuất. Nếu người dùng nói "sửa luôn giúp tôi" thì mới viết code đã sửa.
- **Ưu tiên bug logic và security lên đầu**, đừng để style che lấp các vấn đề nghiêm trọng hơn.
- **Không bịa lỗi để có nội dung.** Nếu code sạch, nói rõ "Không phát hiện vấn đề" — điều này có giá trị hơn là tạo ra false positive.
- **Giải thích ngắn gọn "tại sao"** cho mỗi vấn đề, đặc biệt là security issue — người đọc cần hiểu rủi ro thực tế, không chỉ được bảo "sai".
- Nếu diff quá dài (nhiều file không liên quan), có thể hỏi người dùng muốn tập trung review file/phần nào trước.

---

## Sau khi review xong

Hỏi ngắn gọn: "Bạn muốn tôi sửa trực tiếp các vấn đề trên, hay để bạn tự sửa rồi review lại vòng 2?"
