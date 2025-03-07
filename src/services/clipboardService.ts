// src/services/clipboardService.ts
import * as vscode from 'vscode';

/**
 * テキストをクリップボードにコピー
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await vscode.env.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('クリップボードへのコピーに失敗しました:', error);
    return false;
  }
}

/**
 * クリップボードへのコピー成功時のメッセージを表示
 */
export function showCopySuccessMessage(
  isErrorsOnly: boolean = false,
  isGrouped: boolean = false
): void {
  let message = isErrorsOnly ? 'エラーのみ' : 'すべての診断情報';

  if (isGrouped) {
    message += '（グループ化）';
  }

  message += 'をクリップボードにコピーしました！';

  vscode.window.showInformationMessage(message);
}

/**
 * 診断情報がない場合のメッセージを表示
 */
export function showNoDiagnosticsMessage(isErrorsOnly: boolean = false): void {
  const message = isErrorsOnly
    ? '現在のファイルにエラーがありません。'
    : '現在のファイルに診断情報がありません。';

  vscode.window.showInformationMessage(message);
}

/**
 * アクティブなエディタがない場合のメッセージを表示
 */
export function showNoEditorMessage(): void {
  vscode.window.showInformationMessage(
    'アクティブなエディタが見つかりません。'
  );
}
