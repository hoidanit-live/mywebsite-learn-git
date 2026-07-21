---
name: git-commit-conventional
description: Dùng skill này khi người dùng yêu cầu commit code, viết commit message, hoặc push lên git. Đọc diff đang staged (hoặc unstaged nếu chưa staged gì), phân tích thay đổi và viết commit message theo chuẩn Conventional Commits bằng tiếng Việt. Kích hoạt khi thấy các cụm như "commit giúp", "viết commit message", "đẩy lên github", "git commit", "push code". Nếu người dùng nói thêm cụm như "commit kèm note AI" hoặc "ghi chú AI-generated", thêm dòng ghi chú AI-generated + đã test vào cuối message (xem phần "Ghi chú AI-generated" bên dưới).
---

# Git Commit theo chuẩn Conventional Commits

## Khi nào dùng skill này
Bất cứ khi nào người dùng nhờ commit thay đổi, dù diễn đạt kiểu gì: "commit giúp tao", "đẩy code này lên", "viết message cho đống này", "push lên github"...

## Quy trình

1. **Kiểm tra trạng thái**
   ```bash
   git status
   git diff --cached      # nếu có gì đã staged
   git diff                # nếu chưa staged gì
   ```
   Nếu chưa staged, hỏi người dùng có muốn `git add` hết hay chỉ một số file, trừ khi họ đã nói rõ.

2. **Phân tích diff để xác định**
   - **type**: feat / fix / refactor / style / docs / test / chore / perf / ci / build
   - **scope**: module/thư mục bị ảnh hưởng nhiều nhất (vd: auth, cart, api) — bỏ qua nếu thay đổi rải rác nhiều nơi
   - **mô tả**: 1 câu ngắn, động từ mệnh lệnh ("thêm", "sửa", "xoá"), tiếng Việt, dưới 72 ký tự

   Nếu diff chứa nhiều loại thay đổi không liên quan (vd vừa feat vừa chore), **đề xuất tách thành nhiều commit** thay vì gộp vào 1 message dài, trừ khi người dùng nói rõ muốn gộp.

3. **Viết message theo cấu trúc**
   ```
   <type>(<scope>): <mô tả ngắn>

   <mô tả chi tiết - chỉ thêm nếu thay đổi phức tạp, giải thích TẠI SAO không phải LÀM GÌ>
   ```

4. **Xác nhận trước khi commit thật**
   Luôn hiển thị message đã soạn cho người dùng xem trước, rồi mới chạy:
   ```bash
   git commit -m "type(scope): mô tả"
   ```
   Không tự ý `git push` trừ khi người dùng yêu cầu rõ ràng.

## Bảng type
| Type | Khi nào dùng |
|---|---|
| feat | Thêm tính năng mới |
| fix | Sửa bug |
| refactor | Sửa cấu trúc code, không đổi hành vi |
| style | Format, dấu cách, không đổi logic |
| docs | Tài liệu / README |
| test | Thêm/sửa test |
| chore | Việc lặt vặt: dependency, config |
| perf | Cải thiện hiệu năng |
| ci | Sửa pipeline CI/CD |
| build | Sửa hệ thống build, package |

## Nguyên tắc
- Không bao giờ dùng message chung chung như "update", "fix bug", "asdasd".
- Nếu có breaking change, thêm dòng `BREAKING CHANGE: <mô tả>` ở cuối message.
- Nếu commit liên quan đến issue/PR, hỏi người dùng số issue để thêm `Closes #12` vào footer.
- Ưu tiên nhiều commit nhỏ, rõ nghĩa hơn 1 commit lớn gộp nhiều việc.

## Ghi chú AI-generated (tuỳ chọn, tắt theo mặc định)
**Mặc định KHÔNG thêm ghi chú này.** Chỉ thêm khi người dùng gõ từ khóa kích hoạt rõ ràng trong yêu cầu, ví dụ: "commit kèm note AI", "commit có ghi AI-generated", "thêm ghi chú AI vào commit"...

Nếu không thấy từ khóa kích hoạt, bỏ qua bước này hoàn toàn — không tự hỏi, không tự thêm.

Khi được kích hoạt, thêm một dòng ở cuối message:

```
AI-generated, đã test: <những gì đã kiểm tra>
```

Trước khi thêm dòng này, hỏi người dùng họ đã test những gì (chạy thử, viết unit test, test tay trên UI, chưa test...) rồi điền đúng như họ nói — không tự suy đoán hoặc tự nhận là "đã test kỹ" nếu người dùng không xác nhận.

Ví dụ:
```
feat(auth): thêm đăng nhập bằng Google OAuth

AI-generated, đã test: đăng nhập thành công trên Chrome, chưa test case token hết hạn
```

**Vì sao dòng này hữu ích:** vài tuần hay vài tháng sau, khi cần lần lại lịch sử để tìm nguyên nhân một lỗi, biết đoạn code nào do AI viết và đã test đến đâu giúp thu hẹp nhanh phạm vi nghi vấn — thay vì phải đọc lại toàn bộ diff để đoán.

## Ví dụ
```
feat(auth): thêm đăng nhập bằng Google OAuth
fix(cart): sửa lỗi tổng tiền không cập nhật khi xoá sản phẩm
refactor(api): tách logic xử lý user ra service riêng
chore: cập nhật axios lên v1.7.2
```