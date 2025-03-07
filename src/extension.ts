import * as vscode from 'vscode';
import {
  copyAllDiagnosticsHandler,
  copyErrorsOnlyHandler,
  copyGroupedDiagnosticsHandler,
  copyGroupedErrorsOnlyHandler,
} from './commands/errorCommands';
import { copyVitestResultsHandler } from './commands/vitestCommands';

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
  // 新しいVitestテスト結果コピーコマンドを登録
  const vitestResultsCommand = vscode.commands.registerCommand(
    'easy-copy-errors.copyVitestResults',
    copyVitestResultsHandler
  );

  context.subscriptions.push(
    allDiagnosticsCommand,
    errorsOnlyCommand,
    groupedDiagnosticsCommand,
    groupedErrorsOnlyCommand,
    vitestResultsCommand
  );
}

export function deactivate() {}
