# Checklist chi tiết review code

Dùng file này khi cần soi kỹ hơn checklist tóm tắt trong SKILL.md — đặc biệt với diff lớn hoặc code liên quan bảo mật/tài chính.

## Bug logic

- **Điều kiện biên:** `<` thay vì `<=`, index bắt đầu từ 0 hay 1, vòng lặp `for` chạy thừa/thiếu 1 lần
- **Giá trị rỗng:** hàm có xử lý `null`, `undefined`, `""`, mảng rỗng, object rỗng chưa? Đặc biệt khi destructure object hoặc gọi `.map()/.filter()` trên dữ liệu có thể `undefined`
- **Async/Promise:** quên `await` trước hàm async, `.then()` không có `.catch()`, gọi nhiều async song song nhưng dùng sai `Promise.all` vs tuần tự, race condition khi nhiều request cùng sửa 1 state
- **Logic điều kiện:** if/else có bị đảo ngược không, toán tử `&&`/`||` dùng đúng chỗ chưa, so sánh `==` vs `===` (với ngôn ngữ có phân biệt)
- **Return value:** hàm có return đúng type mong đợi ở mọi nhánh không, có nhánh nào quên return dẫn đến `undefined` không
- **State mutation:** có mutate trực tiếp state/object được truyền vào (side effect không mong muốn) không, đặc biệt trong React/Redux

## Security issue

- **Secrets:** API key, DB password, token, private key có bị hardcode trong code không (kể cả trong comment, test file, hoặc file config commit nhầm)
- **Injection:** SQL injection (nối chuỗi query), command injection (exec shell command với input người dùng), NoSQL injection
- **XSS:** dữ liệu người dùng có được render thẳng ra HTML mà không escape không (`dangerouslySetInnerHTML`, `innerHTML`, template không escape)
- **Authorization:** endpoint/hàm nhạy cảm có kiểm tra quyền của người gọi trước khi thực hiện không, hay chỉ check authentication (đăng nhập) mà quên check authorization (được phép làm hành động này không)
- **Input validation:** input từ client có được validate type, độ dài, định dạng trước khi xử lý không
- **Thông tin nhạy cảm bị lộ:** error message trả về client có chứa stack trace, đường dẫn hệ thống, hoặc thông tin nội bộ không; log có ghi password/token không

## Code style

- Tên biến/hàm có mô tả đúng mục đích không (tránh tên như `data`, `temp`, `flag1`)
- Hàm có làm đúng 1 việc không, hay đang gánh quá nhiều trách nhiệm (nên tách nhỏ)
- Magic number/string có nên đưa thành constant có tên rõ nghĩa không
- Format/style có khớp với phần code xung quanh không (thụt lề, dấu chấm phẩy, quote style)
