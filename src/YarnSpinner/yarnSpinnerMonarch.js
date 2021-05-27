/*
 *---------------------------------------------------------------------------------------------
 *  Copyright (c) Yarn Spinner Editor Team. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *---------------------------------------------------------------------------------------------
 */

/* Currently unable to import .ts file into renderer, likely a webpack issue. https://webpack.js.org/guides/typescript/
 * Monaco Custom Language Documentation: https://microsoft.github.io/monaco-editor/playground.html#extending-language-services-custom-languages
 * JS RegExp Documentation: https://www.w3schools.com/jsref/jsref_obj_regexp.asp
 * Typescript TokensProvider: https://github.com/microsoft/monaco-languages/blob/main/src/typescript/typescript.ts
 */
import * as monaco from 'monaco-editor';
//Exports configuration monaco/monarch tokenisation for Yarn Spinner
export const tokensWIP = 
{
    defaultToken: "Invalid",
    tokenPostfix: ".yarn",
    includeLF: true, //Adds \n to end of each line

    //From section identifiers in the yarn spec.
    //A-Z, a-z, _, followed by an optional period, and then an optional second string of A-Z, a-z, _. '$' are not allowed
    yarnIdentifier: /[A-Za-z0-9_]+[\.]*[A-Za-z0-9_]*/,
  
    yarnFloat: /-?[\d]+\.[\d]+/,
    yarnInteger: /-?\d+/,
    yarnOperator: /(is|==|!=|<=|>=|>(?!>)|<|or|\|\||xor|\^|!|and|&&|\+|-|\*|\/|%|=)/,
    dialogueSymbols: /[:!@%^&*\()\\\|<>?/~`,]/,

    yarnKeywords: ["as","true","false"],
    yarnTypeKeywords: [ "Bool", "String", "Number"],
    yarnCommands: ["jump","stop","declare","set","if", "else", "elseif","endif"],
    yarnOperators: 
    [
        //Equality
        "is", "==",
        //Inequality 
        "!=",
        //Greater than
        ">",
        //Less than
        "<",
        //Less than or equal to
        "<=",
        //Greater than or equal to
        ">=",
        //Boolean OR
        "or", "||",
        //Boolean XOR
        "xor", "^",
        //Boolean negation
        "!",
        //Boolean AND
        "and", "&&",
        //Mathematical Operators
        "+", "-", "*", "/", "%"
    ],

    tokenizer: 
    {    
        fileheader: 
        [
            //File tags
            [ /\#.*\n/, "Metadata" ],

            { include: "comments" },
            { include: "whitespace"},

            //Per Yarn Spec: Title's tag text must follow identifier rules, and other header tags' names must follow identifier rules.
            [ /Title:\s?@yarnIdentifier/, "Default"],
            
            //Header Tags
            [ /@yarnIdentifier:.*\n/, "Metadata" ],
            
            //Header Delimiter
            //Move to body once encountering the ---
            { regex: /---\n/, action: { token: "Default", next: "@body" } }
        ],
        body: 
        [
            { include: "comments" },
            { include: "whitespace"},
            
            [/\\./, "Default"],
            //Interpolation
            { regex: /{/, action: { token: "Interpolation", next: "@interpolation" } },
            //Strings
            { regex: /"/, action: { token: "Strings", next: "@strings"} },
            //Options
            { regex: /->/, action: { token: "Options", next: "@options"} },
            //Commands
            { regex: /<</, action: { token: "Commands", next: "@commands"} },
            //Hashtags
            { regex: /\#/, action: {token: "Metadata", next: "@hashtags"} },

            
            //When encountering the body delimiter, move to the file state.
            //[/\[b\].*\[\\b\] /,"body.bold"],
            [/\[b\].*?\[\\b\]/, "body.bold"],
            [/\[i\].*?\[\\i\]/, "body.italic"],
            [/\[u\].*?\[\\u\]/, "body.underline"],

            /*
                So had to make it non greedy, as if there was a single like with [b]BOLD[/b] notBold [b]BOLD[/b], it would be all be BOLD
                This was due to the greedy .* (match any character, as many times as you can before closing bracket)
                whilst adding ? to the greedy character, it makes it less greedy (or lazy depending on how you look at it)
                Because of this, it is going to match the MINIMUM amount of characters needed to complete the match
                    i.e., until the first closing bracket it finds, not the final one it can match
            */

            //Words
            [/[A-Za-z_$][\w$]*/, "Default"],
            //Floats
            [/@yarnFloat/,"Default"],
            //Integer
            [/@yarnInteger/,"Default"],
            //Symbols
            [/@dialogueSymbols/,"Default"],
            //[/@yarnOperator/, "operator"],//Does operator belong in body / dialogue?
            
            //Body Delimiter
            //End of node
            { regex: /^===\n/, action: { token: "Default", next: "@popall" } }
        ], 
        strings:
        [
            [/[^\"]+/, "Strings"],
            [/"/, "Strings", "@pop"]
        ],
        commands:
        [
            //Embedded Interpolation, Strings, & Variables.
            { regex: /{/, action: { token: "Interpolation", next: "@interpolation" } },
            { regex: /"/, action: { token: "Strings", next: "@strings"} },
            { regex: /\$/, action: { token: "VarAndNum", next: "@variables"} },
            { include: "whitespace"},
            //Numbers, coloured dark pink in commands.
            [/@yarnFloat/,"VarAndNum"],
            [/@yarnInteger/,"VarAndNum"],
            //Operators
            [/@yarnOperator/, "CommandsInternals"],

            //Words, can be specified commands, keywords, or types. (Dark pink)
            [/[A-Za-z_$][\w$]*/, { 
                cases: 
                {
                "@yarnCommands": "CommandsInternals",
                "@yarnKeywords": "CommandsInternals",
                "@yarnTypeKeywords": "CommandsInternals",
                "@default": "Commands"
                }
            }
        ],
            //Pop when reaching close >> bracket.
            { regex: />>/, action: {token: "Commands", next: "@pop"} }
        ],

        options:
        [
            //Interpolation
            { regex: /{/, action: { token: "Interpolation", next: "@interpolation" } },
            //Commands
            { regex: /<</, action: { token: "Commands", next: "@commands" } },
            //Strings
            { regex: /"/, action: { token: "Strings" , next: "@strings"} },
            //Hashtags
            { regex: /\#/, action: {token: "Metadata", next: "@hashtags"} },
            
            [/[ \t\r]+/, ""],

            //Any text
            [/[A-Za-z_$][\w$]*/, "Default"],
            //Numbers
            [/@yarnFloat/,"Default"],
            [/@yarnInteger/,"Default"],
            //Symbols
            [/@dialogueSymbols/, "Default"],
            
            //Pop at new line character.
            { regex: /\n/, action: {token: "Default", next: "@pop"}}
        ],

        interpolation:
        [
            //Embedded variables.
            { regex: /\$/, action: { token: "VarAndNum", next: "@variables"} },
            { include: "whitespace"},
            //Any text
            [/[A-Za-z][\w$]*/, "Interpolation"],
            [/@yarnFloat/,"Interpolation"],
            [/@yarnInteger/,"Interpolation"],
            [/@dialogueSymbols/, "Interpolation"],

            //Pop
            { regex: /}/, action: { token: "Interpolation", next: "@pop" } }
        ],
        comments:
        [
            [/\/\/.*\n/, "Comments"]
        ],
        whitespace:
        [
            [/[ \t\r\n]+/, ""]
        ],
        variables:
        [
            //Variables can only be one word, so they pop at the end.
            { regex: /@yarnIdentifier/, action: { token: "VarAndNum", next: "@pop" } },
            { regex: / /, action: { token: "VarAndNum", next: "@pop" } }
        ],
        hashtags:
        [
            { include: 'comments' },//include the rules for comments
            [/[ \t\r]+/, ""],
            //Any text that's not newline character
            [/[A-Za-z][\w$]*/, "Metadata"],
            [/@yarnFloat/,"Metadata"],
            [/@yarnInteger/,"Metadata"],
            [/@dialogueSymbols/, "Metadata"],
            
            { regex: /\n/, action: {token: "Metadata", next: "@pop"}}
        ]

    }
};

export const config = {

    // Default typescript iLanguageDefinition
    // Set defaultToken to invalid to see what you do not tokenize yet
    wordPattern: /(-?\d*\.\d\w*)|([^`~!@#%^&*()\-=+[{\]}\\|;:'",.<>/?\s]+)/g,

    comments: {
        lineComment: "//"
    },

    brackets: [
        ['<<', '>>'], // Command brackets
        ["[", "]"], 
        ["(", ")"]
    ],

    onEnterRules: [

    ],

    autoClosingPairs: [
        //Command
        { open: '<<', close: '>>' },
        //Interpolation
        { open: '{', close: '}' },
        //Mathematical 
        { open: '(', close: ')' },
    ],

    folding: {
        markers: {
            start: new RegExp('^---'),
            end: new RegExp('^===')
        }
    }
};

export const theme = {
    base: 'vs',
    inherit: true,

    rules: [
        { background: 'CFD8DC'},
        { token: 'body.bold', fontStyle: 'bold' },
        { token: 'body.underline', fontStyle: 'underline' },
        { token: 'body.italic', fontStyle: 'italic' },
        { token: 'body.commands', foreground : 'FF00FF' },
        { token: 'commands', foreground : 'FF00AA' },
        { token: 'file.tag', foreground : '719C70' },
        { token: 'interpolation', foreground : 'CC8400' },
        { token: 'options', foreground : 'AD00C4'},
        { token: 'variables', foreground : '347F36'},
        { token: 'float', foreground : '063B0E'},
        { token: 'number', foreground : '063B0E'},
        { token: 'yarn.commands', foreground : 'A30A70'},
        { token: 'commands.float', foreground : 'A30A70'},
        { token: 'commands.number', foreground : 'A30A70'},
        { token: 'commands.operator', foreground: 'AAAFFF'},
        { token: 'hashtag', foreground: '#AAAAAA'}
        ],

    colors: {
        'editor.foreground': '#000000',
        'editor.background': '#CFD8DC',
        'editorCursor.foreground': '#8B0000',
        'editor.lineHighlightBackground': '#0000FF20',
        'editorLineNumber.foreground': '#008800',
        'editor.selectionBackground': '#88000030',
        'editor.inactiveSelectionBackground': '#88000015'
    }
};

export const completions = {
    provideCompletionItems: (model, position, context, token) => {
        var suggestions = [{
            label: 'jump',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: '<<jump $1>>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        }, {
            label: 'stop',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: '<<stop>>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        }, {
            label: 'set',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: '<<set \$$1 to $2>>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        }, {
            label: 'declare',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: '<<declare \$$1 = $2>>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        }, {
            label: 'declare-explicit',
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: '<<declare \$$1 = $2 as $3>>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        }, {
            label: 'if-endif',
            kind: monaco.languages.CompletionItemKind.Interface,
            insertText: [
                '<<if $1>>',
                '\t$0',
                '<<endif>>'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        }, {
            label: 'elseif',
            kind: monaco.languages.CompletionItemKind.Interface,
            insertText: [
                '<<elseif $1>>',
                '\t$0',
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        }, {
            label: 'else',
            kind: monaco.languages.CompletionItemKind.Interface,
            insertText: [
                '<<else>>',
                '\t$0',
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        }, {
            label: 'New node',
            filterText: 'Title',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: [
                'Title: $1',
                '---',
                '$0',
                '==='
            ].join('\n'),
            documentation: 'Create new node',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        }];
        
        //Get all of the text in the editor
        var text = model.getValueInRange({startLineNumber: 1, startColumn: 1, endLineNumber: position.lineNumber, endColumn: position.column});
        //Regex for both titles and variables, global tag is used.
        var nodesRegex = /Title:\s?[A-Za-z0-9_]+[\.]*[A-Za-z0-9_]*/g;
        var variablesRegex = /\$[A-Za-z0-9_]+[\.]*[A-Za-z0-9_]*/g;
        
        // * FOR FINDING NODE TITLES
        var nodesArr = text.match(nodesRegex);
        var nodes = new Set(nodesArr);
        if(nodes)
        {
            //Iterate through the array of titles that match.
            for(let i of nodes){ 
                var word = i;
                //Remove the "Title:"
                word = word.replace("Title:","");
                //Remove any spaces, for example "Title: nodeName"
                //Can't use replace("Title: ","") as Title:nodeName is valid afaik.
                word = word.replace(" ","");
                //Add the word to the completion items.
                suggestions.push(
                    {label: word, 
                    kind: monaco.languages.CompletionItemKind.Class,
                    insertText: word
                    }
                    );
            } 
        }

        // * FOR FINDING VARIABLES
        
        var variablesArr = text.match(variablesRegex)
        var variables = new Set(variablesArr);

        if(variables){
            //Iterate through the array of titles that match.
            for(let i of variables){
                //Add the word to the completion items.
                var word = i;
                suggestions.push(
                    {
                    label: word, 
                    kind: monaco.languages.CompletionItemKind.Property,
                    insertText: word,
                    }
                    );
            }
        }
        return { suggestions: suggestions };
    }
};