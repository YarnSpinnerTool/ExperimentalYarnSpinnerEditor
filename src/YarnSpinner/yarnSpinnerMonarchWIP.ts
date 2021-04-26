import { languages } from "monaco-editor";

/* Currently unable to import .ts file into renderer, likely a webpack issue. https://webpack.js.org/guides/typescript/
 * Monaco Custom Language Documentation: https://microsoft.github.io/monaco-editor/playground.html#extending-language-services-custom-languages
 * Yarn Spinner Documentation: https://yarnspinner.dev/docs/syntax/
 * JS RegExp Documentation: https://www.w3schools.com/jsref/jsref_obj_regexp.asp
 * 
 * Consider implementing a folding provider.
 */


//Example IMonarchLanguage from: https://microsoft.github.io/monaco-editor/monarch.html
export const yarnSpinnerMonarch: languages.IMonarchLanguage = {
    defaultToken: "invalid",
    tokenPostfix: ".ts",


    keywords: [
        //
        "title", "tags",
        //
        "true", "false", "null",
        //Format Functions
        "plural", "ordinal", "select",
        //


    ],

    typeKeywords: [
        "boolean", "double", "byte", "int", "short", "char", "void", "long", "float"
    ],

    operators: [
        //Equality
        "eq", "is", "==",
        //Inequality 
        "neq", "!",
        //Greater than
        "gt", ">",
        //Less than
        "lt", "<",
        //Less than or equal to
        "lte", "<=",
        //Greater than or equal to
        "gte", ">=",
        //Boolean OR
        "or", "||",
        //Boolean XOR
        "xor", "^",
        //Boolean negation
        "!",
        //Boolean AND
        "and", "&&",
        //Mathematical Operators
        "+", "-", "*", "/", "%", "(", ")"
    ],

    // we include these common regular expressions
    symbols: /[=><!~?:&|+\-*/^%]+/,

    // C# style strings
    escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

    // The main tokenizer for our languages
    tokenizer: {
        root: [
            // identifiers and keywords
            [/[a-z_$][\w$]*/, {
                cases: {
                    "@typeKeywords": "keyword",
                    "@keywords": "keyword",
                    "@default": "identifier"
                }
            }],
            [/[A-Z][\w$]*/, "type.identifier"],  // to show class names nicely

            // whitespace
            { include: "@whitespace" },

            // delimiters and operators
            [/[{}()[\]]/, "@brackets"],
            [/[<>](?!@symbols)/, "@brackets"],
            [/@symbols/, {
                cases: {
                    "@operators": "operator",
                    "@default": ""
                }
            }],

            // @ annotations.
            // As an example, we emit a debugging log message on these tokens.
            // Note: message are supressed during the first load -- change some lines to see them.
            [/@\s*[a-zA-Z_$][\w$]*/, { token: "annotation", log: "annotation token: $0" }],

            // numbers
            [/\d*\.\d+([eE][-+]?\d+)?/, "number.float"],
            [/0[xX][0-9a-fA-F]+/, "number.hex"],
            [/\d+/, "number"],

            // delimiter: after number because of .\d floats
            [/[;,.]/, "delimiter"],

            // strings
            [/"([^"\\]|\\.)*$/, "string.invalid"],  // non-teminated string
            [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],

            // characters
            [/'[^\\']'/, "string"],
            [/(')(@escapes)(')/, ["string", "string.escape", "string"]],
            [/'/, "string.invalid"]
        ],
        //Comments are denoted by a #
        comment: [
            [/[^*]+/, "comment"],
            [/\\*/, "comment", "@push"],    // nested comment
            ["\\*/", "comment", "@pop"],
            [/[*]/, "comment"]
        ],

        string: [
            [/[^\\"]+/, "string"],
            [/@escapes/, "string.escape"],
            [/\\./, "string.escape.invalid"],
            [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }]
        ],

        whitespace: [
            [/[ \t\r\n]+/, "white"],
            [/\/\*/, "comment", "@comment"],
            [/\/\/.*$/, "comment"],
        ],
    },
};