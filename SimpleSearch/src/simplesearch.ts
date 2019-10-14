import * as vscode from 'vscode';
import { SearchItem, SearchItemUrlConfig, SearchItemFileConfig } from "./searchitem";

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

        let settings = vscode.workspace.getConfiguration().get("simplesearch.searchConfig");
        if (!settings) {
            this.LogError("cannot find \'simplesearch.url\' configuration");
            return;
        }

        this.optionList = [];
        let urlList = <Array<Object>>settings;
        for (let i = 0; i !== urlList.length; ++i) {
            let item = <SearchItem>urlList[i];
            if (!item || !item.label) {
                // may need ntf cfg err
                continue;
            }
            if ((item.type === "url" && item.urlConfig === null) || 
                (item.type === "file" && item.fileConfig === null)) {
                // may need ntf cfg err
                continue;
            }

            // make some init
            if (!item.inited) { 
                // add icon
                if (!item.icon || item.icon === "") {
                    let icon = "";
                    if (item.type === "url") {
                        icon = "$(browser)";
                    } else if (item.type === "file") {
                        icon = "$(file)";
                    }
                    item.icon = icon;
                }
                item.rawlabel = item.label;
                item.label = item.icon + " " + item.rawlabel;
                item.inited = true;
            }

            // if (item.type === "url") {
            //     this.LogInfo('LoadSetting: ' + i + " \t" + item.label + " " + item.type + " " + (item.urlConfig !== null ? item.urlConfig.url : "null"));
            // } else {
            //     this.LogInfo('LoadSetting: ' + i + " \t" + item.label + " " + item.type + " include: " + (item.fileConfig !== null ? item.fileConfig.fileToInclude : "null") + " exclude: " + (item.fileConfig !== null ? item.fileConfig.fileToExclude : "null"));
            // }

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
                this.DoSearch(str, this.selectItem);
            }
            quickPick.hide();
            this.selectItem = undefined;
        });

        quickPick.show();
    }

    DoSearch(str: string, searchItem: SearchItem) {
        this.LogInfo("TrySearch: " + str);
        if (searchItem.type === "url") {
            return this.DoSearchUrl(str, searchItem);
        } else if (searchItem.type === "file") {
            return this.DoSearchFile(str, searchItem);
        } else {
            this.LogError("unrecognized SearchItem type: " + searchItem.type);
        }
    }

    DoSearchUrl(str: string, searchItem: SearchItem) {
        if (searchItem.urlConfig === null || searchItem.urlConfig.url === "") {
            this.LogInfo("Search Url Failed");
            return;
        }

        let searchUrl = searchItem.urlConfig.url.replace(/\{name\}/g, str);
        vscode.env.openExternal(vscode.Uri.parse(searchUrl));
    }

    DoSearchFile(str: string, searchItem: SearchItem) {
        if (searchItem.fileConfig === null) {
            this.LogInfo("Search File Failed");
            return;
        }

        vscode.commands.executeCommand('workbench.action.findInFiles', {
            query: str, 
            replace: null, 
            triggerSearch: true, 
            filesToInclude: searchItem.fileConfig.fileToInclude, 
            filesToExclude: searchItem.fileConfig.fileToExclude, 
            isRegex: false, 
            isCaseSensitive: false, 
            matchWholeWord: false, 
        });
    }

    LogInfo(msg: string) {
        vscode.window.showInformationMessage("SimpleSearch: " + msg);
    }

    LogError(msg: string) {
        vscode.window.showErrorMessage("SimpleSearch: " + msg);
    }
}