/** Các hàm tiện ích xử lý chuỗi. */

/** Viết hoa chữ cái đầu tiên, bỏ khoảng trắng thừa. */
export function capitalize(str: string): string {
  const trimmed = str.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/** Bỏ dấu tiếng Việt, ví dụ "Việt Nam" -> "Viet Nam". */
function removeDiacritics(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

/** Chuyển chuỗi thành slug (dùng cho URL), hỗ trợ tiếng Việt có dấu. */
export function slugify(str: string): string {
  return removeDiacritics(str)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");
}

/** Cắt ngắn chuỗi và thêm "..." nếu vượt quá maxLength. */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + "...";
}

/** Kiểm tra chuỗi rỗng hoặc chỉ chứa khoảng trắng. */
export function isBlank(str: string): boolean {
  return str.trim().length === 0;
}

/** Escape các ký tự HTML đặc biệt để chống XSS khi render ra DOM. */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Che bớt chuỗi nhạy cảm (số thẻ, SĐT...), chỉ giữ lại `visibleCount` ký tự cuối. */
export function maskString(str: string, visibleCount = 4): string {
  if (str.length <= visibleCount) return str;
  const maskedLength = str.length - visibleCount;
  return "*".repeat(maskedLength) + str.slice(maskedLength);
}
