import * as vscode from 'vscode';
import {
  copyAllDiagnosticsHandler,
  copyErrorsOnlyHandler,
} from './commands/errorCommands';

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


  context.subscriptions.push(allDiagnosticsCommand, errorsOnlyCommand);
}

export function deactivate() {}
