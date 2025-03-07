
# 📋 Easy Copy Errors

[English](README.md) | [日本語](README.ja.md)

A VS Code extension for easily copying error messages from your current file or terminal output.
Created specifically to help with generating prompts for AI tools (ChatGPT, GitHub Copilot, etc.).

## 🌟 Features

### Diagnostic Information
- 🔴 Copy all diagnostics (errors, warnings, etc.) from the current file
- 🚨 Copy errors only (skip warnings, etc.)
- 📊 Group similar errors for better readability
- 🔧 Customize the format of copied error messages

### Vitest Test Results
- 🧪 Extract and copy failed Vitest test results with readable formatting
- 📋 Select test files and specific tests to copy
- 📝 Include code snippets, expected/received values, and error messages
- 🔍 Support for various Vitest output formats

## 🚀 Usage

### Error

#### How to Use
1. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and run `Errors: Copy Diagnostics`
2. Or use the keyboard shortcut: `Ctrl+Alt+E` (`Cmd+Option+E` on Mac)
3. The diagnostics from your current file will be copied to the clipboard

#### Error Copy Settings
- `easyCopyErrors.useNewFormat`: Use the new AI-friendly format (default: `true`)
- `easyCopyErrors.includeFileName`: Include file name in error messages (default: `true`)
- `easyCopyErrors.format`: Custom format for error messages (default: `"[${severity}] Line ${line}, Column ${column}: ${message}"`)
- `easyCopyErrors.useGrouping`: Group similar errors together (default: `true`)
- `easyCopyErrors.errorsOnly`: Copy only errors, excluding warnings (default: `false`)

#### Format Example
```
file: src/components/Button.tsx
Line 42:      return {label}
Property 'handlClick' does not exist. Did you mean 'handleClick'? ts(2551)
```

#### AI Prompt Example
```
Please help me fix the following TypeScript error:

file: src/components/Button.tsx
Line 42:      return {label}
Property 'handlClick' does not exist. Did you mean 'handleClick'? ts(2551)
```

### Vitest

#### How to Use
1. Run your Vitest tests in the terminal
2. Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and run `Vitest: Copy Vitest Test Results`
3. Or use the keyboard shortcut: `Ctrl+Alt+T` (`Cmd+Option+T` on Mac)
4. Select the test file and specific tests to copy (all tests are selected by default)
5. The selected test results will be copied to your clipboard

#### Vitest Output Format Example
```
file: src/recorder/player/playSimulators.test.ts

expected:
expected "spy" to be called with arguments: [ '#test-button' ]

received:
Received:

  1st spy call:

  [
-   "#test-button",
+   {
+     "selector": "#test-button",
+   },
  ]


Number of calls: 1

code snippet:
[
-   "#test-button",
+   {
+     "selector": "#test-button",
+   },
  ]
```

#### AI Prompt Example
```
Please help me fix the following Vitest test failure:

file: src/recorder/player/playSimulators.test.ts

expected:
expected "spy" to be called with arguments: [ '#test-button' ]

received:
Received:

  1st spy call:

  [
-   "#test-button",
+   {
+     "selector": "#test-button",
+   },
  ]

The test is expecting a string to be passed to the spy, but it seems we need to pass an object with a selector property instead. How should I fix this?
```

## ⌨️ Keyboard Shortcuts

| Feature | Windows/Linux | macOS |
|---------|---------------|-------|
| Copy Diagnostics | `Ctrl+Alt+E` | `Cmd+Option+E` |
| Copy Vitest Test Results | `Ctrl+Alt+T` | `Cmd+Option+T` |

## ⚙️ Settings

This extension provides the following configuration options:

- `easyCopyErrors.useNewFormat`: Use the new AI-friendly format (default: `true`)
- `easyCopyErrors.includeFileName`: Include file name in error messages (default: `true`)
- `easyCopyErrors.format`: Custom format for error messages (default: `"[${severity}] Line ${line}, Column ${column}: ${message}"`)
- `easyCopyErrors.useGrouping`: Group similar errors together (default: `true`)
- `easyCopyErrors.errorsOnly`: Copy only errors, excluding warnings and information (default: `false`)

### 📝 Available Format Placeholders

- `${severity}`: Diagnostic severity (Error, Warning, Info, Hint)
- `${line}`: Line number where the diagnostic appears
- `${column}`: Column number where the diagnostic appears
- `${message}`: Diagnostic message
- `${file}`: File name (only included if `includeFileName` is `true`)
- `${lineContent}`: Content of the line where the error occurs
- `${relativePath}`: Path relative to workspace

## 🤖 Integration with AI Tools

This extension structures error information in a format that's easy for AI tools like ChatGPT and GitHub Copilot to understand.

## 📚 Motivation

### 🧠 Making AI Smarter

AI tools perform better with accurate context. By including the exact file, line number, and code content, AI can better understand and solve your problems.

### ⏱️ Saving Development Time

Save time manually copying error details. One shortcut copies all the information you need to your clipboard.

## 📜 License

Published under the MIT License. See [LICENSE](LICENSE.md) for details.

## 🔄 Version History

See [CHANGELOG.md](CHANGELOG.md)
