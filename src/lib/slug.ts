/**
 * タイトルからslugを生成する
 */
export function generateSlugFromTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    // 日本語文字、英数字、ハイフン、アンダースコア以外を削除
    .replace(/[^\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3040-\u309F\w\s-]/g, '')
    // 空白をハイフンに変換
    .replace(/\s+/g, '-')
    // 連続するハイフンを単一に
    .replace(/-+/g, '-')
    // 先頭と末尾のハイフンを削除
    .replace(/^-+|-+$/g, '')
    // 最大50文字に制限
    .substring(0, 50)
    // 末尾のハイフンを再度削除（切り取りでハイフンが末尾に来た場合）
    .replace(/-+$/, '');
}

/**
 * slugのバリデーション
 */
export function validateSlug(slug: string): { isValid: boolean; error?: string } {
  if (!slug) {
    return { isValid: false, error: 'slugは必須です' };
  }

  if (slug.length < 1) {
    return { isValid: false, error: 'slugは1文字以上である必要があります' };
  }

  if (slug.length > 50) {
    return { isValid: false, error: 'slugは50文字以下である必要があります' };
  }

  // 英数字、日本語文字、ハイフン、アンダースコアのみ許可
  const validPattern = /^[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\w-]+$/;
  if (!validPattern.test(slug)) {
    return { isValid: false, error: 'slugには英数字、日本語、ハイフン、アンダースコアのみ使用できます' };
  }

  // 先頭・末尾がハイフンでないことを確認
  if (slug.startsWith('-') || slug.endsWith('-')) {
    return { isValid: false, error: 'slugの先頭・末尾にハイフンは使用できません' };
  }

  // 連続するハイフンの禁止
  if (slug.includes('--')) {
    return { isValid: false, error: 'slugに連続するハイフンは使用できません' };
  }

  return { isValid: true };
}

/**
 * slugの正規化（ユーザー入力を安全なslugに変換）
 */
export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    // 危険な文字を削除
    .replace(/[^\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\w\s-]/g, '')
    // 空白をハイフンに変換
    .replace(/\s+/g, '-')
    // 連続するハイフンを単一に
    .replace(/-+/g, '-')
    // 先頭と末尾のハイフンを削除
    .replace(/^-+|-+$/g, '')
    // 最大50文字に制限
    .substring(0, 50)
    // 末尾のハイフンを再度削除
    .replace(/-+$/, '');
}

/**
 * 重複チェック用のslug候補を生成
 */
export function generateUniqueSlugCandidates(baseSlug: string): string[] {
  const candidates = [baseSlug];
  
  // 数字サフィックスを追加した候補を生成
  for (let i = 2; i <= 10; i++) {
    candidates.push(`${baseSlug}-${i}`);
  }
  
  return candidates;
}

/**
 * タイムスタンプベースのフォールバックslugを生成
 */
export function generateFallbackSlug(): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `todo-${timestamp}`;
}