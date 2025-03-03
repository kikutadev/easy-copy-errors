import * as vscode from 'vscode';

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
        .join('\n');

      // Copy to clipboard
      await vscode.env.clipboard.writeText(formattedDiagnostics);

      vscode.window.showInformationMessage('Errors copied to clipboard.');
    }
  );

  context.subscriptions.push(disposable);
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

function formatDiagnostic(
  diagnostic: vscode.Diagnostic,
  document: vscode.TextDocument
): string {
  const config = vscode.workspace.getConfiguration('easyCopyErrors');
  const format =
    config.get<string>('format') ||
    '[${severity}] Line ${line}, Column ${column}: ${message}';
  const includeFileName = config.get<boolean>('includeFileName') || true;

  const line = diagnostic.range.start.line + 1;
  const column = diagnostic.range.start.character + 1;
  const message = diagnostic.message;
  const severity = getSeverityString(diagnostic.severity);
  const fileName = document.fileName.split('/').pop() || document.fileName;

  let formatted = format
    .replace('${severity}', severity)
    .replace('${line}', line.toString())
    .replace('${column}', column.toString())
    .replace('${message}', message);

  if (includeFileName) {
    formatted = formatted.replace('${file}', fileName);
  }

  return formatted;
}
