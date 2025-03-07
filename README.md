# READMEの更新

以下に英語と日本語のREADMEファイルの更新版を提供します。最新のv0.0.2の機能を反映した内容になっています。

## README.md（英語版）

```markdown
# 📋 Easy Copy Errors

[English](README.md) | [日本語](README.ja.md)

A VS Code extension for easily copying error messages from your current file or terminal output.
Created specifically to help with generating prompts for AI tools (ChatGPT, GitHub Copilot, etc.).

![](how-to-use.gif)

## 🌟 Features

- 🔴 Copy all diagnostics (errors, warnings, etc.) from the current file
- 🚨 Copy errors only (skip warnings, etc.)
- 🔧 Customize the format of copied error messages
- 📊 Group similar errors for better readability
- 🧪 Extract and copy Vitest test results with readable formatting
- 🌐 Internationalization support

## 🚀 Usage

### Diagnostic Information

Open the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and run:
- `Errors: Copy Diagnostics`

This single command can handle all previous functionality, with behavior controlled by settings.

### Vitest Test Results

When working with Vitest test output:
1. Run your Vitest tests in the terminal
2. Open the Command Palette and run `Vitest: Copy Vitest Test Results`
3. Select the test file and specific tests to copy (all tests are selected by default)

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

### ✅ Example Format

```
file: src/components/Button.tsx
Line 42:      return {label}
Property 'handlClick' does not exist. Did you mean 'handleClick'? ts(2551)
```

### 💡 Example AI Prompt

```
Please help me fix the following TypeScript error:

file: src/components/Button.tsx
Line 42:      return {label}
Property 'handlClick' does not exist. Did you mean 'handleClick'? ts(2551)
```

## 📚 Motivation

### 🧠 Making AI Smarter

AI tools perform better with accurate context. By including the exact file, line number, and code content, AI can better understand and solve your problems.

### ⏱️ Saving Development Time

Save time manually copying error details. One shortcut copies all the information you need to your clipboard.

## 📜 License

Published under the MIT License. See [LICENSE](LICENSE.md) for details.

## 🔄 Version History

See [CHANGELOG.md](CHANGELOG.md)
