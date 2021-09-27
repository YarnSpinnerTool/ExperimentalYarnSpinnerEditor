/*
 *---------------------------------------------------------------------------------------------
 *  Copyright (c) Yarn Spinner Editor Team. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *---------------------------------------------------------------------------------------------
 */

/* Currently unable to import .ts file into renderer, likely a webpack issue. https://webpack.js.org/guides/typescript/
 * Monaco Custom Language Documentation: https://microsoft.github.io/Monaco-editor/playground.html#extending-language-services-custom-languages
 * JS RegExp Documentation: https://www.w3schools.com/jsref/jsref_obj_regexp.asp
 * Typescript TokensProvider: https://github.com/microsoft/Monaco-languages/blob/main/src/typescript/typescript.ts
 */
import * as monaco from "monaco-editor";

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
            filterText: 'title',
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: [
                'title: $1',
                'xpos:',
                'ypos:',
                'colour: ',
                '---',
                '$0',
                '==='
            ].join('\n'),
            documentation: 'Create new node',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        }];
        
        //Get all of the text in the editor
        var text = model.getValue();
        //Regex for both titles and variables, global tag is used.
        var nodesRegex = /title:\s?[A-Za-z0-9_]+[\.]*[A-Za-z0-9_]*/g;
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
                word = word.replace("title:","");
                //Remove any spaces, for example "Title: nodeName"
                //Can't use replace("title: ","") as Title:nodeName is valid afaik.
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