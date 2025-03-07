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
  testName: /^([^\n]+)/,

  /**
   * ファイルパス抽出パターン
   * 例: src/recorder/recorder/handlers/NavigationHandler.test.ts
   */
  filePath: /([a-zA-Z0-9_\-/.]+\.(spec|test)\.[jt]sx?)/i,

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
    // Vitestの行番号つきコードスニペット (❯ から始まる行を含む最小限のブロック)
    /❯\s+[\w/\.\-]+:\d+:\d+[\s\S]*?(?=\n\s*⎯{10,}|\n\s*FAIL|\n\s*$|$)/s,

    // 行番号とパイプ記号を含むコードスニペット（より多くの行を含むようにパターンを改善）
    /\n\s*\d+\s*\|\s*.+\n\s*\d+\s*\|\s*.+\n\s*\d+\s*\|\s*.+(?:\n\s*\d+\s*\|\s*.+)*/s,

    // カラット(^)を含むコード行
    /\n\s*\d+\s*\|.*\n\s*\|.*\^.*\n/s,

    // 以前のパターンをフォールバックとして保持
    /(\[\n|\s+\[\n)[\s\S]*?(\]\n|\s+\]\n)/s,
    /\n\s*at\s+[^\n]+\n\s*at\s+[^\n]+/s,
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

  /**
   * テスト名とファイルパスの抽出パターン
   * 例: FAIL src/recorder/recorder/handlers/NavigationHandler.test.ts > ActionRecorder > 基本機能
   */
  filePathAndTestName:
    /FAIL\s+([a-zA-Z0-9_\-/.]+\.(spec|test)\.[jt]sx?)\s+>\s+(.+?)(?=\n)/i,

  /**
   * エラーや失敗を示す行の抽出パターン
   * 例: error: expected value to match
   */
  errorLine: /(?:error|fail|failed|assertion)(?:\s*:\s*|\s+)(.+)/i,

  /**
   * テスト関数の名前抽出パターン
   * 例: test("should do something")
   */
  testFunction: /(?:test|it|describe)(?:\s*\(\s*|\s+)['"]([^'"]+)['"]/i,

  /**
   * 行番号とコロンを含むパターン
   * 例: 10:42
   */
  lineNumberInText: /[:\s](\d+:\d+)[\s:]/,

  /**
   * 詳細なエラーセクションの区切りパターン
   */
  errorSectionDivider: /⎯{10,}[^\n]*\n\n/,

  /**
   * Failed Testsセクションのパターン
   */
  failedTestsHeader: /Failed Tests \d+/,
};
