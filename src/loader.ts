
var result = fs.readFileSync(path.join(__dirname, "Test.txt"))
class Loader
{
    // var loader = new Loader();
    
    private fs = require('graceful-fs');
    //private path = require('path');
    constructor() {}
    

    /* 
    / Generates a file buffer file path.
    /
    / Usage
    / loader.returnContents();
   */
    getContents() {
        var result = this.fs.readFileSync(path.join(__dirname, "Test.txt"));
        console.log("Read file contents");
        return result;

        //TODO: Error checking, path field
    }

    createFile() {
        //TODO
    }
    
}