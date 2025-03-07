// src/services/testSelectionService.ts
import * as vscode from 'vscode';
import { FailedTest, TestFileGroup } from './vitestParserService';

/**
 * テストファイル選択用のQuickPickアイテム
 */
interface TestFileQuickPickItem extends vscode.QuickPickItem {
  fileGroup: TestFileGroup;
}

/**
 * 個別テスト選択用のQuickPickアイテム
 */
interface TestQuickPickItem extends vscode.QuickPickItem {
  test: FailedTest;
}

/**
 * テストファイル選択UIを表示
 * テスト結果をファイル単位でグループ化し、選択UIを提供する
 * @param testGroups ファイル別にグループ化されたテスト結果
 * @returns 選択されたテストファイルグループ、またはキャンセルされた場合はundefined
 */
export async function showTestFileSelectionUI(
  testGroups: TestFileGroup[]
): Promise<TestFileGroup | undefined> {
  // ファイル数が1つの場合は直接返す（UIをスキップ）
  if (testGroups.length === 1) {
    return testGroups[0];
  }

  // QuickPickアイテムに変換
  const items: TestFileQuickPickItem[] = testGroups.map((group) => ({
    label: group.displayName,
    description: vscode.l10n.t('失敗テスト: {failedTestsLength}件', {
      failedTestsLength: group.failedTests.length,
    }),
    detail: group.filePath,
    fileGroup: group,
  }));

  // QuickPickを表示
  const selectedItem = await vscode.window.showQuickPick(items, {
    placeHolder: vscode.l10n.t('コピーするテストファイルを選択してください'),
    matchOnDescription: true,
    matchOnDetail: true,
  });

  return selectedItem?.fileGroup;
}

/**
 * 個別テスト選択UIを表示
 * 指定されたファイルグループ内のテストを選択するUIを提供する
 * 複数選択可能で、デフォルトで全テストが選択された状態で表示する
 * @param fileGroup テストファイルグループ
 * @returns 選択されたテスト配列、またはキャンセルされた場合はundefined
 */
export async function showIndividualTestSelectionUI(
  fileGroup: TestFileGroup
): Promise<FailedTest[] | undefined> {
  // テスト数が1つの場合は直接返す（UIをスキップ）
  if (fileGroup.failedTests.length === 1) {
    return fileGroup.failedTests;
  }

  // 「全てのテストを選択」オプションを追加
  const allTestsOption: vscode.QuickPickItem = {
    label: vscode.l10n.t('全てのテストを選択'),
    description: vscode.l10n.t('({failedTestsLength}件)', {
      failedTestsLength: fileGroup.failedTests.length,
    }),
    kind: vscode.QuickPickItemKind.Separator,
  };

  // 個別のテストアイテム
  const testItems: TestQuickPickItem[] = fileGroup.failedTests.map((test) => ({
    label: test.testName,
    description: test.lineNumber ? `行: ${test.lineNumber}` : '',
    detail: test.errorMessage,
    test: test,
    picked: true, // デフォルトで全てのテストを選択状態にする
  }));

  const selectedItems = await vscode.window.showQuickPick(
    [allTestsOption, ...testItems],
    {
      placeHolder: vscode.l10n.t('コピーするテストを選択してください'),
      canPickMany: true,
      matchOnDescription: true,
      matchOnDetail: true,
    }
  );

  // 選択されたアイテムがない場合
  if (!selectedItems || selectedItems.length === 0) {
    return undefined;
  }

  // 型安全な変換を行う
  const selectedTestItems = selectedItems.filter(
    (item): item is TestQuickPickItem => 'test' in item
  );

  // 「全てのテストを選択」が選ばれていれば全テストを返す
  if (selectedItems.some((item) => item.label === allTestsOption.label)) {
    return fileGroup.failedTests;
  }

  // 選択されたテストを返す
  return selectedTestItems.map((item) => item.test);
}
