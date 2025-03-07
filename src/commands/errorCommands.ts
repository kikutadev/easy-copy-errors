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
import { useGrouping, errorsOnly } from '../utils/config';

/**
 * 診断情報をコピーするコマンドハンドラー
 * 設定に基づいてグループ化やエラーのみのフィルタリングを行う
 * 以前の4つのコマンドを1つに統合
 */
export async function copyDiagnosticsHandler(): Promise<void> {
  // 設定からオプションを取得
  const grouped = useGrouping();
  const filterErrors = errorsOnly();

  // 現在のファイルの診断情報を取得
  const diagnostics = getCurrentFileDiagnostics();

  if (!diagnostics) {
    showNoEditorMessage();
    return;
  }

  // 診断情報をフィルタリング
  const filteredDiagnostics = filterDiagnostics(diagnostics, {
    errorsOnly: filterErrors,
  });

  if (filteredDiagnostics.length === 0) {
    showNoDiagnosticsMessage(filterErrors);
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
    showCopySuccessMessage(filterErrors);
  }
}

// 以下の関数は不要になったため削除
// copyAllDiagnosticsHandler
// copyErrorsOnlyHandler
// copyGroupedDiagnosticsHandler
// copyGroupedErrorsOnlyHandler
// copyDiagnosticsWithOptions
