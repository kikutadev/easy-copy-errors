// src/services/vitestParserService.ts
/**
 * 失敗したVitestテストの情報
 */
export interface FailedTest {
  filePath: string;
  testName: string;
  errorMessage: string;
  codeSnippet: string;
  lineNumber: string; // 追加：行番号情報
  expected: string;
  received: string;
}

/**
 * ファイル別にグループ化された失敗テスト
 */
export interface TestFileGroup {
  filePath: string;
  displayName: string;
  failedTests: FailedTest[];
}

/**
 * Vitestのテスト出力から失敗したテストを抽出する
 * 複数の抽出方法を試し、結果が見つからない場合は次の方法を試すフォールバック機構を実装
 */
export function parseVitestOutput(text: string): FailedTest[] {
  // まず最初の抽出方法を試す
  let failedTests = extractTestsMethod1(text);

  // 失敗したテストが見つからなかった場合、別の抽出方法を試す
  if (failedTests.length === 0) {
    console.log(
      '抽出方法1で失敗したテストが見つかりませんでした。方法2を試します。'
    );
    failedTests = extractTestsMethod2(text);
  }

  // それでも見つからない場合、最後の抽出方法を試す
  if (failedTests.length === 0) {
    console.log(
      '抽出方法2で失敗したテストが見つかりませんでした。方法3を試します。'
    );
    failedTests = extractTestsMethod3(text);
  }

  return failedTests;
}

/**
 * 失敗したテストをファイル別にグループ化する
 */
export function groupTestsByFile(tests: FailedTest[]): TestFileGroup[] {
  // ファイルパスごとにグループ化
  const groups: { [key: string]: TestFileGroup } = {};

  tests.forEach((test) => {
    if (!groups[test.filePath]) {
      // ファイル名の部分だけを抽出（表示用）
      const displayName = test.filePath.split('/').pop() || test.filePath;

      groups[test.filePath] = {
        filePath: test.filePath,
        displayName,
        failedTests: [],
      };
    }

    groups[test.filePath].failedTests.push(test);
  });

  // 配列に変換してファイルパスでソート
  return Object.values(groups).sort((a, b) =>
    a.filePath.localeCompare(b.filePath)
  );
}

/**
 * 抽出方法1: オリジナルの実装 - Vitestの標準出力形式に対応
 */
function extractTestsMethod1(text: string): FailedTest[] {
  const failedTests: FailedTest[] = [];

  // テストファイルのセクションを検出
  const testSections = text.split(/FAIL\s+/g);

  for (let i = 1; i < testSections.length; i++) {
    const section = testSections[i];

    // テスト名と詳細情報を抽出
    const testNameMatch = section.match(/^([^\n]+)/);
    if (!testNameMatch) {
      continue;
    }

    const testName = testNameMatch[1].trim();

    // ファイルパスを抽出
    const filePathMatch = section.match(/([a-zA-Z0-9_\-/.]+\.test\.[jt]sx?)/);
    if (!filePathMatch) {
      continue;
    }

    const filePath = filePathMatch[1];

    // エラーメッセージを抽出
    const errorMatch = section.match(
      /(?:AssertionError|Error):\s+(.+?)(?=\n\s*❯|\n\s*\n|\n\s*$)/s
    );
    const errorMessage = errorMatch ? errorMatch[1].trim() : '';

    // 行番号情報を抽出
    const lineNumberMatch = section.match(/❯\s+[\w/\.\-]+:(\d+:\d+)/);
    const lineNumber = lineNumberMatch ? lineNumberMatch[1] : '';

    // コードスニペットを抽出
    const codeSnippet = extractCodeSnippet(section);

    // 期待値と実際の値を抽出
    const expected = extractExpected(section);
    const received = extractReceived(section);

    failedTests.push({
      filePath,
      testName,
      errorMessage,
      codeSnippet,
      lineNumber,
      expected,
      received,
    });
  }

  return failedTests;
}

/**
 * 抽出方法2: 複数のパターンを使用した抽出方法
 * 様々なVitestの出力形式に対応するため、複数のパターンを試す
 */
function extractTestsMethod2(text: string): FailedTest[] {
  const failedTests: FailedTest[] = [];

  // 失敗したテストの複数のパターン
  const testPatterns = [
    // パターン1: 「×」マークでテスト名とメッセージが含まれるもの
    /(?:×|✗|✘)\s+([^\n]+?)\s+\d+ms\s*\n[^\n]*?→\s+([^\n]+)/g,

    // パターン2: 「FAIL」や「ERROR」などが含まれるもの
    /(?:FAIL|ERROR|FAILED)(?:\s*-\s*|\s+)([^\n]+)\s*\n[^\n]*?(?:Error|Failed|AssertionError):\s*([^\n]+)/g,

    // パターン3: テスト名が引用符で囲まれたスタイル
    /test\s+['"]([^'"]+)['"]\s+(?:failed|did not pass)(?:[^\n]*)(?:\n[^\n]*?(?:Error|Failed):\s*([^\n]+))?/g,

    // 新しいパターン: FaIL行とAssertionErrorを含むVitest出力形式
    /FAIL\s+(.+?)(?=\n\s*)(?:\n\s*)((?:AssertionError|Error):[^\n]+)/g,
  ];

  for (const pattern of testPatterns) {
    // 正規表現のグローバルインデックスをリセット
    pattern.lastIndex = 0;

    let match;
    while ((match = pattern.exec(text)) !== null) {
      const testName = match[1].trim();
      const errorMessage = (match[2] || 'Unknown error').trim();

      // テストの詳細テキストを抽出（エラー周辺の約1000文字）
      const contextStartIdx = Math.max(0, match.index - 200);
      const contextEndIdx = Math.min(
        text.length,
        match.index + match[0].length + 800
      );
      const detailText = text.substring(contextStartIdx, contextEndIdx);

      // ファイルパスを抽出
      let filePath = 'unknown-file';
      const filePathPatterns = [
        /(?:FAIL|ERROR|FAILED)\s+([^\s]+\.[jt]sx?)/i,
        /● ([^\s]+\.[jt]sx?)/i,
        /([^/\s]+\/[^\s]+\.[jt]sx?)/i,
        /([a-zA-Z0-9_\-/.]+\.(spec|test)\.[jt]sx?)/i,
      ];

      for (const filePattern of filePathPatterns) {
        const fileMatch = detailText.match(filePattern);
        if (fileMatch) {
          filePath = fileMatch[1];
          break;
        }
      }

      // 行番号情報を抽出
      const lineNumberMatch = detailText.match(/❯\s+[\w/\.\-]+:(\d+:\d+)/);
      const lineNumber = lineNumberMatch ? lineNumberMatch[1] : '';

      // 期待値と実際の値を抽出
      const expected = extractExpected(detailText);
      const received = extractReceived(detailText);
      const codeSnippet = extractCodeSnippet(detailText);

      failedTests.push({
        filePath,
        testName,
        errorMessage,
        codeSnippet,
        lineNumber,
        expected,
        received,
      });
    }
  }

  return failedTests;
}

/**
 * 抽出方法3: 最も単純な抽出方法（フォールバック）
 * エラーや失敗の単語を検索し、その周辺情報を抽出する
 */
function extractTestsMethod3(text: string): FailedTest[] {
  const failedTests: FailedTest[] = [];

  // FAILで始まる行を検索し、そのセクションを抽出
  const failSections = text.split(/\n\s*FAIL\s+/);
  for (let i = 1; i < failSections.length; i++) {
    const section = 'FAIL ' + failSections[i];

    // ファイルパスらしきものを抽出
    const filePathMatch = section.match(
      /([a-zA-Z0-9_\-/.]+\.(spec|test)\.[jt]sx?)/i
    );
    if (!filePathMatch) {
      continue;
    }
    const filePath = filePathMatch[1];
    // テスト名を抽出（ファイルパスの後の部分）
    const testNameMatch = section.match(
      /FAIL\s+[a-zA-Z0-9_\-/.]+\.(spec|test)\.[jt]sx?\s+>\s+(.+?)(?=\n)/i
    );
    const testName = testNameMatch ? testNameMatch[2].trim() : 'Unknown test';
    // エラーメッセージを抽出
    const errorMessageMatch = section.match(
      /(?:AssertionError|Error):\s+(.+?)(?=\n\s*❯|\n\s*\n|\n\s*$)/s
    );
    const errorMessage = errorMessageMatch
      ? errorMessageMatch[1].trim()
      : 'Unknown error';
    // 行番号情報を抽出
    const lineNumberMatch = section.match(/❯\s+[\w/\.\-]+:(\d+:\d+)/);
    const lineNumber = lineNumberMatch ? lineNumberMatch[1] : '';
    // コードスニペットと詳細情報を抽出
    const codeSnippet = extractCodeSnippet(section);
    const expected = extractExpected(section);
    const received = extractReceived(section);
    failedTests.push({
      filePath,
      testName,
      errorMessage,
      codeSnippet,
      lineNumber,
      expected,
      received,
    });
  }

  // もし上記の方法で見つからなければ、元のコードを実行
  if (failedTests.length === 0) {
    // 単純にエラーや失敗を含む行を検索
    const errorLines = text
      .split('\n')
      .filter((line) =>
        /(?:error|fail|failed|assertion|expect|×|✗|✘)/i.test(line)
      );

    if (errorLines.length === 0) {
      return failedTests;
    }

    // テスト失敗を示す行を特定
    for (let i = 0; i < errorLines.length; i++) {
      const line = errorLines[i];

      // エラーメッセージらしき情報を抽出
      const errorMatch = line.match(
        /(?:error|fail|failed|assertion)(?:\s*:\s*|\s+)(.+)/i
      );
      if (!errorMatch) {
        continue;
      }

      const errorMessage = errorMatch[1] || 'Unknown error';

      // 前後の行から情報を収集
      const prevLines = i > 0 ? errorLines.slice(Math.max(0, i - 3), i) : [];
      const nextLines =
        i < errorLines.length - 1
          ? errorLines.slice(i + 1, Math.min(errorLines.length, i + 4))
          : [];

      // テスト名を探す
      let testName = 'Unknown test';
      for (const prevLine of prevLines) {
        const testMatch = prevLine.match(
          /(?:test|it|describe)(?:\s*\(\s*|\s+)['"]([^'"]+)['"]/i
        );
        if (testMatch) {
          testName = testMatch[1];
          break;
        }
      }

      // ファイルパスを探す
      let filePath = 'unknown-file';
      const filePattern = /([a-zA-Z0-9_\-/.]+\.(spec|test)\.[jt]sx?)/i;
      const fullContext = [...prevLines, line, ...nextLines].join('\n');
      const fileMatch = fullContext.match(filePattern);
      if (fileMatch) {
        filePath = fileMatch[1];
      }

      // 行番号情報を探す
      const lineNumberMatch = fullContext.match(/[:\s](\d+:\d+)[\s:]/);
      const lineNumber = lineNumberMatch ? lineNumberMatch[1] : '';

      // 追加の詳細情報を抽出
      const expected = extractExpected(fullContext);
      const received = extractReceived(fullContext);
      const codeSnippet = extractCodeSnippet(fullContext);

      failedTests.push({
        filePath,
        testName,
        errorMessage,
        codeSnippet,
        lineNumber,
        expected,
        received,
      });

      // 余分な重複を避けるためにスキップ
      i += 2;
    }
  }

  return failedTests;
}

/**
 * 期待値を抽出
 */
function extractExpected(text: string): string {
  // 複数のパターンを試す
  const patterns = [
    /Expected:[\s\S]*?(?=\n\s*Received:|\n\s*Number of calls:|\n\s*$)/,
    /Expected value:[\s\S]*?(?=\n\s*Received:|\n\s*Actual:|\n\s*$)/,
    /expect\([^)]+\)\.to[A-Za-z]+\(([^)]+)\)/,
    /Expected [\s\S]*?(?=\n\s*but got:|\n\s*$)/i,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      return match[0].trim();
    }
  }

  return '';
}

/**
 * 実際の値を抽出
 */
function extractReceived(text: string): string {
  // 複数のパターンを試す
  const patterns = [
    /Received:[\s\S]*?(?=\n\s*Number of calls:|\n\s*$)/,
    /Actual:[\s\S]*?(?=\n\s*$|$)/,
    /But got:[\s\S]*?(?=\n\s*$|$)/,
    /Instead received:[\s\S]*?(?=\n\s*$|$)/,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      return match[0].trim();
    }
  }

  return '';
}

/**
 * コードスニペットを抽出
 */
function extractCodeSnippet(text: string): string {
  // 複数のパターンを試す
  const patterns = [
    // Vitestの行番号つきコードスニペット (❯ から始まる形式)
    /❯\s+[\w/\.\-]+:\d+:\d+[\s\S]*?(?=\n\n|\n\s*❯|\n\s*FAIL|\n\s*$|$)/s,
    // 行番号とパイプ記号を含むコードスニペット
    /\n\s*\d+\s*\|\s*.+\n\s*\d+\s*\|\s*.+\n\s*\d+\s*\|\s*.+/s,
    // カラット(^)を含むコード行
    /\n\s*\d+\s*\|.*\n\s*\|.*\^.*\n/s,
    // 以前のパターンをフォールバックとして保持
    /(\[\n|\s+\[\n)[\s\S]*?(\]\n|\s+\]\n)/s,
    /\n\s*at\s+[^\n]+\n\s*at\s+[^\n]+/s,
    /\{\s*[\s\S]*?:\s*["'][\s\S]*?["'][\s\S]*?\}/s,
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) {
      return match[0].trim();
    }
  }

  return '';
}

/**
 * 失敗したテスト情報をフォーマットする
 */
export function formatFailedTests(failedTests: FailedTest[]): string {
  return failedTests
    .map((test) => {
      let result = `file: ${test.filePath}`;
      // 行番号情報があれば追加
      if (test.lineNumber) {
        result += `:${test.lineNumber}`;
      }
      result += `\ntest: ${test.testName}\nerror: ${test.errorMessage}`;

      if (test.codeSnippet) {
        result += `\n\ncode snippet:\n${test.codeSnippet}`;
      }

      if (test.expected) {
        result += `\n\nexpected:\n${test.expected}`;
      }

      if (test.received) {
        result += `\n\nreceived:\n${test.received}`;
      }

      return result;
    })
    .join('\n\n---\n\n');
}
