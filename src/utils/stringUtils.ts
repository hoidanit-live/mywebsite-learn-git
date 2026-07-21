/** Các hàm tiện ích xử lý chuỗi. */

/** Viết hoa chữ cái đầu tiên, bỏ khoảng trắng thừa. */
export function capitalize(str: string): string {
  const trimmed = str.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

/** Chuyển chuỗi thành slug (dùng cho URL). */
export function slugify(str: string): string {
  return str
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
