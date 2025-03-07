// src/commands/terminalCommands.ts
import { copySelectedVitestResultsHandler } from './vitestCommands';

/**
 * Vitestテスト結果をコピーするコマンドハンドラー
 * 互換性のために維持。実際の処理は vitestCommands.ts に移動
 */
export async function copyVitestResultsHandler(): Promise<void> {
  // 選択UIを使う新しい実装にリダイレクト
  await copySelectedVitestResultsHandler();
}
