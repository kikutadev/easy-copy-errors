# Easy Copy Errors

A VS Code extension that makes it easy to copy error messages from the current file.

## Features

- Copy all diagnostics (errors, warnings, etc.) from the current file
- Copy only errors from the current file
- Customizable format for copied error messages

## Usage

- Copy all diagnostics: `Ctrl+Shift+E` (`Cmd+Shift+E` on Mac)
- Copy only errors: `Ctrl+Shift+A` (`Cmd+Shift+A` on Mac)

You can also access these commands from the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`):
- "Copy All Errors in Current File"
- "Copy Only Errors in Current File"

## Configuration

This extension offers the following configuration options:

- `easyCopyErrors.includeFileName`: Include the file name in the copied error message (default: true)
- `easyCopyErrors.format`: Format of the copied error message (default: "[${severity}] Line ${line}, Column ${column}: ${message}")

Available placeholders for the format:
- `${severity}`: The severity of the diagnostic (Error, Warning, Info, Hint)
- `${line}`: The line number where the diagnostic appears
- `${column}`: The column number where the diagnostic appears
- `${message}`: The diagnostic message
- `${file}`: The name of the file (only included if `includeFileName` is true)
