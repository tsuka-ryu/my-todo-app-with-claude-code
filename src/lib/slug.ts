/**
 * タイトルからslugを生成する
 */
export function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // 英数字、空白、ハイフン以外を削除
    .replace(/\s+/g, '-') // 空白をハイフンに変換
    .replace(/-+/g, '-') // 連続するハイフンを単一に
    .replace(/^-|-$/g, ''); // 先頭と末尾のハイフンを削除
}