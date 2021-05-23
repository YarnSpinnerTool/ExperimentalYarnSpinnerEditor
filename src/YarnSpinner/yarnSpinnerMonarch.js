/*
 *---------------------------------------------------------------------------------------------
 *  Copyright (c) Yarn Spinner Editor Team. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *---------------------------------------------------------------------------------------------
 */

/* Currently unable to import .ts file into renderer, likely a webpack issue. https://webpack.js.org/guides/typescript/
 * Monaco Custom Language Documentation: https://microsoft.github.io/monaco-editor/playground.html#extending-language-services-custom-languages
 * Yarn Spinner Documentation: https://yarnspinner.dev/docs/syntax/
 * JS RegExp Documentation: https://www.w3schools.com/jsref/jsref_obj_regexp.asp
 * Typescript TokensProvider: https://github.com/microsoft/monaco-languages/blob/main/src/typescript/typescript.ts
 */
import * as monaco from 'monaco-editor';

/*
file

header

body
	commands
x		strings
x		keywords
x		variables
x		numbers 
x		operators
		>> pop
	options
x		text
x		interpolation
x		commands
		3
	dialogue
x		commands
x		interpolation
*/

//Exports configuration monaco/monarch tokenisation for Yarn Spinner
export const tokensWIP = 
{
    defaultToken: "invalid",
    tokenPostfix: ".yarn",
    includeLF: true, //Adds \n to end of each line

    //From section identifiers in the yarn spec.
    //A-Z, a-z, _, followed by an optional period, and then an optional second string of A-Z, a-z, _. '$' are not allowed
    yarnIdentifier: /[A-Za-z_]+[\.]*[A-Za-z_]*/,
  
    yarnFloat: /-?[\d]+\.[\d]+/,
    yarnInteger: /-?\d+/,
    yarnOperator: /(is|==|!=|<=|>=|>(?!>)|<|or|\|\||xor|\^|!|and|&&|\+|-|\*|\/|%)/,
    dialogueSymbols: /[!@#%^&*\()\{}\\\|<>?/~`]/,

    yarnKeywords: ["as","true","false"],
    yarnTypeKeywords: [ "Boolean", "String", "Number"],
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
            //File tags, comments
            [ /\#.*\n/, "file.tag" ],
            { include: 'comments' },
            { include: 'whitespace'},

            //Per Yarn Spec: Title's tag text must follow identifier rules, and other header tags' names must follow identifier rules.
            [ /Title:\s?@yarnIdentifier/, 'title.tag'],
            [ /@yarnIdentifier:.*\n/, 'header.tag' ],
            
            //Move to body once encountering the ---
            { regex: /^---\n/, action: { token: 'header.delimiter', next: '@body' } }
        ],
        body: 
        [
            { include: 'comments' },
            { include: 'whitespace'},
            
            //Interpolation
            { regex: /{/, action: { token: 'interpolation', next: '@interpolation' } },
            //Strings
            { regex: /"/, action: { token: 'string', next: '@strings'} },
            //Options
            { regex: /->/, action: { token: 'options', next: '@options'} },
            //Commands
            { regex: /<</, action: { token: 'commands', next: '@commands'} },
            //Variables
            { regex: /\$/, action: { token: 'variables', next: '@variables'} },
            //Hashtags - TODO move to dialogue
            { regex: /\#/, action: {token: 'hashtag', next: '@hashtags'} },

            
            //When encountering the body delimiter, move to the file state.
            [/\[b\].*\[\\b\]/,"body.bold"],
            [/\[i\].*\[\\i\]/,"body.italic"],
            [/\[u\].*\[\\u\]/,"body.underline"],
            
            //numbers, uncoloured in dialogue
            [/@yarnFloat/,"float"],
            [/@yarnInteger/,"number"],
            [/@dialogueSymbols/,"symbol"],
            //[/@yarnOperator/, "operator"],//Does operator belong in body / dialogue?
            
            //End of node
            { regex: /^===\n/, action: { token: 'body.delimiter', next: '@popall' } }
        ], 
        strings:
        [
            [/[^\"]+/, "string"],
            [/"/, "string", "@pop"]
        ],
        commands:
        [
            //Embedded Interpolation, Strings, & Variables.
            { regex: /{/, action: { token: 'interpolation', next: '@interpolation' } },
            { regex: /"/, action: { token: 'string', next: '@strings'} },
            { regex: /\$/, action: { token: 'variables', next: '@variables'} },
            
            //Numbers, coloured dark pink in commands.
            [/@yarnFloat/,"commands.float"],
            [/@yarnInteger/,"commands.number"],
            [/@yarnOperator/, "commands.operator"],

            
            //Words, can be specified commands, keywords, or types. (Dark pink)
            [/[A-Za-z_$][\w$]*/, { 
                cases: 
                {
                "@yarnCommands": "yarn.commands",
                "@yarnKeywords": "yarn.commands",
                "@yarnTypeKeywords": "yarn.commands",
                "@default": "commands"
                }
            }
        ],
            //Pop when reaching close >> bracket.
            { regex: />>/, action: {token: "commands", next: "@pop"} }
        ],

        options:
        [
            //Embedded interpolation, strings, commands, variables.
            { regex: /{/, action: { token: 'interpolation', next: '@interpolation' } },
            { regex: /<</, action: { token: 'commands', next: '@commands'} },
            { regex: /"/, action: { token: 'string', next: '@strings'} },
            { regex: /\$/, action: { token: 'variables', next: '@variables'} },

            //Any text
            [/[A-Za-z_$][\w$]*/, "dialogue"],
            [/@yarnFloat/,"dialogue"],
            [/@yarnInteger/,"dialogue"],
            [/@dialogueSymbols/, "dialogue"],
            
            //Pop at new line character.
            { regex: /\n/, action: {token: 'dialogue', next: '@pop'}}
        ],

        interpolation:
        [
            //Embedded variables.
            { regex: /\$/, action: { token: 'variables', next: '@variables'} },
            
            //Any text
            [/[A-Za-z][\w$]*/, "interpolation"],
            [/@yarnFloat/,"options"],
            [/@yarnInteger/,"options"],
            [/@dialogueSymbols/, "options"],

            //Pop
            { regex: /}/, action: { token: "interpolation", next: "@pop" } }
        ],
        comments:
        [
            [/\/\/.*\n/, "comment"]
        ],
        whitespace:
        [
            [/[ \t\r\n]+/, ""]
        ],
        variables:
        [
            //Variables can only be one word, so they pop at the end.
            { regex: /@yarnIdentifier/, action: { token: "variables", next: "@pop" } },
            { regex: / /, action: { token: "variables", next: "@pop" } }
        ],
        hashtags:
        [
            { include: 'comments' },//include the rules for comments

            //Any text that's not newline character
            [/[^\n]/, "hashtag"],
            { regex: /\n/, action: {token: 'hashtag', next: '@pop'}}
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
    provideCompletionItems: () => {
        var suggestions = [{
            label: 'jump',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<<jump $1>>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        }, {
            label: 'stop',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<<stop>>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        }, {
            label: 'set',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<<set \$$1 to $2>>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        }, {
            label: 'declare',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<<declare \$$1 = $2>>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        }, {
            label: 'declare-explicit',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: '<<declare \$$1 = $2 as $3>>',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        }, {
            label: 'if-endif',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
                '<<if $1>>',
                '\t$0',
                '<<endif>>'
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        }, {
            label: 'elseif',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
                '<<elseif $1>>',
                '\t$0',
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        }, {
            label: 'else',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
                '<<else>>',
                '\t$0',
            ].join('\n'),
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        }, {
            label: 'New node',
            filterText: 'Title',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: [
                'Title: $1',
                '---',
                '$0',
                '==='
            ].join('\n'),
            documentation: 'Create new node',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        }];
        return { suggestions: suggestions };
    }
};