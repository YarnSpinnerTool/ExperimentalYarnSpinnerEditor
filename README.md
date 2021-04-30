# YarnSpinnerEditor
**An editor for Yarn Spinner written in Electron / TypeScript.**

Using Webpack v5.32.0, Monaco Editor v0.23.0, & ESLint.

| **Useful NPM commands/aliases:** ||
|---|---|
|npm install|  *Installs node module dependencies*|
|npm start|*Alias for npm run build && electron-forge start*|
|npm run lint| *Checks that all files abide by our ESLint parser rules.*|
|npm run lint-fix|*Fixes any ESLint parser errors, where possible.*|

<br>

| **Important NPM info:** ||
|---|---|
 * NPM works through the package.json file. If there is a dependency in this file, it means we have explicitly declared "We need this package for our app". Each package is able to require their own sub-packages that ***THEY*** need to run. All of these packages are downloaded and stored in the `node_modules` folder.
 * `node_modules` IS NOT COMMITED TO GIT. This means that changes to this folder are not uploaded.
 * `npm install` is used to install all packages in the package.json file, and more can be installed by the command: `npm install <packageName>`. If a module has been required by someone else, you need to run this command to bring your installation up to date.

<br>

|**Important git/github info**||
|--|--|
 * Commenting `/cib` on an issue will create a new branch that matches the name and number.
 * Please format all commit messages as `#X - What the commit is`, where X is the __ISSUE__ number.
 * Remember that all master can be merged into any branch at any time without issues to bring a branch up to date. This can be done in GitKraken by checking out master to make sure you're up to date locally, checkout the branch in question, then drag the master branch onto the branch name. If you have questions, ask Seth.
 * 

Coding style and rules, subject to change.

|  Object Type | Stylistic Convention  | 
|---|---|
| Constants  | UPPERCASE |   
| File names | lowercase  |     
| Everything else  | camelCase  |   
