import * as Canvas from "./nodeView";

/**
 * Taken from https://htmldom.dev/create-resizable-split-views/ under the MIT license.
 */
export function setUpResizing() {
    // Query the element
    const resizer = document.getElementById("dragDiv");
    if (resizer) {
        const leftSide = resizer.previousElementSibling as HTMLElement;
        const rightSide = resizer.nextElementSibling as HTMLElement;

        const parent = resizer.parentNode as HTMLElement;

        if (leftSide && rightSide && parent) {
            const parentWidth = parent.getBoundingClientRect().width;

            // The current position of mouse
            let x = 0;

            // Width of left side
            let leftWidth = 0;

            const mouseMoveHandler = function (e: MouseEvent) {
                // How far the mouse has been moved
                const dx = e.clientX - x;
                document.body.style.cursor = "col-resize";

                leftSide.style.userSelect = "none";
                leftSide.style.pointerEvents = "none";

                rightSide.style.userSelect = "none";
                rightSide.style.pointerEvents = "none";

                const newLeftWidth = (leftWidth + dx) * 100 / parentWidth;
                leftSide.style.width = `${newLeftWidth}%`;

                if (newLeftWidth % 0.0001 > 0.00005) {
                    Canvas.responsiveSize();
                }
            };

            const mouseUpHandler = function () {
                resizer.style.removeProperty("cursor");
                document.body.style.removeProperty("cursor");

                leftSide.style.removeProperty("user-select");
                leftSide.style.removeProperty("pointer-events");

                rightSide.style.removeProperty("user-select");
                rightSide.style.removeProperty("pointer-events");

                // Remove the handlers of `mousemove` and `mouseup`
                document.removeEventListener("mousemove", mouseMoveHandler);
                document.removeEventListener("mouseup", mouseUpHandler);
            };

            // Handle the mousedown event
            // that's triggered when user drags the resizer
            const mouseDownHandler = function (e: MouseEvent) {
                // Get the current mouse position
                x = e.clientX;
                leftWidth = leftSide.getBoundingClientRect().width;

                // Attach the listeners to `document`
                document.addEventListener("mousemove", mouseMoveHandler);
                document.addEventListener("mouseup", mouseUpHandler);
            };
            // Attach the handler
            resizer.addEventListener("mousedown", mouseDownHandler);
        }

    }
}