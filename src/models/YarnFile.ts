export class YarnFile 
{
	private filePath: string | null;
	private fileName: string;
	private contents: string;
	private contentsOnDisk: string;
	private uniqueIdentifier: number;

	constructor(filePath: string | null, contents: string | null, name: string | null, uniqueIdentifier: number) 
	{
	    this.filePath = filePath ? filePath : null;
	    this.fileName = name ? name : "New File";
	    this.contents = contents ? contents : "";
	    this.contentsOnDisk = contents ? contents : "";
	    this.uniqueIdentifier = uniqueIdentifier;
	}

	//Getters
	getPath(): string | null 
	{
	    return this.filePath;
	}

	getName(): string 
	{
	    return this.fileName;
	}

	getContents(): string 
	{
	    return this.contents;
	}

	getSaved(): boolean 
	{
	    return this.getContents() === this.contentsOnDisk;
	}

	getUniqueIdentifier(): number 
	{
	    return this.uniqueIdentifier;
	}

	//Setters
	setFilePath(filePath: string): void 
	{
	    this.filePath = filePath;
	}

	setName(name: string): void 
	{
	    this.fileName = name;
	}

	setContents(contents: string): void 
	{
	    this.contents = contents;
	}

	//Functions
	fileSaved(): void 
	{
	    this.contentsOnDisk = this.contents;
	}

}