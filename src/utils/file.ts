import * as vscode from 'vscode';
import * as path from 'path';

/**
 * 指定されたURIから、ワークスペースルートからの相対パスを取得
 */
export function getRelativePath(uri: vscode.Uri): string {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
  if (workspaceFolder) {
    return path.relative(workspaceFolder.uri.fsPath, uri.fsPath);
  }
  return uri.fsPath;
}

/**
 * 指定されたURIからファイル名のみを取得
 */
export function getFileName(uri: vscode.Uri): string {
  return path.basename(uri.fsPath);
}
