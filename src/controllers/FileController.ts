import * as path from "path";

export interface File
{
    filePath?: string;
    fileName?: string;
    contents: string;
    isSaved?: boolean;
    getName(): string;
    getSaved(): boolean;
}

export class FileClass implements File
{
    filePath?: string;
    fileName?: string;
    contents: string;
    isSaved?: boolean;
	
    constructor(filePath?: string, contents?:string, name?: string, isSaved?: boolean)
    {
        this.filePath = filePath;
        this.fileName = name;
        this.contents = contents ? contents : "";
        this.isSaved = isSaved;
    }

    getName():string
    {
        if(this.filePath != undefined)
        {
            return path.basename(this.filePath);
        }
        else return "failure";
    }
	
    getContents():string
    {
        return this.contents;
    }

    getSaved():boolean
    {
        if(this.isSaved != undefined)
        {
            return this.isSaved;
        }
        else
        {
            alert("Failed to get saved.  Does file not exist?");
            return false;
        }
    }
}