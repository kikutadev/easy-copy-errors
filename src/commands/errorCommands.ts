// src/commands/errorCommands.ts
import * as vscode from 'vscode';
import {
  getCurrentFileDiagnostics,
  filterDiagnostics,
  buildDiagnosticContext,
  groupDiagnostics,
} from '../services/diagnosticsService';
import {
  formatDiagnostics,
  formatDiagnosticGroups,
} from '../services/formatterService';
import {
  copyToClipboard,
  showCopySuccessMessage,
  showNoDiagnosticsMessage,
  showNoEditorMessage,
} from '../services/clipboardService';
import { useGrouping } from '../utils/config';

/**
 * すべての診断情報をコピーするコマンドハンドラー
 */
export async function copyAllDiagnosticsHandler(): Promise<void> {
  await copyDiagnosticsWithOptions({ errorsOnly: false });
}

/**
 * エラーのみをコピーするコマンドハンドラー
 */
export async function copyErrorsOnlyHandler(): Promise<void> {
  await copyDiagnosticsWithOptions({ errorsOnly: true });
}

/**
 * グループ化したすべての診断情報をコピーするコマンドハンドラー
 */
export async function copyGroupedDiagnosticsHandler(): Promise<void> {
  await copyDiagnosticsWithOptions({ errorsOnly: false, forceGrouped: true });
}

/**
 * グループ化したエラーのみをコピーするコマンドハンドラー
 */
export async function copyGroupedErrorsOnlyHandler(): Promise<void> {
  await copyDiagnosticsWithOptions({ errorsOnly: true, forceGrouped: true });
}

/**
 * オプションを指定して診断情報をコピー
 */
async function copyDiagnosticsWithOptions(options: {
  errorsOnly: boolean;
  forceGrouped?: boolean;
}): Promise<void> {
  // 設定からグループ化の設定を取得（または強制的にグループ化）
  const grouped = options.forceGrouped || useGrouping();

  // 現在のファイルの診断情報を取得
  const diagnostics = getCurrentFileDiagnostics();

  if (!diagnostics) {
    showNoEditorMessage();
    return;
  }

  // 診断情報をフィルタリング
  const filteredDiagnostics = filterDiagnostics(diagnostics, options);

  if (filteredDiagnostics.length === 0) {
    showNoDiagnosticsMessage(options.errorsOnly);
    return;
  }

  const editor = vscode.window.activeTextEditor!;
  let formattedText: string;

  // グループ化するかどうかで処理を分岐
  if (grouped) {
    // 診断情報をグループ化
    const groups = groupDiagnostics(filteredDiagnostics, editor.document);
    formattedText = formatDiagnosticGroups(groups);
  } else {
    // 通常のフォーマット
    formattedText = formatDiagnostics(
      filteredDiagnostics,
      editor.document,
      buildDiagnosticContext
    );
  }

  // クリップボードにコピー
  const success = await copyToClipboard(formattedText);

  if (success) {
    showCopySuccessMessage(options.errorsOnly, grouped);
  }
}
