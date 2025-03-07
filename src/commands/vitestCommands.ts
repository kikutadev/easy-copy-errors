// src/commands/vitestCommands.ts
import * as vscode from 'vscode';
import { captureTerminalText } from '../services/terminalCaptureService';
import {
  parseVitestOutput,
  formatFailedTests,
} from '../services/vitestParserService';
import { copyToClipboard } from '../services/clipboardService';

/**
 * Vitestテスト結果をコピーするコマンドハンドラー
 */
export async function copyVitestResultsHandler(): Promise<void> {
  vscode.window.showInformationMessage(
    'Vitestテスト結果をキャプチャしています...'
  );

  const terminalText = await captureTerminalText();

  if (!terminalText) {
    vscode.window.showErrorMessage(
      'ターミナルテキストのキャプチャに失敗しました'
    );
    return;
  }

  const failedTests = parseVitestOutput(terminalText);

  if (failedTests.length === 0) {
    vscode.window.showInformationMessage(
      '失敗したテストが見つかりませんでした'
    );
    return;
  }

  const formattedText = formatFailedTests(failedTests);
  const success = await copyToClipboard(formattedText);

  if (success) {
    vscode.window.showInformationMessage(
      `${failedTests.length}件の失敗したテストをコピーしました`
    );
  } else {
    vscode.window.showErrorMessage('テスト結果のコピーに失敗しました');
  }
}
