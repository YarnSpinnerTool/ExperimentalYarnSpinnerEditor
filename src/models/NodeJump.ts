export class NodeJump 
{
    private sourceId: number;
    private targetId: number;
    private drawn = false;
    private isValidJump = false;

    constructor(sourceId: number, targetId: number) 
    {
        this.sourceId = sourceId;
        this.targetId = targetId;
    }

    getSource(): number 
    {
        return this.sourceId;
    }

    getTarget(): number 
    {
        return this.targetId;
    }

    setSource(source: number): void 
    {
        this.sourceId = source;
    }

    setTarget(target: number): void 
    {
        this.targetId = target;
    }

    drawJump(): void 
    {
        this.drawn = true;
    }

    removeDrawnJump(): void 
    {
        this.drawn = false;
    }

    isDrawn(): boolean 
    {
        return this.drawn;
    }

    validateJump(): void 
    {
        this.isValidJump = true;
    }

    invalidateJump(): void 
    {
        this.isValidJump = false;
    }

    //TODO make into some sane function rather than a shallow return
    isValidJumpCheck(): boolean 
    {
        return this.isValidJump;
    }

    //TODO remainder of functions that this may need

}