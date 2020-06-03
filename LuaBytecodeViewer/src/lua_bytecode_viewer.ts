import * as vscode from 'vscode';
const cp = require('child_process');

export class LuaBytecodeViewer {
    optionLoaded: boolean = false;

    constructor() {}

    GetLuaPath(): string {
        let luaDirSetting = vscode.workspace.getConfiguration().get("luabytecodeviewer.luaDir");
        let luaDir = <string>luaDirSetting;
        if (!luaDir || luaDir === "") {
            return "luac";
        }
        // translate 
        let path = luaDir.replace(/\\/gi, "\\\\");
        // remove last '/'
        if (path.endsWith("/") || path.endsWith("\\")) {
            path = path.substr(0, path.length - 1);
        }
        path = path + "/luac";
        path = "\"" + path + "\"";
        return path;
    }
    
    async Run(str: string): Promise<string> {
        let luaPath = this.GetLuaPath();
        let luaCode = str.replace(/\n/gi, " ");
        let cmd = "echo " + luaCode + " | " + luaPath + " -l -p -";
        // console.log("cmd: " + cmd);
        let promise = new Promise<string>((resolve, reject)=>{
            cp.exec(cmd, async (err: string, stdout: string, stderr: string) => {
                // console.log('stdout: ' + stdout);
                // console.log('stderr: ' + stderr);
                // console.log('error: ' + err);
                if (err) {
                    return resolve("Error: \n" + stderr);
                } else {
                    return resolve(stdout);
                }
            });
        });
        return promise;
    }
}