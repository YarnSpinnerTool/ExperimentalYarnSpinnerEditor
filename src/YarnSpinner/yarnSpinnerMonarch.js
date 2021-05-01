/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
/* Currently unable to import .ts file into renderer, likely a webpack issue. https://webpack.js.org/guides/typescript/
 * Monaco Custom Language Documentation: https://microsoft.github.io/monaco-editor/playground.html#extending-language-services-custom-languages
 * Yarn Spinner Documentation: https://yarnspinner.dev/docs/syntax/
 * JS RegExp Documentation: https://www.w3schools.com/jsref/jsref_obj_regexp.asp
 */
import { languages } from "monaco-editor";

export const yarnSpinnerTokensProvider = {
    // Set defaultToken to invalid to see what you do not tokenize yet
    defaultToken: "invalid",
    tokenPostfix: ".ts",

    keywords: [
        //Commands
        "jump","stop","declare","set",
        //Flow Control
        "if", "else", "elseif","endif",
        //Explicit Typing
        "as",
        //Miscellaneous
        "Title:","true","false", "->"
    ],

    typeKeywords: [
        "boolean", "string", "number"
    ],

    operators: [
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

    // we include these common regular expressions
    symbols: /[=><!~?:&|+\-*/^%]+/,
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
    digits: /\d+(_+\d+)*/,
    octaldigits: /[0-7]+(_+[0-7]+)*/,
    binarydigits: /[0-1]+(_+[0-1]+)*/,
    hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,

    regexpctl: /[(){}[\]$^|\-*+?.]/,
    regexpesc: /\\(?:[bBdDfnrstvwWn0\\/]|@regexpctl|c[A-Z]|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4})/,

    // The main tokenizer for our languages
    tokenizer: {
        root: [[/[{}]/, "delimiter.bracket"], { include: "common" }],

        common: [
            //Markup
            [/\[b\].*\[\\b\]/,"bold-bbcode"],
            [/\[i\].*\[\\i\]/,"italics-bbcode"],
            [/\[u\].*\[\\u\]/,"underline-bbcode"],
            // identifiers and keywords
            [/[A-Z][\w$]*/, "identifier"],
            [
                /[a-z_$][\w$]*/,
                {   
                    cases: {
                        "@typeKeywords": "type.identifier",
                        "@keywords": "keyword",
                        "@default": "identifier"
                    }
                }

            ],
            

            // whitespace
            { include: "@whitespace" },

            // regular expression: ensure it is terminated before beginning (otherwise it is an opeator)
            [
                /\/(?=([^\\/]|\\.)+\/([gimsuy]*)(\s*)(\.|;|,|\)|\]|\}|$))/,
                { token: "regexp", bracket: "@open", next: "@regexp" }
            ],

            // delimiters and operators
            [/[()[\]]/, "@brackets"],
            [/[<>](?!@symbols)/, "@brackets"],
            [/!(?=([^=]|$))/, "delimiter"],
            [
                /@symbols/,
                {
                    cases: {
                        "@operators": "delimiter",
                        "@default": ""
                    }
                }
            ],

            // numbers
            [/(@digits)[eE]([-+]?(@digits))?/, "number.float"],
            [/(@digits)\.(@digits)([eE][-+]?(@digits))?/, "number.float"],
            [/0[xX](@hexdigits)n?/, "number.hex"],
            [/0[oO]?(@octaldigits)n?/, "number.octal"],
            [/0[bB](@binarydigits)n?/, "number.binary"],
            [/(@digits)n?/, "number"],

            // delimiter: after number because of .\d floats
            [/[;,.]/, "delimiter"],

            // strings
            [/"([^"\\]|\\.)*$/, "string.invalid"], // non-teminated string
            [/'([^'\\]|\\.)*$/, "string.invalid"], // non-teminated string
            [/"/, "string", "@string_double"],
            [/'/, "string", "@string_single"],
            [/`/, "string", "@string_backtick"]
        ],

        whitespace: [
            [/[ \t\r\n]+/, ""],
            [/\/\*\*(?!\/)/, "comment.doc", "@jsdoc"],
            [/\/\*/, "comment", "@comment"],
            [/\/\/.*$/, "comment"]
        ],

        comment: [
            [/[^/*]+/, "comment"],
            [/\*\//, "comment", "@pop"],
            [/[/*]/, "comment"]
        ],

        jsdoc: [
            [/[^/*]+/, "comment.doc"],
            [/\*\//, "comment.doc", "@pop"],
            [/[/*]/, "comment.doc"]
        ],

        // We match regular expression quite precisely
        regexp: [
            [
                /(\{)(\d+(?:,\d*)?)(\})/,
                ["regexp.escape.control", "regexp.escape.control", "regexp.escape.control"]
            ],
            [
                /(\[)(\^?)(?=(?:[^\]\\/]|\\.)+)/,
                ["regexp.escape.control", { token: "regexp.escape.control", next: "@regexrange" }]
            ],
            [/(\()(\?:|\?=|\?!)/, ["regexp.escape.control", "regexp.escape.control"]],
            [/[()]/, "regexp.escape.control"],
            [/@regexpctl/, "regexp.escape.control"],
            [/[^\\/]/, "regexp"],
            [/@regexpesc/, "regexp.escape"],
            [/\\\./, "regexp.invalid"],
            [
                /(\/)([gimsuy]*)/,
                [{ token: "regexp", bracket: "@close", next: "@pop" }, "keyword.other"]
            ]
        ],

        regexrange: [
            [/-/, "regexp.escape.control"],
            [/\^/, "regexp.invalid"],
            [/@regexpesc/, "regexp.escape"],
            [/[^\]]/, "regexp"],
            [
                /\]/,
                {
                    token: "regexp.escape.control",
                    next: "@pop",
                    bracket: "@close"
                }
            ]
        ],

        string_double: [
            [/[^\\"]+/, "string"],
            [/@escapes/, "string.escape"],
            [/\\./, "string.escape.invalid"],
            [/"/, "string", "@pop"]
        ],

        string_single: [
            [/[^\\']+/, "string"],
            [/@escapes/, "string.escape"],
            [/\\./, "string.escape.invalid"],
            [/'/, "string", "@pop"]
        ],

        string_backtick: [
            [/\$\{/, { token: "delimiter.bracket", next: "@bracketCounting" }],
            [/[^\\`$]+/, "string"],
            [/@escapes/, "string.escape"],
            [/\\./, "string.escape.invalid"],
            [/`/, "string", "@pop"]
        ],

        bracketCounting: [
            [/\{/, "delimiter.bracket", "@bracketCounting"],
            [/\}/, "delimiter.bracket", "@pop"],
            { include: "common" }
        ]
    }
};

export const yarnSpinnerConfig = {

    // Default typescript iLanguageDefinition
    // Set defaultToken to invalid to see what you do not tokenize yet
    defaultToken: "invalid",
    wordPattern: /(-?\d*\.\d\w*)|([^`~!@#%^&*()\-=+[{\]}\\|;:'",.<>/?\s]+)/g,

    comments: {
        lineComment: "//"
    },

    brackets: [
        ['<<', '>>'],
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
            start: new RegExp('^Title:'),
			end: new RegExp('^===')
        }
    }
};

export const yarnSpinnerTheme = {
    base: 'vs',
    inherit: true,

    rules: [
        { background: 'CFD8DC'},
        { token: 'bold-bbcode', fontStyle: 'bold' },
        { token: 'underline-bbcode', fontStyle: 'underline' },
        { token: 'italics-bbcode', fontStyle: 'italic' }
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
