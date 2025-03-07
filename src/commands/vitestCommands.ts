// src/commands/vitestCommands.ts
import * as vscode from 'vscode';
import { copyToClipboard } from '../services/clipboardService';
import { captureTerminalText } from '../services/terminalCaptureService';
import {
  showIndividualTestSelectionUI,
  showTestFileSelectionUI,
} from '../services/testSelectionService';
import {
  formatFailedTests,
  groupTestsByFile,
  parseVitestOutput,
} from '../services/vitestParserService';

/**
 * Vitestテスト結果をファイル単位で選択してコピーするコマンドハンドラー
 */
export async function copySelectedVitestResultsHandler(): Promise<void> {
  vscode.window.showInformationMessage(
    vscode.l10n.t('Vitestテスト結果をキャプチャしています...')
  );

  // ターミナルテキストをキャプチャ
  const terminalText = await captureTerminalText();

  if (!terminalText) {
    vscode.window.showErrorMessage(
      vscode.l10n.t('ターミナルテキストのキャプチャに失敗しました')
    );
    return;
  }

  // テスト結果を解析
  const failedTests = parseVitestOutput(terminalText);

  if (failedTests.length === 0) {
    vscode.window.showInformationMessage(
      vscode.l10n.t('失敗したテストが見つかりませんでした')
    );
    return;
  }

  // ファイル別にグループ化
  const testGroups = groupTestsByFile(failedTests);

  // テストファイル選択UIを表示
  const selectedFileGroup = await showTestFileSelectionUI(testGroups);
  if (!selectedFileGroup) {
    // キャンセルされた
    return;
  }

  // 個別テスト選択UIを表示
  const selectedTests = await showIndividualTestSelectionUI(selectedFileGroup);
  if (!selectedTests) {
    // キャンセルされた
    return;
  }

  // 選択されたテストをフォーマットしてコピー
  const formattedText = formatFailedTests(selectedTests);
  const success = await copyToClipboard(formattedText);

  if (success) {
    vscode.window.showInformationMessage(
      vscode.l10n.t(`{selectedTests.length}件の失敗したテストをコピーしました`)
    );
  } else {
    vscode.window.showErrorMessage(
      vscode.l10n.t('テスト結果のコピーに失敗しました')
    );
  }
}
