import * as vscode from 'vscode';
import {
  copyToClipboard,
  showCopySuccessMessage,
  showNoDiagnosticsMessage,
  showNoEditorMessage,
} from '../services/clipboardService';
import {
  buildDiagnosticContext,
  filterDiagnostics,
  getCurrentFileDiagnostics,
} from '../services/diagnosticsService';
import { formatDiagnostics } from '../services/formatterService';

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
 * オプションを指定して診断情報をコピー
 */
async function copyDiagnosticsWithOptions(options: {
  errorsOnly: boolean;
}): Promise<void> {
  const diagnostics = getCurrentFileDiagnostics();

  if (!diagnostics) {
    showNoEditorMessage();
    return;
  }

  const filteredDiagnostics = filterDiagnostics(diagnostics, options);

  if (filteredDiagnostics.length === 0) {
    showNoDiagnosticsMessage(options.errorsOnly);
    return;
  }

  const editor = vscode.window.activeTextEditor!;
  const formattedText = formatDiagnostics(
    filteredDiagnostics,
    editor.document,
    buildDiagnosticContext
  );

  const success = await copyToClipboard(formattedText);

  if (success) {
    showCopySuccessMessage(options.errorsOnly);
  }
}
