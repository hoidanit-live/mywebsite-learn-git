---
name: pr-description-writer
description: Sinh PR (Pull Request) Title + Description tự động từ danh sách commit và diff — title 1 dòng theo convention, description gồm 3 phần chuẩn Mục đích, Thay đổi chính, Cách test. LUÔN dùng skill này khi người dùng yêu cầu "viết PR description", "viết title cho PR", "viết mô tả PR", "tóm tắt PR này", "generate PR description", khi họ dán `git log`/danh sách commit kèm diff mà không giải thích thêm ý muốn, hoặc khi họ nói "viết giúp phần mô tả để tạo Pull Request". Dùng cả khi người dùng chỉ có commit log mà chưa có diff, hoặc chỉ có diff mà chưa có commit log — skill vẫn xử lý được, chỉ cần hỏi bổ sung phần còn thiếu nếu cần. Không dùng skill này để review/tìm bug trong code (đó là skill code-review-pr) — skill này chỉ tập trung viết title và mô tả PR.
---

# Skill: Viết PR Title & Description

## Mục tiêu

Từ commit log + diff, sinh ra **Title** (1 dòng, ngắn gọn, đúng convention) và **Description** có cấu trúc rõ ràng, đủ để reviewer hiểu trong 30 giây: PR làm gì, thay đổi gì, và test thế nào — thay vì developer phải tự tổng hợp thủ công. Luôn trả về cả hai, không chỉ description, vì đây là 2 trường bắt buộc khi tạo PR trên GitHub/GitLab.

---

## Input cần có

- **Danh sách commit** (khuyến khích, không bắt buộc):
  ```bash
  git log main..HEAD --oneline
  ```
- **Diff** (khuyến khích, không bắt buộc — nhưng có ít nhất 1 trong 2 thứ này thì mới review được):
  ```bash
  git diff main...HEAD
  ```
- **Tùy chọn:** Template PR description sẵn có của team (ví dụ nội dung file `.github/PULL_REQUEST_TEMPLATE.md`). Nếu người dùng cung cấp, LUÔN ưu tiên theo đúng format/heading của template đó thay vì format mặc định bên dưới.
- **Tùy chọn:** Ngữ cảnh nghiệp vụ (liên quan ticket nào, yêu cầu từ ai, mức độ khẩn cấp...) — nếu người dùng không cung cấp, không tự bịa, chỉ tập trung vào phần kỹ thuật suy ra được từ code.

Nếu người dùng chỉ có commit log mà không có diff (hoặc ngược lại), vẫn tiến hành viết description dựa trên nguồn có sẵn, nhưng có thể hỏi thêm 1 câu nếu thông tin quá ít để suy luận mục đích PR.

---

## Quy trình

1. Đọc commit log để nắm trình tự và ý định người dùng đã thể hiện qua commit message
2. Đọc diff để xác định chính xác phần code nào thay đổi, tránh suy diễn sai từ commit message không rõ ràng
3. Sinh **Title** trước — 1 dòng duy nhất tóm tắt toàn bộ PR (xem quy tắc viết Title bên dưới)
4. Sinh **Description** gồm 3 phần theo đúng format bên dưới (hoặc theo template của team nếu có)
5. Nếu diff động chạm nhiều module không liên quan nhau, cân nhắc gợi ý người dùng tách PR — nêu ngắn gọn trong phần "Ghi chú thêm" (xem format)

---

## Quy tắc viết Title

- **Độ dài:** 1 dòng, tối đa khoảng 60-70 ký tự, đủ ngắn để hiển thị trọn vẹn trong danh sách PR trên GitHub/GitLab
- **Format ưu tiên:** theo chuẩn Conventional Commits nếu commit message của người dùng đang theo chuẩn này — `<type>: <mô tả ngắn>`, với `type` là một trong `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`
  - Ví dụ: `fix: xử lý lỗi timeout khi gọi API thanh toán`
  - Nếu commit log không theo Conventional Commits, chỉ cần viết title rõ nghĩa, không bắt buộc ép theo format này
- **Nội dung:** Tóm tắt PR làm gì (What), không phải liệt kê từng commit. Nếu PR có nhiều commit với nhiều `type` khác nhau (vừa `fix` vừa `feat`), chọn type phản ánh đúng nhất mục đích chính của cả PR
- **Tránh:** title chung chung như "Update code", "Fix bug", "Minor changes" — phải nêu được PR sửa/thêm cái gì cụ thể
- **Nếu có template/convention riêng của team** (ví dụ bắt buộc có mã ticket ở đầu title như `[JIRA-123] ...`), luôn hỏi hoặc bám theo nếu người dùng đã cung cấp thông tin này

---

## Format output mặc định (khi không có template team)

```markdown
# Title
[Title 1 dòng theo quy tắc ở trên]

---

# Description

## Mục đích
[1-2 câu: PR này giải quyết vấn đề gì / thêm tính năng gì. Suy luận từ 
commit message + nature của diff. Không bịa lý do nghiệp vụ nếu không có 
thông tin — chỉ mô tả ở mức kỹ thuật nếu ngữ cảnh business không rõ.]

## Thay đổi chính
- [Thay đổi 1 — mô tả ở mức "cái gì thay đổi và tác động", không liệt kê 
  từng dòng code]
- [Thay đổi 2]
- [...]

## Cách test
1. [Bước cụ thể để kiểm tra thay đổi hoạt động đúng]
2. [Bước tiếp theo]
3. [Kết quả mong đợi]

## Ghi chú thêm (chỉ thêm nếu cần)
- [Ví dụ: "PR có thay đổi ở 2 module không liên quan (auth và payment), 
  cân nhắc tách thành 2 PR riêng để dễ review"]
- [Ví dụ: breaking change cần lưu ý, migration cần chạy, v.v.]
```

---

## Nguyên tắc khi viết

- **Luôn sinh cả Title và Description, không được thiếu Title** — đây là lỗi phổ biến nhất cần tránh
- **Title và Description phải nhất quán** — Title là bản tóm tắt 1 dòng của đúng nội dung trong phần "Mục đích", không phải hai nội dung khác nhau
- **Phần "Thay đổi chính" viết ở mức reviewer cần biết**, không liệt kê chi tiết implementation (ví dụ: viết "Thêm retry logic cho API thanh toán", không viết "Thêm biến `retryCount` khởi tạo bằng 0 trong hàm `callPaymentAPI`")
- **Phần "Cách test" phải là các bước hành động cụ thể**, không viết chung chung kiểu "test kỹ trước khi merge". Nếu diff có thêm/sửa test tự động, có thể nhắc kèm lệnh chạy test (ví dụ `npm test`)
- **Không tự bịa ngữ cảnh nghiệp vụ** (ticket, deadline, yêu cầu khách hàng) nếu người dùng không cung cấp — chỉ viết những gì suy luận được từ code
- **Nếu có template của team, bám sát đúng heading/format đó** — không tự ý đổi cấu trúc
- **Giữ ngắn gọn** — PR description không phải tài liệu kỹ thuật đầy đủ, mục tiêu là giúp reviewer nắm nhanh, không phải kể lại toàn bộ code

---

## Sau khi viết xong

Nhắc người dùng 1 câu ngắn: "Bạn nên bổ sung thêm ngữ cảnh nghiệp vụ (ticket, lý do) nếu có, vì mình chỉ suy luận được phần kỹ thuật từ code." Sau đó hỏi có cần điều chỉnh gì không (thêm chi tiết, rút ngắn, đổi theo template khác).