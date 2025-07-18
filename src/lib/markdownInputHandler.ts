interface EditorView {
  state: {
    selection: {
      $from: {
        nodeBefore?: { textContent: string };
        pos: number;
        start: () => number;
      };
    };
    doc: {
      textBetween: (from: number, to: number, separator?: string) => string;
    };
    tr: {
      delete: (from: number, to: number) => { insertText: (text: string) => void };
    };
  };
  dispatch: (tr: unknown) => void;
  dom: {
    closest: (selector: string) => { __tiptapEditor?: unknown } | null;
  };
}

/**
 * マークダウン記法の入力を自動変換するハンドラー
 */
export function markdownInputHandler(view: EditorView, event: KeyboardEvent): boolean {
  // スペースキー or Enterキーが押されたときにマークダウン記法を変換
  if (event.key !== ' ' && event.key !== 'Enter') {
    return false;
  }

  const { state } = view;
  const { selection } = state;
  const { $from } = selection;
  const textBefore = $from.nodeBefore?.textContent || '';
  const currentLineText = getCurrentLineText(view);
  
  // 見出し変換（##, ###）
  if (event.key === ' ') {
    const headingMatch = currentLineText.match(/^(#{1,6})\s*$/);
    if (headingMatch) {
      const level = Math.min(headingMatch[1].length, 6);
      const from = $from.pos - headingMatch[0].length;
      const to = $from.pos;
      
      // 見出しに変換
      const tr = state.tr.delete(from, to);
      view.dispatch(tr);
      
      // 見出しコマンドを実行
      setTimeout(() => {
        const editor = view.dom.closest('[data-tiptap-editor]')?.__tiptapEditor;
        if (editor) {
          editor.chain().focus().toggleHeading({ level }).run();
        }
      }, 0);
      
      return true;
    }
  }

  // リスト変換（-）
  if (event.key === ' ') {
    const listMatch = currentLineText.match(/^[-*+]\s*$/);
    if (listMatch) {
      const from = $from.pos - listMatch[0].length;
      const to = $from.pos;
      
      // リストマーカーを削除
      const tr = state.tr.delete(from, to);
      view.dispatch(tr);
      
      // リストコマンドを実行
      setTimeout(() => {
        const editor = view.dom.closest('[data-tiptap-editor]')?.__tiptapEditor;
        if (editor) {
          editor.chain().focus().toggleBulletList().run();
        }
      }, 0);
      
      return true;
    }
  }

  // 番号付きリスト変換（1.）
  if (event.key === ' ') {
    const orderedListMatch = currentLineText.match(/^(\d+)\.\s*$/);
    if (orderedListMatch) {
      const from = $from.pos - orderedListMatch[0].length;
      const to = $from.pos;
      
      // リストマーカーを削除
      const tr = state.tr.delete(from, to);
      view.dispatch(tr);
      
      // 番号付きリストコマンドを実行
      setTimeout(() => {
        const editor = view.dom.closest('[data-tiptap-editor]')?.__tiptapEditor;
        if (editor) {
          editor.chain().focus().toggleOrderedList().run();
        }
      }, 0);
      
      return true;
    }
  }

  // 太字変換（**text**）
  if (event.key === '*' && textBefore.endsWith('*')) {
    const beforeCursor = currentLineText.slice(0, -1);
    const boldMatch = beforeCursor.match(/\*\*([^*]+)\*$/);
    if (boldMatch) {
      const from = $from.pos - boldMatch[0].length - 1;
      const to = $from.pos;
      
      // マークダウン記法を削除
      const tr = state.tr.delete(from, to).insertText(boldMatch[1]);
      view.dispatch(tr);
      
      // 太字を適用
      setTimeout(() => {
        const editor = view.dom.closest('[data-tiptap-editor]')?.__tiptapEditor;
        if (editor) {
          const startPos = from;
          const endPos = from + boldMatch[1].length;
          editor.chain().focus().setTextSelection({ from: startPos, to: endPos }).toggleBold().run();
        }
      }, 0);
      
      return true;
    }
  }

  // 斜体変換（*text*）
  if (event.key === '*' && !textBefore.endsWith('*')) {
    const beforeCursor = currentLineText.slice(0, -1);
    const italicMatch = beforeCursor.match(/\*([^*]+)$/);
    if (italicMatch) {
      const from = $from.pos - italicMatch[0].length - 1;
      const to = $from.pos;
      
      // マークダウン記法を削除
      const tr = state.tr.delete(from, to).insertText(italicMatch[1]);
      view.dispatch(tr);
      
      // 斜体を適用
      setTimeout(() => {
        const editor = view.dom.closest('[data-tiptap-editor]')?.__tiptapEditor;
        if (editor) {
          const startPos = from;
          const endPos = from + italicMatch[1].length;
          editor.chain().focus().setTextSelection({ from: startPos, to: endPos }).toggleItalic().run();
        }
      }, 0);
      
      return true;
    }
  }

  return false;
}

/**
 * 現在の行のテキストを取得
 */
function getCurrentLineText(view: EditorView): string {
  const { state } = view;
  const { selection } = state;
  const { $from } = selection;
  
  // 現在の行の開始位置を取得
  const lineStart = $from.start();
  const lineEnd = $from.pos;
  
  // 行のテキストを取得
  return state.doc.textBetween(lineStart, lineEnd, '');
}