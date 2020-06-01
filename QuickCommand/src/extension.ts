// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as quickcommand from './quickcommand';

var quickCmd: quickcommand.QuickCommand | null = null;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('extension.quickcommand', () => {		
		if (quickCmd === null) {
			let cls = new quickcommand.QuickCommand(context);
			quickCmd = cls;
		}
		quickCmd.LoadSetting(true);	// refresh config everytime
		quickCmd.ShowQuickCommand();
	});
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
	quickCmd = null;
}
