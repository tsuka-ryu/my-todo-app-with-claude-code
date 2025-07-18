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
      
      // エディタコマンドを直接実行（カーソル位置を正確に保持）
      const editor = view.dom.closest('[data-tiptap-editor]')?.__tiptapEditor;
      if (editor) {
        // 見出しマークを削除してから見出しに変換
        const from = $from.pos - headingMatch[0].length;
        const to = $from.pos;
        editor.chain()
          .focus()
          .setTextSelection({ from, to })
          .deleteSelection()
          .toggleHeading({ level })
          .run();
        
        return true;
      }
    }
  }

  // リスト変換（-）
  if (event.key === ' ') {
    const listMatch = currentLineText.match(/^[-*+]\s*$/);
    if (listMatch) {
      // エディタコマンドを直接実行（カーソル位置を正確に保持）
      const editor = view.dom.closest('[data-tiptap-editor]')?.__tiptapEditor;
      if (editor) {
        // リストマークを削除してからリストに変換
        const from = $from.pos - listMatch[0].length;
        const to = $from.pos;
        editor.chain()
          .focus()
          .setTextSelection({ from, to })
          .deleteSelection()
          .toggleBulletList()
          .run();
        
        return true;
      }
    }
  }

  // 番号付きリスト変換（1.）
  if (event.key === ' ') {
    const orderedListMatch = currentLineText.match(/^(\d+)\.\s*$/);
    if (orderedListMatch) {
      // エディタコマンドを直接実行（カーソル位置を正確に保持）
      const editor = view.dom.closest('[data-tiptap-editor]')?.__tiptapEditor;
      if (editor) {
        // 番号付きリストマークを削除してからリストに変換
        const from = $from.pos - orderedListMatch[0].length;
        const to = $from.pos;
        editor.chain()
          .focus()
          .setTextSelection({ from, to })
          .deleteSelection()
          .toggleOrderedList()
          .run();
        
        return true;
      }
    }
  }

  // 太字変換（**text**）
  if (event.key === '*' && textBefore.endsWith('*')) {
    const beforeCursor = currentLineText.slice(0, -1);
    const boldMatch = beforeCursor.match(/\*\*([^*]+)\*$/);
    if (boldMatch) {
      // エディタコマンドを直接実行（カーソル位置を正確に保持）
      const editor = view.dom.closest('[data-tiptap-editor]')?.__tiptapEditor;
      if (editor) {
        const from = $from.pos - boldMatch[0].length - 1;
        const to = $from.pos;
        
        // マークダウン記法を削除してテキストを挿入後、太字適用
        editor.chain()
          .focus()
          .setTextSelection({ from, to })
          .insertContent(boldMatch[1])
          .setTextSelection({ from, to: from + boldMatch[1].length })
          .toggleBold()
          .run();
        
        return true;
      }
    }
  }

  // 斜体変換（*text*）
  if (event.key === '*' && !textBefore.endsWith('*')) {
    const beforeCursor = currentLineText.slice(0, -1);
    const italicMatch = beforeCursor.match(/\*([^*]+)$/);
    if (italicMatch) {
      // エディタコマンドを直接実行（カーソル位置を正確に保持）
      const editor = view.dom.closest('[data-tiptap-editor]')?.__tiptapEditor;
      if (editor) {
        const from = $from.pos - italicMatch[0].length - 1;
        const to = $from.pos;
        
        // マークダウン記法を削除してテキストを挿入後、斜体適用
        editor.chain()
          .focus()
          .setTextSelection({ from, to })
          .insertContent(italicMatch[1])
          .setTextSelection({ from, to: from + italicMatch[1].length })
          .toggleItalic()
          .run();
        
        return true;
      }
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