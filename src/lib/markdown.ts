import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkHtml from 'remark-html';
import TurndownService from 'turndown';

/**
 * マークダウンをHTMLに変換する
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkHtml, { sanitize: false })
    .process(markdown);
  
  return String(result);
}

/**
 * HTMLをマークダウンに変換する
 */
export function htmlToMarkdown(html: string): string {
  try {
    // turndownライブラリを使用
    const turndownService = new TurndownService({
      headingStyle: 'atx', // # 形式の見出し
      bulletListMarker: '-', // - でリスト
      codeBlockStyle: 'fenced', // ``` でコードブロック
    });
    
    return turndownService.turndown(html);
  } catch (error) {
    console.error('HTML to Markdown conversion failed:', error);
    // フォールバック: 基本的なHTMLタグを手動で変換
    return basicHtmlToMarkdown(html);
  }
}

/**
 * 基本的なHTMLからマークダウンへの変換（フォールバック）
 */
function basicHtmlToMarkdown(html: string): string {
  return html
    // 見出し
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n')
    
    // 太字・斜体
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
    
    // 取り消し線
    .replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~')
    .replace(/<del[^>]*>(.*?)<\/del>/gi, '~~$1~~')
    .replace(/<strike[^>]*>(.*?)<\/strike>/gi, '~~$1~~')
    
    // リスト
    .replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, content) => {
      const items = content.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
      return items.map((item: string) => 
        '- ' + item.replace(/<li[^>]*>(.*?)<\/li>/gi, '$1').trim()
      ).join('\n') + '\n\n';
    })
    .replace(/<ol[^>]*>(.*?)<\/ol>/gis, (match, content) => {
      const items = content.match(/<li[^>]*>(.*?)<\/li>/gi) || [];
      return items.map((item: string, index: number) => 
        `${index + 1}. ` + item.replace(/<li[^>]*>(.*?)<\/li>/gi, '$1').trim()
      ).join('\n') + '\n\n';
    })
    
    // 段落
    .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
    
    // 改行
    .replace(/<br[^>]*\/?>/gi, '\n')
    
    // その他のHTMLタグを削除
    .replace(/<[^>]+>/g, '')
    
    // 連続する改行を整理
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * コンテンツがHTMLかマークダウンかを判定する
 */
export function isHtmlContent(content: string): boolean {
  // HTMLタグが含まれているかチェック
  const htmlTagPattern = /<[^>]+>/;
  return htmlTagPattern.test(content);
}

/**
 * TiptapエディタでレンダリングするためのHTML準備
 * マークダウンの場合はHTMLに変換し、HTMLの場合はそのまま返す
 */
export async function prepareContentForEditor(content: string): Promise<string> {
  if (isHtmlContent(content)) {
    return content;
  } else {
    return await markdownToHtml(content);
  }
}

/**
 * ファイル保存用のマークダウン準備
 * HTMLの場合はマークダウンに変換し、マークダウンの場合はそのまま返す
 */
export function prepareContentForStorage(content: string): string {
  if (isHtmlContent(content)) {
    return htmlToMarkdown(content);
  } else {
    return content;
  }
}