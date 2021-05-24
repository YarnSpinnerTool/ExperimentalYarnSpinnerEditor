# Designing Your Own Theme (Code)
Within the Yarn Spinner Editor, there are a current working total of **14** colours to set that will affect the way the entire editor is rendered for your viewing pleasure.


## Preliminary Definitions
As this document may get very technical, I will be placing definitions here with explanations to the best of my ability so even people without programming experience can set their own themes.

**Token / Tokens** - An identifier for a word in the editor that matches the language definition.

**Editor** - As the Yarn Spinner Editor utilises [Microsoft's Monaco editor](https://microsoft.github.io/monaco-editor/), which powers VSCode, we set colours to the tokens we have defined in the Yarn Spinner language. When I say editor, I mean the text area, not the rest of the program.


## Tokens That Can Be Coloured

### Editor Tokens
The tokens that are outputted to the editor are as follows: 

**Commands** - Anything between, and including the << and >> e.g., `<< This will all be classed as `
**CommandsInternal** - Commands found within Command tokens e.g., `<<  jump  >> << stop >> << customCommand >>`
**VarAndNum** - Variables, and numbers including both numbers and floats. e.g., `$var = 1.0` both **$var** and **1.0** will be coloured, but not **=**.
**Options** - Colours the `->` at the start of the line to indicate options to the player.
**Interpolation** - Similar to commands, anything between and including { }  e.g., `{ interpolation }`
**Strings** - Anything found inside and including " "  e.g., `" This is a string"`
**Metadata** - Header tags that are found below the title of a node, or hashtags at the end of lines, e.g., `some dialogue #Hashtag`
**Comments** - Anything that follows, and includes //, e.g. `some dialogue //Comment`
**Invalid** - The colour you wish for the non-matched or out of placed words in your yarn file.

Note: Commands and Interpolation do not colour anything that matches the other tokens, such as VarAndNum will be coloured as VarAndNum not as command if it is found within a command block, e.g. `<< thisTextIsCommand $var = 1 >>` there thisTextIsCommand, will be coloured as commands, but $var will be coloured as VarAndNum. 

### Program Options
The tokens that colour the remainder of the program, such as text colour and the topbar / side bar are as follows:

**Editor** - Refers to the editor's background colour that sets the top and side bar colour.
**EditorMinimap** - Refers to the editor's overview map on the right hand side of the editor.
**WorkingFiles** - Refers to the working files tabs on the left hand side of the editor.
**TabGap** - Refers to the gap between the top / side bar and the editor.

### Generic Options
**Default** - Refers to the text you wish the editor text and the icons to be.
**invertDefault** - Refers to the contrasting text to default, for example, if default was black, this would be set to white (or whatever you want).

## Setting the Options (TODO)
TODO once we get to actually setting and saving theme information in a sane way


