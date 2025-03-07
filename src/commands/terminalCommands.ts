import * as vscode from 'vscode';
import { captureTerminalText } from '../services/terminalCaptureService';
import {
  parseVitestOutput,
  formatFailedTests,
} from '../services/vitestParserService';
import { copyToClipboard } from '../services/clipboardService';

/**
 * ターミナルからVitestテスト結果をコピーするコマンドハンドラー
 */
export async function copyVitestResultsHandler(): Promise<void> {
  // 処理中メッセージを表示
  vscode.window.showInformationMessage(
    'Vitestテスト結果をキャプチャしています...'
  );

  // ターミナルテキストをキャプチャ
  const terminalText = await captureTerminalText();

  if (!terminalText) {
    vscode.window.showErrorMessage(
      'ターミナルテキストのキャプチャに失敗しました'
    );
    return;
  }

  // Vitest出力を解析
  const failedTests = parseVitestOutput(terminalText);

  if (failedTests.length === 0) {
    vscode.window.showInformationMessage(
      'ターミナル出力に失敗したテストが見つかりませんでした'
    );
    return;
  }

  // 失敗したテストをフォーマット
  const formattedText = formatFailedTests(failedTests);

  // クリップボードにコピー
  const success = await copyToClipboard(formattedText);

  if (success) {
    vscode.window.showInformationMessage(
      `${failedTests.length}件の失敗したテストをクリップボードにコピーしました`
    );
  } else {
    vscode.window.showErrorMessage('テスト結果のコピーに失敗しました');
  }
}
