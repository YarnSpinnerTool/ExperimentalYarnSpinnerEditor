/* eslint-disable @typescript-eslint/no-var-requires */
declare const ELECTRON_AVAILABLE: boolean;
/**
 * Sets the settings defaults.
 * 
 * @returns {void}
 */
export function setupSettingsDefaults(): void 
{

    if (ELECTRON_AVAILABLE) 
    {
        const settings = require("electron-settings");

        // Forces the creation of settings with our defaults
        if (!settings.hasSync("theme")) 
        {
            settings.setSync("theme", {
                name: "OGBlue",
                code: {
                    themeName: "OGBlue"
                }
            });

            settings.setSync("font", {
                fontname: "Roboto",
                code: {
                    fontname: "Roboto"
                }
            });
        }
    }
}

/**
 * Returns the font in settings, or Monospace if running on web.
 * 
 * @returns {string} The name of the font
 */
export function getFontString(): string 
{
    if (ELECTRON_AVAILABLE) 
    {
        const settings = require("electron-settings");
        return settings.getSync("font.fontname").toString();
    }
    return "Monospace";
}


/**
 * Returns the theme in settings, or OGBlue if running on web.
 * 
 * @returns {string} The name of the theme
 */
export function getThemeName(): string 
{
    if (ELECTRON_AVAILABLE) 
    {
        const settings = require("electron-settings");
        return settings.getSync("theme.name").toString();
    }
    return "OGBlue";
}