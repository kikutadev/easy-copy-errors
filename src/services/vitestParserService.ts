// src/services/vitestParserService.ts
/**
 * 失敗したVitestテストの情報
 */
export interface FailedTest {
  filePath: string;
  testName: string;
  errorMessage: string;
  codeSnippet: string;
  expected: string;
  received: string;
}

/**
 * Vitestのテスト出力から失敗したテストを抽出する
 */
export function parseVitestOutput(text: string): FailedTest[] {
  const failedTests: FailedTest[] = [];

  // テストファイルのセクションを検出
  const testSections = text.split(/❯\s+[^\s]+\s+\(\d+\s+tests/g);

  for (let i = 1; i < testSections.length; i++) {
    const section = testSections[i];
    const filePathMatch = text.match(
      new RegExp(
        `❯\\s+([^\\s]+)\\s+\\(\\d+\\s+tests.*?${section
          .substring(0, 30)
          .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
        's'
      )
    );

    if (!filePathMatch) continue;
    const filePath = filePathMatch[1];

    // 失敗したテスト行を検出
    const failedTestPattern =
      /×\s+(.+?)\s+\d+ms\n\s+→\s+(.+?)(?=\n\s+[×✓]|\n\s*$)/gs;
    let testMatch;

    while ((testMatch = failedTestPattern.exec(section)) !== null) {
      const testName = testMatch[1].trim();
      const errorMessage = testMatch[2].trim();

      // テストの詳細テキストを抽出
      const startIdx = testMatch.index + testMatch[0].length;
      const nextTestMatch = failedTestPattern.exec(section);
      failedTestPattern.lastIndex = testMatch.index + 1; // 検索位置をリセット

      const endIdx = nextTestMatch ? nextTestMatch.index : section.length;
      const detailText = section.substring(startIdx, endIdx);

      // 期待値と実際の値を抽出
      const expected = extractExpected(detailText);
      const received = extractReceived(detailText);
      const codeSnippet = extractCodeSnippet(detailText);

      failedTests.push({
        filePath,
        testName,
        errorMessage,
        codeSnippet,
        expected,
        received,
      });
    }
  }

  return failedTests;
}

/**
 * 期待値を抽出
 */
function extractExpected(text: string): string {
  const match = text.match(
    /Expected:[\s\S]*?(?=\n\s*Received:|\n\s*Number of calls:|\n\s*$)/
  );
  return match ? match[0].trim() : '';
}

/**
 * 実際の値を抽出
 */
function extractReceived(text: string): string {
  const match = text.match(/Received:[\s\S]*?(?=\n\s*Number of calls:|\n\s*$)/);
  return match ? match[0].trim() : '';
}

/**
 * コードスニペットを抽出
 */
function extractCodeSnippet(text: string): string {
  const match = text.match(/(\[\n|\s+\[\n)[\s\S]*?(\]\n|\s+\]\n)/);
  return match ? match[0].trim() : '';
}

/**
 * 失敗したテスト情報をフォーマットする
 */
export function formatFailedTests(failedTests: FailedTest[]): string {
  return failedTests
    .map((test) => {
      let result = `file: ${test.filePath}\ntest: ${test.testName}\nerror: ${test.errorMessage}`;

      if (test.codeSnippet) {
        result += `\n\ncode:\n${test.codeSnippet}`;
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
