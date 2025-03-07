// src/test/utils/file.test.ts
import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as sinon from 'sinon';

import { getRelativePath, getFileName } from '../utils/file';

suite('File Utilities Test Suite', () => {
  // テスト前後の設定
  let sandbox: sinon.SinonSandbox;

  setup(() => {
    // テスト前にSinonサンドボックスを作成
    sandbox = sinon.createSandbox();
  });

  teardown(() => {
    // テスト後にサンドボックスをリストア
    sandbox.restore();
  });

  test('getRelativePath should return relative path when in workspace', () => {
    // モックデータの設定
    const workspacePath = '/path/to/workspace';
    const filePath = '/path/to/workspace/src/utils/file.ts';
    const expectedRelativePath = 'src/utils/file.ts';

    // ワークスペースフォルダのモックを作成
    const mockWorkspaceFolder = {
      uri: { fsPath: workspacePath },
      name: 'workspace',
      index: 0,
    } as vscode.WorkspaceFolder;

    // getWorkspaceFolderのスタブを作成
    const getWorkspaceFolderStub = sandbox.stub(
      vscode.workspace,
      'getWorkspaceFolder'
    );
    getWorkspaceFolderStub.returns(mockWorkspaceFolder);

    // テスト対象のURIを作成
    const uri = { fsPath: filePath } as vscode.Uri;

    // 関数を実行して結果を検証
    const result = getRelativePath(uri);
    assert.strictEqual(result, expectedRelativePath);

    // スタブが正しく呼ばれたことを確認
    sinon.assert.calledWith(getWorkspaceFolderStub, uri);
  });

  test('getRelativePath should return full path when not in workspace', () => {
    // モックデータの設定
    const filePath = '/path/to/file/outside/workspace.ts';

    // getWorkspaceFolderのスタブを作成
    const getWorkspaceFolderStub = sandbox.stub(
      vscode.workspace,
      'getWorkspaceFolder'
    );
    getWorkspaceFolderStub.returns(undefined);

    // テスト対象のURIを作成
    const uri = { fsPath: filePath } as vscode.Uri;

    // 関数を実行して結果を検証
    const result = getRelativePath(uri);
    assert.strictEqual(result, filePath);

    // スタブが正しく呼ばれたことを確認
    sinon.assert.calledWith(getWorkspaceFolderStub, uri);
  });

  test('getFileName should return just the file name', () => {
    // モックデータの設定
    const filePath = '/path/to/workspace/src/utils/file.ts';
    const expectedFileName = 'file.ts';

    // テスト対象のURIを作成
    const uri = { fsPath: filePath } as vscode.Uri;

    // 関数を実行して結果を検証
    const result = getFileName(uri);
    assert.strictEqual(result, expectedFileName);
  });

  test('getFileName should handle files without path', () => {
    // モックデータの設定
    const filePath = 'file.ts';
    const expectedFileName = 'file.ts';

    // テスト対象のURIを作成
    const uri = { fsPath: filePath } as vscode.Uri;

    // 関数を実行して結果を検証
    const result = getFileName(uri);
    assert.strictEqual(result, expectedFileName);
  });
});
