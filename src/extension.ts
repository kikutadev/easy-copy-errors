import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "easy-copy-errors" is now active');

    // Register the command to copy errors
    let disposable = vscode.commands.registerCommand('easy-copy-errors.copyErrors', async () => {
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
            vscode.window.showInformationMessage('No errors found in the current file.');
            return;
        }

        // Format the diagnostics
        const formattedDiagnostics = diagnostics.map(diagnostic => {
            const line = diagnostic.range.start.line + 1; // Lines are 0-based
            const column = diagnostic.range.start.character + 1; // Columns are 0-based
            const message = diagnostic.message;
            const severity = getSeverityString(diagnostic.severity);

            return `[${severity}] Line ${line}, Column ${column}: ${message}`;
        }).join('\n');

        // Copy to clipboard
        await vscode.env.clipboard.writeText(formattedDiagnostics);

        vscode.window.showInformationMessage('Errors copied to clipboard.');
    });

    context.subscriptions.push(disposable);
}

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

export function deactivate() {}
