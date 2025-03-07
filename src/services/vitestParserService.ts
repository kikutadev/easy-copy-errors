// src/services/vitestParserService.ts
import {
  extractTestsMethod1,
  extractTestsMethod2,
  extractTestsMethod3,
} from './vitestExtractorService';

/**
 * 失敗したVitestテストの情報
 */
export interface FailedTest {
  filePath: string; // テストファイルのパス
  testName: string; // テスト名
  errorMessage: string; // エラーメッセージ
  codeSnippet: string; // エラー箇所のコードスニペット
  lineNumber: string; // エラー発生行番号
  expected: string; // 期待値
  received: string; // 実際値
}

/**
 * ファイル別にグループ化された失敗テスト
 */
export interface TestFileGroup {
  filePath: string; // ファイルパス
  displayName: string; // 表示用ファイル名
  failedTests: FailedTest[]; // このファイル内の失敗テスト一覧
}

/**
 * Vitestのテスト出力から失敗したテストを抽出する
 * 複数の抽出方法を試し、結果が見つからない場合は次の方法を試すフォールバック機構を実装
 * @param text ターミナルからキャプチャしたテキスト
 * @returns 抽出された失敗テスト情報の配列
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
 * 同じファイルパスのテストをまとめ、ファイル名でソートする
 * @param tests 失敗テスト情報の配列
 * @returns ファイル別にグループ化されたテスト情報
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
 * 失敗したテスト情報を読みやすい形式にフォーマットする
 * @param failedTests フォーマットする失敗テスト情報の配列
 * @returns フォーマットされたテキスト
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
