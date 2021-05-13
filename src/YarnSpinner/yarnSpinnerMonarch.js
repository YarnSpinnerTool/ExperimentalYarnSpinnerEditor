/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
		strings
		keywords
		variables
		numbers
		operators
		>> pop
	options
		text
		interpolation
		commands
		3
	dialogue
		commands
		escaping
		interpolation
*/
export const tokensWIP = 
{
    defaultToken: "dialogue",
    tokenPostfix: ".yarn",

    keywords: ["as","true","false"],
    typeKeywords: [ "Boolean", "String", "Number"],
    commands: ["jump","stop","declare","set","if", "else", "elseif","endif"],
    operators: 
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
        file: 
        [
            //file tags, comments
            [ /\#.*$/, "file.tag" ],
            { include: 'comments' },
            { include: 'whitespace'},
            { regex: /.*:.*/, action: { token: 'file.delimiter', next: '@header' } }
        ],
        header: 
        [
            //header tags, comments
            [ /.*:.*/, 'header.tag' ],
            { include: 'comments' },
            { include: 'whitespace'},


            //When encountering the header delimiter, move to the body state
            { regex: /---/, action: { token: 'header.delimiter', next: '@body' } }
        ],
        body: 
        [
            //dialogue, commands, options, hashtags
            { include: 'comments' },
            { include: 'whitespace'},
            //Dialogue is the default token
                //Needs to account for BB code
                //Needs to account for interpolation
            //[/<<.*>>/,'body.commands'],
            //Commands can be either generic, or @commands
                //They begin and end with << >>
                //Needs to account for interpolation
            { regex: /{/, action: { token: 'interpolation', next: '@interpolation' } },
            { regex: /"/, action: { token: 'string', next: '@strings'} },
            { regex: /->/, action: { token: 'options', next: '@options'} },
            { regex: /<</, action: { token: 'commands', next: '@commands'} },
            //When encountering the body delimiter, move to the file state.
            [/\[b\].*\[\\b\]/,"body.bold"],
            [/\[i\].*\[\\i\]/,"body.italic"],
            [/\[u\].*\[\\u\]/,"body.underline"],
            { regex: /===/, action: { token: 'body.delimiter', next: '@popall' } }
        ], 
        strings:
        [
            [/[^\"]+/, "string"],
            [/"/, "string", "@pop"]
        ],
        dialogue:
        [

        ],
        commands:
        [
            { regex: /{/, action: { token: 'interpolation', next: '@interpolation' } },
            { regex: /"/, action: { token: 'string', next: '@strings'} },
            [/.+?(?={)/, 'commands'],   //Interpolation
            [/.+?(?=")/, 'commands'],   //Strings
            { regex: /.*?>>$/, action: {token: 'commands', next: '@pop'} }
        ],
        options:
        [
            { regex: /{/, action: { token: 'interpolation', next: '@interpolation' } },
            { regex: /<</, action: { token: 'commands', next: '@commands'} },
            //[/<<.*>>/,'body.commands'],

            [/.+?(?={)/, 'options'], //Interpolation
            [/.+?(?=<<)/, 'options'], //Commands
            // [/^(.*?)<</, 'options'],
            
            { regex: /.*$/, action: {token: 'options', next: '@pop'}}
        ],
        interpolation:
        [
            [/[a-z_$][\w$]*/, 'interpolation'],
            [/[A-Z][\w\$]*/, 'interpolation'],
            { regex: /}/, action: { token: 'interpolation', next: '@pop' } }
        ],
        comments:
        [
            [/\/\/.*$/, "comment"]
        ],
        whitespace:
        [
            [/[ \t\r\n]+/, ""]
        ]
    }
};

export const config = {

    // Default typescript iLanguageDefinition
    // Set defaultToken to invalid to see what you do not tokenize yet
    defaultToken: "invalid",
    wordPattern: /(-?\d*\.\d\w*)|([^`~!@#%^&*()\-=+[{\]}\\|;:'",.<>/?\s]+)/g,

    comments: {
        lineComment: "//"
    },

    brackets: [
        ['<', '>'],
        ["[", "]"],
        ["(", ")"]
    ],

    onEnterRules: [

    ],

    autoClosingPairs: [
        //Command
        { open: '<', close: '>' },
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
        { token: 'options', foreground : '6A008A'}
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