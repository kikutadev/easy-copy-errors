// src/services/vitestExtractorService.ts
import { VitestPatterns } from '../utils/regexPatterns';
import { FailedTest } from './vitestParserService';

/**
 * Vitestのテスト結果から期待値を抽出する
 * 複数の正規表現パターンを試し、最初にマッチしたものを返す
 * @param text 抽出対象のテキスト
 * @returns 抽出された期待値の文字列、見つからない場合は空文字列
 */
export function extractExpected(text: string): string {
  for (const pattern of VitestPatterns.expected) {
    const match = pattern.exec(text);
    if (match) {
      return match[0].trim();
    }
  }
  return '';
}

/**
 * Vitestのテスト結果から実際値を抽出する
 * 複数の正規表現パターンを試し、最初にマッチしたものを返す
 * @param text 抽出対象のテキスト
 * @returns 抽出された実際値の文字列、見つからない場合は空文字列
 */
export function extractReceived(text: string): string {
  for (const pattern of VitestPatterns.received) {
    const match = pattern.exec(text);
    if (match) {
      return match[0].trim();
    }
  }
  return '';
}

/**
 * Vitestのテスト結果からコードスニペットを抽出する
 * 複数の正規表現パターンを試し、最初にマッチしたものを返す
 * @param text 抽出対象のテキスト
 * @returns 抽出されたコードスニペットの文字列、見つからない場合は空文字列
 */
export function extractCodeSnippet(text: string): string {
  // テキスト中に行番号付きのコードスニペットが含まれているかチェック
  const snippetIndex = text.indexOf('❯ ');
  if (snippetIndex !== -1) {
    // ❯ 行を含む周辺のテキストを抽出
    const snippetContext = text.substring(snippetIndex);
    // コードスニペットパターンを適用
    for (const pattern of VitestPatterns.codeSnippet) {
      const snippetMatch = pattern.exec(snippetContext);
      if (snippetMatch) {
        return snippetMatch[0].trim();
      }
    }
  }

  // 通常のコードスニペット抽出
  for (const pattern of VitestPatterns.codeSnippet) {
    const match = pattern.exec(text);
    if (match) {
      return match[0].trim();
    }
  }
  return '';
}

/**
 * Vitestのテスト結果から失敗したテストを抽出する（方法1）
 * FAIL行を区切りとしてセクションに分割し、各セクションから情報を抽出する
 * @param text 解析対象のテキスト
 * @returns 抽出された失敗テスト情報の配列
 */
export function extractTestsMethod1(text: string): FailedTest[] {
  const failedTests: FailedTest[] = [];

  // ファイルパスとテスト名を一度に抽出するパターンを試す
  const fileTestMatches = Array.from(
    text.matchAll(VitestPatterns.filePathWithTestName)
  );

  if (fileTestMatches.length > 0) {
    // 各マッチに対して処理
    for (const match of fileTestMatches) {
      const filePath = match[1];
      const testName = match[3].trim();

      // テストセクションの開始位置を特定
      const matchPosition = match.index || 0;
      const testStart = text.indexOf('\n', matchPosition) + 1;

      // 次のテストセクションの開始位置を特定
      let testEnd = text.indexOf('\n FAIL ', testStart);
      if (testEnd === -1) {
        testEnd = text.indexOf('\n⎯⎯⎯⎯⎯⎯⎯⎯⎯', testStart);
      }
      if (testEnd === -1) {
        testEnd = text.length;
      }

      // テストセクションを抽出
      const testSection = text.substring(testStart, testEnd);

      // エラーメッセージを抽出
      const errorMatch = testSection.match(VitestPatterns.errorMessage);
      const errorMessage = errorMatch ? errorMatch[1].trim() : '';

      // 行番号情報を抽出
      const lineNumberMatch = testSection.match(VitestPatterns.lineNumber);
      const lineNumber = lineNumberMatch ? lineNumberMatch[1] : '';

      // コードスニペットを抽出
      const codeSnippet = extractCodeSnippet(testSection);

      // 期待値と実際の値を抽出
      const expected = extractExpected(testSection);
      const received = extractReceived(testSection);

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

    // マッチが見つかった場合は結果を返す
    if (failedTests.length > 0) {
      return failedTests;
    }
  }

  // テストファイルのセクションを検出
  const testSections = text.split(VitestPatterns.failLine);

  for (let i = 1; i < testSections.length; i++) {
    const section = testSections[i];

    // ファイルパスを抽出
    const filePathMatch = section.match(VitestPatterns.filePath);
    if (!filePathMatch) {
      continue;
    }

    const filePath = filePathMatch[1];

    // テスト名を抽出
    const testNameMatch = section.match(VitestPatterns.testName);
    if (!testNameMatch) {
      continue;
    }

    const testName = testNameMatch[1].trim();

    // エラーメッセージを抽出
    const errorMatch = section.match(VitestPatterns.errorMessage);
    const errorMessage = errorMatch ? errorMatch[1].trim() : '';

    // 行番号情報を抽出
    const lineNumberMatch = section.match(VitestPatterns.lineNumber);
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
 * Vitestのテスト結果から失敗したテストを抽出する（方法2）
 * 複数のパターンを使用して失敗テストを検出し、各テストの前後のコンテキストから情報を抽出する
 * @param text 解析対象のテキスト
 * @returns 抽出された失敗テスト情報の配列
 */
export function extractTestsMethod2(text: string): FailedTest[] {
  const failedTests: FailedTest[] = [];

  // 詳細なエラーセクションを抽出
  const errorSections = text.split(VitestPatterns.errorSectionDivider);
  for (const section of errorSections) {
    if (!section.includes('FAIL ')) {
      continue;
    }

    // ファイルパスとテスト名を抽出
    const headerMatch = section.match(
      VitestPatterns.filePathWithTestNameNonGlobal
    );
    if (headerMatch) {
      const filePath = headerMatch[1];
      const testName = headerMatch[3].trim();

      // エラーメッセージを抽出
      const errorMatch = section.match(VitestPatterns.errorMessage);
      const errorMessage = errorMatch ? errorMatch[1].trim() : '';

      // 行番号情報を抽出
      const lineNumberMatch = section.match(VitestPatterns.lineNumber);
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
  }

  // 結果が見つかった場合は返す
  if (failedTests.length > 0) {
    return failedTests;
  }

  // 失敗したテストの複数のパターンを試す
  for (const pattern of VitestPatterns.failedTestPatterns) {
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
      for (const filePattern of VitestPatterns.filePathPatterns) {
        const fileMatch = detailText.match(filePattern);
        if (fileMatch) {
          filePath = fileMatch[1];
          break;
        }
      }

      // 行番号情報を抽出
      const lineNumberMatch = detailText.match(VitestPatterns.lineNumber);
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
 * Vitestのテスト結果から失敗したテストを抽出する（方法3）
 * FAILセクションを検索するか、エラー関連の行を検索して情報を抽出する
 * 他の方法が失敗した場合のフォールバックとして使用
 * @param text 解析対象のテキスト
 * @returns 抽出された失敗テスト情報の配列
 */
export function extractTestsMethod3(text: string): FailedTest[] {
  const failedTests: FailedTest[] = [];

  // 詳細なエラー情報セクションを探す
  const detailedErrorSections = text.split(VitestPatterns.failedTestsHeader);
  if (detailedErrorSections.length > 1) {
    const detailedSection = detailedErrorSections[1];
    const individualTests = detailedSection.split(/\n\s*FAIL\s+/);

    for (let i = 1; i < individualTests.length; i++) {
      const testSection = 'FAIL ' + individualTests[i];

      // ファイルパスとテスト名を抽出
      const fileTestMatch = testSection.match(
        VitestPatterns.filePathAndTestName
      );
      if (fileTestMatch) {
        const filePath = fileTestMatch[1];
        const testName = fileTestMatch[3].trim();

        // エラーメッセージを抽出
        const errorMatch = testSection.match(VitestPatterns.errorMessage);
        const errorMessage = errorMatch ? errorMatch[1].trim() : '';

        // 行番号情報を抽出
        const lineNumberMatch = testSection.match(VitestPatterns.lineNumber);
        const lineNumber = lineNumberMatch ? lineNumberMatch[1] : '';

        // コードスニペットを抽出
        const codeSnippet = extractCodeSnippet(testSection);

        // 期待値と実際の値を抽出
        const expected = extractExpected(testSection);
        const received = extractReceived(testSection);

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

    // 結果が見つかった場合は返す
    if (failedTests.length > 0) {
      return failedTests;
    }
  }

  // FAILで始まる行を検索し、そのセクションを抽出
  const failSections = text.split(/\n\s*FAIL\s+/);
  for (let i = 1; i < failSections.length; i++) {
    const section = 'FAIL ' + failSections[i];

    // ファイルパスらしきものを抽出
    const filePathMatch = section.match(VitestPatterns.filePath);
    if (!filePathMatch) {
      continue;
    }

    const filePath = filePathMatch[1];

    // テスト名を抽出（ファイルパスの後の部分）
    const testNameMatch = section.match(VitestPatterns.filePathAndTestName);
    const testName = testNameMatch ? testNameMatch[3].trim() : 'Unknown test';

    // エラーメッセージを抽出
    const errorMessageMatch = section.match(VitestPatterns.errorMessage);
    const errorMessage = errorMessageMatch
      ? errorMessageMatch[1].trim()
      : 'Unknown error';

    // 行番号情報を抽出
    const lineNumberMatch = section.match(VitestPatterns.lineNumber);
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

  // FAILセクションから抽出できた場合は結果を返す
  if (failedTests.length > 0) {
    return failedTests;
  }

  // FAILセクションから抽出できなかった場合は、エラー行から抽出を試みる
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
    const errorMatch = line.match(VitestPatterns.errorLine);
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
      const testMatch = prevLine.match(VitestPatterns.testFunction);
      if (testMatch) {
        testName = testMatch[1];
        break;
      }
    }

    // ファイルパスを探す
    let filePath = 'unknown-file';
    const fullContext = [...prevLines, line, ...nextLines].join('\n');
    const fileMatch = fullContext.match(VitestPatterns.filePath);
    if (fileMatch) {
      filePath = fileMatch[1];
    }

    // 行番号情報を探す
    const lineNumberMatch = fullContext.match(VitestPatterns.lineNumberInText);
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

  return failedTests;
}
