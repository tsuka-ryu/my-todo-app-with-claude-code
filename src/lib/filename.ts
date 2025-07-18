/**
 * タイトルからファイル名を生成する
 */
export function generateFilenameFromTitle(title: string): string {
  return title
    .trim()
    // ファイルシステムで問題となる文字を削除または置換
    .replace(/[<>:"/\\|?*]/g, '') // Windows/Unix で禁止されている文字
    .replace(/\s+/g, '-') // 空白をハイフンに変換
    .replace(/\.+$/, '') // 末尾のドットを削除（隠しファイル防止）
    .replace(/^\.+/, '') // 先頭のドットを削除
    // 最大200文字に制限（ファイルシステムの制限を考慮）
    .substring(0, 200)
    .trim();
}

/**
 * ファイル名のバリデーション
 */
export function validateFilename(filename: string): { isValid: boolean; error?: string } {
  if (!filename) {
    return { isValid: false, error: 'ファイル名は必須です' };
  }

  if (filename.length < 1) {
    return { isValid: false, error: 'ファイル名は1文字以上である必要があります' };
  }

  if (filename.length > 200) {
    return { isValid: false, error: 'ファイル名は200文字以下である必要があります' };
  }

  // 禁止文字のチェック
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(filename)) {
    return { isValid: false, error: 'ファイル名に使用できない文字が含まれています' };
  }

  // 予約されたファイル名のチェック（Windowsの制限）
  const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
  if (reservedNames.includes(filename.toUpperCase())) {
    return { isValid: false, error: 'このファイル名は予約されています' };
  }

  return { isValid: true };
}

/**
 * 重複チェック用のファイル名候補を生成
 */
export function generateUniqueFilenameCandidates(baseFilename: string): string[] {
  const candidates = [baseFilename];
  
  // 数字サフィックスを追加した候補を生成
  for (let i = 2; i <= 10; i++) {
    candidates.push(`${baseFilename}-${i}`);
  }
  
  return candidates;
}

/**
 * タイムスタンプベースのフォールバックファイル名を生成
 */
export function generateFallbackFilename(): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `todo-${timestamp}`;
}