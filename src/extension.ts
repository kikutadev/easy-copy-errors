// src/extension.ts
import * as vscode from 'vscode';
import { copyDiagnosticsHandler } from './commands/errorCommands';
import {
  copyVitestResultsHandler,
  copySelectedVitestResultsHandler,
} from './commands/vitestCommands';

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "easy-copy-errors" is now active');

  // 診断情報コピーコマンドを1つに統合
  const diagnosticsCommand = vscode.commands.registerCommand(
    'easy-copy-errors.copyErrors',
    copyDiagnosticsHandler
  );

  const vitestResultsCommand = vscode.commands.registerCommand(
    'easy-copy-errors.copyVitestResults',
    copyVitestResultsHandler
  );

  const selectVitestResultsCommand = vscode.commands.registerCommand(
    'easy-copy-errors.selectVitestResults',
    copySelectedVitestResultsHandler
  );


  context.subscriptions.push(
    diagnosticsCommand,
    vitestResultsCommand,
    selectVitestResultsCommand,
  );
}

export function deactivate() {}
