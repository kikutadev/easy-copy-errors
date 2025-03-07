# Change Log

All notable changes to the "easy-copy-errors" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.2] - 2025-03-08

### Added
- 国際化（i18n）サポートを追加（`@vscode/l10n`を使用）
- タイムアウト付き通知メッセージ機能：通知が5秒後に自動的に消える
- テスト選択UIでデフォルトで全テストが選択される機能

### Changed
- コマンドを整理し、より直感的なUI体験を提供
  - 診断情報コピーコマンドを単一の `copyErrors` コマンドに統合
  - Vitestコマンドを単一の `copyVitestResults` コマンドに統合
- 設定を強化：
  - `useGrouping` のデフォルト値を `true` に変更
  - `errorsOnly` 設定を追加してエラーのみをフィルタリング可能に

### Fixed
- 正規表現パターンを改善し、Vitestテスト結果の抽出精度を向上
- ファイルパスとテスト名の誤抽出を修正
- テスト結果の重複を削除する処理を追加
- `matchAll` メソッドで使用する正規表現にグローバルフラグを適切に設定


## [0.0.1] - 2025-03-05

initial release
