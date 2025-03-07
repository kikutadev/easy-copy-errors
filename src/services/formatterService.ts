// src/services/formatterService.ts
import * as vscode from 'vscode';
import { getFileName, getRelativePath } from '../utils/file';
import {
  useNewFormat,
  getCustomFormat,
  includeFileName,
} from '../utils/config';
import { DiagnosticContext, DiagnosticGroup } from './diagnosticsService';

/**
 * 診断情報をフォーマット
 */
export function formatDiagnostic(context: DiagnosticContext): string {
  if (useNewFormat()) {
    return formatNewStyle(context);
  } else {
    return formatCustomStyle(context);
  }
}

/**
 * 新しいスタイルでフォーマット（AIプロンプト向け）
 */
function formatNewStyle(context: DiagnosticContext): string {
  const { document, line, lineContent, message } = context;
  const relativePath = getRelativePath(document.uri);

  return `file: ${relativePath}\nLine ${line}:      ${lineContent}\n${message}`;
}

/**
 * カスタムスタイルでフォーマット（ユーザー設定に基づく）
 */
function formatCustomStyle(context: DiagnosticContext): string {
  const { document, line, column, lineContent, severity, message } = context;
  const fileName = getFileName(document.uri);
  const relativePath = getRelativePath(document.uri);

  let format = getCustomFormat();

  let formatted = format
    .replace(/\${severity}/g, severity)
    .replace(/\${line}/g, line.toString())
    .replace(/\${column}/g, column.toString())
    .replace(/\${message}/g, message)
    .replace(/\${lineContent}/g, lineContent);

  if (includeFileName()) {
    formatted = formatted
      .replace(/\${file}/g, fileName)
      .replace(/\${relativePath}/g, relativePath);
  }

  return formatted;
}

/**
 * 複数の診断情報をフォーマットして結合
 */
export function formatDiagnostics(
  diagnostics: vscode.Diagnostic[],
  document: vscode.TextDocument,
  buildContext: (
    diag: vscode.Diagnostic,
    doc: vscode.TextDocument
  ) => DiagnosticContext
): string {
  return diagnostics
    .map((diag) => formatDiagnostic(buildContext(diag, document)))
    .join('\n\n');
}

/**
 * グループ化された診断情報をフォーマット
 */
export function formatDiagnosticGroups(groups: DiagnosticGroup[]): string {
  return groups
    .map((group) => formatDiagnosticGroup(group))
    .join('\n\n---\n\n');
}

/**
 * 単一の診断情報グループをフォーマット（シンプルなスタイル）
 * 同じファイル内で同じエラーメッセージのものをまとめる
 */
function formatDiagnosticGroup(group: DiagnosticGroup): string {
  const { contexts, message } = group;

  if (contexts.length === 0) {
    return '';
  }

  // 最初のコンテキストからファイル情報を取得
  const firstContext = contexts[0];
  const relativePath = getRelativePath(firstContext.document.uri);

  // ファイル情報を出力
  let result = `file: ${relativePath}\n`;

  // 各行の情報をフォーマット
  contexts.forEach((context) => {
    result += `Line ${context.line}: ${context.lineContent}\n`;
  });

  // エラーメッセージを最後に追加
  result += `${message}`;

  return result;
}
