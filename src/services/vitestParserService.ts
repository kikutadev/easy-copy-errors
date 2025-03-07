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
 * @param text ターミナル出力テキスト
 * @returns 失敗したテストの配列
 */
export function parseVitestOutput(text: string): FailedTest[] {
  const failedTests: FailedTest[] = [];

  // FAILセクションを検出する正規表現
  // Vitestの実際の出力形式に合わせて調整する必要あり
  const failTestPattern =
    /(?:FAIL|✗|× )(.+?\.[a-z]+).*?\n(.*?)\n([\s\S]+?)(?=(?:FAIL|✓|√|✗|× |PASS|\s*$))/g;

  let match;
  while ((match = failTestPattern.exec(text)) !== null) {
    const section = match[0];
    const filePath = match[1].trim();
    const testName = match[2].trim();
    const errorDetails = match[3];

    const errorMessage = extractErrorMessage(errorDetails);
    const codeSnippet = extractCodeSnippet(errorDetails);
    const { expected, received } = extractExpectedReceived(errorDetails);

    failedTests.push({
      filePath,
      testName,
      errorMessage,
      codeSnippet,
      expected,
      received,
    });
  }

  return failedTests;
}

/**
 * エラーメッセージを抽出する
 */
function extractErrorMessage(text: string): string {
  // Vitestの実際の出力形式に合わせて調整
  const errorPattern = /Error:(.+?)(?=\n\s*\n|\n\s*at|\n\s*Expected)/s;
  const match = errorPattern.exec(text);
  return match ? match[1].trim() : 'Unknown error';
}

/**
 * コードスニペットを抽出する
 */
function extractCodeSnippet(text: string): string {
  // Vitestの実際の出力形式に合わせて調整
  const snippetPattern =
    /\n\s*\d+\s*\|\s*.+\n\s*\d+\s*\|\s*.+\n\s*\d+\s*\|\s*.+/;
  const match = snippetPattern.exec(text);
  return match ? match[0].trim() : '';
}

/**
 * expected と received の値を抽出する
 */
function extractExpectedReceived(text: string): {
  expected: string;
  received: string;
} {
  // Vitestの実際の出力形式に合わせて調整
  const expectedPattern = /Expected:(?:\s*\n)?\s*(.+?)(?=\n\s*Received:|$)/s;
  const receivedPattern = /Received:(?:\s*\n)?\s*(.+?)(?=\n\s*$|$)/s;

  const expectedMatch = expectedPattern.exec(text);
  const receivedMatch = receivedPattern.exec(text);

  return {
    expected: expectedMatch ? expectedMatch[1].trim() : '',
    received: receivedMatch ? receivedMatch[1].trim() : '',
  };
}

/**
 * 失敗したテスト情報をフォーマットする
 */
export function formatFailedTests(failedTests: FailedTest[]): string {
  return failedTests
    .map((test) => {
      return `file: ${test.filePath}
test: ${test.testName}
error: ${test.errorMessage}

code:
${test.codeSnippet}

expected: ${test.expected}
received: ${test.received}
`;
    })
    .join('\n---\n\n');
}
