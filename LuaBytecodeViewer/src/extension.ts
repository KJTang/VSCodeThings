// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as luaBV from './lua_bytecode_viewer';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// register a content provider for the luabytecode-scheme
	let viewer = new luaBV.LuaBytecodeViewer();
	const myScheme = 'luabytecode';
	const myProvider = new class implements vscode.TextDocumentContentProvider {
		async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
			let result = await viewer.Run(uri.path);
			return result;
		}
	};
	context.subscriptions.push(vscode.workspace.registerTextDocumentContentProvider(myScheme, myProvider));

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('extension.viewluabytecode', async () => {
		let str = "";
		let editor = vscode.window.activeTextEditor;
		if (editor) {
			let selection = editor.selection;
			if (!selection.anchor.isEqual(selection.active)) {
				str = editor.document.getText(selection);
			} else {
				str = editor.document.getText();
			}
		}
		if (str === "") {
			str = "no lua code.";
		}
		// console.log('luabytecode:\n' + str);

		let uri = vscode.Uri.parse('luabytecode:' + str);
		let doc = await vscode.workspace.openTextDocument(uri); // calls back into the provider
		await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside, false);
		vscode.languages.setTextDocumentLanguage(doc, "lua");
	});
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
