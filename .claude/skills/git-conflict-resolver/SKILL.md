---
name: git-conflict-resolver
description: Phân tích merge conflict Git phức tạp — đọc ý định của từng bên (HEAD vs branch đang merge vào) trước khi đề xuất cách merge hợp lý, thay vì chỉ chọn giữ bên nào. LUÔN dùng skill này khi người dùng dán đoạn code có marker conflict kiểu Git (dãy dấu bằng, dãy dấu lớn hơn/nhỏ hơn đánh dấu HEAD và branch), khi họ nói "giải quyết conflict", "resolve conflict", "merge conflict này giúp tôi", "conflict này nên giữ bên nào", hoặc mô tả tình huống 2 branch cùng sửa 1 đoạn code theo 2 hướng khác nhau. Đặc biệt ưu tiên dùng khi conflict liên quan logic nghiệp vụ quan trọng (tính toán, điều kiện, thanh toán, bảo mật) chứ không chỉ là conflict định dạng/khoảng trắng đơn giản. Không dùng skill này cho conflict tầm thường (import order, format, khoảng trắng) — với các case đó chỉ cần merge trực tiếp không cần phân tích.
---

# Skill: Giải Quyết Conflict Phức Tạp

## Mục tiêu

Khi 2 bên cùng sửa một đoạn code theo 2 hướng khác nhau, việc merge không phải là "chọn bên đúng" mà là hiểu ý định thực sự của từng bên rồi tìm cách kết hợp (hoặc chỉ ra mâu thuẫn thật sự cần người dùng quyết định). Skill này luôn phân tích ý định TRƯỚC khi đề xuất code merge, không nhảy thẳng vào việc gộp code.

---

## Input cần có

- **Bắt buộc:** Đoạn code conflict đầy đủ, nguyên khối bao gồm cả marker Git tiêu chuẩn (dòng đánh dấu HEAD, dòng phân cách, dòng đánh dấu tên branch đang merge vào) — không cắt bớt phần nào
- **Nên có, nếu người dùng chưa cung cấp thì chủ động gợi ý lấy:**
  ```bash
  git log --oneline -5 HEAD
  git log --oneline -5 <tên-branch-kia>
  ```
  (commit message giúp suy luận ý định chính xác hơn nhiều so với chỉ đọc code)
- **Tùy chọn nhưng rất quan trọng nếu có:** Ngữ cảnh nghiệp vụ — branch này đang làm gì, branch kia đang làm gì. Nếu người dùng không cung cấp và code không đủ rõ để suy luận ý định, PHẢI hỏi lại thay vì đoán bừa — đoán sai ý định là rủi ro lớn nhất của skill này.

Nếu người dùng chỉ dán conflict mà không có gì thêm, cứ tiến hành phân tích dựa trên code trước, nhưng nếu ý định 2 bên không rõ ràng chỉ từ code, dừng lại hỏi thêm ngữ cảnh trước khi đề xuất merge — không tự bịa ý định.

---

## Quy trình bắt buộc (không được bỏ qua bước 1-2 để nhảy thẳng vào merge)

### Bước 1: Phân tích ý định từng bên riêng biệt
- Đọc phiên bản HEAD (phần trên marker `=======`): nó đang cố làm gì, giải quyết vấn đề gì
- Đọc phiên bản đang merge vào (phần dưới): nó đang cố làm gì, giải quyết vấn đề gì
- Dùng commit message (nếu có) để xác nhận/điều chỉnh suy luận, không chỉ đoán từ code

### Bước 2: Đánh giá mức độ mâu thuẫn
Phân vào 1 trong 3 nhóm:
- **Không mâu thuẫn, có thể kết hợp cả hai** — cả 2 thay đổi độc lập về mặt logic, ví dụ một bên sửa công thức tính, một bên thêm điều kiện chặn giá trị âm
- **Mâu thuẫn thật sự** — 2 bên có ý định trái ngược nhau về mặt nghiệp vụ (ví dụ một bên cho phép giá trị âm, một bên chặn giá trị âm) — trường hợp này KHÔNG tự chọn 1 bên, phải trình bày rõ mâu thuẫn và hỏi người dùng quyết định
- **Một bên có thể đã lỗi thời** — ví dụ ý định của HEAD đã được giải quyết theo cách khác ở nhánh kia — nêu rõ nghi vấn này thay vì mặc định giữ theo commit mới hơn

### Bước 3: Đề xuất merge (chỉ khi thuộc nhóm "không mâu thuẫn" hoặc người dùng đã xác nhận hướng xử lý cho nhóm "mâu thuẫn thật sự")
- Viết ra đoạn code cụ thể sau khi merge
- Giải thích ngắn gọn tại sao chọn cách này
- Nếu phát hiện thêm vấn đề ngoài phạm vi conflict (như ví dụ thiếu `qty` trong phép tính ở một bên) — luôn nêu ra, đây thường là giá trị lớn nhất của việc phân tích kỹ thay vì merge nhanh

---

## Format output

```markdown
## Phân tích ý định

**HEAD (bên trên):** [Ý định, dựa trên code + commit message nếu có]

**<tên-branch-kia> (bên dưới):** [Ý định, dựa trên code + commit message nếu có]

## Đánh giá
[Không mâu thuẫn / Mâu thuẫn thật sự / Nghi vấn một bên lỗi thời — giải 
thích ngắn gọn tại sao]

## Đề xuất merge
(Chỉ điền phần này nếu đã rõ hướng xử lý — nếu mâu thuẫn thật sự và cần 
người dùng quyết định, thay phần này bằng câu hỏi cụ thể)

\`\`\`[ngôn ngữ tương ứng]
[code sau khi merge]
\`\`\`

**Lý do chọn cách merge này:** [giải thích]

## Lưu ý thêm (nếu có)
[Vấn đề phát sinh phát hiện được ngoài phạm vi conflict, ví dụ bug tiềm 
ẩn ở 1 trong 2 bên]
```

---

## Nguyên tắc khi phân tích

- **Không bao giờ chọn merge kiểu "giữ nguyên HEAD" hoặc "giữ nguyên branch kia" một cách máy móc** chỉ vì đó là cách nhanh nhất — luôn ưu tiên hiểu ý định trước
- **Nếu ý định 2 bên mâu thuẫn thật sự về nghiệp vụ, không tự quyết định thay người dùng** — trình bày rõ 2 lựa chọn và hỏi, đặc biệt với conflict liên quan tiền bạc, bảo mật, hoặc dữ liệu người dùng
- **Không merge mù quáng bằng cách gộp cả 2 đoạn code lại** (giữ cả if và else, giữ cả 2 hàm cùng tên...) trừ khi đã xác nhận đây thực sự là cách đúng
- **Luôn nhắc người dùng test lại sau khi merge**, đặc biệt nếu conflict liên quan logic quan trọng — skill này hỗ trợ ra quyết định, không thay thế việc kiểm thử
- Nếu thiếu ngữ cảnh nghiệp vụ và không thể suy luận chắc chắn từ code, thà hỏi lại còn hơn đưa ra đề xuất merge sai

---

## Sau khi đề xuất merge xong

Nhắc ngắn gọn: "Nhớ test lại kỹ phần này sau khi merge, đặc biệt nếu liên quan logic nghiệp vụ quan trọng." Nếu ở nhóm "mâu thuẫn thật sự", luôn kết thúc bằng câu hỏi rõ ràng để người dùng chọn hướng, không tự ý quyết định.
