import * as vscode from 'vscode';

export class SimpleSearch {
    selectItem: SearchItem | undefined;
    optionList: SearchItem[];
    optionLoaded: boolean = false;
    
    constructor() {
        this.optionList = [];
        this.LoadSetting(true);
    }

    LoadSetting(force = false): any {
        if (this.optionLoaded && !force) {
            return;
        }
        this.optionLoaded = true;

        let settings = vscode.workspace.getConfiguration().get("simplesearch.url");
        if (!settings) {
            this.LogError("cannot find \'simplesearch.url\' configuration");
            return;
        }

        this.optionList = [];
        let urlList = <Array<Object>>settings;
        for (let i = 0; i !== urlList.length; ++i) {
            let item = <SearchItem>urlList[i];
            if (!item || !item.label || !item.url) {
                // may need ntf cfg err
                continue;
            }
            if (!item.description) {
                item.description = "";
            }
            // this.LogInfo('setting ' + i + " \t" + item.label + " " + item.description + " " + item.url);

            // add cfg
            this.optionList.push(item);
        }
    }
    
    Run(str: string): any {
        if (str === "") {
            this.ShowInput();
        } else {
            this.ShowQuickPick(str);
        }
    }

    ShowInput(): any {
        let input = vscode.window.createInputBox();
        input.title = "Input Search Item";
        input.placeholder = "something to search ...";
        input.onDidHide(() => input.dispose());
        input.onDidAccept(() => {
            if (!input.value || input.value === "") {
                vscode.window.showInformationMessage("SimpleSearch: search item is null");
            } else {
                this.ShowQuickPick(input.value);
            }
            input.hide();
        });
        input.show();
    }

    ShowQuickPick(str: string): any {
        if (str === "" || !this.optionList) {
            return;
        }

        let quickPick = vscode.window.createQuickPick();
        quickPick.title = "Search \'{name}\' On ...".replace(/\{name\}/g, str);
        quickPick.items = this.optionList;
        quickPick.onDidHide(() => quickPick.dispose());
        quickPick.onDidChangeActive((items) => {
            if (items[0]) {
                this.selectItem = <SearchItem>items[0];
            }
        });
        quickPick.onDidAccept(() => {
            if (this.selectItem) {
                let searchUrl = this.selectItem.url.replace(/\{name\}/g, str);
                this.DoSearch(searchUrl);
            }
            quickPick.hide();
            this.selectItem = undefined;
        });

        quickPick.show();
    }

    DoSearch(searchUrl: string) {
        if (searchUrl === "") {
            return;
        }
        
        // search item
        // this.LogInfo("Search: " + searchUrl);
        vscode.env.openExternal(vscode.Uri.parse(searchUrl));
    }

    LogInfo(msg: string) {
        vscode.window.showInformationMessage("SimpleSearch: " + msg);
    }

    LogError(msg: string) {
        vscode.window.showErrorMessage("SimpleSearch: " + msg);
    }
}

class SearchItem implements vscode.QuickPickItem {
    label: string;
    description: string;
    url: string;

    constructor(label: string, description: string, url: string) {
        this.label = label;
        this.description = description;
        this.url = url;
    }
}