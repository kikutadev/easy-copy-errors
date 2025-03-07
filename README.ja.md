
# 📋 Easy Copy Errors

[English](README.md) | [日本語](README.ja.md)

現在のファイルからエラーメッセージやテスト結果を簡単にコピーするためのVS Code拡張機能です。
特に生成AI（ChatGPT、GitHub Copilotなど）へのプロンプト作成のために作りました。

![](how-to-use.gif)

## 🌟 特徴

- 🔴 現在のファイル内のすべての診断情報（エラー、警告など）をコピー
- 🚨 エラーのみをコピー（警告などは除外）
- 🔧 コピーされるエラーメッセージのフォーマットをカスタマイズ可能
- 📊 同様のエラーをグループ化して読みやすく表示
- 🧪 Vitestテスト結果を抽出して読みやすい形式でコピー
- 🌐 国際化対応

## 🚀 使い方

### 診断情報

コマンドパレット（`Ctrl+Shift+P`または`Cmd+Shift+P`）から実行：
- `Errors: Copy Diagnostics`

このコマンド一つで、以前のすべての機能を設定に基づいて実行できます。

### Vitestテスト結果

Vitestテスト出力を扱う場合：
1. ターミナルでVitestテストを実行
2. コマンドパレットを開いて `Vitest: Copy Vitest Test Results` を実行
3. テストファイルと特定のテストを選択（デフォルトですべてのテストが選択されています）

## ⚙️ 設定

この拡張機能では以下の設定オプションが利用できます：

- `easyCopyErrors.useNewFormat`: AI向けの新しいフォーマットを使用する（デフォルト: `true`）
- `easyCopyErrors.includeFileName`: コピーされるエラーメッセージにファイル名を含める（デフォルト: `true`）
- `easyCopyErrors.format`: エラーメッセージのフォーマット（デフォルト: `"[${severity}] Line ${line}, Column ${column}: ${message}"`）
- `easyCopyErrors.useGrouping`: 類似したエラーをグループ化する（デフォルト: `true`）
- `easyCopyErrors.errorsOnly`: エラーのみをコピーし、警告や情報を除外する（デフォルト: `false`）

### 📝 フォーマットで使用できるプレースホルダー

- `${severity}`: 診断の重要度（Error、Warning、Info、Hint）
- `${line}`: 診断が表示される行番号
- `${column}`: 診断が表示される列番号
- `${message}`: 診断メッセージ
- `${file}`: ファイル名（`includeFileName`が`true`の場合のみ含まれる）
- `${lineContent}`: エラーが発生している行のコード内容
- `${relativePath}`: ワークスペースからの相対パス

## 🤖 生成AIとの連携

この拡張機能は、エラー情報を構造化された形式でコピーするため、ChatGPTやGitHub Copilotなどの生成AIにエラー内容を伝える際に非常に便利です。

### ✅ コピーされるフォーマット例

```
file: src/components/Button.tsx
Line 42:      return {label}
Property 'handlClick' does not exist. Did you mean 'handleClick'? ts(2551)
```

このフォーマットを使用することで、AIはエラーの発生箇所やコンテキストを正確に理解し、より的確な解決策を提案できるようになります。

### 💡 AIへの質問例

```
以下のTypeScriptのエラーを解決する方法を教えてください。

file: src/components/Button.tsx
Line 42:      return {label}
Property 'handlClick' does not exist. Did you mean 'handleClick'? ts(2551)
```

## 📚 この拡張機能を使うモチベーション

### 🧠 生成AIを賢くする

生成AIの性能は、提供されるコンテキストに大きく依存します。エラーが発生した正確なファイル、行番号、コード内容を含めることで、AIはより正確に問題を理解し、より良い解決策を提案できます。

### ⏱️ 開発時間の短縮

エラーの詳細情報を手動でコピー＆ペーストする時間を節約できます。ショートカットキー一つで、必要な情報が全てクリップボードにコピーされます。

## 📜 ライセンス

MITライセンスで公開しています。詳細は[LICENSE](LICENSE.md)ファイルをご覧ください。

## 🔄 バージョン履歴

詳細は[CHANGELOG.md](CHANGELOG.md)をご覧ください。
