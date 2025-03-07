// src/utils/config.ts
import * as vscode from 'vscode';

/**
 * 拡張機能の設定を取得
 */
export function getConfiguration() {
  return vscode.workspace.getConfiguration('easyCopyErrors');
}

/**
 * 新しいフォーマットを使用するかどうかを取得
 */
export function useNewFormat(): boolean {
  return getConfiguration().get<boolean>('useNewFormat') ?? true;
}

/**
 * カスタムフォーマット文字列を取得
 */
export function getCustomFormat(): string {
  return (
    getConfiguration().get<string>('format') ||
    '[${severity}] Line ${line}, Column ${column}: ${message}'
  );
}

/**
 * ファイル名を含めるかどうかを取得
 */
export function includeFileName(): boolean {
  return getConfiguration().get<boolean>('includeFileName') ?? true;
}

/**
 * エラーをグループ化するかどうかを取得
 * デフォルトでグループ化するように変更
 */
export function useGrouping(): boolean {
  return getConfiguration().get<boolean>('useGrouping') ?? true;
}

/**
 * エラーのみをコピーするかどうかを取得
 * 新しく追加された設定
 */
export function errorsOnly(): boolean {
  return getConfiguration().get<boolean>('errorsOnly') ?? false;
}
