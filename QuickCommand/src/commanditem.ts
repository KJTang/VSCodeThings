import * as vscode from 'vscode';

export class CommandItem implements vscode.QuickPickItem {
    label: string = "";
    rawlabel: string;
    icon: string = "";
    inited: boolean = false;
    description: string = "";
    command: string = "";

    constructor(rawlabel: string, description: string) {
        this.rawlabel = rawlabel;
        this.description = description;
        this.inited = false;
    }
}