// src/utils/regexPatterns.ts

/**
 * Vitestのテスト結果パースに使用する正規表現パターン
 * パターンの管理を一元化して保守性を向上させる
 */
export const VitestPatterns = {
  /**
   * FAIL行パターン
   * 例: FAIL src/example.test.ts
   */
  failLine: /\s*FAIL\s+/g,

  /**
   * テスト名抽出パターン
   * 例: NavigationHandler > handleBeforeUnload > ビーコンを正しく送信する
   */
  testName: />\s+([^>][^\n]+?)(?=\s+\d+ms|\s*$)/,

  /**
   * ファイルパス抽出パターン
   * 例: src/recorder/recorder/handlers/NavigationHandler.test.ts
   */
  filePath: /(?:FAIL|❯)\s+([a-zA-Z0-9_\-/.]+\.(spec|test)\.[jt]sx?)/i,

  /**
   * エラーメッセージ抽出パターン
   * 例: AssertionError: expected "spy" to be called with arguments: [ { type: 'HISTORY_NAVIGATE', …(4) } ]
   */
  errorMessage:
    /(?:AssertionError|TypeError|Error):\s+(.+?)(?=\n\s*❯|\n\s*\n|\n\s*$)/s,

  /**
   * 行番号情報抽出パターン
   * 例: ❯ src/recorder/recorder/handlers/NavigationHandler.test.ts:162:42
   */
  lineNumber: /❯\s+[\w/\.\-]+:(\d+:\d+)/,

  /**
   * コードスニペット抽出パターン群
   */
  codeSnippet: [
    // ❯行から始まり、行番号付きのコードブロックを含むパターン
    /❯\s+[\w/\.\-]+:\d+:\d+\n[\s\S]*?\d+\s*\|\s*.+\n\s*\|.*\^.*\n(?:\s*\d+\s*\|\s*.+\n)*/s,

    // 行番号とパイプ記号を含むコードスニペット（より多くの行を含むようにパターンを改善）
    /\n\s*\d+\s*\|\s*.+\n\s*\d+\s*\|\s*.+\n\s*\d+\s*\|\s*.+(?:\n\s*\d+\s*\|\s*.+)*/s,

    // カラット(^)を含むコード行
    /\n\s*\d+\s*\|.*\n\s*\|.*\^.*\n/s,

    // 以前のパターンをフォールバックとして保持
    // より多くのスタックトレース行にマッチするパターン

    /\n\s*at\s+[^\n]+(?:\n\s*at\s+[^\n]+)+/s,
    /\{\s*[\s\S]*?:\s*["'][\s\S]*?["'][\s\S]*?\}/s,
  ],

  /**
   * 期待値抽出パターン群
   */
  expected: [
    /Expected:[\s\S]*?(?=\n\s*Received:|\n\s*Number of calls:|\n\s*$)/,
    /Expected value:[\s\S]*?(?=\n\s*Received:|\n\s*Actual:|\n\s*$)/,
    /expect\([^)]+\)\.to[A-Za-z]+\(([^)]+)\)/,
    /Expected [\s\S]*?(?=\n\s*but got:|\n\s*$)/i,
  ],

  /**
   * 実際値抽出パターン群
   */
  received: [
    // Receivedとその後のNumber of callsまでを一括で抽出するように改善
    /Received:[\s\S]*?(?:Number of calls:[^\n]*(?:\n\s*\n|\n\s*❯|\n\s*⎯{10,}|\n\s*$|$))/s,
    /Actual:[\s\S]*?(?=\n\s*$|$)/,
    /But got:[\s\S]*?(?=\n\s*$|$)/,
    /Instead received:[\s\S]*?(?=\n\s*$|$)/,
  ],

  /**
   * テストファイルパスとテスト名の組み合わせパターン
   * 例: FAIL src/recorder/recorder/ActionRecorder.test.ts > ActionRecorder > 基本機能
   */
  filePathWithTestName:
    /FAIL\s+([a-zA-Z0-9_\-/.]+\.(spec|test)\.[jt]sx?)\s+>\s+([^>][^\n]+?)(?=\s+\d+ms|\s*$)/,
  
  /**
   * 失敗したテスト検出パターン群
   */
  failedTestPatterns: [
    // パターン1: 「×」マークでテスト名とメッセージが含まれるもの
    /(?:×|✗|✘)\s+([^\n]+?)\s+\d+ms\s*\n[^\n]*?→\s+([^\n]+)/g,

    // パターン2: 「FAIL」や「ERROR」などが含まれるもの
    /(?:FAIL|ERROR|FAILED)(?:\s*-\s*|\s+)([^\n]+)\s*\n[^\n]*?(?:Error|Failed|AssertionError):\s*([^\n]+)/g,

    // パターン3: テスト名が引用符で囲まれたスタイル
    /test\s+['"]([^'"]+)['"]\s+(?:failed|did not pass)(?:[^\n]*)(?:\n[^\n]*?(?:Error|Failed):\s*([^\n]+))?/g,

    // パターン4: FaIL行とAssertionErrorを含むVitest出力形式
    /FAIL\s+(.+?)(?=\n\s*)(?:\n\s*)((?:AssertionError|Error):[^\n]+)/g,
  ],

  /**
   * ファイルパス検出パターン群
   */
  filePathPatterns: [
    /(?:FAIL|ERROR|FAILED)\s+([^\s]+\.[jt]sx?)/i,
    /● ([^\s]+\.[jt]sx?)/i,
    /([^/\s]+\/[^\s]+\.[jt]sx?)/i,
    /([a-zA-Z0-9_\-/.]+\.(spec|test)\.[jt]sx?)/i,
  ],
};
