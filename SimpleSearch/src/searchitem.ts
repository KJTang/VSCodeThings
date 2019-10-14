import * as vscode from 'vscode';

export class SearchItemUrlConfig {
    url: string = "";
}

export class SearchItemFileConfig {
    fileToInclude: string = "";
    fileToExclude: string = "";
}

export class SearchItem implements vscode.QuickPickItem {
    label: string = "";
    rawlabel: string;
    icon: string = "";
    inited: boolean = false;
    description: string = "";
    type: string = "url";
    urlConfig: SearchItemUrlConfig | null = null;
    fileConfig: SearchItemFileConfig | null = null;

    constructor(rawlabel: string, description: string) {
        this.rawlabel = rawlabel;
        this.description = description;
        this.inited = false;
    }
}