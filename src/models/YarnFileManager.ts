import { YarnFile } from "./YarnFile";
export class YarnFileManager 
{
	private openFiles = new Map<number, YarnFile>(); //Number is the representation of the uniqueIdentifier
	private currentOpenYarnFile: YarnFile;

	constructor() 
	{
	    this.currentOpenYarnFile = this.createEmptyFile();
	}

	//Getters 
	getFiles(): Map<number, YarnFile> 
	{
	    return this.openFiles;
	}

	getCurrentOpenFile(): YarnFile 
	{
	    return this.currentOpenYarnFile;
	}

	getYarnFile(yarnIDNumber: number): YarnFile | undefined 
	{
	    return this.openFiles.get(yarnIDNumber);
	}

	//Setters
	setCurrentOpenYarnFile(yarnIDNumber: number): void 
	{
	    const newCurrent = this.openFiles.get(yarnIDNumber);
	    if (newCurrent) 
	    {
	        this.currentOpenYarnFile = newCurrent;
	    }
	}

	//Functions
	addToFiles(newFile: YarnFile): void 
	{
	    this.openFiles.set(newFile.getUniqueIdentifier(), newFile);
	}

	removeFromFiles(yarnIDNumber: number): void 
	{
	    this.openFiles.delete(yarnIDNumber);
	}

	createEmptyFile(): YarnFile 
	{
	    const newFile: YarnFile = new YarnFile(null, null, null, Date.now());
	    this.addToFiles(newFile);
	    this.setCurrentOpenYarnFile(newFile.getUniqueIdentifier());

	    return newFile;
	}
}