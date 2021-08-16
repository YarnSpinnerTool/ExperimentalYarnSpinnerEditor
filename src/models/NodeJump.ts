export class NodeJump {
    private sourceTitle: string;
    private targetTitle: string;
    private drawn = false;
    private isValidJump = false;

    constructor(sourceTitle: string, targetTitle: string) {
        this.sourceTitle = sourceTitle.trim();
        this.targetTitle = targetTitle.trim();
    }

    getSource(): string {
        return this.sourceTitle;
    }

    getTarget(): string {
        return this.targetTitle;
    }

    setSource(source: string): void {
        this.sourceTitle = source;
    }

    setTarget(target: string): void {
        this.targetTitle = target;
    }

    drawJump(): void {
        this.drawn = true;
    }

    removeDrawnJump(): void {
        this.drawn = false;
    }

    isDrawn(): boolean {
        return this.drawn;
    }

    validateJump(): void {
        this.isValidJump = true;
    }

    invalidateJump(): void {
        this.isValidJump = false;
    }

    //TODO make into some sane function rather than a shallow return
    isValidJumpCheck(): boolean {
        return this.isValidJump;
    }

    //TODO remainder of functions that this may need

}