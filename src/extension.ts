import * as vscode from 'vscode';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  console.log('Extension "easy-copy-errors" is now active');

  // Register the command to copy errors
  let disposable = vscode.commands.registerCommand(
    'easy-copy-errors.copyErrors',
    async () => {
      // Get the active text editor
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage('No active editor found.');
        return;
      }

      // Get the document
      const document = editor.document;

      // Get diagnostics (errors) for the current file
      const diagnostics = vscode.languages.getDiagnostics(document.uri);

      if (diagnostics.length === 0) {
        vscode.window.showInformationMessage(
          'No errors found in the current file.'
        );
        return;
      }

      // Format the diagnostics
      const formattedDiagnostics = diagnostics
        .map((diag) => formatDiagnostic(diag, document))
        .join('\n\n');

      // Copy to clipboard
      await vscode.env.clipboard.writeText(formattedDiagnostics);

      vscode.window.showInformationMessage('Errors copied to clipboard.');
    }
  );

  // Also register the command to copy only errors (not warnings, etc.)
  let copyErrorsOnly = vscode.commands.registerCommand(
    'easy-copy-errors.copyErrorsOnly',
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage('No active editor found.');
        return;
      }

      const document = editor.document;
      const diagnostics = vscode.languages.getDiagnostics(document.uri);

      // Filter to only include errors
      const errors = diagnostics.filter(
        (d) => d.severity === vscode.DiagnosticSeverity.Error
      );

      if (errors.length === 0) {
        vscode.window.showInformationMessage(
          'No errors found in the current file.'
        );
        return;
      }

      const formattedErrors = errors
        .map((diag) => formatDiagnostic(diag, document))
        .join('\n\n');

      await vscode.env.clipboard.writeText(formattedErrors);

      vscode.window.showInformationMessage('Errors copied to clipboard.');
    }
  );

  context.subscriptions.push(disposable, copyErrorsOnly);
}

export function deactivate() {}

function getSeverityString(severity: vscode.DiagnosticSeverity): string {
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
 * Get the relative path of a file from the workspace root
 */
function getRelativePath(uri: vscode.Uri): string {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
  if (workspaceFolder) {
    return path.relative(workspaceFolder.uri.fsPath, uri.fsPath);
  }
  return uri.fsPath;
}

/**
 * Format a diagnostic with file path, line content, and error message
 */
function formatDiagnostic(
  diagnostic: vscode.Diagnostic,
  document: vscode.TextDocument
): string {
  const config = vscode.workspace.getConfiguration('easyCopyErrors');
  const useNewFormat = config.get<boolean>('useNewFormat') ?? true;

  // Get the line number
  const line = diagnostic.range.start.line + 1;
  const column = diagnostic.range.start.character + 1;

  // Get the message and severity
  const message = diagnostic.message;
  const severity = getSeverityString(diagnostic.severity);

  // Get file information
  const fileName = document.fileName.split('/').pop() || document.fileName;
  const relativePath = getRelativePath(document.uri);

  // Get the line content
  const lineContent = document.lineAt(diagnostic.range.start.line).text;

  if (useNewFormat) {
    // Use the new format that includes file path and line content
    return `file: ${relativePath}\nLine ${line}:      ${lineContent}\n${message}`;
  } else {
    // Use the original configurable format
    const format =
      config.get<string>('format') ||
      '[${severity}] Line ${line}, Column ${column}: ${message}';
    const includeFileName = config.get<boolean>('includeFileName') ?? true;

    let formatted = format
      .replace(/\${severity}/g, severity)
      .replace(/\${line}/g, line.toString())
      .replace(/\${column}/g, column.toString())
      .replace(/\${message}/g, message)
      .replace(/\${lineContent}/g, lineContent);

    if (includeFileName) {
      formatted = formatted
        .replace(/\${file}/g, fileName)
        .replace(/\${relativePath}/g, relativePath);
    }

    return formatted;
  }
}
