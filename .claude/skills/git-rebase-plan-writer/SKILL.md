---
name: git-rebase-plan-writer
description: Đề xuất kế hoạch git rebase -i (interactive rebase) cụ thể — commit nào giữ pick, commit nào squash/fixup vào commit nào, có nên đổi thứ tự không, kèm message mới sau khi gộp — để làm sạch lịch sử commit trước khi merge/tạo PR. LUÔN dùng skill này khi người dùng dán danh sách commit (output git log --oneline hoặc git log -p) và muốn dọn lịch sử, khi họ nói "gộp commit giúp tôi", "rebase interactive giúp tôi", "dọn lịch sử commit", "squash commit nào", "làm sạch commit trước khi tạo PR". Không dùng skill này để viết PR description (đó là skill pr-description-writer) hay giải quyết merge conflict (đó là skill conflict-resolver) — skill này chỉ tập trung lên kế hoạch rebase để dọn lịch sử, không xử lý conflict phát sinh trong lúc rebase.
---

# Skill: Viết Rebase Interactive Plan

## Mục tiêu

Từ danh sách commit lộn xộn (nhiều commit "wip", "fix typo", "update"...), đề xuất một kế hoạch rebase cụ thể theo đúng format Git hiểu được, để người dùng copy trực tiếp vào editor khi chạy `git rebase -i` — thay vì tự nhớ lại và quyết định thủ công.

---

## Input cần có

- **Bắt buộc:** Danh sách commit trên nhánh, lấy từ:
  ```bash
  git log --oneline main..HEAD
  ```
  (thay `main` bằng tên nhánh gốc nếu team dùng tên khác, ví dụ `develop`)
- **Nên có nếu commit message không rõ ràng** (nhiều commit kiểu "wip", "update", "fix"): lấy thêm nội dung diff để hiểu đúng bản chất từng commit:
  ```bash
  git log -p main..HEAD
  ```
- Nếu người dùng chỉ đưa danh sách commit dạng `--oneline` mà message quá mập mờ để suy luận commit nào liên quan đến commit nào, hỏi lại xin thêm `-p` thay vì đoán bừa cách gộp.

---

## Cảnh báo an toàn — LUÔN nhắc trước khi đưa ra plan

Rebase làm thay đổi lịch sử commit (thay đổi hash). Trước khi đưa ra bất kỳ đề xuất nào, luôn hỏi hoặc nhắc: **nhánh này đã được push lên và có người khác đang code chung/pull về chưa?** Nếu có, cảnh báo rõ: không nên rebase nhánh đã chia sẻ, vì sẽ gây conflict nghiêm trọng cho người khác khi họ pull. Interactive rebase chỉ an toàn cho nhánh cá nhân, chưa chia sẻ hoặc chuẩn bị tạo PR lần đầu.

---

## Quy trình

1. Đọc toàn bộ danh sách commit theo đúng thứ tự thời gian (commit cũ nhất trước, giống thứ tự Git yêu cầu khi rebase)
2. Nhóm các commit có liên quan đến cùng một thay đổi logic — dựa vào commit message rõ ràng nhất trong nhóm làm "commit gốc" để giữ `pick`, các commit sửa đi sửa lại trong cùng nhóm đó thành `fixup` hoặc `squash`
3. Phân biệt `fixup` và `squash`:
   - Dùng `fixup` khi message của commit đó không có giá trị giữ lại (ví dụ "fix typo", "wip", "asdf")
   - Dùng `squash` khi message của commit đó có thông tin đáng giữ lại một phần, cần con người xem lại để quyết định giữ gì trong message gộp
4. Xác định các commit độc lập, có ý nghĩa riêng (ví dụ "thêm test", "cập nhật docs") — giữ `pick` riêng, không gộp chung với thay đổi chính, để reviewer dễ theo dõi từng phần việc
5. Chỉ đề xuất đổi thứ tự (reorder) khi thực sự cần thiết để nhóm các thay đổi liên quan lại gần nhau — không đảo thứ tự tùy tiện, vì thứ tự sai có thể gây lỗi khi rebase (commit sau phụ thuộc vào thay đổi của commit trước)
6. Với mỗi nhóm được squash, đề xuất luôn message mới rõ ràng, ngắn gọn, mô tả đúng bản chất thay đổi

---

## Format output

```markdown
## Kế hoạch rebase

| Commit | Hành động | Lý do |
|---|---|---|
| [hash] [message gốc] | pick | [Lý do giữ riêng] |
| [hash] [message gốc] | fixup / squash | [Lý do gộp vào commit nào] |
| ... | ... | ... |

## Plan để copy vào editor khi chạy `git rebase -i main`

\`\`\`
pick [hash] [message]
fixup [hash]
fixup [hash]
pick [hash] [message]
squash [hash]
...
\`\`\`

## Message đề xuất sau khi squash (nếu có)
- Commit [hash gốc của nhóm]: "[message mới đề xuất]"
- ...

## Lưu ý trước khi chạy
- Xác nhận nhánh này chưa được người khác pull/dựa vào
- Sau khi lưu plan và Git dừng lại để reword, dùng message đề xuất ở trên
- Nếu gặp conflict trong lúc rebase, xử lý từng bước theo hướng dẫn Git 
  hiện ra (skill này không tự động giải quyết conflict phát sinh)
```

---

## Nguyên tắc khi đề xuất

- **Không gộp các thay đổi không liên quan vào cùng một commit** chỉ để giảm số lượng — mục tiêu là lịch sử rõ ràng, không phải càng ít commit càng tốt
- **Giữ lại commit độc lập có giá trị riêng** (test, docs, refactor không liên quan) thay vì gộp hết vào 1 commit khổng lồ
- **Không tự ý đổi thứ tự nếu có rủi ro phụ thuộc giữa các commit** — nếu không chắc, ghi rõ giả định và khuyến nghị người dùng tự kiểm tra kỹ trước khi áp dụng
- **Luôn ưu tiên `fixup` hơn `squash` khi message gốc không có giá trị**, để giảm việc phải tự viết lại message thủ công
- Nếu số lượng commit ít (1-2 commit) hoặc message đã rõ ràng sẵn, nói thẳng là không cần rebase, không cố tạo ra plan không cần thiết

---

## Sau khi đưa plan xong

Nhắc ngắn gọn: "Nhớ xác nhận nhánh này chưa được người khác pull trước khi rebase, và luôn có thể `git rebase --abort` nếu quá trình rebase gặp vấn đề không mong muốn."
