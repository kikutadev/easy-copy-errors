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
    // 将来的に他のフィルタリングオプションを追加可能
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
