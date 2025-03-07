// src/services/diagnosticsService.ts
import * as vscode from 'vscode';

/**
 * 診断情報の重要度を文字列に変換
 */
export function getSeverityString(severity: vscode.DiagnosticSeverity): string {
  switch (severity) {
    case vscode.DiagnosticSeverity.Error:
      return 'Error';
    case vscode.DiagnosticSeverity.Warning:
      return 'Warning';
    case vscode.DiagnosticSeverity.Information:
      return 'Info';
    case vscode.DiagnosticSeverity.Hint:
      return 'Hint';
    default:
      return 'Unknown';
  }
}

/**
 * 現在のファイルの診断情報を取得
 */
export function getCurrentFileDiagnostics(): vscode.Diagnostic[] | null {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return null;
  }

  return vscode.languages.getDiagnostics(editor.document.uri);
}

/**
 * 診断情報をフィルタリング
 */
export function filterDiagnostics(
  diagnostics: vscode.Diagnostic[],
  filterOptions: {
    errorsOnly?: boolean;
  } = {}
): vscode.Diagnostic[] {
  const { errorsOnly = false } = filterOptions;

  if (errorsOnly) {
    return diagnostics.filter(
      (d) => d.severity === vscode.DiagnosticSeverity.Error
    );
  }

  return diagnostics;
}

/**
 * 診断情報のコンテキスト情報を構築
 */
export function buildDiagnosticContext(
  diagnostic: vscode.Diagnostic,
  document: vscode.TextDocument
): DiagnosticContext {
  return {
    diagnostic,
    document,
    line: diagnostic.range.start.line + 1,
    column: diagnostic.range.start.character + 1,
    lineContent: document.lineAt(diagnostic.range.start.line).text,
    severity: getSeverityString(diagnostic.severity),
    message: diagnostic.message,
  };
}

/**
 * 診断情報のコンテキスト
 */
export interface DiagnosticContext {
  diagnostic: vscode.Diagnostic;
  document: vscode.TextDocument;
  line: number;
  column: number;
  lineContent: string;
  severity: string;
  message: string;
}

/**
 * 診断情報のグループ
 * 同じファイル内で同じエラーメッセージを持つものをグループ化
 */
export interface DiagnosticGroup {
  // グループ内のコンテキスト一覧
  contexts: DiagnosticContext[];
  // 共通のファイルパス
  filePath: string;
  // 共通のエラーメッセージ
  message: string;
  // グループに固有のID
  id: string;
}

/**
 * 診断情報をグループ化する
 * 同じファイル内の同じエラーメッセージのものをまとめる
 */
export function groupDiagnostics(
  diagnostics: vscode.Diagnostic[],
  document: vscode.TextDocument
): DiagnosticGroup[] {
  // ファイル+メッセージの組み合わせでグループ化
  const groups: { [key: string]: DiagnosticGroup } = {};

  // 各診断情報を処理
  diagnostics.forEach((diagnostic) => {
    const context = buildDiagnosticContext(diagnostic, document);
    const message = diagnostic.message;
    const filePath = document.fileName;

    // グループのキーを作成（ファイルパス+メッセージ）
    const groupKey = `${filePath}:${message}`;

    if (!groups[groupKey]) {
      groups[groupKey] = {
        contexts: [],
        filePath,
        message,
        id: groupKey,
      };
    }

    groups[groupKey].contexts.push(context);
  });

  // 結果を配列に変換してソート
  return (
    Object.values(groups)
      // 行番号でソート
      .map((group) => {
        group.contexts.sort((a, b) => a.line - b.line);
        return group;
      })
      // グループをファイルパスでソート
      .sort((a, b) => a.filePath.localeCompare(b.filePath))
  );
}
