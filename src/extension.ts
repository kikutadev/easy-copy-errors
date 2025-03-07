// src/extension.ts
import * as vscode from 'vscode';
import {
  copyAllDiagnosticsHandler,
  copyErrorsOnlyHandler,
  copyGroupedDiagnosticsHandler,
  copyGroupedErrorsOnlyHandler,
} from './commands/errorCommands';
import { copyVitestResultsHandler } from './commands/terminalCommands';
import {
  copyAllVitestResultsHandler,
  copySelectedVitestResultsHandler,
} from './commands/vitestCommands';

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "easy-copy-errors" is now active');

  // Register commands
  const allDiagnosticsCommand = vscode.commands.registerCommand(
    'easy-copy-errors.copyErrors',
    copyAllDiagnosticsHandler
  );

  const errorsOnlyCommand = vscode.commands.registerCommand(
    'easy-copy-errors.copyErrorsOnly',
    copyErrorsOnlyHandler
  );

  const groupedDiagnosticsCommand = vscode.commands.registerCommand(
    'easy-copy-errors.copyGroupedErrors',
    copyGroupedDiagnosticsHandler
  );

  const groupedErrorsOnlyCommand = vscode.commands.registerCommand(
    'easy-copy-errors.copyGroupedErrorsOnly',
    copyGroupedErrorsOnlyHandler
  );

  // 旧コマンド（互換性のために維持）
  const vitestResultsCommand = vscode.commands.registerCommand(
    'easy-copy-errors.copyVitestResults',
    copyVitestResultsHandler
  );

  // 新コマンド：ファイル単位で選択してコピー
  const selectVitestResultsCommand = vscode.commands.registerCommand(
    'easy-copy-errors.selectVitestResults',
    copySelectedVitestResultsHandler
  );

  // 新コマンド：すべての失敗テストをコピー（選択UIなし）
  const allVitestResultsCommand = vscode.commands.registerCommand(
    'easy-copy-errors.copyAllVitestResults',
    copyAllVitestResultsHandler
  );

  context.subscriptions.push(
    allDiagnosticsCommand,
    errorsOnlyCommand,
    groupedDiagnosticsCommand,
    groupedErrorsOnlyCommand,
    vitestResultsCommand,
    selectVitestResultsCommand,
    allVitestResultsCommand
  );
}

export function deactivate() {}
