import * as vscode from 'vscode';
import { CommandItem } from "./commanditem";

export class QuickCommand {
    selectItem: CommandItem | undefined;
    optionList: CommandItem[];
    optionLoaded: boolean = false;
    terminal: vscode.Terminal | null = null;

    constructor(context: vscode.ExtensionContext) {
        this.Log("new QuickCommand()");
        this.optionList = [];
        this.LoadSetting(true);

        // register terminal
        let listener = (terminal: vscode.Terminal) => {
            if (terminal === this.terminal) {
                this.terminal = null;
            }
        };
        vscode.window.onDidCloseTerminal(listener, this, [ new vscode.Disposable(listener) ]);
    }

    GetTerminal() : vscode.Terminal {
        if (this.terminal === null) {
            this.terminal = vscode.window.createTerminal({ name: 'QuickCommand' });
        }
        return this.terminal;
    }

    LoadSetting(force = false): any {
        if (this.optionLoaded && !force) {
            return;
        }
        this.optionLoaded = true;

        let settings = vscode.workspace.getConfiguration().get("quickcommand.commands");
        if (!settings) {
            this.LogError("cannot find \'quickcommand.commands\' configuration");
            return;
        }

        this.optionList = [];
        let urlList = <Array<Object>>settings;
        for (let i = 0; i !== urlList.length; ++i) {
            let item = <CommandItem>urlList[i];
            if (!item || !item.label) {
                // may need ntf cfg err
                continue;
            }

            // make some init
            if (!item.inited) { 
                // add icon (ref https://code.visualstudio.com/api/references/icons-in-labels)
                if (!item.icon || item.icon === "") {
                    item.icon = "$(file-binary)";
                }
                item.rawlabel = item.label;
                item.label = item.icon + " " + item.rawlabel;
                item.inited = true;
            }

            // add cfg
            this.optionList.push(item);
        }
    }

    ShowQuickCommand(): any {
        if (!this.optionList) {
            return;
        }

        let quickPick = vscode.window.createQuickPick();
        quickPick.title = "Run Command";
        quickPick.items = this.optionList;
        quickPick.onDidHide(() => quickPick.dispose());
        quickPick.onDidChangeActive((items) => {
            if (items[0]) {
                this.selectItem = <CommandItem>items[0];
            }
        });
        quickPick.onDidAccept(() => {
            if (this.selectItem) {
                this.RunCommand(this.selectItem);
            }
            quickPick.hide();
            this.selectItem = undefined;
        });

        quickPick.show();
    }

    RunCommand(command: CommandItem) {
        this.Log("RunCommand: " + command.rawlabel);

        // TODO: need replace placeholder, such as {filename}
        let cmd = command.command;
        
        let term = this.GetTerminal();
        term.show();
        term.sendText(cmd);
    }

    Log(msg: string) {
        console.log("QuickCommand: " + msg);
    }

    LogInfo(msg: string) {
        vscode.window.showInformationMessage("QuickCommand: " + msg);
    }

    LogError(msg: string) {
        vscode.window.showErrorMessage("QuickCommand: " + msg);
    }
}