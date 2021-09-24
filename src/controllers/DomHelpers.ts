import { YarnFile } from "../models/YarnFile";

/**
* Add and remove classes to correctly highlight the active file.
* 
* @param {string|number} fileToMarkCurrent The file to mark current.
* 
* @returns {void}
*/
export function setActiveFile(fileToMarkCurrent: string | number) 
{
   // Convert mixed type to string.
   fileToMarkCurrent = fileToMarkCurrent.toString();

   const activeFiles = document.getElementsByClassName("active-file");
   Array.from(activeFiles).forEach((value) => 
   {
       value.classList.remove("active-file");
   });

   document.getElementById(fileToMarkCurrent)?.classList.add("active-file");

}

/**
 * Creates and appends the HTML required for showing a new file.
 * 
 * @param {YarnFIleClass} file The file to add to the display.
 * 
 * @returns {void}
 */
export function addFileToDisplay(file: YarnFile): void 
 {
     const div = document.createElement("div");
     div.setAttribute("id", file.getUniqueIdentifier().toString());
 
     const closeButton = document.createElement("button");
     closeButton.textContent = "x";
 
     const para = document.createElement("p");
     para.textContent = file.getName();
 
     div.appendChild(para);
     div.appendChild(closeButton);
 
 
     const fileListElement = document.getElementById("workingFilesDetail");
 
     if (fileListElement) 
     {
         fileListElement.appendChild(div);
     }
     else 
     {
         console.error("OpenFileError: Cannot append file to display list");
     }
 
     setActiveFile(file.getUniqueIdentifier());
 }