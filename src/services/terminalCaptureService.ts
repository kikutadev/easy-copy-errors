// src/services/terminalCaptureService.ts
import * as vscode from 'vscode';

/**
 * ターミナルの出力テキストをキャプチャする
 * ターミナルのテキストを選択してクリップボードに一時的にコピーし、
 * 元のクリップボード内容を復元する
 * @returns キャプチャしたテキスト、または失敗した場合はnull
 */
export async function captureTerminalText(): Promise<string | null> {
  // 元のクリップボード内容を保存
  const originalClipboard = await vscode.env.clipboard.readText();

  try {
    // アクティブなターミナルが存在するか確認
    if (!vscode.window.activeTerminal) {
      vscode.window.showWarningMessage(
        'アクティブなターミナルが見つかりません'
      );
      return null;
    }

    // ターミナルのテキストをすべて選択
    await vscode.commands.executeCommand('workbench.action.terminal.selectAll');
    // 選択したテキストをコピー
    await vscode.commands.executeCommand(
      'workbench.action.terminal.copySelection'
    );
    // 選択を解除
    await vscode.commands.executeCommand(
      'workbench.action.terminal.clearSelection'
    );

    // クリップボードからテキストを取得
    const terminalText = await vscode.env.clipboard.readText();

    // 元のクリップボード内容を復元
    await vscode.env.clipboard.writeText(originalClipboard);

    return terminalText;
  } catch (error) {
    console.error('ターミナルテキストのキャプチャに失敗:', error);
    // 元のクリップボード内容を復元
    await vscode.env.clipboard.writeText(originalClipboard);
    return null;
  }
}
