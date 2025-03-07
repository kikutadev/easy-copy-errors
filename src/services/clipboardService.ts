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
    console.error(
      vscode.l10n.t('クリップボードへのコピーに失敗しました:'),
      error
    );
    return false;
  }
}

/**
 * タイムアウト付きの通知メッセージを表示する
 * VSCodeのプログレスAPIを使用して、指定した時間後に自動的に閉じる通知を表示
 * @param message 表示するメッセージ
 * @param type メッセージの種類 ('info', 'warning', 'error')
 * @param timeout 自動的に閉じるまでの時間（ミリ秒）
 */
export function showTimedMessage(
  message: string,
  type: 'info' | 'warning' | 'error' = 'info',
  timeout: number = 3000
): void {
  // アイコンをメッセージタイプに基づいて設定
  let icon = '$(info)';
  if (type === 'warning') {
    icon = '$(warning)';
  } else if (type === 'error') {
    icon = '$(error)';
  }

  // withProgressを使用して一時的な通知を表示
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `${icon} ${message}`,
      cancellable: false,
    },
    async () => {
      // タイムアウトまで待機
      await new Promise((resolve) => setTimeout(resolve, timeout));
      // タイムアウト後に自動的に閉じる（この関数が完了すると通知が閉じる）
      return;
    }
  );

  // タイプに応じてステータスバーにも表示
  // const statusBarMessage = vscode.window.setStatusBarMessage(message, timeout);
}

/**
 * クリップボードへのコピー成功時のメッセージを表示
 */
export function showCopySuccessMessage(isErrorsOnly: boolean = false): void {
  showTimedMessage(
    vscode.l10n.t({
      message: '{0}をクリップボードにコピーしました！',
      args: [isErrorsOnly ? 'エラー' : '診断情報'],
      comment: ['isErrorsOnly'],
    }),
    'info'
  );
}

/**
 * 診断情報がない場合のメッセージを表示
 */
export function showNoDiagnosticsMessage(isErrorsOnly: boolean = false): void {
  const message = isErrorsOnly
    ? vscode.l10n.t('現在のファイルにエラーがありません。')
    : vscode.l10n.t('現在のファイルに診断情報がありません。');

  showTimedMessage(message, 'info');
}

/**
 * アクティブなエディタがない場合のメッセージを表示
 */
export function showNoEditorMessage(): void {
  showTimedMessage(
    vscode.l10n.t('アクティブなエディタが見つかりません。'),
    'info'
  );
}
