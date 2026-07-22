---
name: git-gitignore-hooks-writer
description: Sinh file .gitignore chuẩn theo stack dự án, và/hoặc viết pre-commit hook (lint, format, chặn commit chứa secret) phù hợp với công cụ dự án đang dùng. LUÔN dùng skill này khi người dùng yêu cầu "viết gitignore", "tạo .gitignore cho dự án", "viết pre-commit hook", "chặn commit chứa secret", "setup lint/format tự động trước khi commit", hoặc mô tả stack dự án và muốn có 2 file này. Nếu người dùng chỉ cần 1 trong 2 (chỉ gitignore hoặc chỉ hook), vẫn dùng skill này nhưng chỉ thực hiện phần được yêu cầu. Không dùng skill này để review code đã có (đó là skill code-review-pr) hay viết script cho git bisect (đó là skill bisect-script-writer) — skill này chỉ tập trung sinh .gitignore và viết git hook.
---

# Skill: Sinh .gitignore & Git Hooks

## Mục tiêu

Từ stack công nghệ của dự án, sinh ra file `.gitignore` đầy đủ và/hoặc pre-commit hook chạy đúng công cụ dự án đang dùng (lint, format, chặn secret) — 2 lớp phòng thủ ngăn commit nhầm file rác hoặc lộ thông tin nhạy cảm.

---

## Input cần có

- **Bắt buộc:** Stack/ngôn ngữ dự án đang dùng (ví dụ: Node.js + React, Python Django, Java Spring Boot). Nếu người dùng không nói rõ, hỏi lại trước khi viết — `.gitignore` và hook sai stack sẽ vô dụng hoặc gây lỗi
- **Nếu yêu cầu pre-commit hook, cần thêm:** công cụ lint/format cụ thể đang dùng (ESLint, Prettier, Pylint, Black, gofmt...). Nếu người dùng chưa cài công cụ nào, hỏi họ muốn skill đề xuất công cụ phổ biến cho stack đó không, thay vì tự ý giả định
- **Tùy chọn:** Package manager cho hook chia sẻ được qua team (ví dụ Husky cho Node.js, pre-commit framework cho Python) — nếu người dùng muốn hook tự động cài cho cả team khi clone dự án, không chỉ chạy trên máy cá nhân

---

## Phần 1: Sinh .gitignore

Luôn bao gồm đủ các nhóm sau, điều chỉnh theo đúng stack:
- Thư mục dependency (`node_modules/`, `venv/`, `vendor/`...)
- File môi trường/secret (`.env`, `.env.local`, `*.pem`, `*.key`...)
- File build/output (`dist/`, `build/`, `*.class`, `__pycache__/`...)
- File cấu hình IDE cá nhân (`.vscode/`, `.idea/`)
- File hệ điều hành phổ biến (`.DS_Store`, `Thumbs.db`)
- Bất kỳ file đặc thù nào của framework cụ thể (ví dụ `.next/` cho Next.js, `*.pyc` cho Python)

Không copy nguyên một template gitignore chung chung không khớp stack — luôn điều chỉnh đúng theo công nghệ người dùng đã nêu.

---

## Phần 2: Viết pre-commit hook

### Nguyên tắc bắt buộc
- **Chỉ chạy trên các file đã staged**, không chạy toàn bộ repo (dùng `git diff --cached --name-only --diff-filter=ACM`) — để hook nhanh, không làm chậm mỗi lần commit
- **Thứ tự chạy:** format trước (tự sửa được) → lint (chặn nếu còn lỗi sau format) → quét secret (luôn chạy, không phụ thuộc kết quả 2 bước trên)
- **Bất kỳ bước nào fail đều phải chặn commit** bằng `exit 1`, kèm thông báo rõ ràng bước nào fail và tại sao
- **Luôn có bước quét secret** dù người dùng không yêu cầu rõ, trừ khi họ nói rõ không cần — đây là lớp bảo vệ quan trọng nhất trong 3 việc

### Quét secret — pattern tối thiểu cần có
- AWS access key: `AKIA[0-9A-Z]{16}`
- Private key format chuẩn: `-----BEGIN [A-Z ]+PRIVATE KEY-----`
- Chuỗi dài nghi là token/API key (heuristic: chuỗi liên tục >20 ký tự gồm chữ+số trong ngữ cảnh biến có tên chứa `key`, `token`, `secret`, `password`)

Luôn giải thích rõ ràng: đây là lớp bảo vệ bổ sung ở máy cá nhân, có thể bị bỏ qua bằng `git commit --no-verify`, không thay thế công cụ quét chuyên dụng ở tầng CI/CD.

---

## Format output

```markdown
## File .gitignore

\`\`\`gitignore
[nội dung .gitignore]
\`\`\`

## Pre-commit hook (.git/hooks/pre-commit)

\`\`\`bash
#!/bin/bash
[nội dung script]
\`\`\`

## Cách cài đặt
\`\`\`bash
chmod +x .git/hooks/pre-commit
\`\`\`

**Lưu ý:** \`.git/hooks/\` không được đồng bộ qua Git — mỗi thành viên team 
phải tự cài hook này, hoặc dùng [Husky/pre-commit framework tùy stack] để 
hook tự động cài khi clone/install dự án.

## Trước khi tin tưởng dùng thật
Test hook bằng cách cố tình commit 1 file có lỗi lint và 1 file chứa chuỗi 
trông giống API key, xác nhận hook chặn đúng như mong đợi.
```

Nếu người dùng chỉ yêu cầu 1 trong 2 phần, chỉ xuất phần được yêu cầu, bỏ phần còn lại.

---

## Nguyên tắc chung

- **Không giả định công cụ lint/format nếu người dùng chưa nói rõ** — hỏi lại hoặc đề xuất công cụ phổ biến cho stack đó và xin xác nhận trước khi viết hook dựa trên công cụ đó
- **Luôn nhắc rõ giới hạn của hook chặn secret** (có thể bị bỏ qua bằng `--no-verify`, không thay thế công cụ CI chuyên dụng) — tránh để người dùng hiểu nhầm đây là lớp bảo vệ tuyệt đối
- **Không viết hook quá nặng** (chạy toàn bộ test suite, build lại toàn bộ dự án) trong `pre-commit` — việc nặng nên để hook `pre-push` hoặc CI, pre-commit cần nhanh để không gây khó chịu khi commit thường xuyên
- Nếu dự án đã có sẵn `.gitignore`, hỏi người dùng muốn thay thế hoàn toàn hay chỉ bổ sung phần thiếu, không tự ý ghi đè

---

## Sau khi đưa kết quả xong

Nhắc ngắn gọn: "Nhớ test hook trước khi tin tưởng dùng thật, và nếu team nhiều người, cân nhắc dùng công cụ chia sẻ hook (Husky/pre-commit framework) để mọi người đều có hook này khi clone dự án."
