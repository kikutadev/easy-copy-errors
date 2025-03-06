import * as vscode from 'vscode';

/**
 * テキストをクリップボードにコピー
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await vscode.env.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * クリップボードへのコピー成功時のメッセージを表示
 */
export function showCopySuccessMessage(isErrorsOnly: boolean = false): void {
  const message = isErrorsOnly
    ? 'Errors copied to clipboard.'
    : 'All diagnostics copied to clipboard.';

  vscode.window.showInformationMessage(message);
}

/**
 * 診断情報がない場合のメッセージを表示
 */
export function showNoDiagnosticsMessage(isErrorsOnly: boolean = false): void {
  const message = isErrorsOnly
    ? 'No errors found in the current file.'
    : 'No diagnostics found in the current file.';

  vscode.window.showInformationMessage(message);
}

/**
 * アクティブなエディタがない場合のメッセージを表示
 */
export function showNoEditorMessage(): void {
  vscode.window.showInformationMessage('No active editor found.');
}
