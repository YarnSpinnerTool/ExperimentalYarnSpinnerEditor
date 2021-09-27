// const template = {
//     default: "",
//     invertDefault: "",

//     commands: "",
//     commandsInternal: "",
//     varAndNum: "",
//     options: "",

//     interpolation: "",
//     strings: "", 
//     metadata: "",
//     comments: "",

//     editor: "",
//     editorMinimap: "",
//     workingFile: "",
//     tabGap: ""
// };

//File to handle the list of variables

export class ThemeReader 
{

    constructor()
    {
        console.log("Theme reader loaded");
    }

    returnThemeOnStringName(name: string) : Record<string,string>
    {
        switch (name)
        {
        case "OGBlue":
            return this.OGBlue;
            break;
        case "Pink":
            return this.Pink;
        case "Night":
            return this.Night;
        case "Wireframe":
            return this.WireFrame;
        default:
            return null;
        }
    }


    //Original blue theme //! TODO
    OGBlue = {
        default: "#000000",
        invertDefault: "#FFFFFF",

        commands: "#5C7AFF",
        commandsInternal: "#27187E",
        varAndNum: "#D81159",
        options: "#A42CD6",

        interpolation: "#EE964B",
        strings: "#DB2B39",
        metadata: "#57737A",
        comments: "#2BA84A",

        editor: "#CFD8DC",
        editorMinimap: "#d7dcde",
        workingFile: "#d5dee2",
        tabGap: "#546E7A",
        selectedFileBg: "#b6d1db",
    };

    //Pink theme //TODO
    Pink = {
        default: "#000000",
        invertDefault: "#FFFFFF",

        commands: "#259DA6",
        commandsInternal: "#639EAC",
        varAndNum: "#9F7E65",
        options: "#8D6A79",

        interpolation: "#686877",
        strings: "#5f9a3f",
        metadata: "#35292B",
        comments: "#9E7660",

        editor: "#f7c2c2",
        editorMinimap: "#f5cece",
        workingFile: "#fce5e5",
        tabGap: "#ff7474"
    };
    /**/

    //Night theme //TODO
    Night = {
        default: "#FFFFFF",
        invertDefault: "#000000",

        commands: "#b1c0ff",
        commandsInternal: "#9ebbd5",
        varAndNum: "#c0a9d7",
        options: "#A199A9",

        interpolation: "#BFA37C",
        strings: "#acd6d3",
        metadata: "#bebc95",
        comments: "#78b687",

        editor: "#797979",
        editorMinimap: "#919191",
        workingFile: "#D7D7D7",
        tabGap: "#5C5C5C"
    };
    /**/

    //Wireframe theme //TODO
    WireFrame = {
        default: "#000000",
        invertDefault: "#FFFFFF",

        commands: "#111111",
        commandsInternal: "#222222",
        varAndNum: "#333333",
        options: "#444444",

        interpolation: "#555555",
        strings: "#666666",
        metadata: "#777777",
        comments: "#888888",

        editor: "#FFFFFF",
        editorMinimap: "#999999",
        workingFile: "#555555",
        tabGap: "#999999"
    };
    /**/

    /**
     * getRandomInt
     * @param {number} max Randoms in range of 0 to Max
     * 
     * @returns {void}
     */
    getRandomInt(max: number) : number
    {
        return Math.floor(Math.random() * max);
    }

    randomTheme(): Record<string, string> 
    {
        switch (this.getRandomInt(4)) 
        {
        case 0:
            return this.OGBlue;
            break;
        case 1:
            return this.Pink;
            break;
        case 2:
            return this.Night;
            break;
        default:
            return this.WireFrame;
        }
    }
}

// return OGBlue;
// return Pink;
// return Night;
// return WireFrame;
