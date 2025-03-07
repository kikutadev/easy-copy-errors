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
 * タイムアウト付きの通知メッセージを表示する
 * 指定した時間（ミリ秒）後に自動的に通知を閉じる
 * @param message 表示するメッセージ
 * @param type メッセージの種類 ('info', 'warning', 'error')
 * @param timeout 自動的に閉じるまでの時間（ミリ秒）
 */
export function showTimedMessage(
  message: string,
  type: 'info' | 'warning' | 'error' = 'info',
  timeout: number = 5000
): void {
  let messagePromise: Thenable<any>;

  // メッセージの種類に応じた表示メソッドを使用
  switch (type) {
    case 'warning':
      messagePromise = vscode.window.showWarningMessage(message);
      break;
    case 'error':
      messagePromise = vscode.window.showErrorMessage(message);
      break;
    case 'info':
    default:
      messagePromise = vscode.window.showInformationMessage(message);
      break;
  }

  // タイムアウト後にメッセージを閉じる
  setTimeout(() => {
    // VSCodeの内部APIを使用してメッセージを閉じる

    if (messagePromise && messagePromise.cancel) {

      messagePromise.cancel();
    }
  }, timeout);
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

  -vscode.window.showInformationMessage(message);
  showTimedMessage(message, 'info');
}

/**
 * 診断情報がない場合のメッセージを表示
 */
export function showNoDiagnosticsMessage(isErrorsOnly: boolean = false): void {
  const message = isErrorsOnly
    ? '現在のファイルにエラーがありません。'
    : '現在のファイルに診断情報がありません。';

  showTimedMessage(message, 'info');
}

/**
 * アクティブなエディタがない場合のメッセージを表示
 */
export function showNoEditorMessage(): void {
  showTimedMessage('アクティブなエディタが見つかりません。', 'info');
}
