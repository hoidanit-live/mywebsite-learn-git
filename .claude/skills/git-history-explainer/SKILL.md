---
name: git-history-explainer
description: Tóm tắt lịch sử git log -p hoặc git blame dài thành một "câu chuyện" mạch lạc, giải thích vì sao một đoạn code cụ thể tồn tại, ai viết, khi nào, và liệu nó có còn cần thiết hay đã lỗi thời. LUÔN dùng skill này khi người dùng dán output của git log -p hoặc git blame, khi họ nói "tại sao đoạn code này lại như vậy", "giải thích lịch sử đoạn code này", "code này ai viết vậy", "đoạn này có còn cần thiết không", hoặc mô tả tình huống gặp code cũ khó hiểu không có comment và muốn biết lý do đằng sau. Không dùng skill này để review chất lượng code hiện tại (đó là skill code-review-pr) hay để giải quyết merge conflict (đó là skill conflict-resolver) — skill này chỉ tập trung giải thích quá khứ/lý do tồn tại của code, không đánh giá đúng sai hay đề xuất sửa code hiện tại.
---

# Skill: Giải Thích Lịch Sử / Blame

## Mục tiêu

Đọc lịch sử Git (log hoặc blame) dài và khó theo dõi thủ công, tóm tắt lại thành một câu chuyện rõ ràng: đoạn code cụ thể xuất hiện khi nào, vì lý do gì, đã thay đổi ra sao qua thời gian, và có dấu hiệu đã lỗi thời hay không — giúp người dùng ra quyết định (giữ/sửa/xóa) một cách tự tin thay vì đoán mò.

---

## Input cần có

- **Bắt buộc:** Đoạn code cụ thể người dùng đang thắc mắc (dù chỉ 1-2 dòng) — nếu người dùng chỉ dán lịch sử mà không chỉ rõ đoạn code nào đang quan tâm, hỏi lại trước khi phân tích, vì lịch sử dài mà không có mục tiêu rõ ràng sẽ cho ra tóm tắt lan man, không hữu ích
- **Bắt buộc:** Output của một trong hai lệnh:
  ```bash
  git blame -L <dòng-bắt-đầu>,<dòng-kết-thúc> <đường-dẫn-file>
  ```
  hoặc
  ```bash
  git log -p --follow -- <đường-dẫn-file>
  ```
  Nếu người dùng chưa cung cấp, gợi ý họ chạy 1 trong 2 lệnh trên tùy nhu cầu: `blame` nếu chỉ cần biết dòng hiện tại ai viết, `log -p` nếu cần cả quá trình tiến hóa
- **Nếu lịch sử quá dài (nhiều chục/trăm commit):** Gợi ý người dùng giới hạn lại bằng `git log -p -20 --follow -- <file>` (giới hạn 20 commit gần nhất) thay vì đưa nguyên lịch sử quá dài vào một lần

---

## Quy trình

1. Xác định chính xác đoạn code người dùng đang quan tâm — nếu chưa rõ, hỏi lại
2. Đọc toàn bộ lịch sử được cung cấp, lọc ra CHỈ những commit thực sự liên quan đến đoạn code đó (bỏ qua commit không liên quan dù chúng có trong output)
3. Sắp xếp theo thứ tự thời gian, tóm tắt mỗi commit liên quan: commit làm gì, dựa trên commit message + nội dung diff (không chỉ dựa vào message vì message có thể không đầy đủ)
4. Đánh giá xem đoạn code có dấu hiệu đã lỗi thời không — ví dụ: lý do ban đầu được nhắc trong message nhưng điều kiện đó đã thay đổi ở commit sau (đổi hệ thống, gỡ tính năng liên quan, v.v.)
5. Đưa ra khuyến nghị mức độ tin cậy: có đủ căn cứ để tự tin xóa/sửa không, hay cần xác minh thêm

---

## Format output

```markdown
## Lịch sử đoạn code này

- **Commit [hash ngắn] ([thời gian tương đối nếu có])**: "[commit message]" 
  — [tóm tắt commit này làm gì với đoạn code, dựa trên message + diff]
- **Commit [hash ngắn] ([thời gian])**: "[commit message]" — [tóm tắt]
- [...]

## Nhận định
[Giải thích lý do có thể có tại sao đoạn code được viết như vậy, dựa trên 
chuỗi lịch sử ở trên. Nêu rõ đây là suy luận dựa trên commit message, 
không phải sự thật tuyệt đối.]

## Đoạn code này có còn cần thiết không?
[Một trong 3 kết luận:
- "Có căn cứ cho thấy vẫn cần thiết vì [lý do]"
- "Có dấu hiệu đã lỗi thời vì [lý do cụ thể từ lịch sử], nhưng nên xác 
  minh thêm trước khi xóa: [gợi ý cách xác minh]"
- "Không đủ căn cứ để kết luận — lịch sử không đề cập rõ lý do, nên hỏi 
  trực tiếp người viết code nếu còn trong team"]
```

---

## Nguyên tắc khi phân tích

- **Không suy diễn quá đà từ commit message ngắn/không rõ ràng** kiểu "fix", "update", "wip" — nếu message không đủ thông tin, nói rõ "message không đủ rõ để xác định lý do chính xác" thay vì tự bịa một lý do nghe hợp lý
- **Luôn phân biệt giữa "sự thật từ lịch sử" và "suy luận của mình"** — dùng ngôn ngữ như "có thể vì", "dựa trên commit message này", tránh khẳng định chắc nịch khi chỉ đang suy đoán
- **Không tự đề xuất xóa code chỉ vì nó "trông có vẻ" lỗi thời** — luôn kèm theo cách xác minh trước khi hành động (kiểm tra log production, hỏi người liên quan, tìm test case liên quan)
- **Nếu lịch sử cho thấy đoạn code liên quan đến bug nghiêm trọng đã từng xảy ra** (ví dụ message nhắc "fix lỗi mất tiền", "fix security issue"), luôn nhấn mạnh cảnh báo rõ ràng trước khi gợi ý bất kỳ thay đổi nào
- Nếu output người dùng đưa vào không chứa commit nào thực sự liên quan đến đoạn code họ hỏi, nói thẳng điều này thay vì cố tóm tắt những commit không liên quan

---

## Sau khi tóm tắt xong

Nếu kết luận là "có dấu hiệu lỗi thời", luôn hỏi lại: "Bạn có muốn mình gợi ý cách xác minh cụ thể trước khi xóa/sửa đoạn code này không?" — không tự động chuyển sang đề xuất sửa code trừ khi người dùng yêu cầu, vì mục tiêu chính của skill này là giải thích, không phải sửa code.
