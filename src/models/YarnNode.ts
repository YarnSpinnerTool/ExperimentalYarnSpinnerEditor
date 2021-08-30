export class YarnNode 
{

    private title: string;
    private lineTitle: number;//Holds the line that the title of the node resides on
    private lineStart: number;//Holds the dialogue start ---
    private lineEnd: number;//Holds the end '==='
    private metadata: Map<string, string>;//first string is metadata name, second is metadata content
    private uniqueIdentifier: number;

    constructor(uniqueIdentifier: number, title: string, lineTitle: number, lineStart?: number, lineEnd?: number, metadata?: Map<string, string>) 
    {
        this.uniqueIdentifier = uniqueIdentifier;
        this.title = title;
        this.lineTitle = lineTitle;
        this.lineStart = -1;
        this.lineEnd = -1;
        this.metadata = new Map<string, string>();

        if (lineStart) 
        {
            this.lineStart = lineStart;
        }

        if (lineEnd) 
        {
            this.lineEnd = lineEnd;
        }

        if (metadata) 
        {
            this.metadata = metadata;
        }
    }

    getTitle(): string 
    {
        return this.title;
    }

    getLineTitle(): number 
    {
        return this.lineTitle;
    }

    getLineStart(): number 
    {
        return this.lineStart;
    }

    getLineEnd(): number 
    {
        return this.lineEnd;
    }

    getUniqueIdentifier(): number 
    {
        return this.uniqueIdentifier;
    }
	
    getMetaData() : Map<string, string> 
    {
        return this.metadata;
    }

    setTitle(title: string): void 
    {
        this.title = title;
    }

    setLineTitle(lineTitle: number): void 
    {
        this.lineTitle = lineTitle;
    }

    setLineStart(lineStart: number): void 
    {
        this.lineStart = lineStart;
    }

    setLineEnd(lineEnd: number): void 
    {
        this.lineEnd = lineEnd;
    }
	
    setMetadata(metadata: Map<string, string>) : void 
    {
        this.metadata = metadata;
    }


}