'use strict';

var require$$0 = require('obsidian');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

var main = {};

Object.defineProperty(main, '__esModule', { value: true });

var obsidian = require$$0__default["default"];

const DEFAULT_DAILY_NOTE_FORMAT = "YYYY-MM-DD";
const DEFAULT_WEEKLY_NOTE_FORMAT = "gggg-[W]ww";
const DEFAULT_MONTHLY_NOTE_FORMAT = "YYYY-MM";
const DEFAULT_QUARTERLY_NOTE_FORMAT = "YYYY-[Q]Q";
const DEFAULT_YEARLY_NOTE_FORMAT = "YYYY";

function shouldUsePeriodicNotesSettings(periodicity) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodicNotes = window.app.plugins.getPlugin("periodic-notes");
    return periodicNotes && periodicNotes.settings?.[periodicity]?.enabled;
}
/**
 * Read the user settings for the `daily-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
function getDailyNoteSettings() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { internalPlugins, plugins } = window.app;
        if (shouldUsePeriodicNotesSettings("daily")) {
            const { format, folder, template } = plugins.getPlugin("periodic-notes")?.settings?.daily || {};
            return {
                format: format || DEFAULT_DAILY_NOTE_FORMAT,
                folder: folder?.trim() || "",
                template: template?.trim() || "",
            };
        }
        const { folder, format, template } = internalPlugins.getPluginById("daily-notes")?.instance?.options || {};
        return {
            format: format || DEFAULT_DAILY_NOTE_FORMAT,
            folder: folder?.trim() || "",
            template: template?.trim() || "",
        };
    }
    catch (err) {
        console.info("No custom daily note settings found!", err);
    }
}
/**
 * Read the user settings for the `weekly-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
function getWeeklyNoteSettings() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pluginManager = window.app.plugins;
        const calendarSettings = pluginManager.getPlugin("calendar")?.options;
        const periodicNotesSettings = pluginManager.getPlugin("periodic-notes")?.settings?.weekly;
        if (shouldUsePeriodicNotesSettings("weekly")) {
            return {
                format: periodicNotesSettings.format || DEFAULT_WEEKLY_NOTE_FORMAT,
                folder: periodicNotesSettings.folder?.trim() || "",
                template: periodicNotesSettings.template?.trim() || "",
            };
        }
        const settings = calendarSettings || {};
        return {
            format: settings.weeklyNoteFormat || DEFAULT_WEEKLY_NOTE_FORMAT,
            folder: settings.weeklyNoteFolder?.trim() || "",
            template: settings.weeklyNoteTemplate?.trim() || "",
        };
    }
    catch (err) {
        console.info("No custom weekly note settings found!", err);
    }
}
/**
 * Read the user settings for the `periodic-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
function getMonthlyNoteSettings() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pluginManager = window.app.plugins;
    try {
        const settings = (shouldUsePeriodicNotesSettings("monthly") &&
            pluginManager.getPlugin("periodic-notes")?.settings?.monthly) ||
            {};
        return {
            format: settings.format || DEFAULT_MONTHLY_NOTE_FORMAT,
            folder: settings.folder?.trim() || "",
            template: settings.template?.trim() || "",
        };
    }
    catch (err) {
        console.info("No custom monthly note settings found!", err);
    }
}
/**
 * Read the user settings for the `periodic-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
function getQuarterlyNoteSettings() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pluginManager = window.app.plugins;
    try {
        const settings = (shouldUsePeriodicNotesSettings("quarterly") &&
            pluginManager.getPlugin("periodic-notes")?.settings?.quarterly) ||
            {};
        return {
            format: settings.format || DEFAULT_QUARTERLY_NOTE_FORMAT,
            folder: settings.folder?.trim() || "",
            template: settings.template?.trim() || "",
        };
    }
    catch (err) {
        console.info("No custom quarterly note settings found!", err);
    }
}
/**
 * Read the user settings for the `periodic-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
function getYearlyNoteSettings() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pluginManager = window.app.plugins;
    try {
        const settings = (shouldUsePeriodicNotesSettings("yearly") &&
            pluginManager.getPlugin("periodic-notes")?.settings?.yearly) ||
            {};
        return {
            format: settings.format || DEFAULT_YEARLY_NOTE_FORMAT,
            folder: settings.folder?.trim() || "",
            template: settings.template?.trim() || "",
        };
    }
    catch (err) {
        console.info("No custom yearly note settings found!", err);
    }
}

// Credit: @creationix/path.js
function join(...partSegments) {
    // Split the inputs into a list of path commands.
    let parts = [];
    for (let i = 0, l = partSegments.length; i < l; i++) {
        parts = parts.concat(partSegments[i].split("/"));
    }
    // Interpret the path commands to get the new resolved path.
    const newParts = [];
    for (let i = 0, l = parts.length; i < l; i++) {
        const part = parts[i];
        // Remove leading and trailing slashes
        // Also remove "." segments
        if (!part || part === ".")
            continue;
        // Push new path segments.
        else
            newParts.push(part);
    }
    // Preserve the initial slash if there was one.
    if (parts[0] === "")
        newParts.unshift("");
    // Turn back into a single string path.
    return newParts.join("/");
}
function basename(fullPath) {
    let base = fullPath.substring(fullPath.lastIndexOf("/") + 1);
    if (base.lastIndexOf(".") != -1)
        base = base.substring(0, base.lastIndexOf("."));
    return base;
}
async function ensureFolderExists(path) {
    const dirs = path.replace(/\\/g, "/").split("/");
    dirs.pop(); // remove basename
    if (dirs.length) {
        const dir = join(...dirs);
        if (!window.app.vault.getAbstractFileByPath(dir)) {
            await window.app.vault.createFolder(dir);
        }
    }
}
async function getNotePath(directory, filename) {
    if (!filename.endsWith(".md")) {
        filename += ".md";
    }
    const path = obsidian.normalizePath(join(directory, filename));
    await ensureFolderExists(path);
    return path;
}
async function getTemplateInfo(template) {
    const { metadataCache, vault } = window.app;
    const templatePath = obsidian.normalizePath(template);
    if (templatePath === "/") {
        return Promise.resolve(["", null]);
    }
    try {
        const templateFile = metadataCache.getFirstLinkpathDest(templatePath, "");
        const contents = await vault.cachedRead(templateFile);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const IFoldInfo = window.app.foldManager.load(templateFile);
        return [contents, IFoldInfo];
    }
    catch (err) {
        console.error(`Failed to read the daily note template '${templatePath}'`, err);
        new obsidian.Notice("Failed to read the daily note template");
        return ["", null];
    }
}

/**
 * dateUID is a way of weekly identifying daily/weekly/monthly notes.
 * They are prefixed with the granularity to avoid ambiguity.
 */
function getDateUID(date, granularity = "day") {
    const ts = date.clone().startOf(granularity).format();
    return `${granularity}-${ts}`;
}
function removeEscapedCharacters(format) {
    return format.replace(/\[[^\]]*\]/g, ""); // remove everything within brackets
}
/**
 * XXX: When parsing dates that contain both week numbers and months,
 * Moment choses to ignore the week numbers. For the week dateUID, we
 * want the opposite behavior. Strip the MMM from the format to patch.
 */
function isFormatAmbiguous(format, granularity) {
    if (granularity === "week") {
        const cleanFormat = removeEscapedCharacters(format);
        return (/w{1,2}/i.test(cleanFormat) &&
            (/M{1,4}/.test(cleanFormat) || /D{1,4}/.test(cleanFormat)));
    }
    return false;
}
function getDateFromFile(file, granularity) {
    return getDateFromFilename(file.basename, granularity);
}
function getDateFromPath(path, granularity) {
    return getDateFromFilename(basename(path), granularity);
}
function getDateFromFilename(filename, granularity) {
    const getSettings = {
        day: getDailyNoteSettings,
        week: getWeeklyNoteSettings,
        month: getMonthlyNoteSettings,
        quarter: getQuarterlyNoteSettings,
        year: getYearlyNoteSettings,
    };
    const format = getSettings[granularity]().format.split("/").pop();
    const noteDate = window.moment(filename, format, true);
    if (!noteDate.isValid()) {
        return null;
    }
    if (isFormatAmbiguous(format, granularity)) {
        if (granularity === "week") {
            const cleanFormat = removeEscapedCharacters(format);
            if (/w{1,2}/i.test(cleanFormat)) {
                return window.moment(filename, 
                // If format contains week, remove day & month formatting
                format.replace(/M{1,4}/g, "").replace(/D{1,4}/g, ""), false);
            }
        }
    }
    return noteDate;
}

class DailyNotesFolderMissingError extends Error {
}
/**
 * This function mimics the behavior of the daily-notes plugin
 * so it will replace {{date}}, {{title}}, and {{time}} with the
 * formatted timestamp.
 *
 * Note: it has an added bonus that it's not 'today' specific.
 */
async function createDailyNote(date) {
    const app = window.app;
    const { vault } = app;
    const moment = window.moment;
    const { template, format, folder } = getDailyNoteSettings();
    const [templateContents, IFoldInfo] = await getTemplateInfo(template);
    const filename = date.format(format);
    const normalizedPath = await getNotePath(folder, filename);
    try {
        const createdFile = await vault.create(normalizedPath, templateContents
            .replace(/{{\s*date\s*}}/gi, filename)
            .replace(/{{\s*time\s*}}/gi, moment().format("HH:mm"))
            .replace(/{{\s*title\s*}}/gi, filename)
            .replace(/{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi, (_, _timeOrDate, calc, timeDelta, unit, momentFormat) => {
            const now = moment();
            const currentDate = date.clone().set({
                hour: now.get("hour"),
                minute: now.get("minute"),
                second: now.get("second"),
            });
            if (calc) {
                currentDate.add(parseInt(timeDelta, 10), unit);
            }
            if (momentFormat) {
                return currentDate.format(momentFormat.substring(1).trim());
            }
            return currentDate.format(format);
        })
            .replace(/{{\s*yesterday\s*}}/gi, date.clone().subtract(1, "day").format(format))
            .replace(/{{\s*tomorrow\s*}}/gi, date.clone().add(1, "d").format(format)));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        app.foldManager.save(createdFile, IFoldInfo);
        return createdFile;
    }
    catch (err) {
        console.error(`Failed to create file: '${normalizedPath}'`, err);
        new obsidian.Notice("Unable to create new file.");
    }
}
function getDailyNote(date, dailyNotes) {
    return dailyNotes[getDateUID(date, "day")] ?? null;
}
function getAllDailyNotes() {
    /**
     * Find all daily notes in the daily note folder
     */
    const { vault } = window.app;
    const { folder } = getDailyNoteSettings();
    const dailyNotesFolder = vault.getAbstractFileByPath(obsidian.normalizePath(folder));
    if (!dailyNotesFolder) {
        throw new DailyNotesFolderMissingError("Failed to find daily notes folder");
    }
    const dailyNotes = {};
    obsidian.Vault.recurseChildren(dailyNotesFolder, (note) => {
        if (note instanceof obsidian.TFile) {
            const date = getDateFromFile(note, "day");
            if (date) {
                const dateString = getDateUID(date, "day");
                dailyNotes[dateString] = note;
            }
        }
    });
    return dailyNotes;
}

class WeeklyNotesFolderMissingError extends Error {
}
function getDaysOfWeek() {
    const { moment } = window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let weekStart = moment.localeData()._week.dow;
    const daysOfWeek = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
    ];
    while (weekStart) {
        daysOfWeek.push(daysOfWeek.shift());
        weekStart--;
    }
    return daysOfWeek;
}
function getDayOfWeekNumericalValue(dayOfWeekName) {
    return getDaysOfWeek().indexOf(dayOfWeekName.toLowerCase());
}
async function createWeeklyNote(date) {
    const { vault } = window.app;
    const { template, format, folder } = getWeeklyNoteSettings();
    const [templateContents, IFoldInfo] = await getTemplateInfo(template);
    const filename = date.format(format);
    const normalizedPath = await getNotePath(folder, filename);
    try {
        const createdFile = await vault.create(normalizedPath, templateContents
            .replace(/{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi, (_, _timeOrDate, calc, timeDelta, unit, momentFormat) => {
            const now = window.moment();
            const currentDate = date.clone().set({
                hour: now.get("hour"),
                minute: now.get("minute"),
                second: now.get("second"),
            });
            if (calc) {
                currentDate.add(parseInt(timeDelta, 10), unit);
            }
            if (momentFormat) {
                return currentDate.format(momentFormat.substring(1).trim());
            }
            return currentDate.format(format);
        })
            .replace(/{{\s*title\s*}}/gi, filename)
            .replace(/{{\s*time\s*}}/gi, window.moment().format("HH:mm"))
            .replace(/{{\s*(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s*:(.*?)}}/gi, (_, dayOfWeek, momentFormat) => {
            const day = getDayOfWeekNumericalValue(dayOfWeek);
            return date.weekday(day).format(momentFormat.trim());
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.app.foldManager.save(createdFile, IFoldInfo);
        return createdFile;
    }
    catch (err) {
        console.error(`Failed to create file: '${normalizedPath}'`, err);
        new obsidian.Notice("Unable to create new file.");
    }
}
function getWeeklyNote(date, weeklyNotes) {
    return weeklyNotes[getDateUID(date, "week")] ?? null;
}
function getAllWeeklyNotes() {
    const weeklyNotes = {};
    if (!appHasWeeklyNotesPluginLoaded()) {
        return weeklyNotes;
    }
    const { vault } = window.app;
    const { folder } = getWeeklyNoteSettings();
    const weeklyNotesFolder = vault.getAbstractFileByPath(obsidian.normalizePath(folder));
    if (!weeklyNotesFolder) {
        throw new WeeklyNotesFolderMissingError("Failed to find weekly notes folder");
    }
    obsidian.Vault.recurseChildren(weeklyNotesFolder, (note) => {
        if (note instanceof obsidian.TFile) {
            const date = getDateFromFile(note, "week");
            if (date) {
                const dateString = getDateUID(date, "week");
                weeklyNotes[dateString] = note;
            }
        }
    });
    return weeklyNotes;
}

class MonthlyNotesFolderMissingError extends Error {
}
/**
 * This function mimics the behavior of the daily-notes plugin
 * so it will replace {{date}}, {{title}}, and {{time}} with the
 * formatted timestamp.
 *
 * Note: it has an added bonus that it's not 'today' specific.
 */
async function createMonthlyNote(date) {
    const { vault } = window.app;
    const { template, format, folder } = getMonthlyNoteSettings();
    const [templateContents, IFoldInfo] = await getTemplateInfo(template);
    const filename = date.format(format);
    const normalizedPath = await getNotePath(folder, filename);
    try {
        const createdFile = await vault.create(normalizedPath, templateContents
            .replace(/{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi, (_, _timeOrDate, calc, timeDelta, unit, momentFormat) => {
            const now = window.moment();
            const currentDate = date.clone().set({
                hour: now.get("hour"),
                minute: now.get("minute"),
                second: now.get("second"),
            });
            if (calc) {
                currentDate.add(parseInt(timeDelta, 10), unit);
            }
            if (momentFormat) {
                return currentDate.format(momentFormat.substring(1).trim());
            }
            return currentDate.format(format);
        })
            .replace(/{{\s*date\s*}}/gi, filename)
            .replace(/{{\s*time\s*}}/gi, window.moment().format("HH:mm"))
            .replace(/{{\s*title\s*}}/gi, filename));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.app.foldManager.save(createdFile, IFoldInfo);
        return createdFile;
    }
    catch (err) {
        console.error(`Failed to create file: '${normalizedPath}'`, err);
        new obsidian.Notice("Unable to create new file.");
    }
}
function getMonthlyNote(date, monthlyNotes) {
    return monthlyNotes[getDateUID(date, "month")] ?? null;
}
function getAllMonthlyNotes() {
    const monthlyNotes = {};
    if (!appHasMonthlyNotesPluginLoaded()) {
        return monthlyNotes;
    }
    const { vault } = window.app;
    const { folder } = getMonthlyNoteSettings();
    const monthlyNotesFolder = vault.getAbstractFileByPath(obsidian.normalizePath(folder));
    if (!monthlyNotesFolder) {
        throw new MonthlyNotesFolderMissingError("Failed to find monthly notes folder");
    }
    obsidian.Vault.recurseChildren(monthlyNotesFolder, (note) => {
        if (note instanceof obsidian.TFile) {
            const date = getDateFromFile(note, "month");
            if (date) {
                const dateString = getDateUID(date, "month");
                monthlyNotes[dateString] = note;
            }
        }
    });
    return monthlyNotes;
}

class QuarterlyNotesFolderMissingError extends Error {
}
/**
 * This function mimics the behavior of the daily-notes plugin
 * so it will replace {{date}}, {{title}}, and {{time}} with the
 * formatted timestamp.
 *
 * Note: it has an added bonus that it's not 'today' specific.
 */
async function createQuarterlyNote(date) {
    const { vault } = window.app;
    const { template, format, folder } = getQuarterlyNoteSettings();
    const [templateContents, IFoldInfo] = await getTemplateInfo(template);
    const filename = date.format(format);
    const normalizedPath = await getNotePath(folder, filename);
    try {
        const createdFile = await vault.create(normalizedPath, templateContents
            .replace(/{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi, (_, _timeOrDate, calc, timeDelta, unit, momentFormat) => {
            const now = window.moment();
            const currentDate = date.clone().set({
                hour: now.get("hour"),
                minute: now.get("minute"),
                second: now.get("second"),
            });
            if (calc) {
                currentDate.add(parseInt(timeDelta, 10), unit);
            }
            if (momentFormat) {
                return currentDate.format(momentFormat.substring(1).trim());
            }
            return currentDate.format(format);
        })
            .replace(/{{\s*date\s*}}/gi, filename)
            .replace(/{{\s*time\s*}}/gi, window.moment().format("HH:mm"))
            .replace(/{{\s*title\s*}}/gi, filename));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.app.foldManager.save(createdFile, IFoldInfo);
        return createdFile;
    }
    catch (err) {
        console.error(`Failed to create file: '${normalizedPath}'`, err);
        new obsidian.Notice("Unable to create new file.");
    }
}
function getQuarterlyNote(date, quarterly) {
    return quarterly[getDateUID(date, "quarter")] ?? null;
}
function getAllQuarterlyNotes() {
    const quarterly = {};
    if (!appHasQuarterlyNotesPluginLoaded()) {
        return quarterly;
    }
    const { vault } = window.app;
    const { folder } = getQuarterlyNoteSettings();
    const quarterlyFolder = vault.getAbstractFileByPath(obsidian.normalizePath(folder));
    if (!quarterlyFolder) {
        throw new QuarterlyNotesFolderMissingError("Failed to find quarterly notes folder");
    }
    obsidian.Vault.recurseChildren(quarterlyFolder, (note) => {
        if (note instanceof obsidian.TFile) {
            const date = getDateFromFile(note, "quarter");
            if (date) {
                const dateString = getDateUID(date, "quarter");
                quarterly[dateString] = note;
            }
        }
    });
    return quarterly;
}

class YearlyNotesFolderMissingError extends Error {
}
/**
 * This function mimics the behavior of the daily-notes plugin
 * so it will replace {{date}}, {{title}}, and {{time}} with the
 * formatted timestamp.
 *
 * Note: it has an added bonus that it's not 'today' specific.
 */
async function createYearlyNote(date) {
    const { vault } = window.app;
    const { template, format, folder } = getYearlyNoteSettings();
    const [templateContents, IFoldInfo] = await getTemplateInfo(template);
    const filename = date.format(format);
    const normalizedPath = await getNotePath(folder, filename);
    try {
        const createdFile = await vault.create(normalizedPath, templateContents
            .replace(/{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi, (_, _timeOrDate, calc, timeDelta, unit, momentFormat) => {
            const now = window.moment();
            const currentDate = date.clone().set({
                hour: now.get("hour"),
                minute: now.get("minute"),
                second: now.get("second"),
            });
            if (calc) {
                currentDate.add(parseInt(timeDelta, 10), unit);
            }
            if (momentFormat) {
                return currentDate.format(momentFormat.substring(1).trim());
            }
            return currentDate.format(format);
        })
            .replace(/{{\s*date\s*}}/gi, filename)
            .replace(/{{\s*time\s*}}/gi, window.moment().format("HH:mm"))
            .replace(/{{\s*title\s*}}/gi, filename));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.app.foldManager.save(createdFile, IFoldInfo);
        return createdFile;
    }
    catch (err) {
        console.error(`Failed to create file: '${normalizedPath}'`, err);
        new obsidian.Notice("Unable to create new file.");
    }
}
function getYearlyNote(date, yearlyNotes) {
    return yearlyNotes[getDateUID(date, "year")] ?? null;
}
function getAllYearlyNotes() {
    const yearlyNotes = {};
    if (!appHasYearlyNotesPluginLoaded()) {
        return yearlyNotes;
    }
    const { vault } = window.app;
    const { folder } = getYearlyNoteSettings();
    const yearlyNotesFolder = vault.getAbstractFileByPath(obsidian.normalizePath(folder));
    if (!yearlyNotesFolder) {
        throw new YearlyNotesFolderMissingError("Failed to find yearly notes folder");
    }
    obsidian.Vault.recurseChildren(yearlyNotesFolder, (note) => {
        if (note instanceof obsidian.TFile) {
            const date = getDateFromFile(note, "year");
            if (date) {
                const dateString = getDateUID(date, "year");
                yearlyNotes[dateString] = note;
            }
        }
    });
    return yearlyNotes;
}

function appHasDailyNotesPluginLoaded() {
    const { app } = window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dailyNotesPlugin = app.internalPlugins.plugins["daily-notes"];
    if (dailyNotesPlugin && dailyNotesPlugin.enabled) {
        return true;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodicNotes = app.plugins.getPlugin("periodic-notes");
    return periodicNotes && periodicNotes.settings?.daily?.enabled;
}
/**
 * XXX: "Weekly Notes" live in either the Calendar plugin or the periodic-notes plugin.
 * Check both until the weekly notes feature is removed from the Calendar plugin.
 */
function appHasWeeklyNotesPluginLoaded() {
    const { app } = window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (app.plugins.getPlugin("calendar")) {
        return true;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodicNotes = app.plugins.getPlugin("periodic-notes");
    return periodicNotes && periodicNotes.settings?.weekly?.enabled;
}
function appHasMonthlyNotesPluginLoaded() {
    const { app } = window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodicNotes = app.plugins.getPlugin("periodic-notes");
    return periodicNotes && periodicNotes.settings?.monthly?.enabled;
}
function appHasQuarterlyNotesPluginLoaded() {
    const { app } = window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodicNotes = app.plugins.getPlugin("periodic-notes");
    return periodicNotes && periodicNotes.settings?.quarterly?.enabled;
}
function appHasYearlyNotesPluginLoaded() {
    const { app } = window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodicNotes = app.plugins.getPlugin("periodic-notes");
    return periodicNotes && periodicNotes.settings?.yearly?.enabled;
}
function getPeriodicNoteSettings(granularity) {
    const getSettings = {
        day: getDailyNoteSettings,
        week: getWeeklyNoteSettings,
        month: getMonthlyNoteSettings,
        quarter: getQuarterlyNoteSettings,
        year: getYearlyNoteSettings,
    }[granularity];
    return getSettings();
}
function createPeriodicNote(granularity, date) {
    const createFn = {
        day: createDailyNote,
        month: createMonthlyNote,
        week: createWeeklyNote,
    };
    return createFn[granularity](date);
}

main.DEFAULT_DAILY_NOTE_FORMAT = DEFAULT_DAILY_NOTE_FORMAT;
main.DEFAULT_MONTHLY_NOTE_FORMAT = DEFAULT_MONTHLY_NOTE_FORMAT;
main.DEFAULT_QUARTERLY_NOTE_FORMAT = DEFAULT_QUARTERLY_NOTE_FORMAT;
main.DEFAULT_WEEKLY_NOTE_FORMAT = DEFAULT_WEEKLY_NOTE_FORMAT;
main.DEFAULT_YEARLY_NOTE_FORMAT = DEFAULT_YEARLY_NOTE_FORMAT;
main.appHasDailyNotesPluginLoaded = appHasDailyNotesPluginLoaded;
main.appHasMonthlyNotesPluginLoaded = appHasMonthlyNotesPluginLoaded;
main.appHasQuarterlyNotesPluginLoaded = appHasQuarterlyNotesPluginLoaded;
main.appHasWeeklyNotesPluginLoaded = appHasWeeklyNotesPluginLoaded;
main.appHasYearlyNotesPluginLoaded = appHasYearlyNotesPluginLoaded;
var createDailyNote_1 = main.createDailyNote = createDailyNote;
main.createMonthlyNote = createMonthlyNote;
main.createPeriodicNote = createPeriodicNote;
main.createQuarterlyNote = createQuarterlyNote;
main.createWeeklyNote = createWeeklyNote;
main.createYearlyNote = createYearlyNote;
var getAllDailyNotes_1 = main.getAllDailyNotes = getAllDailyNotes;
main.getAllMonthlyNotes = getAllMonthlyNotes;
main.getAllQuarterlyNotes = getAllQuarterlyNotes;
main.getAllWeeklyNotes = getAllWeeklyNotes;
main.getAllYearlyNotes = getAllYearlyNotes;
var getDailyNote_1 = main.getDailyNote = getDailyNote;
main.getDailyNoteSettings = getDailyNoteSettings;
main.getDateFromFile = getDateFromFile;
main.getDateFromPath = getDateFromPath;
main.getDateUID = getDateUID;
main.getMonthlyNote = getMonthlyNote;
main.getMonthlyNoteSettings = getMonthlyNoteSettings;
main.getPeriodicNoteSettings = getPeriodicNoteSettings;
main.getQuarterlyNote = getQuarterlyNote;
main.getQuarterlyNoteSettings = getQuarterlyNoteSettings;
main.getTemplateInfo = getTemplateInfo;
main.getWeeklyNote = getWeeklyNote;
main.getWeeklyNoteSettings = getWeeklyNoteSettings;
main.getYearlyNote = getYearlyNote;
main.getYearlyNoteSettings = getYearlyNoteSettings;

// Obsidian bundles moment.js and exposes it as window.moment at runtime.
// Its type is declared globally via "declare global" in types.d.ts, which
// works fine for whole-project type-checking (this project's own tsconfig,
// tests, build) but not for tools that type-check files in isolation --
// those never see the ambient augmentation from that separate file, so
// every window.moment usage silently resolves to `any` there, cascading
// into unsafe-* lint warnings on every line that touches its return value.
//
// Re-exporting through a real ES import sidesteps that: a module import's
// type is resolved from this file's own declared type regardless of ambient
// declaration visibility elsewhere.
//
// Uses a Proxy instead of capturing window.moment directly at module-load
// time, so later mutations of window.moment are still reflected -- some
// tests intentionally monkey-patch window.moment mid-test (to exercise
// error-handling branches around a throwing .format()), and a plain
// captured reference would keep pointing at the pre-mock function.
const moment = new Proxy((() => undefined), {
    apply: (_target, thisArg, args) => Reflect.apply(window.moment, thisArg, args),
    get: (_target, prop, receiver) => Reflect.get(window.moment, prop, receiver),
});

/**
 * Module pour le formatage de dates
 */
/**
 * Classe pour formater des dates
 */
class DateFormatter {
    /**
     * Formate une date selon le format spécifié
     * @param date La date à formater
     * @param format Le format de date (format Moment.js)
     * @returns La date formatée en string
     */
    static format(date, format) {
        return moment(date).format(format);
    }
    /**
     * Formate une date avec heure
     * @param date La date à formater
     * @param dateFormat Le format de date
     * @param timeFormat Le format d'heure
     * @param separator Le séparateur entre date et heure (défaut: " ")
     * @returns La date formatée avec l'heure
     */
    static formatWithTime(date, dateFormat, timeFormat, separator = " ") {
        const dateStr = this.format(date, dateFormat);
        const timeStr = this.format(date, timeFormat);
        return `${dateStr}${separator}${timeStr}`;
    }
}

var i18n$1 = {exports: {}};

(function (module) {
// Generated by CoffeeScript 1.6.2
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  (function(root, factory) {
    if (module.exports) {
      return module.exports = factory();
    } else {
      return root.i18n = factory();
    }
  })((typeof self !== "undefined" && self !== null ? self : this), function() {
    var Translator, i18n, translator;

    Translator = (function() {
      function Translator() {
        this.translate = __bind(this.translate, this);        this.data = {
          values: {},
          contexts: []
        };
        this.globalContext = {};
      }

      Translator.prototype.translate = function(text, defaultNumOrFormatting, numOrFormattingOrContext, formattingOrContext, context) {
        var defaultText, formatting, isObject, num;

        if (context == null) {
          context = this.globalContext;
        }
        isObject = function(obj) {
          var type;

          type = typeof obj;
          return type === "function" || type === "object" && !!obj;
        };
        if (isObject(defaultNumOrFormatting)) {
          defaultText = null;
          num = null;
          formatting = defaultNumOrFormatting;
          context = numOrFormattingOrContext || this.globalContext;
        } else {
          if (typeof defaultNumOrFormatting === "number") {
            defaultText = null;
            num = defaultNumOrFormatting;
            formatting = numOrFormattingOrContext;
            context = formattingOrContext || this.globalContext;
          } else {
            defaultText = defaultNumOrFormatting;
            if (typeof numOrFormattingOrContext === "number") {
              num = numOrFormattingOrContext;
              formatting = formattingOrContext;
              context = context;
            } else {
              num = null;
              formatting = numOrFormattingOrContext;
              context = formattingOrContext || this.globalContext;
            }
          }
        }
        if (isObject(text)) {
          if (isObject(text['i18n'])) {
            text = text['i18n'];
          }
          return this.translateHash(text, context);
        } else {
          return this.translateText(text, num, formatting, context, defaultText);
        }
      };

      Translator.prototype.add = function(d) {
        var c, k, v, _i, _len, _ref, _ref1, _results;

        if ((d.values != null)) {
          _ref = d.values;
          for (k in _ref) {
            v = _ref[k];
            this.data.values[k] = v;
          }
        }
        if ((d.contexts != null)) {
          _ref1 = d.contexts;
          _results = [];
          for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
            c = _ref1[_i];
            _results.push(this.data.contexts.push(c));
          }
          return _results;
        }
      };

      Translator.prototype.setContext = function(key, value) {
        return this.globalContext[key] = value;
      };

      Translator.prototype.extend = function(ext) {
        return this.extension = ext;
      };

      Translator.prototype.clearContext = function(key) {
        return this.globalContext[key] = null;
      };

      Translator.prototype.reset = function() {
        this.resetData();
        return this.resetContext();
      };

      Translator.prototype.resetData = function() {
        return this.data = {
          values: {},
          contexts: []
        };
      };

      Translator.prototype.resetContext = function() {
        return this.globalContext = {};
      };

      Translator.prototype.translateHash = function(hash, context) {
        var k, v;

        for (k in hash) {
          v = hash[k];
          if (typeof v === "string") {
            hash[k] = this.translateText(v, null, null, context);
          }
        }
        return hash;
      };

      Translator.prototype.translateText = function(text, num, formatting, context, defaultText) {
        var contextData, result;

        if (context == null) {
          context = this.globalContext;
        }
        if (this.data == null) {
          return this.useOriginalText(defaultText || text, num, formatting);
        }
        contextData = this.getContextData(this.data, context);
        if (contextData != null) {
          result = this.findTranslation(text, num, formatting, contextData.values, defaultText);
        }
        if (result == null) {
          result = this.findTranslation(text, num, formatting, this.data.values, defaultText);
        }
        if (result == null) {
          return this.useOriginalText(defaultText || text, num, formatting);
        }
        return result;
      };

      Translator.prototype.findTranslation = function(text, num, formatting, data, defaultText) {
        var a, b, c, d, e, result, triple, value, _i, _len;

        value = data[text];
        if (value == null) {
          return null;
        }
        if (typeof value === "object" && !Array.isArray(value)) {
          if (this.extension && typeof this.extension === "function") {
            value = this.extension(text, num, formatting, value);
            value = this.applyNumbers(value, num);
            return this.applyFormatting(value, num, formatting);
          } else {
            return this.useOriginalText(defaultText || text, num, formatting);
          }
        }
        if ((num == null) && !Array.isArray(value)) {
          if (typeof value === "string") {
            return this.applyFormatting(value, num, formatting);
          }
        } else {
          if (value instanceof Array || value.length) {
            a = num === null;
            for (_i = 0, _len = value.length; _i < _len; _i++) {
              triple = value[_i];
              b = triple[0] === null;
              c = triple[1] === null;
              d = num >= triple[0];
              e = num <= triple[1];
              if (a && b && c || !a && (!b && d && (c || e) || b && !c && e)) {
                result = this.applyFormatting(triple[2].replace("-%n", String(-num)), num, formatting);
                return this.applyFormatting(result.replace("%n", String(num)), num, formatting);
              }
            }
          }
        }
        return null;
      };

      Translator.prototype.applyNumbers = function(str, num) {
        str = str.replace("-%n", String(-num));
        str = str.replace("%n", String(num));
        return str;
      };

      Translator.prototype.getContextData = function(data, context) {
        var c, equal, key, value, _i, _len, _ref, _ref1;

        if (data.contexts == null) {
          return null;
        }
        _ref = data.contexts;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          c = _ref[_i];
          equal = true;
          _ref1 = c.matches;
          for (key in _ref1) {
            value = _ref1[key];
            equal = equal && value === context[key];
          }
          if (equal) {
            return c;
          }
        }
        return null;
      };

      Translator.prototype.useOriginalText = function(text, num, formatting) {
        if (num == null) {
          return this.applyFormatting(text, num, formatting);
        }
        return this.applyFormatting(text.replace("%n", String(num)), num, formatting);
      };

      Translator.prototype.applyFormatting = function(text, num, formatting) {
        var ind, regex;

        for (ind in formatting) {
          regex = new RegExp("%{" + ind + "}", "g");
          text = text.replace(regex, formatting[ind]);
        }
        return text;
      };

      return Translator;

    })();
    translator = new Translator();
    i18n = translator.translate;
    i18n.translator = translator;
    i18n.create = function(data) {
      var trans;

      trans = new Translator();
      if (data != null) {
        trans.add(data);
      }
      trans.translate.create = i18n.create;
      trans.translate.translator = trans;
      return trans.translate;
    };
    return i18n;
  });

}).call(commonjsGlobal);
}(i18n$1));

var i18n = i18n$1.exports;

const dict$a = {
    today: "Today",
    tomorrow: "Tomorrow",
    yesterday: "Yesterday",
    next: "Next",
    last: "Last",
    this: "This",
    in: "In",
    sunday: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    inminutes: "in %{timeDelta} minutes",
    inhours: "in %{timeDelta} hours",
    indays: "in %{timeDelta} days",
    inweeks: "in %{timeDelta} weeks",
    inmonths: "in %{timeDelta} months",
    daysago: "%{timeDelta} days ago",
    weeksago: "%{timeDelta} weeks ago",
    monthsago: "%{timeDelta} months ago",
    minutesago: "%{timeDelta} minutes ago",
    hoursago: "%{timeDelta} hours ago",
    time: "Time",
    now: "Now",
    plusminutes: "+%{timeDelta} minutes",
    minusminutes: "-%{timeDelta} minutes",
    plushour: "+%{timeDelta} hour",
    minushour: "-%{timeDelta} hour",
    minute: "Minute|Minutes|min|mins|m",
    hour: "Hour|Hours|h|hr|hrs|h",
    day: "Day|Days|d",
    week: "Week|Weeks|w",
    month: "Month|Months|M|mo",
    year: "Year|Years|y|yr|yrs",
    and: "And",
    at: "At",
    from: "From",
    to: "To|Until|Till",
    of: "of",
    first: "first",
};

const dict$9 = {
    today: "今日",
    tomorrow: "明日",
    yesterday: "昨日",
    next: "次|翌|来",
    last: "前|去|先|昨",
    this: "今|本|当",
    in: "あと|ato",
    sunday: "日曜日",
    monday: "月曜日",
    tuesday: "火曜日",
    wednesday: "水曜日",
    thursday: "木曜日",
    friday: "金曜日",
    saturday: "土曜日",
    inminutes: "%{timeDelta}分後",
    inhours: "%{timeDelta}時間後",
    indays: "%{timeDelta}日後",
    inweeks: "%{timeDelta}週間後",
    inmonths: "%{timeDelta}ヶ月後",
    daysago: "%{timeDelta}日前",
    weeksago: "%{timeDelta}週間前",
    monthsago: "%{timeDelta}ヶ月前",
    minutesago: "%{timeDelta}分前",
    hoursago: "%{timeDelta}時間前",
    time: "時間",
    now: "今",
    plusminutes: "+%{timeDelta} 分",
    minusminutes: "-%{timeDelta} 分",
    plushour: "+%{timeDelta} 時間",
    minushour: "-%{timeDelta} 時間",
    minute: "分|ふん|ぷん|fun",
    hour: "時間|じかん|時|じ",
    day: "日|にち",
    week: "週|週間|しゅう|しゅうかん",
    month: "月|ヶ月|かげつ|がつ",
    year: "年|ねん",
    of: "の",
    first: "最初|第一|初|最初の",
    and: "と|および",
    at: "に|で",
    from: "から|より",
    to: "まで|までに",
};

const dict$8 = {
    today: "Aujourd'hui",
    tomorrow: "Demain",
    yesterday: "Hier",
    next: "prochain|prochaine|suivant|suivante",
    last: "dernier|dernière|passé|passée",
    this: "ce|cette|cet",
    in: "dans",
    sunday: "Dimanche",
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    inminutes: "dans %{timeDelta} minutes",
    inhours: "dans %{timeDelta} heures",
    indays: "dans %{timeDelta} jours",
    inweeks: "dans %{timeDelta} semaines",
    inmonths: "dans %{timeDelta} mois",
    daysago: "il y a %{timeDelta} jours",
    weeksago: "il y a %{timeDelta} semaines",
    monthsago: "il y a %{timeDelta} mois",
    minutesago: "il y a %{timeDelta} minutes",
    hoursago: "il y a %{timeDelta} heures",
    time: "heure",
    now: "maintenant",
    plusminutes: "+%{timeDelta} minutes",
    minusminutes: "-%{timeDelta} minutes",
    plushour: "+%{timeDelta} heure",
    minushour: "-%{timeDelta} heure",
    minute: "minute|minutes|min|mins|m",
    hour: "heure|heures|h",
    day: "jour|jours|j|d",
    week: "semaine|semaines|s|w",
    month: "mois|M|mo",
    year: "année|années|an|ans|a|y",
    and: "et",
    at: "à|a",
    from: "de|depuis|du",
    to: "à|a|jusqu'à|jusqu'au|au",
    of: "du|de",
    first: "premier|première",
};

const dict$7 = {
    today: "Hoje",
    tomorrow: "Amanhã",
    yesterday: "Ontem",
    next: "próximo|próxima|seguinte",
    last: "último|última|passado|passada",
    this: "este|esta",
    in: "em|daqui a|daqui",
    sunday: "Domingo",
    monday: "Segunda-feira",
    tuesday: "Terça-feira",
    wednesday: "Quarta-feira",
    thursday: "Quinta-feira",
    friday: "Sexta-feira",
    saturday: "Sábado",
    inminutes: "em %{timeDelta} minutos",
    inhours: "em %{timeDelta} horas",
    indays: "em %{timeDelta} dias",
    inweeks: "em %{timeDelta} semanas",
    inmonths: "em %{timeDelta} meses",
    daysago: "há %{timeDelta} dias",
    weeksago: "há %{timeDelta} semanas",
    monthsago: "há %{timeDelta} meses",
    minutesago: "há %{timeDelta} minutos",
    hoursago: "há %{timeDelta} horas",
    agosuffix: "atrás|atras",
    time: "hora",
    now: "agora",
    plusminutes: "+%{timeDelta} minutos",
    minusminutes: "-%{timeDelta} minutos",
    plushour: "+%{timeDelta} hora",
    minushour: "-%{timeDelta} hora",
    minute: "minuto|minutos|min|mins|m",
    hour: "hora|horas|h",
    day: "dia|dias|d",
    week: "semana|semanas|s|w",
    month: "mês|meses|M|mo",
    year: "ano|anos|a|y",
    and: "e",
    at: "às|as|à|a",
    from: "de|desde",
    to: "até|ao|à",
    of: "do|da|de",
    first: "primeiro|primeira",
};

const dict$6 = {
    today: "Heute",
    tomorrow: "Morgen",
    yesterday: "Gestern",
    next: "nächster|nächste|nächstes|nächsten",
    last: "letzter|letzte|letztes",
    this: "dieser|diese|dieses",
    in: "in",
    sunday: "Sonntag",
    monday: "Montag",
    tuesday: "Dienstag",
    wednesday: "Mittwoch",
    thursday: "Donnerstag",
    friday: "Freitag",
    saturday: "Samstag",
    inminutes: "in %{timeDelta} Minuten",
    inhours: "in %{timeDelta} Stunden",
    indays: "in %{timeDelta} Tagen",
    inweeks: "in %{timeDelta} Wochen",
    inmonths: "in %{timeDelta} Monaten",
    daysago: "vor %{timeDelta} Tagen",
    weeksago: "vor %{timeDelta} Wochen",
    monthsago: "vor %{timeDelta} Monaten",
    minutesago: "vor %{timeDelta} Minuten",
    hoursago: "vor %{timeDelta} Stunden",
    time: "Zeit",
    now: "jetzt",
    plusminutes: "+%{timeDelta} Minuten",
    minusminutes: "-%{timeDelta} Minuten",
    plushour: "+%{timeDelta} Stunde",
    minushour: "-%{timeDelta} Stunde",
    minute: "Minute|Minuten|min|mins|m",
    hour: "Stunde|Stunden|Std|h",
    day: "Tag|Tage|d|t",
    week: "Woche|Wochen|w",
    month: "Monat|Monate|Monats|M|mo",
    year: "Jahr|Jahre|j|y",
    and: "und",
    at: "um",
    from: "von|ab",
    to: "bis|bis zum",
    of: "des|vom",
    first: "erster|erste|erstes",
};

const dict$5 = {
    today: "Vandaag",
    tomorrow: "Morgen",
    yesterday: "Gisteren",
    next: "volgende",
    last: "vorige|laatste",
    this: "deze|dit",
    in: "over",
    sunday: "zondag",
    monday: "maandag",
    tuesday: "dinsdag",
    wednesday: "woensdag",
    thursday: "donderdag",
    friday: "vrijdag",
    saturday: "zaterdag",
    inminutes: "over %{timeDelta} minuten",
    inhours: "over %{timeDelta} uren",
    indays: "over %{timeDelta} dagen",
    inweeks: "over %{timeDelta} weken",
    inmonths: "over %{timeDelta} maanden",
    daysago: "%{timeDelta} dagen geleden",
    weeksago: "%{timeDelta} weken geleden",
    monthsago: "%{timeDelta} maanden geleden",
    minutesago: "%{timeDelta} minuten geleden",
    hoursago: "%{timeDelta} uren geleden",
    time: "tijd",
    now: "nu",
    plusminutes: "+%{timeDelta} minuten",
    minusminutes: "-%{timeDelta} minuten",
    plushour: "+%{timeDelta} uur",
    minushour: "-%{timeDelta} uur",
    minute: "minuut|minuten|min|mins|m",
    hour: "uur|uren|u|h",
    day: "dag|dagen|d",
    week: "week|weken|w",
    month: "maand|maanden|M|mo",
    year: "jaar|jaren|j|y",
    and: "en",
    at: "om",
    from: "van|vanaf",
    to: "tot|tot en met",
    of: "van",
    first: "eerste",
};

const dict$4 = {
    today: "Hoy",
    tomorrow: "Mañana",
    yesterday: "Ayer",
    next: "próximo|próxima|siguiente",
    last: "último|última|pasado|pasada",
    this: "este|esta",
    in: "en|dentro de",
    sunday: "Domingo",
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    inminutes: "en %{timeDelta} minutos",
    inhours: "en %{timeDelta} horas",
    indays: "en %{timeDelta} días",
    inweeks: "en %{timeDelta} semanas",
    inmonths: "en %{timeDelta} meses",
    daysago: "hace %{timeDelta} días",
    weeksago: "hace %{timeDelta} semanas",
    monthsago: "hace %{timeDelta} meses",
    minutesago: "hace %{timeDelta} minutos",
    hoursago: "hace %{timeDelta} horas",
    agosuffix: "atrás|atras",
    time: "hora",
    now: "ahora",
    plusminutes: "+%{timeDelta} minutos",
    minusminutes: "-%{timeDelta} minutos",
    plushour: "+%{timeDelta} hora",
    minushour: "-%{timeDelta} hora",
    minute: "minuto|minutos|min|mins|m",
    hour: "hora|horas|h",
    day: "día|días|d",
    week: "semana|semanas|s|w",
    month: "mes|meses|M|mo",
    year: "año|años|a|y",
    and: "y",
    at: "a las|a la|a|en",
    from: "de|desde",
    to: "a|hasta",
    of: "de|del",
    first: "primer|primera",
};

const dict$3 = {
    today: "Oggi",
    tomorrow: "Domani",
    yesterday: "Ieri",
    next: "prossimo|prossima|seguente",
    last: "ultimo|ultima|scorso|scorsa|passato|passata",
    this: "questo|questa",
    in: "in|tra",
    sunday: "Domenica",
    monday: "Lunedì",
    tuesday: "Martedì",
    wednesday: "Mercoledì",
    thursday: "Giovedì",
    friday: "Venerdì",
    saturday: "Sabato",
    inminutes: "tra %{timeDelta} minuti",
    inhours: "tra %{timeDelta} ore",
    indays: "tra %{timeDelta} giorni",
    inweeks: "tra %{timeDelta} settimane",
    inmonths: "tra %{timeDelta} mesi",
    daysago: "%{timeDelta} giorni fa",
    weeksago: "%{timeDelta} settimane fa",
    monthsago: "%{timeDelta} mesi fa",
    minutesago: "%{timeDelta} minuti fa",
    hoursago: "%{timeDelta} ore fa",
    time: "ora",
    now: "adesso|ora",
    plusminutes: "+%{timeDelta} minuti",
    minusminutes: "-%{timeDelta} minuti",
    plushour: "+%{timeDelta} ora",
    minushour: "-%{timeDelta} ora",
    minute: "minuto|minuti|min|mins|m",
    hour: "ora|ore|h",
    day: "giorno|giorni|g|d",
    week: "settimana|settimane|s|w",
    month: "mese|mesi|M|mo",
    year: "anno|anni|a|y",
    and: "e",
    at: "alle|alla|a",
    from: "da|dal|dalla",
    to: "a|fino a|fino al|fino alla",
    of: "del|della|di",
    first: "primo|prima",
};

const dict$2 = {
    today: "Сегодня",
    tomorrow: "Завтра",
    yesterday: "Вчера",
    next: "следующий|следующая|следующее|следующие",
    last: "последний|последняя|последнее|последние|прошлый|прошлая|прошлое|прошлые",
    this: "этот|эта|это|эти",
    in: "через",
    sunday: "Воскресенье|Воскресенья",
    monday: "Понедельник|Понедельника",
    tuesday: "Вторник|Вторника",
    wednesday: "Среда|Среды",
    thursday: "Четверг|Четверга",
    friday: "Пятница|Пятницы",
    saturday: "Суббота|Субботы",
    inminutes: "через %{timeDelta} минут|минуту|минуты",
    inhours: "через %{timeDelta} час|часа|часов",
    indays: "через %{timeDelta} день|дня|дней",
    inweeks: "через %{timeDelta} неделю|недели|недель",
    inmonths: "через %{timeDelta} месяц|месяца|месяцев",
    daysago: "%{timeDelta} день|дня|дней назад",
    weeksago: "%{timeDelta} неделю|недели|недель назад",
    monthsago: "%{timeDelta} месяц|месяца|месяцев назад",
    minutesago: "%{timeDelta} минут|минуту|минуты назад",
    hoursago: "%{timeDelta} час|часа|часов назад",
    time: "время",
    now: "сейчас",
    plusminutes: "+%{timeDelta} минут|минуту|минуты",
    minusminutes: "-%{timeDelta} минут|минуту|минуты",
    plushour: "+%{timeDelta} час|часа|часов",
    minushour: "-%{timeDelta} час|часа|часов",
    minute: "минута|минуты|минут|мин|м",
    hour: "час|часа|часов|ч",
    day: "день|дня|дней|д",
    week: "неделя|недели|недель|н|нед",
    month: "месяц|месяца|месяцев|мес|м",
    year: "год|года|лет|г|л",
    and: "и",
    at: "в",
    from: "с|от",
    to: "до|к",
    of: "из|от",
    first: "первый|первая|первое|первые",
};

const dict$1 = {
    today: "Сьогодні",
    tomorrow: "Завтра",
    yesterday: "Вчора",
    next: "наступний|наступна|наступне|наступні",
    last: "останній|остання|останнє|останні|минулий|минула|минуле|минулі",
    this: "цей|ця|це|ці",
    in: "через",
    sunday: "Неділя|Неділі",
    monday: "Понеділок|Понеділка",
    tuesday: "Вівторок|Вівторка",
    wednesday: "Середа|Середи",
    thursday: "Четвер|Четверга",
    friday: "П'ятниця|П'ятниці",
    saturday: "Субота|Суботи",
    inminutes: "через %{timeDelta} хвилину|хвилини|хвилин",
    inhours: "через %{timeDelta} годину|години|годин",
    indays: "через %{timeDelta} день|дні|днів",
    inweeks: "через %{timeDelta} тиждень|тижні|тижнів",
    inmonths: "через %{timeDelta} місяць|місяці|місяців",
    daysago: "%{timeDelta} день|дні|днів тому",
    weeksago: "%{timeDelta} тиждень|тижні|тижнів тому",
    monthsago: "%{timeDelta} місяць|місяці|місяців тому",
    minutesago: "%{timeDelta} хвилину|хвилини|хвилин тому",
    hoursago: "%{timeDelta} годину|години|годин тому",
    time: "час",
    now: "зараз",
    plusminutes: "+%{timeDelta} хвилину|хвилини|хвилин",
    minusminutes: "-%{timeDelta} хвилину|хвилини|хвилин",
    plushour: "+%{timeDelta} годину|години|годин",
    minushour: "-%{timeDelta} годину|години|годин",
    minute: "хвилина|хвилини|хвилин|хв|м",
    hour: "година|години|годин|год|г",
    day: "день|дні|днів|д",
    week: "тиждень|тижні|тижнів|т|тиж",
    month: "місяць|місяці|місяців|міс|м",
    year: "рік|роки|років|р",
    and: "і",
    at: "о",
    from: "з|від",
    to: "до|к",
    of: "з|від",
    first: "перший|перша|перше|перші",
};

const dict = {
    today: "今天",
    tomorrow: "明天",
    yesterday: "昨天",
    // Formal ("下一個"/"下一个") and short prefix ("下", e.g. "下星期一"/"下周一") forms,
    // covering both Traditional and Simplified script.
    next: "下一個|下一个|下",
    // "最後/最后" ("last" in general), "上一個/上一个" ("previous"), and short "上"
    // (e.g. "上星期一"/"上周一").
    last: "最後|最后|上一個|上一个|上",
    // "這個/这个" (formal) and short "這/这" (e.g. "這星期一"/"这周一").
    this: "這個|这个|這|这",
    in: "在",
    // "禮拜/礼拜" (colloquial, originally "worship day") is also extremely common
    // for weekdays, e.g. "禮拜一"/"礼拜一" for Monday.
    sunday: "星期日|周日|週日|星期天|禮拜日|礼拜日|禮拜天|礼拜天",
    monday: "星期一|周一|週一|禮拜一|礼拜一",
    tuesday: "星期二|周二|週二|禮拜二|礼拜二",
    wednesday: "星期三|周三|週三|禮拜三|礼拜三",
    thursday: "星期四|周四|週四|禮拜四|礼拜四",
    friday: "星期五|周五|週五|禮拜五|礼拜五",
    saturday: "星期六|周六|週六|禮拜六|礼拜六",
    inminutes: "%{timeDelta}分鐘後",
    inhours: "%{timeDelta}小時後",
    indays: "%{timeDelta}天後",
    inweeks: "%{timeDelta}週後",
    inmonths: "%{timeDelta}個月後",
    daysago: "%{timeDelta}天前",
    weeksago: "%{timeDelta}週前",
    monthsago: "%{timeDelta}個月前",
    minutesago: "%{timeDelta}分鐘前",
    hoursago: "%{timeDelta}小時前",
    // Not used for display, only for matching "N unit" + this marker (e.g.
    // "2天後"/"2天后" = "2 days" + "後"/"后" = "2 days later"). Kept separate from
    // the %{timeDelta} templates above (which are also used verbatim in
    // autosuggest labels and don't support "|" alternatives the same way).
    // "之後/之后" and "以後/以后" are equally common alternatives to bare "後/后"
    // (e.g. "2天之後", "3個月以後").
    later: "後|后|之後|之后|以後|以后",
    time: "時間|时间",
    now: "現在|现在",
    plusminutes: "+%{timeDelta}分鐘",
    minusminutes: "-%{timeDelta}分鐘",
    plushour: "+%{timeDelta}小時",
    minushour: "-%{timeDelta}小時",
    minute: "分鐘|分钟|分",
    hour: "小時|小时|時|时",
    day: "天|日",
    week: "週|周|星期|個星期|个星期|禮拜|礼拜|個禮拜|个礼拜",
    month: "月|個月|个月",
    year: "年",
    and: "和",
    at: "在",
    from: "從|从|自",
    to: "到|至",
    of: "的",
    first: "第一|第一個|第一个",
};

const notFoundDefault = "NOTFOUND";
// Cache des traducteurs pour éviter de les recréer à chaque appel
// Performance optimization: translators are created once and reused
const translatorCache = {};
// Map des modules de langue pour faciliter l'accès
const languageModules = {
    en: dict$a,
    ja: dict$9,
    fr: dict$8,
    pt: dict$7,
    de: dict$6,
    nl: dict$5,
    es: dict$4,
    it: dict$3,
    ru: dict$2,
    uk: dict$1,
    'zh.hant': dict,
};
/**
 * Obtient un traducteur pour une langue donnée (avec cache)
 * Gets a translator for a given language (cached)
 */
function getTranslator(lang) {
    if (!translatorCache[lang]) {
        const languageModule = languageModules[lang];
        if (languageModule) {
            // roddeh-i18n's shipped types declare the 2nd call argument as
            // `number | FormattingContext`, but its actual runtime API (used
            // throughout this file) also accepts a plain string default value --
            // that overload just isn't reflected in its .d.ts, hence the cast.
            translatorCache[lang] = i18n.create({ values: languageModule });
        }
        else {
            // Fallback vers l'anglais si la langue n'est pas trouvée
            if (!translatorCache['en']) {
                translatorCache['en'] = i18n.create({ values: dict$a });
            }
            return translatorCache['en'];
        }
    }
    return translatorCache[lang];
}
function t(key, lang, variables) {
    const langTranslator = getTranslator(lang);
    const translation = langTranslator(key, notFoundDefault, variables);
    if (translation === notFoundDefault) {
        const enTranslator = getTranslator("en");
        return enTranslator(key, notFoundDefault, variables);
    }
    return translation;
}

/**
 * Collects and caches translated words across multiple languages, and builds
 * regex alternations from them.
 *
 * Every supported language can define several variants for the same concept
 * (e.g. French "next": "prochain|prochaine|suivant|suivante"), and every
 * feature of the parser needs to gather those variants across *all* active
 * languages before building a regex out of them. This class centralizes that
 * "look up a translation key in every active language, split multi-variant
 * entries on '|', trim, dedupe" pattern, which used to be repeated inline
 * roughly fifteen times throughout NLDParser (and, less exhaustively, in
 * ContextAnalyzer and utils.ts).
 */
class TranslationCollector {
    constructor(languages) {
        this.languages = languages;
        this.translationCache = new Map();
    }
    /**
     * Gets a translation with caching for performance.
     */
    translate(key, lang) {
        const cacheKey = `${lang}:${key}`;
        const cached = this.translationCache.get(cacheKey);
        if (cached !== undefined) {
            return cached;
        }
        const translated = t(key, lang);
        this.translationCache.set(cacheKey, translated);
        return translated;
    }
    /**
     * Collects every variant of `key`'s translation across all active languages,
     * splitting multi-variant entries (e.g. "a|b|c") on "|", trimming, and
     * de-duplicating. Entries that aren't found for a given language are skipped.
     *
     * @param key - Translation key (e.g. "next", "monday", "indays")
     * @param options.lowercase - Lowercase each variant (default: false)
     */
    collectWords(key, options = {}) {
        const words = [];
        for (const lang of this.languages) {
            const translation = this.translate(key, lang);
            if (!translation || translation === "NOTFOUND")
                continue;
            for (const variant of translation.split("|")) {
                const trimmed = variant.trim();
                // No current language dictionary entry has an empty "||" segment or
                // a trailing/leading "|", so this guard can't actually be false with
                // real data -- kept in case a future dictionary entry is malformed.
                if (trimmed) {
                    words.push(options.lowercase ? trimmed.toLowerCase() : trimmed);
                }
            }
        }
        return [...new Set(words)];
    }
    /**
     * Builds a regex alternation ("a|b|c") from a list of words, escaping regex
     * special characters.
     *
     * Longest words are sorted first: otherwise a shorter word that is a prefix
     * of a longer one (e.g. French "prochain" vs "prochaine") can match first
     * and leave the remaining letters to be mis-captured by whatever comes next
     * in the pattern.
     */
    buildAlternation(words) {
        const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return [...new Set(words)]
            .sort((a, b) => b.length - a.length)
            .map(escapeRegex)
            .join('|');
    }
    /**
     * Convenience: collectWords(key) followed by buildAlternation() in one call.
     */
    buildAlternationFor(key, options = {}) {
        return this.buildAlternation(this.collectWords(key, options));
    }
}

const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];
function getWordBoundaries(editor) {
    const cursor = editor.getCursor();
    const pos = editor.posToOffset(cursor);
    const editorWithCM = editor;
    // wordAt() returns null when the cursor isn't inside/adjacent to a word
    // (empty line, whitespace, punctuation-only text) -- fall back to a
    // zero-width range at the cursor instead of crashing.
    const word = editorWithCM.cm?.state.wordAt(pos);
    if (!word) {
        return { from: cursor, to: cursor };
    }
    const wordStart = editor.offsetToPos(word.from);
    const wordEnd = editor.offsetToPos(word.to);
    return {
        from: wordStart,
        to: wordEnd,
    };
}
function getSelectedText(editor) {
    if (editor.somethingSelected()) {
        return editor.getSelection();
    }
    else {
        const wordBoundaries = getWordBoundaries(editor);
        // Select the word at cursor position to enable text replacement
        // This is necessary for the date parsing commands to work correctly
        editor.setSelection(wordBoundaries.from, wordBoundaries.to);
        return editor.getSelection();
    }
}
function adjustCursor(editor, cursor, newStr, oldStr) {
    const cursorOffset = newStr.length - oldStr.length;
    editor.setCursor({
        line: cursor.line,
        ch: cursor.ch + cursorOffset,
    });
}
function parseTruthy(flag) {
    return ["y", "yes", "1", "t", "true"].indexOf(flag.toLowerCase()) >= 0;
}
/**
 * Valide un format Moment.js et retourne un résultat avec prévisualisation
 * @param format - Le format Moment.js à valider
 * @returns Un objet contenant valid (booléen), error (optionnel), preview (optionnel)
 */
function validateMomentFormat(format) {
    if (!format || typeof format !== 'string') {
        return { valid: false, error: "Le format ne peut pas être vide" };
    }
    // Limiter la longueur du format pour éviter les attaques
    const MAX_FORMAT_LENGTH = 100;
    if (format.length > MAX_FORMAT_LENGTH) {
        return { valid: false, error: `Le format ne peut pas dépasser ${MAX_FORMAT_LENGTH} caractères` };
    }
    try {
        const testDate = moment();
        const formatted = testDate.format(format);
        // Vérifier que le format produit quelque chose de valide
        if (!formatted || formatted === format) {
            return { valid: false, error: "Format invalide ou non reconnu" };
        }
        // Vérifier que le format ne contient pas de caractères dangereux
        // Moment.js utilise des caractères spéciaux, mais on veut éviter les injections
        // Les formats Moment.js valides contiennent principalement des lettres, chiffres et caractères de ponctuation
        const dangerousPattern = /[<>"'`]/;
        if (dangerousPattern.test(format)) {
            return { valid: false, error: "Le format contient des caractères non autorisés" };
        }
        return { valid: true, preview: formatted };
    }
    catch (error) {
        return { valid: false, error: error instanceof Error ? error.message : "Erreur lors de la validation du format" };
    }
}
/**
 * Sanitize et valide une entrée utilisateur pour éviter les injections
 * @param input - L'entrée à sanitizer
 * @param maxLength - Longueur maximale autorisée (défaut: 200)
 * @returns L'entrée sanitizée ou null si invalide
 */
function sanitizeInput(input, maxLength = 200) {
    if (!input || typeof input !== 'string') {
        return null;
    }
    // Limiter la longueur
    const trimmed = input.trim().substring(0, maxLength);
    if (trimmed.length === 0) {
        return null;
    }
    // Rejeter les caractères de contrôle et les caractères sans usage légitime dans une
    // expression de date en langage naturel (ex: "<", ">", "`"). On n'utilise pas de whitelist
    // de scripts car les dates en langage naturel utilisent des lettres de toutes les langues
    // supportées (latin, cyrillique, japonais, chinois...), ainsi que l'apostrophe
    // (ex: "Aujourd'hui" en français, "П'ятниці" en ukrainien).
    // eslint-disable-next-line no-control-regex -- intentional: this range is the actual sanitization target, not a typo.
    const invalidCharsPattern = /[<>`\u0000-\u001F\u007F-\u009F]/;
    if (invalidCharsPattern.test(trimmed)) {
        return null;
    }
    return trimmed;
}
/**
 * Valide un paramètre URI pour éviter les injections
 * @param param - Le paramètre à valider
 * @param maxLength - Longueur maximale autorisée (défaut: 100)
 * @returns Le paramètre validé ou null si invalide
 */
function validateUriParam(param, maxLength = 100) {
    return sanitizeInput(param, maxLength);
}
function getWeekNumber(dayOfWeek) {
    return daysOfWeek.indexOf(dayOfWeek);
}
function getLocaleWeekStart() {
    const localeData = moment.localeData();
    const startOfWeek = localeData._week?.dow ?? 0;
    return daysOfWeek[startOfWeek];
}
function generateMarkdownLink(app, subpath, alias) {
    const vaultWithConfig = app.vault;
    const useMarkdownLinks = vaultWithConfig.getConfig("useMarkdownLinks");
    const path = require$$0.normalizePath(subpath);
    if (useMarkdownLinks) {
        if (alias) {
            return `[${alias}](${path.replace(/ /g, "%20")})`;
        }
        else {
            return `[${subpath}](${path})`;
        }
    }
    else {
        if (alias) {
            return `[[${path}|${alias}]]`;
        }
        else {
            return `[[${path}]]`;
        }
    }
}
async function getOrCreateDailyNote(date) {
    // Borrowed from the Slated plugin:
    // https://github.com/tgrosinger/slated-obsidian/blob/main/src/vault.ts#L17
    const desiredNote = getDailyNote_1(date, getAllDailyNotes_1());
    if (desiredNote) {
        return desiredNote;
    }
    return createDailyNote_1(date);
}
// The Array/Map branches below are unreachable with this file's only caller
// (matchAnyPattern() is only ever invoked with ORDINAL_WORD_DICTIONARY, a
// plain object) -- kept because they're copied verbatim from chrono-node's
// more generically-used original, not because they're currently exercised.
function extractTerms$1(dictionary) {
    let keys;
    if (dictionary instanceof Array) {
        keys = [...dictionary];
    }
    else if (dictionary instanceof Map) {
        keys = Array.from(dictionary.keys());
    }
    else {
        keys = Object.keys(dictionary);
    }
    return keys;
}
function matchAnyPattern$1(dictionary) {
    const joinedTerms = extractTerms$1(dictionary)
        .sort((a, b) => b.length - a.length)
        .join("|")
        .replace(/\./g, "\\.");
    return `(?:${joinedTerms})`;
}
const ORDINAL_WORD_DICTIONARY$5 = {
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5,
    sixth: 6,
    seventh: 7,
    eighth: 8,
    ninth: 9,
    tenth: 10,
    eleventh: 11,
    twelfth: 12,
    thirteenth: 13,
    fourteenth: 14,
    fifteenth: 15,
    sixteenth: 16,
    seventeenth: 17,
    eighteenth: 18,
    nineteenth: 19,
    twentieth: 20,
    "twenty first": 21,
    "twenty-first": 21,
    "twenty second": 22,
    "twenty-second": 22,
    "twenty third": 23,
    "twenty-third": 23,
    "twenty fourth": 24,
    "twenty-fourth": 24,
    "twenty fifth": 25,
    "twenty-fifth": 25,
    "twenty sixth": 26,
    "twenty-sixth": 26,
    "twenty seventh": 27,
    "twenty-seventh": 27,
    "twenty eighth": 28,
    "twenty-eighth": 28,
    "twenty ninth": 29,
    "twenty-ninth": 29,
    thirtieth: 30,
    "thirty first": 31,
    "thirty-first": 31,
};
const ORDINAL_NUMBER_PATTERN$6 = `(?:${matchAnyPattern$1(ORDINAL_WORD_DICTIONARY$5)}|[0-9]{1,2}(?:st|nd|rd|th|ème|ème|er|e|er|e|\\.)?)`;
function parseOrdinalNumberPattern$6(match) {
    let num = match.toLowerCase();
    if (ORDINAL_WORD_DICTIONARY$5[num] !== undefined) {
        return ORDINAL_WORD_DICTIONARY$5[num];
    }
    // Remove ordinal suffixes: st, nd, rd, th, ème, er, e, and trailing dot
    num = num.replace(/(?:st|nd|rd|th|ème|er|e|\.)$/i, "");
    return parseInt(num);
}
/**
 * Détermine si une expression temporelle relative courte (minutes/heures) devrait omettre la date
 * car elle reste dans la même journée (aujourd'hui)
 * @param text - Le texte de l'expression temporelle (ex: "dans 15 min", "in 2 hours", "30分鐘後")
 * @param languages - Les langues supportées pour détecter les patterns
 * @returns true si c'est une expression relative courte qui reste aujourd'hui
 */
function shouldOmitDateForShortRelative(text, languages) {
    const lowerText = text.toLowerCase().trim();
    const tc = new TranslationCollector(languages);
    const inPattern = tc.buildAlternationFor("in");
    const minutePattern = tc.buildAlternationFor("minute");
    const hourPattern = tc.buildAlternationFor("hour");
    // Suffix-style languages (e.g. Chinese "30分鐘後") mark "later" instead of
    // prefixing with "in"; see translation-collector.ts / parser.ts for why this
    // is a separate key from the day/hour/minute word lists.
    const laterPattern = tc.buildAlternationFor("later");
    const shortRelativePatterns = [];
    // Every one of the 11 supported languages defines minute/hour together
    // with in/later, so the nested `if (minutePattern)`/`if (hourPattern)`
    // checks below can't actually be false while their enclosing `if` is true
    // -- no combination of real (or unknown) language codes produces "in" or
    // "later" without also producing "minute" and "hour". Kept as a guard in
    // case a future language module is authored incompletely.
    // Prefix style: "in X minutes"/"dans X min"/...
    if (inPattern) {
        if (minutePattern) {
            shortRelativePatterns.push(new RegExp(`^(?:${inPattern})\\s+\\d+\\s+(?:${minutePattern})`, 'i'));
        }
        if (hourPattern) {
            shortRelativePatterns.push(new RegExp(`^(?:${inPattern})\\s+\\d+\\s+(?:${hourPattern})`, 'i'));
        }
    }
    // Suffix style: "X minutes" + "later" marker, e.g. Chinese "30分鐘後"
    if (laterPattern) {
        if (minutePattern) {
            shortRelativePatterns.push(new RegExp(`^\\d+\\s*(?:${minutePattern})\\s*(?:${laterPattern})$`, 'i'));
        }
        if (hourPattern) {
            shortRelativePatterns.push(new RegExp(`^\\d+\\s*(?:${hourPattern})\\s*(?:${laterPattern})$`, 'i'));
        }
    }
    return shortRelativePatterns.some(pattern => pattern.test(lowerText));
}
/**
 * Obtient l'éditeur actif de manière flexible, compatible avec QuickAdd et autres plugins
 * Essaie plusieurs méthodes pour trouver l'éditeur actif
 * @param workspace - L'instance Workspace d'Obsidian
 * @returns L'éditeur actif ou null si aucun n'est trouvé
 */
function getActiveEditor(workspace) {
    // Méthode 1: Utiliser activeEditor si disponible (Obsidian récent)
    const workspaceWithActiveEditor = workspace;
    if (workspaceWithActiveEditor.activeEditor?.editor) {
        return workspaceWithActiveEditor.activeEditor.editor;
    }
    // Méthode 2: Utiliser getActiveViewOfType(MarkdownView) (méthode standard)
    const activeView = workspace.getActiveViewOfType(require$$0.MarkdownView);
    if (activeView?.editor) {
        return activeView.editor;
    }
    // Méthode 3: Chercher dans tous les leafs pour trouver un éditeur actif
    // Utile pour QuickAdd et autres plugins qui créent des éditeurs personnalisés
    const activeLeaf = workspace.getMostRecentLeaf();
    if (activeLeaf) {
        const view = activeLeaf.view;
        // Vérifier si la vue a un éditeur
        const viewWithEditor = view;
        if (viewWithEditor.editor) {
            return viewWithEditor.editor;
        }
    }
    // Méthodes 4 et 5: Parcourir tous les leafs markdown, en préférant celui qui
    // a le focus, sinon le premier éditeur disponible en dernier recours.
    let firstAvailableEditor = null;
    for (const leaf of workspace.getLeavesOfType("markdown")) {
        const view = leaf.view;
        if (view instanceof require$$0.MarkdownView && view.editor) {
            const editorEl = view.editor.cm;
            if (editorEl?.hasFocus?.()) {
                return view.editor;
            }
            firstAvailableEditor = firstAvailableEditor ?? view.editor;
        }
    }
    return firstAvailableEditor;
}
// Extracts a readable message from a caught value of unknown type. Plain
// `String(e)` is unsafe for arbitrary unknown values (a thrown plain object
// would stringify to the useless "[object Object]"), but blanket
// `JSON.stringify(e)` isn't right either -- it would wrap thrown strings in
// literal quotes, changing what already-thrown-string call sites log.
function describeError(e) {
    if (e instanceof Error)
        return e.message;
    if (typeof e === "string")
        return e;
    return JSON.stringify(e);
}

class HistoryManagerModal extends require$$0.Modal {
    constructor(app, plugin) {
        super(app);
        // Two-click confirmation for "Clear all": first click arms it, second
        // click (on the same render) actually clears -- avoids wiping the whole
        // history from a single accidental click, without the complexity of a
        // separate confirmation modal or a timeout to reset the arming state.
        this.clearAllArmed = false;
        this.plugin = plugin;
    }
    onOpen() {
        this.clearAllArmed = false;
        this.render();
    }
    onClose() {
        this.contentEl.empty();
    }
    async render() {
        // Fetched before touching the DOM so the modal doesn't flash an
        // empty/header-only state while the (async) history load is in flight.
        const entries = await this.plugin.historyManager.getEntriesForManagement();
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass("nld-history-manager-modal");
        contentEl.createEl("h2", { text: "Manage suggestion history" });
        if (entries.length === 0) {
            contentEl.createEl("p", { text: "No history yet. Suggestions you select from the autosuggest popup will appear here." });
            return;
        }
        new require$$0.Setting(contentEl)
            .setName("Clear all history")
            .setDesc(this.clearAllArmed
            ? "Click again to confirm -- this cannot be undone."
            : `Remove all ${entries.length} entries.`)
            .addButton((button) => {
            button.setButtonText(this.clearAllArmed ? "Click again to confirm" : "Clear all");
            if (this.clearAllArmed) {
                button.setWarning();
            }
            button.onClick(async () => {
                if (!this.clearAllArmed) {
                    this.clearAllArmed = true;
                    await this.render();
                    return;
                }
                await this.plugin.historyManager.clearHistory();
                this.clearAllArmed = false;
                await this.render();
            });
        });
        for (const entry of entries) {
            const lastUsedText = moment(entry.lastUsed).fromNow();
            const timesText = entry.count === 1 ? "1 time" : `${entry.count} times`;
            new require$$0.Setting(contentEl)
                .setName(entry.display)
                .setDesc(`Used ${timesText} · last used ${lastUsedText}`)
                .addButton((button) => {
                button
                    .setIcon("trash")
                    .setTooltip("Remove this entry")
                    .onClick(async () => {
                    // Deleting a single entry is a different action from "Clear
                    // all" -- don't leave that button armed from an earlier click,
                    // where a later, unrelated "Clear all" click would then wipe
                    // everything without the user re-confirming that specific intent.
                    this.clearAllArmed = false;
                    await this.plugin.historyManager.removeEntry(entry.key);
                    await this.render();
                });
            });
        }
    }
}

const DEFAULT_SETTINGS = {
    autosuggestToggleLink: true,
    autocompleteTriggerPhrase: "@",
    isAutosuggestEnabled: true,
    format: "YYYY-MM-DD",
    timeFormat: "HH:mm",
    separator: " ",
    weekStart: "locale-default",
    languages: ["en"],
    english: true,
    japanese: false,
    french: false,
    german: false,
    portuguese: false,
    dutch: false,
    spanish: false,
    italian: false,
    russian: false,
    ukrainian: false,
    chinese: false,
    modalToggleTime: false,
    modalToggleLink: false,
    modalMomentFormat: "YYYY-MM-DD HH:mm",
    // Smart suggestions
    enableSmartSuggestions: true,
    enableHistorySuggestions: true,
    enableContextSuggestions: true,
    // Smart date formatting
    omitDateForShortRelative: true,
};
const weekdays = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];
class NLDSettingsTab extends require$$0.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        const localizedWeekdays = moment.weekdays();
        const localeWeekStart = getLocaleWeekStart();
        containerEl.empty();
        new require$$0.Setting(containerEl).setHeading().setName("Natural language dates");
        new require$$0.Setting(containerEl).setHeading().setName("Parser settings");
        const dateFormatSetting = new require$$0.Setting(containerEl)
            .setName("Date format")
            .setDesc("Output format for parsed dates")
            .addMomentFormat((text) => text
            .setDefaultFormat("YYYY-MM-DD")
            .setValue(this.plugin.settings.format)
            .onChange(async (value) => {
            const validated = validateMomentFormat(value || "YYYY-MM-DD");
            if (validated.valid) {
                this.plugin.settings.format = value || "YYYY-MM-DD";
                await this.plugin.saveSettings();
                // Mettre à jour la description avec la prévisualisation.
                // validateMomentFormat()'s contract guarantees preview is set
                // whenever valid is true, so the ": ''" fallback below is
                // unreachable with real data.
                dateFormatSetting.setDesc(`Output format for parsed dates${validated.preview ? ` (Preview: ${validated.preview})` : ""}`);
            }
            else {
                // Afficher l'erreur dans la description. Every invalid-format
                // return from validateMomentFormat() always sets error, so the
                // "Format invalide" fallback below is unreachable with real data.
                dateFormatSetting.setDesc(`Output format for parsed dates - ⚠️ ${validated.error || "Format invalide"}`);
                // Ne pas sauvegarder le format invalide, restaurer le précédent
                text.setValue(this.plugin.settings.format);
            }
        }));
        // Afficher la prévisualisation initiale
        const initialValidation = validateMomentFormat(this.plugin.settings.format);
        if (initialValidation.valid && initialValidation.preview) {
            dateFormatSetting.setDesc(`Output format for parsed dates (Preview: ${initialValidation.preview})`);
        }
        new require$$0.Setting(containerEl)
            .setName("Week starts on")
            .setDesc("Which day to consider as the start of the week")
            .addDropdown((dropdown) => {
            dropdown.addOption("locale-default", `Locale default (${String(localeWeekStart)})`);
            localizedWeekdays.forEach((day, i) => {
                dropdown.addOption(weekdays[i], day);
            });
            dropdown.setValue(this.plugin.settings.weekStart.toLowerCase());
            dropdown.onChange(async (value) => {
                this.plugin.settings.weekStart = value;
                await this.plugin.saveSettings();
            });
        });
        new require$$0.Setting(containerEl).setHeading().setName("Language settings");
        this.createLanguageSetting(containerEl, "English", "english", "en");
        this.createLanguageSetting(containerEl, "Japanese", "japanese", "ja");
        this.createLanguageSetting(containerEl, "French", "french", "fr");
        this.createLanguageSetting(containerEl, "German", "german", "de", "partially supported");
        this.createLanguageSetting(containerEl, "Portuguese", "portuguese", "pt", "partially supported");
        this.createLanguageSetting(containerEl, "Dutch", "dutch", "nl", "under development");
        this.createLanguageSetting(containerEl, "Spanish", "spanish", "es");
        this.createLanguageSetting(containerEl, "Italian", "italian", "it");
        this.createLanguageSetting(containerEl, "Russian", "russian", "ru");
        this.createLanguageSetting(containerEl, "Ukrainian", "ukrainian", "uk");
        this.createLanguageSetting(containerEl, "Chinese (Traditional)", "chinese", "zh.hant", "partially supported");
        new require$$0.Setting(containerEl).setHeading().setName("Hotkey formatting settings");
        const timeFormatSetting = new require$$0.Setting(containerEl)
            .setName("Time format")
            .setDesc("Format for the hotkeys that include the current time")
            .addMomentFormat((text) => text
            .setDefaultFormat("HH:mm")
            .setValue(this.plugin.settings.timeFormat)
            .onChange(async (value) => {
            const validated = validateMomentFormat(value || "HH:mm");
            if (validated.valid) {
                this.plugin.settings.timeFormat = value || "HH:mm";
                await this.plugin.saveSettings();
                // Mettre à jour la description avec la prévisualisation (see
                // the date-format setting above: the ": ''" fallback here is
                // similarly unreachable given validateMomentFormat()'s contract).
                timeFormatSetting.setDesc(`Format for the hotkeys that include the current time${validated.preview ? ` (Preview: ${validated.preview})` : ""}`);
            }
            else {
                // Afficher l'erreur dans la description (unreachable fallback,
                // same reasoning as the date-format setting above).
                timeFormatSetting.setDesc(`Format for the hotkeys that include the current time - ⚠️ ${validated.error || "Format invalide"}`);
                // Ne pas sauvegarder le format invalide, restaurer le précédent
                text.setValue(this.plugin.settings.timeFormat);
            }
        }));
        // Afficher la prévisualisation initiale
        const initialTimeValidation = validateMomentFormat(this.plugin.settings.timeFormat);
        if (initialTimeValidation.valid && initialTimeValidation.preview) {
            timeFormatSetting.setDesc(`Format for the hotkeys that include the current time (Preview: ${initialTimeValidation.preview})`);
        }
        new require$$0.Setting(containerEl)
            .setName("Separator")
            .setDesc("Separator between date and time for entries that have both")
            .addText((text) => text
            .setPlaceholder("Separator is empty")
            .setValue(this.plugin.settings.separator)
            .onChange(async (value) => {
            this.plugin.settings.separator = value;
            await this.plugin.saveSettings();
        }));
        new require$$0.Setting(containerEl).setHeading().setName("Date autosuggest");
        new require$$0.Setting(containerEl)
            .setName("Enable date autosuggest")
            .setDesc(`Input dates with natural language. Open the suggest menu with ${this.plugin.settings.autocompleteTriggerPhrase}`)
            .addToggle((toggle) => toggle
            .setValue(this.plugin.settings.isAutosuggestEnabled)
            .onChange(async (value) => {
            this.plugin.settings.isAutosuggestEnabled = value;
            await this.plugin.saveSettings();
        }));
        new require$$0.Setting(containerEl)
            .setName("Add dates as link?")
            .setDesc("If enabled, dates created via autosuggest will be wrapped in [[wikilinks]]")
            .addToggle((toggle) => toggle
            .setValue(this.plugin.settings.autosuggestToggleLink)
            .onChange(async (value) => {
            this.plugin.settings.autosuggestToggleLink = value;
            await this.plugin.saveSettings();
        }));
        const triggerPhraseDesc = "Character(s) that will cause the date autosuggest to open";
        const triggerPhraseSetting = new require$$0.Setting(containerEl)
            .setName("Trigger phrase")
            .setDesc(triggerPhraseDesc)
            .addMomentFormat((text) => text
            .setPlaceholder(DEFAULT_SETTINGS.autocompleteTriggerPhrase)
            .setValue(this.plugin.settings.autocompleteTriggerPhrase || "@")
            .onChange(async (value) => {
            const trimmed = value.trim();
            if (trimmed) {
                this.plugin.settings.autocompleteTriggerPhrase = trimmed;
                await this.plugin.saveSettings();
                triggerPhraseSetting.setDesc(triggerPhraseDesc);
            }
            else {
                // An empty trigger phrase makes onTrigger()'s
                // query.startsWith(triggerPhrase) always true, so the
                // autosuggest popup would fire on virtually every keystroke.
                // Refuse to save it, matching the Date/Time format fields above.
                triggerPhraseSetting.setDesc(`${triggerPhraseDesc} - ⚠️ Trigger phrase cannot be empty`);
                text.setValue(this.plugin.settings.autocompleteTriggerPhrase || "@");
            }
        }));
        new require$$0.Setting(containerEl).setHeading().setName("Smart suggestions");
        new require$$0.Setting(containerEl)
            .setName("Enable smart suggestions")
            .setDesc("Enable intelligent suggestions based on your usage history and document context")
            .addToggle((toggle) => toggle
            .setValue(this.plugin.settings.enableSmartSuggestions)
            .onChange(async (value) => {
            this.plugin.settings.enableSmartSuggestions = value;
            await this.plugin.saveSettings();
        }));
        new require$$0.Setting(containerEl)
            .setName("History-based suggestions")
            .setDesc("Learn from your frequently used date patterns and prioritize them in suggestions")
            .addToggle((toggle) => toggle
            .setValue(this.plugin.settings.enableHistorySuggestions)
            .onChange(async (value) => {
            this.plugin.settings.enableHistorySuggestions = value;
            await this.plugin.saveSettings();
        }));
        new require$$0.Setting(containerEl)
            .setName("Context-based suggestions")
            .setDesc("Suggest dates based on dates already present in the current document")
            .addToggle((toggle) => toggle
            .setValue(this.plugin.settings.enableContextSuggestions)
            .onChange(async (value) => {
            this.plugin.settings.enableContextSuggestions = value;
            await this.plugin.saveSettings();
        }));
        new require$$0.Setting(containerEl)
            .setName("Manage history")
            .setDesc("View your suggestion history and remove individual entries, or clear it entirely")
            .addButton((button) => button
            .setButtonText("Manage history")
            .onClick(() => {
            new HistoryManagerModal(this.app, this.plugin).open();
        }));
        new require$$0.Setting(containerEl).setHeading().setName("Date formatting");
        new require$$0.Setting(containerEl)
            .setName("Omit date for short relative expressions")
            .setDesc("When enabled, short relative expressions for today (e.g., 'in 15 min', 'dans 2 heures') will display only the time (e.g., '14:30') instead of '[[2024-01-15]] 14:30'")
            .addToggle((toggle) => toggle
            .setValue(this.plugin.settings.omitDateForShortRelative)
            .onChange(async (value) => {
            this.plugin.settings.omitDateForShortRelative = value;
            await this.plugin.saveSettings();
        }));
    }
    createLanguageSetting(containerEl, text, settingKey, code, note) {
        note = note ? ` (${note})` : "";
        return new require$$0.Setting(containerEl)
            .setName(text)
            .setDesc(`Whether to parse ${text} or not` + note)
            .addToggle(l => l
            .setValue(this.plugin.settings[settingKey])
            .onChange(async (v) => {
            this.plugin.settings[settingKey] = v;
            this.editLanguages(code, v);
            await this.plugin.saveSettings();
            this.plugin.resetParser();
        }));
    }
    editLanguages(code, enabled) {
        if (enabled) {
            if (!this.plugin.settings.languages.includes(code)) {
                this.plugin.settings.languages.push(code);
            }
        }
        else {
            const index = this.plugin.settings.languages.indexOf(code);
            if (index > -1) {
                this.plugin.settings.languages.splice(index, 1);
            }
        }
    }
}

class DatePickerModal extends require$$0.Modal {
    constructor(app, plugin) {
        super(app);
        this.calendarEl = null;
        this.quickButtonsEl = null;
        this.previewEl = null;
        this.dateInputEl = null;
        this.themeObserver = null;
        this.keyboardHandler = null;
        this.updateSelectedDateFn = null;
        this.plugin = plugin;
        this.selectedDate = moment();
        this.currentMonth = moment();
        // Détecter le mode sombre
        this.isDarkMode = activeDocument.body.classList.contains("theme-dark");
    }
    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass("nld-date-picker-modal");
        // Ajouter les styles pour le mode sombre
        if (this.isDarkMode) {
            contentEl.addClass("nld-dark-mode");
        }
        let momentFormat = this.plugin.settings.modalMomentFormat;
        let insertAsLink = this.plugin.settings.modalToggleLink;
        let dateInput = "";
        const getDateStr = () => {
            let cleanDateInput = dateInput;
            let shouldIncludeAlias = false;
            if (dateInput.endsWith("|")) {
                shouldIncludeAlias = true;
                cleanDateInput = dateInput.slice(0, -1);
            }
            // Utiliser la date sélectionnée dans le calendrier si disponible
            const dateToParse = cleanDateInput || this.selectedDate.format("YYYY-MM-DD");
            const parsedDate = this.plugin.parseDate(dateToParse);
            // Valider le format avant utilisation
            const formatValidation = validateMomentFormat(momentFormat);
            const formatToUse = formatValidation.valid ? momentFormat : DEFAULT_SETTINGS.modalMomentFormat;
            let parsedDateString = parsedDate.moment.isValid()
                ? parsedDate.moment.format(formatToUse)
                : "";
            if (insertAsLink) {
                parsedDateString = generateMarkdownLink(this.app, parsedDateString, shouldIncludeAlias ? cleanDateInput : undefined);
            }
            return parsedDateString;
        };
        const updatePreview = () => {
            if (this.previewEl) {
                this.previewEl.setText(getDateStr());
            }
        };
        // syncInput controls whether the raw text field gets overwritten with
        // the formatted date. Calendar clicks/quick buttons/keyboard nav want
        // that (it's how the field reflects the selection), but the field's own
        // onChange handler must NOT sync itself while the user is still typing
        // into it -- getDateStr()/updatePreview() already show a live preview
        // of the parsed result separately, without touching what's being typed.
        const updateSelectedDate = (date, syncInput = true) => {
            this.selectedDate = date.clone();
            if (syncInput && this.dateInputEl) {
                this.dateInputEl.value = date.format("YYYY-MM-DD");
            }
            updatePreview();
            this.renderCalendar();
        };
        // Stocker la fonction pour qu'elle soit accessible depuis renderCalendar
        this.updateSelectedDateFn = updateSelectedDate;
        // Container principal
        const container = contentEl.createDiv("nld-date-picker-container");
        // Section des boutons rapides
        this.quickButtonsEl = container.createDiv("nld-quick-buttons");
        this.renderQuickButtons(updateSelectedDate);
        // Section du calendrier
        const calendarSection = container.createDiv("nld-calendar-section");
        // Navigation du calendrier
        const navEl = calendarSection.createDiv("nld-calendar-nav");
        const prevMonthBtn = navEl.createEl("button", {
            cls: "nld-nav-btn",
            text: "‹",
            attr: { "aria-label": "Mois précédent" }
        });
        const monthYearEl = navEl.createDiv("nld-month-year");
        const nextMonthBtn = navEl.createEl("button", {
            cls: "nld-nav-btn",
            text: "›",
            attr: { "aria-label": "Mois suivant" }
        });
        prevMonthBtn.addEventListener("click", () => {
            this.currentMonth.subtract(1, "month");
            this.renderCalendar();
            this.updateMonthYearDisplay(monthYearEl);
        });
        nextMonthBtn.addEventListener("click", () => {
            this.currentMonth.add(1, "month");
            this.renderCalendar();
            this.updateMonthYearDisplay(monthYearEl);
        });
        // Sélecteur d'année (dropdown)
        const yearSelect = navEl.createEl("select", { cls: "nld-year-select" });
        const currentYear = this.currentMonth.year();
        for (let year = currentYear - 10; year <= currentYear + 10; year++) {
            const option = yearSelect.createEl("option", { text: String(year), value: String(year) });
            if (year === currentYear) {
                option.selected = true;
            }
        }
        yearSelect.addEventListener("change", (e) => {
            const target = e.target;
            this.currentMonth.year(parseInt(target.value));
            this.renderCalendar();
            this.updateMonthYearDisplay(monthYearEl);
        });
        // Sélecteur de mois (dropdown)
        const monthSelect = navEl.createEl("select", { cls: "nld-month-select" });
        const monthNames = moment.months();
        monthNames.forEach((month, index) => {
            const option = monthSelect.createEl("option", { text: month, value: String(index) });
            if (index === this.currentMonth.month()) {
                option.selected = true;
            }
        });
        monthSelect.addEventListener("change", (e) => {
            const target = e.target;
            this.currentMonth.month(parseInt(target.value));
            this.renderCalendar();
            this.updateMonthYearDisplay(monthYearEl);
        });
        this.updateMonthYearDisplay(monthYearEl);
        // Calendrier
        this.calendarEl = calendarSection.createDiv("nld-calendar");
        this.renderCalendar();
        // Section de saisie manuelle
        const inputSection = container.createDiv("nld-input-section");
        const dateInputEl = new require$$0.Setting(inputSection)
            .setName("Date")
            .setDesc("")
            .addText((textEl) => {
            textEl.setPlaceholder("Today");
            textEl.setValue(this.selectedDate.format("YYYY-MM-DD"));
            this.dateInputEl = textEl.inputEl;
            textEl.onChange((value) => {
                dateInput = value;
                if (value) {
                    const parsed = this.plugin.parseDate(value);
                    if (parsed.moment.isValid()) {
                        updateSelectedDate(parsed.moment, false);
                    }
                }
                updatePreview();
            });
            window.setTimeout(() => textEl.inputEl.focus(), 10);
        });
        this.previewEl = dateInputEl.descEl;
        updatePreview();
        // Options de format
        const formatSetting = new require$$0.Setting(inputSection)
            .setName("Date format")
            .setDesc("Moment format to be used")
            .addMomentFormat((momentEl) => {
            momentEl.setPlaceholder("YYYY-MM-DD HH:mm");
            momentEl.setValue(momentFormat);
            momentEl.onChange((value) => {
                const validated = validateMomentFormat(value.trim() || "YYYY-MM-DD HH:mm");
                if (validated.valid) {
                    momentFormat = value.trim() || "YYYY-MM-DD HH:mm";
                    this.plugin.settings.modalMomentFormat = momentFormat;
                    void this.plugin.saveSettings();
                    updatePreview();
                    // Mettre à jour la description avec la prévisualisation
                    formatSetting.setDesc(`Moment format to be used${validated.preview ? ` (Preview: ${validated.preview})` : ""}`);
                }
                else {
                    // Afficher l'erreur dans la description
                    formatSetting.setDesc(`Moment format to be used - ⚠️ ${validated.error || "Format invalide"}`);
                    // Ne pas sauvegarder le format invalide, restaurer le précédent
                    momentEl.setValue(momentFormat);
                }
            });
        });
        // Afficher la prévisualisation initiale
        const initialValidation = validateMomentFormat(momentFormat);
        if (initialValidation.valid && initialValidation.preview) {
            formatSetting.setDesc(`Moment format to be used (Preview: ${initialValidation.preview})`);
        }
        new require$$0.Setting(inputSection)
            .setName("Add as link?")
            .addToggle((toggleEl) => {
            toggleEl.setValue(this.plugin.settings.modalToggleLink).onChange((value) => {
                insertAsLink = value;
                this.plugin.settings.modalToggleLink = insertAsLink;
                void this.plugin.saveSettings();
                updatePreview();
            });
        });
        // Boutons d'action
        inputSection.createDiv("modal-button-container", (buttonContainerEl) => {
            buttonContainerEl
                .createEl("button", { attr: { type: "button" }, text: "Never mind" })
                .addEventListener("click", () => this.close());
            buttonContainerEl.createEl("button", {
                attr: { type: "button" },
                cls: "mod-cta",
                text: "Insert date",
            }).addEventListener("click", () => {
                this.insertDate(getDateStr());
            });
        });
        // Raccourcis clavier
        this.keyboardHandler = this.createKeyboardHandler(prevMonthBtn, nextMonthBtn, updateSelectedDate);
        this.contentEl.addEventListener("keydown", this.keyboardHandler);
        // Observer les changements de thème
        this.setupThemeObserver();
    }
    renderQuickButtons(updateSelectedDate) {
        if (!this.quickButtonsEl)
            return;
        this.quickButtonsEl.empty();
        this.quickButtonsEl.createDiv({ cls: "nld-quick-buttons-label", text: "Quick select:" });
        const primaryLang = this.plugin.settings.languages[0] || "en";
        // Fonction helper pour obtenir la première variante d'une traduction
        const getFirstVariant = (key) => {
            const translation = t(key, primaryLang);
            if (translation === "NOTFOUND") {
                return key;
            }
            // Prendre la première variante si plusieurs (séparées par |)
            return translation.split("|")[0].trim();
        };
        const quickOptions = [
            {
                label: getFirstVariant("today"),
                moment: moment()
            },
            {
                label: getFirstVariant("tomorrow"),
                moment: moment().add(1, "day")
            },
            {
                label: getFirstVariant("yesterday"),
                moment: moment().subtract(1, "day")
            },
            {
                label: `${getFirstVariant("next")} ${getFirstVariant("week")}`,
                moment: moment().add(1, "week")
            },
            {
                label: `${getFirstVariant("next")} ${getFirstVariant("month")}`,
                moment: moment().add(1, "month")
            },
            {
                label: `${getFirstVariant("next")} ${getFirstVariant("year")}`,
                moment: moment().add(1, "year")
            },
        ];
        const buttonsContainer = this.quickButtonsEl.createDiv("nld-quick-buttons-grid");
        quickOptions.forEach((option) => {
            const button = buttonsContainer.createEl("button", {
                cls: "nld-quick-btn",
                text: option.label,
            });
            button.addEventListener("click", () => {
                updateSelectedDate(option.moment);
                this.currentMonth = option.moment.clone();
                this.renderCalendar();
            });
        });
    }
    renderCalendar() {
        if (!this.calendarEl)
            return;
        this.calendarEl.empty();
        // En-têtes des jours de la semaine
        const weekStart = this.plugin.settings.weekStart === "locale-default"
            ? getLocaleWeekStart()
            : this.plugin.settings.weekStart;
        const weekStartIndex = weekStart === "sunday" ? 0 : 1;
        const weekdays = moment.weekdaysShort();
        const orderedWeekdays = [
            ...weekdays.slice(weekStartIndex),
            ...weekdays.slice(0, weekStartIndex),
        ];
        const headerRow = this.calendarEl.createDiv("nld-calendar-header");
        orderedWeekdays.forEach((day) => {
            const dayHeader = headerRow.createDiv("nld-calendar-day-header");
            dayHeader.setText(day);
        });
        // Grille du calendrier
        const grid = this.calendarEl.createDiv("nld-calendar-grid");
        const startOfMonth = this.currentMonth.clone().startOf("month");
        const endOfMonth = this.currentMonth.clone().endOf("month");
        // Calculer le début de la semaine selon les préférences
        const startDate = startOfMonth.clone();
        const dayOfWeek = startDate.day();
        const diff = dayOfWeek - weekStartIndex;
        if (diff < 0) {
            startDate.subtract(7 + diff, "days");
        }
        else {
            startDate.subtract(diff, "days");
        }
        // Calculer la fin de la semaine
        const endDate = endOfMonth.clone();
        const endDayOfWeek = endDate.day();
        const endDiff = (6 + weekStartIndex - endDayOfWeek) % 7;
        if (endDiff > 0) {
            endDate.add(endDiff, "days");
        }
        const today = moment();
        const currentDate = startDate.clone();
        while (currentDate.isSameOrBefore(endDate, "day")) {
            // Capturer la date actuelle dans une variable locale pour éviter les problèmes de closure
            const dateForThisDay = currentDate.clone();
            const dayEl = grid.createDiv("nld-calendar-day");
            const dayNumber = dateForThisDay.date();
            // Style selon le type de jour
            if (dateForThisDay.isSame(today, "day")) {
                dayEl.addClass("nld-today");
            }
            if (dateForThisDay.isSame(this.selectedDate, "day")) {
                dayEl.addClass("nld-selected");
            }
            if (!dateForThisDay.isSame(this.currentMonth, "month")) {
                dayEl.addClass("nld-other-month");
            }
            const dayNumberEl = dayEl.createDiv("nld-day-number");
            dayNumberEl.setText(String(dayNumber));
            // Événement de clic
            dayEl.addEventListener("click", () => {
                if (this.updateSelectedDateFn) {
                    this.updateSelectedDateFn(dateForThisDay);
                }
            });
            currentDate.add(1, "day");
        }
    }
    updateMonthYearDisplay(monthYearEl) {
        monthYearEl.empty();
        const monthName = this.currentMonth.format("MMMM");
        const year = this.currentMonth.format("YYYY");
        const monthSpan = monthYearEl.createSpan();
        monthSpan.setText(monthName);
        const spaceSpan = monthYearEl.createSpan();
        spaceSpan.setText(" ");
        const yearSpan = monthYearEl.createSpan();
        yearSpan.setText(year);
    }
    createKeyboardHandler(prevMonthBtn, nextMonthBtn, updateSelectedDate) {
        return (e) => {
            // Éviter les raccourcis si on est dans un input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) {
                return;
            }
            switch (e.key) {
                case "ArrowLeft":
                    e.preventDefault();
                    prevMonthBtn.click();
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    nextMonthBtn.click();
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    this.currentMonth.subtract(1, "month");
                    this.renderCalendar();
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    this.currentMonth.add(1, "month");
                    this.renderCalendar();
                    break;
                case "Home":
                    e.preventDefault();
                    updateSelectedDate(moment());
                    this.currentMonth = moment();
                    this.renderCalendar();
                    break;
                case "Escape":
                    e.preventDefault();
                    this.close();
                    break;
            }
        };
    }
    setupThemeObserver() {
        // Observer les changements de classe pour détecter le changement de thème
        this.themeObserver = new MutationObserver(() => {
            const wasDarkMode = this.isDarkMode;
            this.isDarkMode = activeDocument.body.classList.contains("theme-dark");
            if (wasDarkMode !== this.isDarkMode && this.contentEl) {
                if (this.isDarkMode) {
                    this.contentEl.addClass("nld-dark-mode");
                }
                else {
                    this.contentEl.removeClass("nld-dark-mode");
                }
            }
        });
        this.themeObserver.observe(activeDocument.body, {
            attributes: true,
            attributeFilter: ["class"],
        });
    }
    insertDate(dateStr) {
        const activeEditor = getActiveEditor(this.app.workspace);
        if (!activeEditor) {
            return;
        }
        this.close();
        activeEditor.replaceSelection(dateStr);
    }
    onClose() {
        const { contentEl } = this;
        contentEl.empty();
        // Nettoyer les event listeners
        if (this.keyboardHandler) {
            contentEl.removeEventListener("keydown", this.keyboardHandler);
            this.keyboardHandler = null;
        }
        // Nettoyer l'observer de thème
        if (this.themeObserver) {
            this.themeObserver.disconnect();
            this.themeObserver = null;
        }
    }
}

var Meridiem;
(function (Meridiem) {
    Meridiem[Meridiem["AM"] = 0] = "AM";
    Meridiem[Meridiem["PM"] = 1] = "PM";
})(Meridiem || (Meridiem = {}));
var Weekday;
(function (Weekday) {
    Weekday[Weekday["SUNDAY"] = 0] = "SUNDAY";
    Weekday[Weekday["MONDAY"] = 1] = "MONDAY";
    Weekday[Weekday["TUESDAY"] = 2] = "TUESDAY";
    Weekday[Weekday["WEDNESDAY"] = 3] = "WEDNESDAY";
    Weekday[Weekday["THURSDAY"] = 4] = "THURSDAY";
    Weekday[Weekday["FRIDAY"] = 5] = "FRIDAY";
    Weekday[Weekday["SATURDAY"] = 6] = "SATURDAY";
})(Weekday || (Weekday = {}));
var Month;
(function (Month) {
    Month[Month["JANUARY"] = 1] = "JANUARY";
    Month[Month["FEBRUARY"] = 2] = "FEBRUARY";
    Month[Month["MARCH"] = 3] = "MARCH";
    Month[Month["APRIL"] = 4] = "APRIL";
    Month[Month["MAY"] = 5] = "MAY";
    Month[Month["JUNE"] = 6] = "JUNE";
    Month[Month["JULY"] = 7] = "JULY";
    Month[Month["AUGUST"] = 8] = "AUGUST";
    Month[Month["SEPTEMBER"] = 9] = "SEPTEMBER";
    Month[Month["OCTOBER"] = 10] = "OCTOBER";
    Month[Month["NOVEMBER"] = 11] = "NOVEMBER";
    Month[Month["DECEMBER"] = 12] = "DECEMBER";
})(Month || (Month = {}));

function assignSimilarDate(component, target) {
    component.assign("day", target.getDate());
    component.assign("month", target.getMonth() + 1);
    component.assign("year", target.getFullYear());
}
function assignSimilarTime(component, target) {
    component.assign("hour", target.getHours());
    component.assign("minute", target.getMinutes());
    component.assign("second", target.getSeconds());
    component.assign("millisecond", target.getMilliseconds());
    component.assign("meridiem", target.getHours() < 12 ? Meridiem.AM : Meridiem.PM);
}
function implySimilarDate(component, target) {
    component.imply("day", target.getDate());
    component.imply("month", target.getMonth() + 1);
    component.imply("year", target.getFullYear());
}
function implySimilarTime(component, target) {
    component.imply("hour", target.getHours());
    component.imply("minute", target.getMinutes());
    component.imply("second", target.getSeconds());
    component.imply("millisecond", target.getMilliseconds());
    component.imply("meridiem", target.getHours() < 12 ? Meridiem.AM : Meridiem.PM);
}

const TIMEZONE_ABBR_MAP = {
    ACDT: 630,
    ACST: 570,
    ADT: -180,
    AEDT: 660,
    AEST: 600,
    AFT: 270,
    AKDT: -480,
    AKST: -540,
    ALMT: 360,
    AMST: -180,
    AMT: -240,
    ANAST: 720,
    ANAT: 720,
    AQTT: 300,
    ART: -180,
    AST: -240,
    AWDT: 540,
    AWST: 480,
    AZOST: 0,
    AZOT: -60,
    AZST: 300,
    AZT: 240,
    BNT: 480,
    BOT: -240,
    BRST: -120,
    BRT: -180,
    BST: 60,
    BTT: 360,
    CAST: 480,
    CAT: 120,
    CCT: 390,
    CDT: -300,
    CEST: 120,
    CET: {
        timezoneOffsetDuringDst: 2 * 60,
        timezoneOffsetNonDst: 60,
        dstStart: (year) => getLastWeekdayOfMonth(year, Month.MARCH, Weekday.SUNDAY, 2),
        dstEnd: (year) => getLastWeekdayOfMonth(year, Month.OCTOBER, Weekday.SUNDAY, 3),
    },
    CHADT: 825,
    CHAST: 765,
    CKT: -600,
    CLST: -180,
    CLT: -240,
    COT: -300,
    CST: -360,
    CT: {
        timezoneOffsetDuringDst: -5 * 60,
        timezoneOffsetNonDst: -6 * 60,
        dstStart: (year) => getNthWeekdayOfMonth(year, Month.MARCH, Weekday.SUNDAY, 2, 2),
        dstEnd: (year) => getNthWeekdayOfMonth(year, Month.NOVEMBER, Weekday.SUNDAY, 1, 2),
    },
    CVT: -60,
    CXT: 420,
    ChST: 600,
    DAVT: 420,
    EASST: -300,
    EAST: -360,
    EAT: 180,
    ECT: -300,
    EDT: -240,
    EEST: 180,
    EET: 120,
    EGST: 0,
    EGT: -60,
    EST: -300,
    ET: {
        timezoneOffsetDuringDst: -4 * 60,
        timezoneOffsetNonDst: -5 * 60,
        dstStart: (year) => getNthWeekdayOfMonth(year, Month.MARCH, Weekday.SUNDAY, 2, 2),
        dstEnd: (year) => getNthWeekdayOfMonth(year, Month.NOVEMBER, Weekday.SUNDAY, 1, 2),
    },
    FJST: 780,
    FJT: 720,
    FKST: -180,
    FKT: -240,
    FNT: -120,
    GALT: -360,
    GAMT: -540,
    GET: 240,
    GFT: -180,
    GILT: 720,
    GMT: 0,
    GST: 240,
    GYT: -240,
    HAA: -180,
    HAC: -300,
    HADT: -540,
    HAE: -240,
    HAP: -420,
    HAR: -360,
    HAST: -600,
    HAT: -90,
    HAY: -480,
    HKT: 480,
    HLV: -210,
    HNA: -240,
    HNC: -360,
    HNE: -300,
    HNP: -480,
    HNR: -420,
    HNT: -150,
    HNY: -540,
    HOVT: 420,
    ICT: 420,
    IDT: 180,
    IOT: 360,
    IRDT: 270,
    IRKST: 540,
    IRKT: 540,
    IRST: 210,
    IST: 330,
    JST: 540,
    KGT: 360,
    KRAST: 480,
    KRAT: 480,
    KST: 540,
    KUYT: 240,
    LHDT: 660,
    LHST: 630,
    LINT: 840,
    MAGST: 720,
    MAGT: 720,
    MART: -510,
    MAWT: 300,
    MDT: -360,
    MESZ: 120,
    MEZ: 60,
    MHT: 720,
    MMT: 390,
    MSD: 240,
    MSK: 180,
    MST: -420,
    MT: {
        timezoneOffsetDuringDst: -6 * 60,
        timezoneOffsetNonDst: -7 * 60,
        dstStart: (year) => getNthWeekdayOfMonth(year, Month.MARCH, Weekday.SUNDAY, 2, 2),
        dstEnd: (year) => getNthWeekdayOfMonth(year, Month.NOVEMBER, Weekday.SUNDAY, 1, 2),
    },
    MUT: 240,
    MVT: 300,
    MYT: 480,
    NCT: 660,
    NDT: -90,
    NFT: 690,
    NOVST: 420,
    NOVT: 360,
    NPT: 345,
    NST: -150,
    NUT: -660,
    NZDT: 780,
    NZST: 720,
    OMSST: 420,
    OMST: 420,
    PDT: -420,
    PET: -300,
    PETST: 720,
    PETT: 720,
    PGT: 600,
    PHOT: 780,
    PHT: 480,
    PKT: 300,
    PMDT: -120,
    PMST: -180,
    PONT: 660,
    PST: -480,
    PT: {
        timezoneOffsetDuringDst: -7 * 60,
        timezoneOffsetNonDst: -8 * 60,
        dstStart: (year) => getNthWeekdayOfMonth(year, Month.MARCH, Weekday.SUNDAY, 2, 2),
        dstEnd: (year) => getNthWeekdayOfMonth(year, Month.NOVEMBER, Weekday.SUNDAY, 1, 2),
    },
    PWT: 540,
    PYST: -180,
    PYT: -240,
    RET: 240,
    SAMT: 240,
    SAST: 120,
    SBT: 660,
    SCT: 240,
    SGT: 480,
    SRT: -180,
    SST: -660,
    TAHT: -600,
    TFT: 300,
    TJT: 300,
    TKT: 780,
    TLT: 540,
    TMT: 300,
    TVT: 720,
    ULAT: 480,
    UTC: 0,
    UYST: -120,
    UYT: -180,
    UZT: 300,
    VET: -210,
    VLAST: 660,
    VLAT: 660,
    VUT: 660,
    WAST: 120,
    WAT: 60,
    WEST: 60,
    WESZ: 60,
    WET: 0,
    WEZ: 0,
    WFT: 720,
    WGST: -120,
    WGT: -180,
    WIB: 420,
    WIT: 540,
    WITA: 480,
    WST: 780,
    WT: 0,
    YAKST: 600,
    YAKT: 600,
    YAPT: 600,
    YEKST: 360,
    YEKT: 360,
};
function getNthWeekdayOfMonth(year, month, weekday, n, hour = 0) {
    let dayOfMonth = 0;
    let i = 0;
    while (i < n) {
        dayOfMonth++;
        const date = new Date(year, month - 1, dayOfMonth);
        if (date.getDay() === weekday)
            i++;
    }
    return new Date(year, month - 1, dayOfMonth, hour);
}
function getLastWeekdayOfMonth(year, month, weekday, hour = 0) {
    const oneIndexedWeekday = weekday === 0 ? 7 : weekday;
    const date = new Date(year, month - 1 + 1, 1, 12);
    const firstWeekdayNextMonth = date.getDay() === 0 ? 7 : date.getDay();
    let dayDiff;
    if (firstWeekdayNextMonth === oneIndexedWeekday)
        dayDiff = 7;
    else if (firstWeekdayNextMonth < oneIndexedWeekday)
        dayDiff = 7 + firstWeekdayNextMonth - oneIndexedWeekday;
    else
        dayDiff = firstWeekdayNextMonth - oneIndexedWeekday;
    date.setDate(date.getDate() - dayDiff);
    return new Date(year, month - 1, date.getDate(), hour);
}
function toTimezoneOffset(timezoneInput, date, timezoneOverrides = {}) {
    if (timezoneInput == null) {
        return null;
    }
    if (typeof timezoneInput === "number") {
        return timezoneInput;
    }
    const matchedTimezone = timezoneOverrides[timezoneInput] ?? TIMEZONE_ABBR_MAP[timezoneInput];
    if (matchedTimezone == null) {
        return null;
    }
    if (typeof matchedTimezone == "number") {
        return matchedTimezone;
    }
    if (date == null) {
        return null;
    }
    if (date > matchedTimezone.dstStart(date.getFullYear()) && !(date > matchedTimezone.dstEnd(date.getFullYear()))) {
        return matchedTimezone.timezoneOffsetDuringDst;
    }
    return matchedTimezone.timezoneOffsetNonDst;
}

const EmptyDuration = {
    day: 0,
    second: 0,
    millisecond: 0,
};
function addDuration(ref, duration) {
    let date = new Date(ref);
    if (duration["y"]) {
        duration["year"] = duration["y"];
        delete duration["y"];
    }
    if (duration["mo"]) {
        duration["month"] = duration["mo"];
        delete duration["mo"];
    }
    if (duration["M"]) {
        duration["month"] = duration["M"];
        delete duration["M"];
    }
    if (duration["w"]) {
        duration["week"] = duration["w"];
        delete duration["w"];
    }
    if (duration["d"]) {
        duration["day"] = duration["d"];
        delete duration["d"];
    }
    if (duration["h"]) {
        duration["hour"] = duration["h"];
        delete duration["h"];
    }
    if (duration["m"]) {
        duration["minute"] = duration["m"];
        delete duration["m"];
    }
    if (duration["s"]) {
        duration["second"] = duration["s"];
        delete duration["s"];
    }
    if (duration["ms"]) {
        duration["millisecond"] = duration["ms"];
        delete duration["ms"];
    }
    if ("year" in duration) {
        const floor = Math.floor(duration["year"]);
        date.setFullYear(date.getFullYear() + floor);
        const remainingFraction = duration["year"] - floor;
        if (remainingFraction > 0) {
            duration.month = duration?.month ?? 0;
            duration.month += remainingFraction * 12;
        }
    }
    if ("quarter" in duration) {
        const floor = Math.floor(duration["quarter"]);
        date.setMonth(date.getMonth() + floor * 3);
    }
    if ("month" in duration) {
        const floor = Math.floor(duration["month"]);
        date.setMonth(date.getMonth() + floor);
        const remainingFraction = duration["month"] - floor;
        if (remainingFraction > 0) {
            duration.week = duration?.week ?? 0;
            duration.week += remainingFraction * 4;
        }
    }
    if ("week" in duration) {
        const floor = Math.floor(duration["week"]);
        date.setDate(date.getDate() + floor * 7);
        const remainingFraction = duration["week"] - floor;
        if (remainingFraction > 0) {
            duration.day = duration?.day ?? 0;
            duration.day += Math.round(remainingFraction * 7);
        }
    }
    if ("day" in duration) {
        const floor = Math.floor(duration["day"]);
        date.setDate(date.getDate() + floor);
        const remainingFraction = duration["day"] - floor;
        if (remainingFraction > 0) {
            duration.hour = duration?.hour ?? 0;
            duration.hour += Math.round(remainingFraction * 24);
        }
    }
    if ("hour" in duration) {
        const floor = Math.floor(duration["hour"]);
        date.setHours(date.getHours() + floor);
        const remainingFraction = duration["hour"] - floor;
        if (remainingFraction > 0) {
            duration.minute = duration?.minute ?? 0;
            duration.minute += Math.round(remainingFraction * 60);
        }
    }
    if ("minute" in duration) {
        const floor = Math.floor(duration["minute"]);
        date.setMinutes(date.getMinutes() + floor);
        const remainingFraction = duration["minute"] - floor;
        if (remainingFraction > 0) {
            duration.second = duration?.second ?? 0;
            duration.second += Math.round(remainingFraction * 60);
        }
    }
    if ("second" in duration) {
        const floor = Math.floor(duration["second"]);
        date.setSeconds(date.getSeconds() + floor);
        const remainingFraction = duration["second"] - floor;
        if (remainingFraction > 0) {
            duration.millisecond = duration?.millisecond ?? 0;
            duration.millisecond += Math.round(remainingFraction * 1000);
        }
    }
    if ("millisecond" in duration) {
        const floor = Math.floor(duration["millisecond"]);
        date.setMilliseconds(date.getMilliseconds() + floor);
    }
    return date;
}
function reverseDuration(duration) {
    const reversed = {};
    for (const key in duration) {
        reversed[key] = -duration[key];
    }
    return reversed;
}

class ReferenceWithTimezone {
    instant;
    timezoneOffset;
    constructor(instant, timezoneOffset) {
        this.instant = instant ?? new Date();
        this.timezoneOffset = timezoneOffset ?? null;
    }
    static fromDate(date) {
        return new ReferenceWithTimezone(date);
    }
    static fromInput(input, timezoneOverrides) {
        if (input instanceof Date) {
            return ReferenceWithTimezone.fromDate(input);
        }
        const instant = input?.instant ?? new Date();
        const timezoneOffset = toTimezoneOffset(input?.timezone, instant, timezoneOverrides);
        return new ReferenceWithTimezone(instant, timezoneOffset);
    }
    getDateWithAdjustedTimezone() {
        const date = new Date(this.instant);
        if (this.timezoneOffset !== null) {
            date.setMinutes(date.getMinutes() - this.getSystemTimezoneAdjustmentMinute(this.instant));
        }
        return date;
    }
    getSystemTimezoneAdjustmentMinute(date, overrideTimezoneOffset) {
        if (!date) {
            date = new Date();
        }
        const currentTimezoneOffset = -date.getTimezoneOffset();
        const targetTimezoneOffset = overrideTimezoneOffset ?? this.timezoneOffset ?? currentTimezoneOffset;
        return currentTimezoneOffset - targetTimezoneOffset;
    }
    getTimezoneOffset() {
        return this.timezoneOffset ?? -this.instant.getTimezoneOffset();
    }
}
class ParsingComponents {
    knownValues;
    impliedValues;
    reference;
    _tags = new Set();
    constructor(reference, knownComponents) {
        this.reference = reference;
        this.knownValues = {};
        this.impliedValues = {};
        if (knownComponents) {
            for (const key in knownComponents) {
                this.knownValues[key] = knownComponents[key];
            }
        }
        const date = reference.getDateWithAdjustedTimezone();
        this.imply("day", date.getDate());
        this.imply("month", date.getMonth() + 1);
        this.imply("year", date.getFullYear());
        this.imply("hour", 12);
        this.imply("minute", 0);
        this.imply("second", 0);
        this.imply("millisecond", 0);
    }
    static createRelativeFromReference(reference, duration = EmptyDuration) {
        let date = addDuration(reference.getDateWithAdjustedTimezone(), duration);
        const components = new ParsingComponents(reference);
        components.addTag("result/relativeDate");
        if ("hour" in duration || "minute" in duration || "second" in duration || "millisecond" in duration) {
            components.addTag("result/relativeDateAndTime");
            assignSimilarTime(components, date);
            assignSimilarDate(components, date);
            components.assign("timezoneOffset", reference.getTimezoneOffset());
        }
        else {
            implySimilarTime(components, date);
            components.imply("timezoneOffset", reference.getTimezoneOffset());
            if ("day" in duration) {
                components.assign("day", date.getDate());
                components.assign("month", date.getMonth() + 1);
                components.assign("year", date.getFullYear());
                components.assign("weekday", date.getDay());
            }
            else if ("week" in duration) {
                components.assign("day", date.getDate());
                components.assign("month", date.getMonth() + 1);
                components.assign("year", date.getFullYear());
                components.imply("weekday", date.getDay());
            }
            else {
                components.imply("day", date.getDate());
                if ("month" in duration) {
                    components.assign("month", date.getMonth() + 1);
                    components.assign("year", date.getFullYear());
                }
                else {
                    components.imply("month", date.getMonth() + 1);
                    if ("year" in duration) {
                        components.assign("year", date.getFullYear());
                    }
                    else {
                        components.imply("year", date.getFullYear());
                    }
                }
            }
        }
        return components;
    }
    get(component) {
        if (component in this.knownValues) {
            return this.knownValues[component];
        }
        if (component in this.impliedValues) {
            return this.impliedValues[component];
        }
        return null;
    }
    isCertain(component) {
        return component in this.knownValues;
    }
    getCertainComponents() {
        return Object.keys(this.knownValues);
    }
    imply(component, value) {
        if (component in this.knownValues) {
            return this;
        }
        this.impliedValues[component] = value;
        return this;
    }
    assign(component, value) {
        this.knownValues[component] = value;
        delete this.impliedValues[component];
        return this;
    }
    addDurationAsImplied(duration) {
        const currentDate = this.dateWithoutTimezoneAdjustment();
        const date = addDuration(currentDate, duration);
        if ("day" in duration || "week" in duration || "month" in duration || "year" in duration) {
            this.delete(["day", "weekday", "month", "year"]);
            this.imply("day", date.getDate());
            this.imply("weekday", date.getDay());
            this.imply("month", date.getMonth() + 1);
            this.imply("year", date.getFullYear());
        }
        if ("second" in duration || "minute" in duration || "hour" in duration) {
            this.delete(["second", "minute", "hour"]);
            this.imply("second", date.getSeconds());
            this.imply("minute", date.getMinutes());
            this.imply("hour", date.getHours());
        }
        return this;
    }
    delete(components) {
        if (typeof components === "string") {
            components = [components];
        }
        for (const component of components) {
            delete this.knownValues[component];
            delete this.impliedValues[component];
        }
    }
    clone() {
        const component = new ParsingComponents(this.reference);
        component.knownValues = {};
        component.impliedValues = {};
        for (const key in this.knownValues) {
            component.knownValues[key] = this.knownValues[key];
        }
        for (const key in this.impliedValues) {
            component.impliedValues[key] = this.impliedValues[key];
        }
        return component;
    }
    isOnlyDate() {
        return !this.isCertain("hour") && !this.isCertain("minute") && !this.isCertain("second");
    }
    isOnlyTime() {
        return (!this.isCertain("weekday") && !this.isCertain("day") && !this.isCertain("month") && !this.isCertain("year"));
    }
    isOnlyWeekdayComponent() {
        return this.isCertain("weekday") && !this.isCertain("day") && !this.isCertain("month");
    }
    isDateWithUnknownYear() {
        return this.isCertain("month") && !this.isCertain("year");
    }
    isValidDate() {
        const date = this.dateWithoutTimezoneAdjustment();
        if (date.getFullYear() !== this.get("year"))
            return false;
        if (date.getMonth() !== this.get("month") - 1)
            return false;
        if (date.getDate() !== this.get("day"))
            return false;
        if (this.get("hour") != null && date.getHours() != this.get("hour"))
            return false;
        if (this.get("minute") != null && date.getMinutes() != this.get("minute"))
            return false;
        return true;
    }
    toString() {
        return `[ParsingComponents {
            tags: ${JSON.stringify(Array.from(this._tags).sort())}, 
            knownValues: ${JSON.stringify(this.knownValues)}, 
            impliedValues: ${JSON.stringify(this.impliedValues)}}, 
            reference: ${JSON.stringify(this.reference)}]`;
    }
    date() {
        const date = this.dateWithoutTimezoneAdjustment();
        const timezoneAdjustment = this.reference.getSystemTimezoneAdjustmentMinute(date, this.get("timezoneOffset"));
        return new Date(date.getTime() + timezoneAdjustment * 60000);
    }
    addTag(tag) {
        this._tags.add(tag);
        return this;
    }
    addTags(tags) {
        for (const tag of tags) {
            this._tags.add(tag);
        }
        return this;
    }
    tags() {
        return new Set(this._tags);
    }
    dateWithoutTimezoneAdjustment() {
        const date = new Date(this.get("year"), this.get("month") - 1, this.get("day"), this.get("hour"), this.get("minute"), this.get("second"), this.get("millisecond"));
        date.setFullYear(this.get("year"));
        return date;
    }
}
class ParsingResult {
    refDate;
    index;
    text;
    reference;
    start;
    end;
    constructor(reference, index, text, start, end) {
        this.reference = reference;
        this.refDate = reference.instant;
        this.index = index;
        this.text = text;
        this.start = start || new ParsingComponents(reference);
        this.end = end;
    }
    clone() {
        const result = new ParsingResult(this.reference, this.index, this.text);
        result.start = this.start ? this.start.clone() : null;
        result.end = this.end ? this.end.clone() : null;
        return result;
    }
    date() {
        return this.start.date();
    }
    addTag(tag) {
        this.start.addTag(tag);
        if (this.end) {
            this.end.addTag(tag);
        }
        return this;
    }
    addTags(tags) {
        this.start.addTags(tags);
        if (this.end) {
            this.end.addTags(tags);
        }
        return this;
    }
    tags() {
        const combinedTags = new Set(this.start.tags());
        if (this.end) {
            for (const tag of this.end.tags()) {
                combinedTags.add(tag);
            }
        }
        return combinedTags;
    }
    toString() {
        const tags = Array.from(this.tags()).sort();
        return `[ParsingResult {index: ${this.index}, text: '${this.text}', tags: ${JSON.stringify(tags)} ...}]`;
    }
}

function repeatedTimeunitPattern(prefix, singleTimeunitPattern, connectorPattern = "\\s{0,5},?\\s{0,5}") {
    const singleTimeunitPatternNoCapture = singleTimeunitPattern.replace(/\((?!\?)/g, "(?:");
    return `${prefix}${singleTimeunitPatternNoCapture}(?:${connectorPattern}${singleTimeunitPatternNoCapture}){0,10}`;
}
function extractTerms(dictionary) {
    let keys;
    if (dictionary instanceof Array) {
        keys = [...dictionary];
    }
    else if (dictionary instanceof Map) {
        keys = Array.from(dictionary.keys());
    }
    else {
        keys = Object.keys(dictionary);
    }
    return keys;
}
function matchAnyPattern(dictionary) {
    const joinedTerms = extractTerms(dictionary)
        .sort((a, b) => b.length - a.length)
        .join("|")
        .replace(/\./g, "\\.");
    return `(?:${joinedTerms})`;
}

function findMostLikelyADYear(yearNumber) {
    if (yearNumber < 100) {
        if (yearNumber > 50) {
            yearNumber = yearNumber + 1900;
        }
        else {
            yearNumber = yearNumber + 2000;
        }
    }
    return yearNumber;
}
function findYearClosestToRef(refDate, day, month) {
    let date = new Date(refDate);
    date.setMonth(month - 1);
    date.setDate(day);
    const nextYear = addDuration(date, { "year": 1 });
    const lastYear = addDuration(date, { "year": -1 });
    if (Math.abs(nextYear.getTime() - refDate.getTime()) < Math.abs(date.getTime() - refDate.getTime())) {
        date = nextYear;
    }
    else if (Math.abs(lastYear.getTime() - refDate.getTime()) < Math.abs(date.getTime() - refDate.getTime())) {
        date = lastYear;
    }
    return date.getFullYear();
}

const WEEKDAY_DICTIONARY$b = {
    sunday: 0,
    sun: 0,
    "sun.": 0,
    monday: 1,
    mon: 1,
    "mon.": 1,
    tuesday: 2,
    tue: 2,
    "tue.": 2,
    wednesday: 3,
    wed: 3,
    "wed.": 3,
    thursday: 4,
    thurs: 4,
    "thurs.": 4,
    thur: 4,
    "thur.": 4,
    thu: 4,
    "thu.": 4,
    friday: 5,
    fri: 5,
    "fri.": 5,
    saturday: 6,
    sat: 6,
    "sat.": 6,
};
const FULL_MONTH_NAME_DICTIONARY$3 = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
};
const MONTH_DICTIONARY$b = {
    ...FULL_MONTH_NAME_DICTIONARY$3,
    jan: 1,
    "jan.": 1,
    feb: 2,
    "feb.": 2,
    mar: 3,
    "mar.": 3,
    apr: 4,
    "apr.": 4,
    jun: 6,
    "jun.": 6,
    jul: 7,
    "jul.": 7,
    aug: 8,
    "aug.": 8,
    sep: 9,
    "sep.": 9,
    sept: 9,
    "sept.": 9,
    oct: 10,
    "oct.": 10,
    nov: 11,
    "nov.": 11,
    dec: 12,
    "dec.": 12,
};
const INTEGER_WORD_DICTIONARY$a = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
};
const ORDINAL_WORD_DICTIONARY$4 = {
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5,
    sixth: 6,
    seventh: 7,
    eighth: 8,
    ninth: 9,
    tenth: 10,
    eleventh: 11,
    twelfth: 12,
    thirteenth: 13,
    fourteenth: 14,
    fifteenth: 15,
    sixteenth: 16,
    seventeenth: 17,
    eighteenth: 18,
    nineteenth: 19,
    twentieth: 20,
    "twenty first": 21,
    "twenty-first": 21,
    "twenty second": 22,
    "twenty-second": 22,
    "twenty third": 23,
    "twenty-third": 23,
    "twenty fourth": 24,
    "twenty-fourth": 24,
    "twenty fifth": 25,
    "twenty-fifth": 25,
    "twenty sixth": 26,
    "twenty-sixth": 26,
    "twenty seventh": 27,
    "twenty-seventh": 27,
    "twenty eighth": 28,
    "twenty-eighth": 28,
    "twenty ninth": 29,
    "twenty-ninth": 29,
    "thirtieth": 30,
    "thirty first": 31,
    "thirty-first": 31,
};
const TIME_UNIT_DICTIONARY_NO_ABBR = {
    second: "second",
    seconds: "second",
    minute: "minute",
    minutes: "minute",
    hour: "hour",
    hours: "hour",
    day: "day",
    days: "day",
    week: "week",
    weeks: "week",
    month: "month",
    months: "month",
    quarter: "quarter",
    quarters: "quarter",
    year: "year",
    years: "year",
};
const TIME_UNIT_DICTIONARY$a = {
    s: "second",
    sec: "second",
    second: "second",
    seconds: "second",
    m: "minute",
    min: "minute",
    mins: "minute",
    minute: "minute",
    minutes: "minute",
    h: "hour",
    hr: "hour",
    hrs: "hour",
    hour: "hour",
    hours: "hour",
    d: "day",
    day: "day",
    days: "day",
    w: "week",
    week: "week",
    weeks: "week",
    mo: "month",
    mon: "month",
    mos: "month",
    month: "month",
    months: "month",
    qtr: "quarter",
    quarter: "quarter",
    quarters: "quarter",
    y: "year",
    yr: "year",
    year: "year",
    years: "year",
    ...TIME_UNIT_DICTIONARY_NO_ABBR,
};
const NUMBER_PATTERN$a = `(?:${matchAnyPattern(INTEGER_WORD_DICTIONARY$a)}|[0-9]+|[0-9]+\\.[0-9]+|half(?:\\s{0,2}an?)?|an?\\b(?:\\s{0,2}few)?|few|several|the|a?\\s{0,2}couple\\s{0,2}(?:of)?)`;
function parseNumberPattern$a(match) {
    const num = match.toLowerCase();
    if (INTEGER_WORD_DICTIONARY$a[num] !== undefined) {
        return INTEGER_WORD_DICTIONARY$a[num];
    }
    else if (num === "a" || num === "an" || num == "the") {
        return 1;
    }
    else if (num.match(/few/)) {
        return 3;
    }
    else if (num.match(/half/)) {
        return 0.5;
    }
    else if (num.match(/couple/)) {
        return 2;
    }
    else if (num.match(/several/)) {
        return 7;
    }
    return parseFloat(num);
}
const ORDINAL_NUMBER_PATTERN$5 = `(?:${matchAnyPattern(ORDINAL_WORD_DICTIONARY$4)}|[0-9]{1,2}(?:st|nd|rd|th)?)`;
function parseOrdinalNumberPattern$5(match) {
    let num = match.toLowerCase();
    if (ORDINAL_WORD_DICTIONARY$4[num] !== undefined) {
        return ORDINAL_WORD_DICTIONARY$4[num];
    }
    num = num.replace(/(?:st|nd|rd|th)$/i, "");
    return parseInt(num);
}
const YEAR_PATTERN$9 = `(?:[1-9][0-9]{0,3}\\s{0,2}(?:BE|AD|BC|BCE|CE)|[1-9][0-9]{3}|[5-9][0-9]|2[0-5])`;
function parseYear$a(match) {
    if (/BE/i.test(match)) {
        match = match.replace(/BE/i, "");
        return parseInt(match) - 543;
    }
    if (/BCE?/i.test(match)) {
        match = match.replace(/BCE?/i, "");
        return -parseInt(match);
    }
    if (/(AD|CE)/i.test(match)) {
        match = match.replace(/(AD|CE)/i, "");
        return parseInt(match);
    }
    const rawYearNumber = parseInt(match);
    return findMostLikelyADYear(rawYearNumber);
}
const SINGLE_TIME_UNIT_PATTERN$a = `(${NUMBER_PATTERN$a})\\s{0,3}(${matchAnyPattern(TIME_UNIT_DICTIONARY$a)})`;
const SINGLE_TIME_UNIT_REGEX$a = new RegExp(SINGLE_TIME_UNIT_PATTERN$a, "i");
const SINGLE_TIME_UNIT_NO_ABBR_PATTERN$2 = `(${NUMBER_PATTERN$a})\\s{0,3}(${matchAnyPattern(TIME_UNIT_DICTIONARY_NO_ABBR)})`;
const TIME_UNIT_CONNECTOR_PATTERN = `\\s{0,5},?(?:\\s*and)?\\s{0,5}`;
const TIME_UNITS_PATTERN$a = repeatedTimeunitPattern(`(?:(?:about|around)\\s{0,3})?`, SINGLE_TIME_UNIT_PATTERN$a, TIME_UNIT_CONNECTOR_PATTERN);
const TIME_UNITS_NO_ABBR_PATTERN$2 = repeatedTimeunitPattern(`(?:(?:about|around)\\s{0,3})?`, SINGLE_TIME_UNIT_NO_ABBR_PATTERN$2, TIME_UNIT_CONNECTOR_PATTERN);
function parseDuration$a(timeunitText) {
    const fragments = {};
    let remainingText = timeunitText;
    let match = SINGLE_TIME_UNIT_REGEX$a.exec(remainingText);
    while (match) {
        collectDateTimeFragment$9(fragments, match);
        remainingText = remainingText.substring(match[0].length).trim();
        match = SINGLE_TIME_UNIT_REGEX$a.exec(remainingText);
    }
    if (Object.keys(fragments).length == 0) {
        return null;
    }
    return fragments;
}
function collectDateTimeFragment$9(fragments, match) {
    if (match[0].match(/^[a-zA-Z]+$/)) {
        return;
    }
    const num = parseNumberPattern$a(match[1]);
    const unit = TIME_UNIT_DICTIONARY$a[match[2].toLowerCase()];
    fragments[unit] = num;
}

class AbstractParserWithWordBoundaryChecking {
    innerPatternHasChange(context, currentInnerPattern) {
        return this.innerPattern(context) !== currentInnerPattern;
    }
    patternLeftBoundary() {
        return `(\\W|^)`;
    }
    cachedInnerPattern = null;
    cachedPattern = null;
    pattern(context) {
        if (this.cachedInnerPattern) {
            if (!this.innerPatternHasChange(context, this.cachedInnerPattern)) {
                return this.cachedPattern;
            }
        }
        this.cachedInnerPattern = this.innerPattern(context);
        this.cachedPattern = new RegExp(`${this.patternLeftBoundary()}${this.cachedInnerPattern.source}`, this.cachedInnerPattern.flags);
        return this.cachedPattern;
    }
    extract(context, match) {
        const header = match[1] ?? "";
        match.index = match.index + header.length;
        match[0] = match[0].substring(header.length);
        for (let i = 2; i < match.length; i++) {
            match[i - 1] = match[i];
        }
        return this.innerExtract(context, match);
    }
}

const PATTERN_WITH_OPTIONAL_PREFIX = new RegExp(`(?:(?:within|in|for)\\s*)?` +
    `(?:(?:about|around|roughly|approximately|just)\\s*(?:~\\s*)?)?(${TIME_UNITS_PATTERN$a})(?=\\W|$)`, "i");
const PATTERN_WITH_PREFIX$1 = new RegExp(`(?:within|in|for)\\s*` +
    `(?:(?:about|around|roughly|approximately|just)\\s*(?:~\\s*)?)?(${TIME_UNITS_PATTERN$a})(?=\\W|$)`, "i");
const PATTERN_WITH_PREFIX_STRICT = new RegExp(`(?:within|in|for)\\s*` +
    `(?:(?:about|around|roughly|approximately|just)\\s*(?:~\\s*)?)?(${TIME_UNITS_NO_ABBR_PATTERN$2})(?=\\W|$)`, "i");
class ENTimeUnitWithinFormatParser$1 extends AbstractParserWithWordBoundaryChecking {
    strictMode;
    constructor(strictMode) {
        super();
        this.strictMode = strictMode;
    }
    innerPattern(context) {
        if (this.strictMode) {
            return PATTERN_WITH_PREFIX_STRICT;
        }
        return context.option.forwardDate ? PATTERN_WITH_OPTIONAL_PREFIX : PATTERN_WITH_PREFIX$1;
    }
    innerExtract(context, match) {
        if (match[0].match(/^for\s*the\s*\w+/)) {
            return null;
        }
        const timeUnits = parseDuration$a(match[1]);
        if (!timeUnits) {
            return null;
        }
        return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
    }
}

const PATTERN$1b = new RegExp(`(?:on\\s{0,3})?` +
    `(${ORDINAL_NUMBER_PATTERN$5})` +
    `(?:` +
    `\\s{0,3}(?:to|\\-|\\–|until|through|till)?\\s{0,3}` +
    `(${ORDINAL_NUMBER_PATTERN$5})` +
    ")?" +
    `(?:-|/|\\s{0,3}(?:of)?\\s{0,3})` +
    `(${matchAnyPattern(MONTH_DICTIONARY$b)})` +
    "(?:" +
    `(?:-|/|,?\\s{0,3})` +
    `(${YEAR_PATTERN$9}(?!\\w))` +
    ")?" +
    "(?=\\W|$)", "i");
const DATE_GROUP$g = 1;
const DATE_TO_GROUP$c = 2;
const MONTH_NAME_GROUP$k = 3;
const YEAR_GROUP$r = 4;
class ENMonthNameLittleEndianParser$1 extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$1b;
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        const month = MONTH_DICTIONARY$b[match[MONTH_NAME_GROUP$k].toLowerCase()];
        const day = parseOrdinalNumberPattern$5(match[DATE_GROUP$g]);
        if (day > 31) {
            match.index = match.index + match[DATE_GROUP$g].length;
            return null;
        }
        result.start.assign("month", month);
        result.start.assign("day", day);
        if (match[YEAR_GROUP$r]) {
            const yearNumber = parseYear$a(match[YEAR_GROUP$r]);
            result.start.assign("year", yearNumber);
        }
        else {
            const year = findYearClosestToRef(context.refDate, day, month);
            result.start.imply("year", year);
        }
        if (match[DATE_TO_GROUP$c]) {
            const endDate = parseOrdinalNumberPattern$5(match[DATE_TO_GROUP$c]);
            result.end = result.start.clone();
            result.end.assign("day", endDate);
        }
        return result;
    }
}

const PATTERN$1a = new RegExp(`(${matchAnyPattern(MONTH_DICTIONARY$b)})` +
    "(?:-|/|\\s*,?\\s*)" +
    `(${ORDINAL_NUMBER_PATTERN$5})(?!\\s*(?:am|pm))\\s*` +
    "(?:" +
    "(?:to|\\-)\\s*" +
    `(${ORDINAL_NUMBER_PATTERN$5})\\s*` +
    ")?" +
    "(?:" +
    `(?:-|/|\\s*,\\s*|\\s+)` +
    `(${YEAR_PATTERN$9})` +
    ")?" +
    "(?=\\W|$)(?!\\:\\d)", "i");
const MONTH_NAME_GROUP$j = 1;
const DATE_GROUP$f = 2;
const DATE_TO_GROUP$b = 3;
const YEAR_GROUP$q = 4;
class ENMonthNameMiddleEndianParser$1 extends AbstractParserWithWordBoundaryChecking {
    shouldSkipYearLikeDate;
    constructor(shouldSkipYearLikeDate) {
        super();
        this.shouldSkipYearLikeDate = shouldSkipYearLikeDate;
    }
    innerPattern() {
        return PATTERN$1a;
    }
    innerExtract(context, match) {
        const month = MONTH_DICTIONARY$b[match[MONTH_NAME_GROUP$j].toLowerCase()];
        const day = parseOrdinalNumberPattern$5(match[DATE_GROUP$f]);
        if (day > 31) {
            return null;
        }
        if (this.shouldSkipYearLikeDate) {
            if (!match[DATE_TO_GROUP$b] && !match[YEAR_GROUP$q] && match[DATE_GROUP$f].match(/^2[0-5]$/)) {
                return null;
            }
        }
        const components = context
            .createParsingComponents({
            day: day,
            month: month,
        })
            .addTag("parser/ENMonthNameMiddleEndianParser");
        if (match[YEAR_GROUP$q]) {
            const year = parseYear$a(match[YEAR_GROUP$q]);
            components.assign("year", year);
        }
        else {
            const year = findYearClosestToRef(context.refDate, day, month);
            components.imply("year", year);
        }
        if (!match[DATE_TO_GROUP$b]) {
            return components;
        }
        const endDate = parseOrdinalNumberPattern$5(match[DATE_TO_GROUP$b]);
        const result = context.createParsingResult(match.index, match[0]);
        result.start = components;
        result.end = components.clone();
        result.end.assign("day", endDate);
        return result;
    }
}

const PATTERN$19 = new RegExp(`((?:in)\\s*)?` +
    `(${matchAnyPattern(MONTH_DICTIONARY$b)})` +
    `\\s*` +
    `(?:` +
    `(?:,|-|of)?\\s*(${YEAR_PATTERN$9})?` +
    ")?" +
    "(?=[^\\s\\w]|\\s+[^0-9]|\\s+$|$)", "i");
const PREFIX_GROUP$b = 1;
const MONTH_NAME_GROUP$i = 2;
const YEAR_GROUP$p = 3;
class ENMonthNameParser$1 extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$19;
    }
    innerExtract(context, match) {
        const monthName = match[MONTH_NAME_GROUP$i].toLowerCase();
        if (match[0].length <= 3 && !FULL_MONTH_NAME_DICTIONARY$3[monthName]) {
            return null;
        }
        const result = context.createParsingResult(match.index + (match[PREFIX_GROUP$b] || "").length, match.index + match[0].length);
        result.start.imply("day", 1);
        result.start.addTag("parser/ENMonthNameParser");
        const month = MONTH_DICTIONARY$b[monthName];
        result.start.assign("month", month);
        if (match[YEAR_GROUP$p]) {
            const year = parseYear$a(match[YEAR_GROUP$p]);
            result.start.assign("year", year);
        }
        else {
            const year = findYearClosestToRef(context.refDate, 1, month);
            result.start.imply("year", year);
        }
        return result;
    }
}

const PATTERN$18 = new RegExp(`([0-9]{4})[-\\.\\/\\s]` +
    `(?:(${matchAnyPattern(MONTH_DICTIONARY$b)})|([0-9]{1,2}))[-\\.\\/\\s]` +
    `([0-9]{1,2})` +
    "(?=\\W|$)", "i");
const YEAR_NUMBER_GROUP$4 = 1;
const MONTH_NAME_GROUP$h = 2;
const MONTH_NUMBER_GROUP$3 = 3;
const DATE_NUMBER_GROUP$3 = 4;
class ENYearMonthDayParser extends AbstractParserWithWordBoundaryChecking {
    strictMonthDateOrder;
    constructor(strictMonthDateOrder) {
        super();
        this.strictMonthDateOrder = strictMonthDateOrder;
    }
    innerPattern() {
        return PATTERN$18;
    }
    innerExtract(context, match) {
        const year = parseInt(match[YEAR_NUMBER_GROUP$4]);
        let day = parseInt(match[DATE_NUMBER_GROUP$3]);
        let month = match[MONTH_NUMBER_GROUP$3]
            ? parseInt(match[MONTH_NUMBER_GROUP$3])
            : MONTH_DICTIONARY$b[match[MONTH_NAME_GROUP$h].toLowerCase()];
        if (month < 1 || month > 12) {
            if (this.strictMonthDateOrder) {
                return null;
            }
            if (day >= 1 && day <= 12) {
                [month, day] = [day, month];
            }
        }
        if (day < 1 || day > 31) {
            return null;
        }
        return {
            day: day,
            month: month,
            year: year,
        };
    }
}

const PATTERN$17 = new RegExp("([0-9]|0[1-9]|1[012])/([0-9]{4})" + "", "i");
const MONTH_GROUP$8 = 1;
const YEAR_GROUP$o = 2;
class ENSlashMonthFormatParser$1 extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$17;
    }
    innerExtract(context, match) {
        const year = parseInt(match[YEAR_GROUP$o]);
        const month = parseInt(match[MONTH_GROUP$8]);
        return context.createParsingComponents().imply("day", 1).assign("month", month).assign("year", year);
    }
}

function primaryTimePattern(leftBoundary, primaryPrefix, primarySuffix, flags) {
    return new RegExp(`${leftBoundary}` +
        `${primaryPrefix}` +
        `(\\d{1,4})` +
        `(?:` +
        `(?:\\.|:|：)` +
        `(\\d{1,2})` +
        `(?:` +
        `(?::|：)` +
        `(\\d{2})` +
        `(?:\\.(\\d{1,6}))?` +
        `)?` +
        `)?` +
        `(?:\\s*(a\\.m\\.|p\\.m\\.|am?|pm?))?` +
        `${primarySuffix}`, flags);
}
function followingTimePatten(followingPhase, followingSuffix) {
    return new RegExp(`^(${followingPhase})` +
        `(\\d{1,4})` +
        `(?:` +
        `(?:\\.|\\:|\\：)` +
        `(\\d{1,2})` +
        `(?:` +
        `(?:\\.|\\:|\\：)` +
        `(\\d{1,2})(?:\\.(\\d{1,6}))?` +
        `)?` +
        `)?` +
        `(?:\\s*(a\\.m\\.|p\\.m\\.|am?|pm?))?` +
        `${followingSuffix}`, "i");
}
const HOUR_GROUP$6 = 2;
const MINUTE_GROUP$5 = 3;
const SECOND_GROUP$5 = 4;
const MILLI_SECOND_GROUP = 5;
const AM_PM_HOUR_GROUP$4 = 6;
class AbstractTimeExpressionParser {
    strictMode;
    constructor(strictMode = false) {
        this.strictMode = strictMode;
    }
    patternFlags() {
        return "i";
    }
    primaryPatternLeftBoundary() {
        return `(^|\\s|T|\\b)`;
    }
    primarySuffix() {
        return `(?!/)(?=\\W|$)`;
    }
    followingSuffix() {
        return `(?!/)(?=\\W|$)`;
    }
    pattern(context) {
        return this.getPrimaryTimePatternThroughCache();
    }
    extract(context, match) {
        const startComponents = this.extractPrimaryTimeComponents(context, match);
        if (!startComponents) {
            if (match[0].match(/^\d{4}/)) {
                match.index += 4;
                return null;
            }
            match.index += match[0].length;
            return null;
        }
        const index = match.index + match[1].length;
        const text = match[0].substring(match[1].length);
        const result = context.createParsingResult(index, text, startComponents);
        match.index += match[0].length;
        const remainingText = context.text.substring(match.index);
        const followingPattern = this.getFollowingTimePatternThroughCache();
        const followingMatch = followingPattern.exec(remainingText);
        if (text.match(/^\d{3,4}/) && followingMatch) {
            if (followingMatch[0].match(/^\s*([+-])\s*\d{2,4}$/)) {
                return null;
            }
            if (followingMatch[0].match(/^\s*([+-])\s*\d{2}\W\d{2}/)) {
                return null;
            }
        }
        if (!followingMatch ||
            followingMatch[0].match(/^\s*([+-])\s*\d{3,4}$/)) {
            return this.checkAndReturnWithoutFollowingPattern(result);
        }
        result.end = this.extractFollowingTimeComponents(context, followingMatch, result);
        if (result.end) {
            result.text += followingMatch[0];
        }
        return this.checkAndReturnWithFollowingPattern(result);
    }
    extractPrimaryTimeComponents(context, match, strict = false) {
        const components = context.createParsingComponents();
        let minute = 0;
        let meridiem = null;
        let hour = parseInt(match[HOUR_GROUP$6]);
        if (hour > 100) {
            if (match[HOUR_GROUP$6].length == 4 && match[MINUTE_GROUP$5] == null && !match[AM_PM_HOUR_GROUP$4]) {
                return null;
            }
            if (this.strictMode || match[MINUTE_GROUP$5] != null) {
                return null;
            }
            minute = hour % 100;
            hour = Math.floor(hour / 100);
        }
        if (hour > 24) {
            return null;
        }
        if (match[MINUTE_GROUP$5] != null) {
            if (match[MINUTE_GROUP$5].length == 1 && !match[AM_PM_HOUR_GROUP$4]) {
                return null;
            }
            minute = parseInt(match[MINUTE_GROUP$5]);
        }
        if (minute >= 60) {
            return null;
        }
        if (hour > 12) {
            meridiem = Meridiem.PM;
        }
        if (match[AM_PM_HOUR_GROUP$4] != null) {
            if (hour > 12)
                return null;
            const ampm = match[AM_PM_HOUR_GROUP$4][0].toLowerCase();
            if (ampm == "a") {
                meridiem = Meridiem.AM;
                if (hour == 12) {
                    hour = 0;
                }
            }
            if (ampm == "p") {
                meridiem = Meridiem.PM;
                if (hour != 12) {
                    hour += 12;
                }
            }
        }
        components.assign("hour", hour);
        components.assign("minute", minute);
        if (meridiem !== null) {
            components.assign("meridiem", meridiem);
        }
        else {
            if (hour < 12) {
                components.imply("meridiem", Meridiem.AM);
            }
            else {
                components.imply("meridiem", Meridiem.PM);
            }
        }
        if (match[MILLI_SECOND_GROUP] != null) {
            const millisecond = parseInt(match[MILLI_SECOND_GROUP].substring(0, 3));
            if (millisecond >= 1000)
                return null;
            components.assign("millisecond", millisecond);
        }
        if (match[SECOND_GROUP$5] != null) {
            const second = parseInt(match[SECOND_GROUP$5]);
            if (second >= 60)
                return null;
            components.assign("second", second);
        }
        return components;
    }
    extractFollowingTimeComponents(context, match, result) {
        const components = context.createParsingComponents();
        if (match[MILLI_SECOND_GROUP] != null) {
            const millisecond = parseInt(match[MILLI_SECOND_GROUP].substring(0, 3));
            if (millisecond >= 1000)
                return null;
            components.assign("millisecond", millisecond);
        }
        if (match[SECOND_GROUP$5] != null) {
            const second = parseInt(match[SECOND_GROUP$5]);
            if (second >= 60)
                return null;
            components.assign("second", second);
        }
        let hour = parseInt(match[HOUR_GROUP$6]);
        let minute = 0;
        let meridiem = -1;
        if (match[MINUTE_GROUP$5] != null) {
            minute = parseInt(match[MINUTE_GROUP$5]);
        }
        else if (hour > 100) {
            minute = hour % 100;
            hour = Math.floor(hour / 100);
        }
        if (minute >= 60 || hour > 24) {
            return null;
        }
        if (hour >= 12) {
            meridiem = Meridiem.PM;
        }
        if (match[AM_PM_HOUR_GROUP$4] != null) {
            if (hour > 12) {
                return null;
            }
            const ampm = match[AM_PM_HOUR_GROUP$4][0].toLowerCase();
            if (ampm == "a") {
                meridiem = Meridiem.AM;
                if (hour == 12) {
                    hour = 0;
                    if (!components.isCertain("day")) {
                        components.imply("day", components.get("day") + 1);
                    }
                }
            }
            if (ampm == "p") {
                meridiem = Meridiem.PM;
                if (hour != 12)
                    hour += 12;
            }
            if (!result.start.isCertain("meridiem")) {
                if (meridiem == Meridiem.AM) {
                    result.start.imply("meridiem", Meridiem.AM);
                    if (result.start.get("hour") == 12) {
                        result.start.assign("hour", 0);
                    }
                }
                else {
                    result.start.imply("meridiem", Meridiem.PM);
                    if (result.start.get("hour") != 12) {
                        result.start.assign("hour", result.start.get("hour") + 12);
                    }
                }
            }
        }
        components.assign("hour", hour);
        components.assign("minute", minute);
        if (meridiem >= 0) {
            components.assign("meridiem", meridiem);
        }
        else {
            const startAtPM = result.start.isCertain("meridiem") && result.start.get("hour") > 12;
            if (startAtPM) {
                if (result.start.get("hour") - 12 > hour) {
                    components.imply("meridiem", Meridiem.AM);
                }
                else if (hour <= 12) {
                    components.assign("hour", hour + 12);
                    components.assign("meridiem", Meridiem.PM);
                }
            }
            else if (hour > 12) {
                components.imply("meridiem", Meridiem.PM);
            }
            else if (hour <= 12) {
                components.imply("meridiem", Meridiem.AM);
            }
        }
        if (components.date().getTime() < result.start.date().getTime()) {
            components.imply("day", components.get("day") + 1);
        }
        return components;
    }
    checkAndReturnWithoutFollowingPattern(result) {
        if (result.text.match(/^\d$/)) {
            return null;
        }
        if (result.text.match(/^\d\d\d+$/)) {
            return null;
        }
        if (result.text.match(/\d[apAP]$/)) {
            return null;
        }
        const endingWithNumbers = result.text.match(/[^\d:.](\d[\d.]+)$/);
        if (endingWithNumbers) {
            const endingNumbers = endingWithNumbers[1];
            if (this.strictMode) {
                return null;
            }
            if (endingNumbers.includes(".") && !endingNumbers.match(/\d(\.\d{2})+$/)) {
                return null;
            }
            const endingNumberVal = parseInt(endingNumbers);
            if (endingNumberVal > 24) {
                return null;
            }
        }
        return result;
    }
    checkAndReturnWithFollowingPattern(result) {
        if (result.text.match(/^\d+-\d+$/)) {
            return null;
        }
        const endingWithNumbers = result.text.match(/[^\d:.](\d[\d.]+)\s*-\s*(\d[\d.]+)$/);
        if (endingWithNumbers) {
            if (this.strictMode) {
                return null;
            }
            const startingNumbers = endingWithNumbers[1];
            const endingNumbers = endingWithNumbers[2];
            if (endingNumbers.includes(".") && !endingNumbers.match(/\d(\.\d{2})+$/)) {
                return null;
            }
            const endingNumberVal = parseInt(endingNumbers);
            const startingNumberVal = parseInt(startingNumbers);
            if (endingNumberVal > 24 || startingNumberVal > 24) {
                return null;
            }
        }
        return result;
    }
    cachedPrimaryPrefix = null;
    cachedPrimarySuffix = null;
    cachedPrimaryTimePattern = null;
    getPrimaryTimePatternThroughCache() {
        const primaryPrefix = this.primaryPrefix();
        const primarySuffix = this.primarySuffix();
        if (this.cachedPrimaryPrefix === primaryPrefix && this.cachedPrimarySuffix === primarySuffix) {
            return this.cachedPrimaryTimePattern;
        }
        this.cachedPrimaryTimePattern = primaryTimePattern(this.primaryPatternLeftBoundary(), primaryPrefix, primarySuffix, this.patternFlags());
        this.cachedPrimaryPrefix = primaryPrefix;
        this.cachedPrimarySuffix = primarySuffix;
        return this.cachedPrimaryTimePattern;
    }
    cachedFollowingPhase = null;
    cachedFollowingSuffix = null;
    cachedFollowingTimePatten = null;
    getFollowingTimePatternThroughCache() {
        const followingPhase = this.followingPhase();
        const followingSuffix = this.followingSuffix();
        if (this.cachedFollowingPhase === followingPhase && this.cachedFollowingSuffix === followingSuffix) {
            return this.cachedFollowingTimePatten;
        }
        this.cachedFollowingTimePatten = followingTimePatten(followingPhase, followingSuffix);
        this.cachedFollowingPhase = followingPhase;
        this.cachedFollowingSuffix = followingSuffix;
        return this.cachedFollowingTimePatten;
    }
}

class ENTimeExpressionParser$1 extends AbstractTimeExpressionParser {
    constructor(strictMode) {
        super(strictMode);
    }
    followingPhase() {
        return "\\s*(?:\\-|\\–|\\~|\\〜|to|until|through|till|\\?)\\s*";
    }
    primaryPrefix() {
        return "(?:(?:at|from)\\s*)??";
    }
    primarySuffix() {
        return "(?:\\s*(?:o\\W*clock|at\\s*night|in\\s*the\\s*(?:morning|afternoon)))?(?!/)(?=\\W|$)";
    }
    extractPrimaryTimeComponents(context, match) {
        const components = super.extractPrimaryTimeComponents(context, match);
        if (!components) {
            return components;
        }
        if (match[0].endsWith("night")) {
            const hour = components.get("hour");
            if (hour >= 6 && hour < 12) {
                components.assign("hour", components.get("hour") + 12);
                components.assign("meridiem", Meridiem.PM);
            }
            else if (hour < 6) {
                components.assign("meridiem", Meridiem.AM);
            }
        }
        if (match[0].endsWith("afternoon")) {
            components.assign("meridiem", Meridiem.PM);
            const hour = components.get("hour");
            if (hour >= 0 && hour <= 6) {
                components.assign("hour", components.get("hour") + 12);
            }
        }
        if (match[0].endsWith("morning")) {
            components.assign("meridiem", Meridiem.AM);
            const hour = components.get("hour");
            if (hour < 12) {
                components.assign("hour", components.get("hour"));
            }
        }
        return components.addTag("parser/ENTimeExpressionParser");
    }
    extractFollowingTimeComponents(context, match, result) {
        const followingComponents = super.extractFollowingTimeComponents(context, match, result);
        if (followingComponents) {
            followingComponents.addTag("parser/ENTimeExpressionParser");
        }
        return followingComponents;
    }
}

const PATTERN$16 = new RegExp(`(${TIME_UNITS_PATTERN$a})\\s{0,5}(?:ago|before|earlier)(?=\\W|$)`, "i");
const STRICT_PATTERN$5 = new RegExp(`(${TIME_UNITS_NO_ABBR_PATTERN$2})\\s{0,5}(?:ago|before|earlier)(?=\\W|$)`, "i");
class ENTimeUnitAgoFormatParser$1 extends AbstractParserWithWordBoundaryChecking {
    strictMode;
    constructor(strictMode) {
        super();
        this.strictMode = strictMode;
    }
    innerPattern() {
        return this.strictMode ? STRICT_PATTERN$5 : PATTERN$16;
    }
    innerExtract(context, match) {
        const duration = parseDuration$a(match[1]);
        if (!duration) {
            return null;
        }
        return ParsingComponents.createRelativeFromReference(context.reference, reverseDuration(duration));
    }
}

const PATTERN$15 = new RegExp(`(${TIME_UNITS_PATTERN$a})\\s{0,5}(?:later|after|from now|henceforth|forward|out)` + "(?=(?:\\W|$))", "i");
const STRICT_PATTERN$4 = new RegExp(`(${TIME_UNITS_NO_ABBR_PATTERN$2})\\s{0,5}(later|after|from now)(?=\\W|$)`, "i");
const GROUP_NUM_TIMEUNITS$2 = 1;
class ENTimeUnitLaterFormatParser$1 extends AbstractParserWithWordBoundaryChecking {
    strictMode;
    constructor(strictMode) {
        super();
        this.strictMode = strictMode;
    }
    innerPattern() {
        return this.strictMode ? STRICT_PATTERN$4 : PATTERN$15;
    }
    innerExtract(context, match) {
        const timeUnits = parseDuration$a(match[GROUP_NUM_TIMEUNITS$2]);
        if (!timeUnits) {
            return null;
        }
        return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
    }
}

class Filter {
    refine(context, results) {
        return results.filter((r) => this.isValid(context, r));
    }
}
class MergingRefiner {
    refine(context, results) {
        if (results.length < 2) {
            return results;
        }
        const mergedResults = [];
        let curResult = results[0];
        let nextResult = null;
        for (let i = 1; i < results.length; i++) {
            nextResult = results[i];
            const textBetween = context.text.substring(curResult.index + curResult.text.length, nextResult.index);
            if (!this.shouldMergeResults(textBetween, curResult, nextResult, context)) {
                mergedResults.push(curResult);
                curResult = nextResult;
            }
            else {
                const left = curResult;
                const right = nextResult;
                const mergedResult = this.mergeResults(textBetween, left, right, context);
                context.debug(() => {
                    console.log(`${this.constructor.name} merged ${left} and ${right} into ${mergedResult}`);
                });
                curResult = mergedResult;
            }
        }
        if (curResult != null) {
            mergedResults.push(curResult);
        }
        return mergedResults;
    }
}

class AbstractMergeDateRangeRefiner extends MergingRefiner {
    shouldMergeResults(textBetween, currentResult, nextResult) {
        return !currentResult.end && !nextResult.end && textBetween.match(this.patternBetween()) != null;
    }
    mergeResults(textBetween, fromResult, toResult) {
        if (!fromResult.start.isOnlyWeekdayComponent() && !toResult.start.isOnlyWeekdayComponent()) {
            toResult.start.getCertainComponents().forEach((key) => {
                if (!fromResult.start.isCertain(key)) {
                    fromResult.start.imply(key, toResult.start.get(key));
                }
            });
            fromResult.start.getCertainComponents().forEach((key) => {
                if (!toResult.start.isCertain(key)) {
                    toResult.start.imply(key, fromResult.start.get(key));
                }
            });
        }
        if (fromResult.start.date() > toResult.start.date()) {
            let fromDate = fromResult.start.date();
            let toDate = toResult.start.date();
            if (toResult.start.isOnlyWeekdayComponent() && addDuration(toDate, { day: 7 }) > fromDate) {
                toDate = addDuration(toDate, { day: 7 });
                toResult.start.imply("day", toDate.getDate());
                toResult.start.imply("month", toDate.getMonth() + 1);
                toResult.start.imply("year", toDate.getFullYear());
            }
            else if (fromResult.start.isOnlyWeekdayComponent() && addDuration(fromDate, { day: -7 }) < toDate) {
                fromDate = addDuration(fromDate, { day: -7 });
                fromResult.start.imply("day", fromDate.getDate());
                fromResult.start.imply("month", fromDate.getMonth() + 1);
                fromResult.start.imply("year", fromDate.getFullYear());
            }
            else if (toResult.start.isDateWithUnknownYear() && addDuration(toDate, { year: 1 }) > fromDate) {
                toDate = addDuration(toDate, { year: 1 });
                toResult.start.imply("year", toDate.getFullYear());
            }
            else if (fromResult.start.isDateWithUnknownYear() && addDuration(fromDate, { year: -1 }) < toDate) {
                fromDate = addDuration(fromDate, { year: -1 });
                fromResult.start.imply("year", fromDate.getFullYear());
            }
            else {
                [toResult, fromResult] = [fromResult, toResult];
            }
        }
        const result = fromResult.clone();
        result.start = fromResult.start;
        result.end = toResult.start;
        result.index = Math.min(fromResult.index, toResult.index);
        if (fromResult.index < toResult.index) {
            result.text = fromResult.text + textBetween + toResult.text;
        }
        else {
            result.text = toResult.text + textBetween + fromResult.text;
        }
        return result;
    }
}

class ENMergeDateRangeRefiner$1 extends AbstractMergeDateRangeRefiner {
    patternBetween() {
        return /^\s*(to|-|–|until|through|till)\s*$/i;
    }
}

function mergeDateTimeResult(dateResult, timeResult) {
    const result = dateResult.clone();
    const beginDate = dateResult.start;
    const beginTime = timeResult.start;
    result.start = mergeDateTimeComponent(beginDate, beginTime);
    if (dateResult.end != null || timeResult.end != null) {
        const endDate = dateResult.end == null ? dateResult.start : dateResult.end;
        const endTime = timeResult.end == null ? timeResult.start : timeResult.end;
        const endDateTime = mergeDateTimeComponent(endDate, endTime);
        if (dateResult.end == null && endDateTime.date().getTime() < result.start.date().getTime()) {
            const nextDay = new Date(endDateTime.date().getTime());
            nextDay.setDate(nextDay.getDate() + 1);
            if (endDateTime.isCertain("day")) {
                assignSimilarDate(endDateTime, nextDay);
            }
            else {
                implySimilarDate(endDateTime, nextDay);
            }
        }
        result.end = endDateTime;
    }
    return result;
}
function mergeDateTimeComponent(dateComponent, timeComponent) {
    const dateTimeComponent = dateComponent.clone();
    if (timeComponent.isCertain("hour")) {
        dateTimeComponent.assign("hour", timeComponent.get("hour"));
        dateTimeComponent.assign("minute", timeComponent.get("minute"));
        if (timeComponent.isCertain("second")) {
            dateTimeComponent.assign("second", timeComponent.get("second"));
            if (timeComponent.isCertain("millisecond")) {
                dateTimeComponent.assign("millisecond", timeComponent.get("millisecond"));
            }
            else {
                dateTimeComponent.imply("millisecond", timeComponent.get("millisecond"));
            }
        }
        else {
            dateTimeComponent.imply("second", timeComponent.get("second"));
            dateTimeComponent.imply("millisecond", timeComponent.get("millisecond"));
        }
    }
    else {
        dateTimeComponent.imply("hour", timeComponent.get("hour"));
        dateTimeComponent.imply("minute", timeComponent.get("minute"));
        dateTimeComponent.imply("second", timeComponent.get("second"));
        dateTimeComponent.imply("millisecond", timeComponent.get("millisecond"));
    }
    if (timeComponent.isCertain("timezoneOffset")) {
        dateTimeComponent.assign("timezoneOffset", timeComponent.get("timezoneOffset"));
    }
    const dateHasMeaningfulMeridiem = dateComponent.get("meridiem") != null &&
        (dateComponent.isCertain("meridiem") ||
            Array.from(dateComponent.tags()).some((t) => t.startsWith("casualReference/")));
    if (timeComponent.isCertain("meridiem")) {
        dateTimeComponent.assign("meridiem", timeComponent.get("meridiem"));
    }
    else if (timeComponent.get("meridiem") != null && !dateHasMeaningfulMeridiem) {
        dateTimeComponent.imply("meridiem", timeComponent.get("meridiem"));
    }
    if (dateTimeComponent.get("meridiem") == Meridiem.PM && dateTimeComponent.get("hour") < 12) {
        if (timeComponent.isCertain("hour")) {
            dateTimeComponent.assign("hour", dateTimeComponent.get("hour") + 12);
        }
        else {
            dateTimeComponent.imply("hour", dateTimeComponent.get("hour") + 12);
        }
    }
    dateTimeComponent.addTags(dateComponent.tags());
    dateTimeComponent.addTags(timeComponent.tags());
    return dateTimeComponent;
}

class AbstractMergeDateTimeRefiner extends MergingRefiner {
    shouldMergeResults(textBetween, currentResult, nextResult) {
        return (((currentResult.start.isOnlyDate() && nextResult.start.isOnlyTime()) ||
            (nextResult.start.isOnlyDate() && currentResult.start.isOnlyTime())) &&
            textBetween.match(this.patternBetween()) != null);
    }
    mergeResults(textBetween, currentResult, nextResult) {
        const result = currentResult.start.isOnlyDate()
            ? mergeDateTimeResult(currentResult, nextResult)
            : mergeDateTimeResult(nextResult, currentResult);
        result.index = currentResult.index;
        result.text = currentResult.text + textBetween + nextResult.text;
        return result;
    }
}

class ENMergeDateTimeRefiner$1 extends AbstractMergeDateTimeRefiner {
    patternBetween() {
        return new RegExp("^\\s*(T|at|after|before|on|of|,|-|\\.|∙|:)?\\s*$");
    }
}

const TIMEZONE_NAME_PATTERN = new RegExp("^\\s*,?\\s*\\(?([A-Z]{2,4})\\)?(?=\\W|$)", "i");
class ExtractTimezoneAbbrRefiner {
    timezoneOverrides;
    constructor(timezoneOverrides) {
        this.timezoneOverrides = timezoneOverrides;
    }
    refine(context, results) {
        const timezoneOverrides = context.option.timezones ?? {};
        results.forEach((result) => {
            const suffix = context.text.substring(result.index + result.text.length);
            const match = TIMEZONE_NAME_PATTERN.exec(suffix);
            if (!match) {
                return;
            }
            const timezoneAbbr = match[1].toUpperCase();
            const refDate = result.start.date() ?? result.refDate ?? new Date();
            const tzOverrides = { ...this.timezoneOverrides, ...timezoneOverrides };
            const extractedTimezoneOffset = toTimezoneOffset(timezoneAbbr, refDate, tzOverrides);
            if (extractedTimezoneOffset == null) {
                return;
            }
            context.debug(() => {
                console.log(`Extracting timezone: '${timezoneAbbr}' into: ${extractedTimezoneOffset} for: ${result.start}`);
            });
            const currentTimezoneOffset = result.start.get("timezoneOffset");
            if (currentTimezoneOffset !== null && extractedTimezoneOffset != currentTimezoneOffset) {
                if (result.start.isCertain("timezoneOffset")) {
                    return;
                }
                if (timezoneAbbr != match[1]) {
                    return;
                }
            }
            if (result.start.isOnlyDate()) {
                if (timezoneAbbr != match[1]) {
                    return;
                }
            }
            result.text += match[0];
            if (!result.start.isCertain("timezoneOffset")) {
                result.start.assign("timezoneOffset", extractedTimezoneOffset);
            }
            if (result.end != null && !result.end.isCertain("timezoneOffset")) {
                result.end.assign("timezoneOffset", extractedTimezoneOffset);
            }
        });
        return results;
    }
}

const TIMEZONE_OFFSET_PATTERN = new RegExp("^\\s*(?:\\(?(?:GMT|UTC)\\s?)?([+-])(\\d{1,2})(?::?(\\d{2}))?\\)?", "i");
const TIMEZONE_OFFSET_SIGN_GROUP = 1;
const TIMEZONE_OFFSET_HOUR_OFFSET_GROUP = 2;
const TIMEZONE_OFFSET_MINUTE_OFFSET_GROUP = 3;
class ExtractTimezoneOffsetRefiner {
    refine(context, results) {
        results.forEach(function (result) {
            if (result.start.isCertain("timezoneOffset")) {
                return;
            }
            const suffix = context.text.substring(result.index + result.text.length);
            const match = TIMEZONE_OFFSET_PATTERN.exec(suffix);
            if (!match) {
                return;
            }
            context.debug(() => {
                console.log(`Extracting timezone: '${match[0]}' into : ${result}`);
            });
            const hourOffset = parseInt(match[TIMEZONE_OFFSET_HOUR_OFFSET_GROUP]);
            const minuteOffset = parseInt(match[TIMEZONE_OFFSET_MINUTE_OFFSET_GROUP] || "0");
            let timezoneOffset = hourOffset * 60 + minuteOffset;
            if (timezoneOffset > 14 * 60) {
                return;
            }
            if (match[TIMEZONE_OFFSET_SIGN_GROUP] === "-") {
                timezoneOffset = -timezoneOffset;
            }
            if (result.end != null) {
                result.end.assign("timezoneOffset", timezoneOffset);
            }
            result.start.assign("timezoneOffset", timezoneOffset);
            result.text += match[0];
        });
        return results;
    }
}

class OverlapRemovalRefiner {
    refine(context, results) {
        if (results.length < 2) {
            return results;
        }
        const filteredResults = [];
        let prevResult = results[0];
        for (let i = 1; i < results.length; i++) {
            const result = results[i];
            if (result.index >= prevResult.index + prevResult.text.length) {
                filteredResults.push(prevResult);
                prevResult = result;
                continue;
            }
            let kept = null;
            let removed = null;
            if (result.text.length > prevResult.text.length) {
                kept = result;
                removed = prevResult;
            }
            else {
                kept = prevResult;
                removed = result;
            }
            context.debug(() => {
                console.log(`${this.constructor.name} remove ${removed} by ${kept}`);
            });
            prevResult = kept;
        }
        if (prevResult != null) {
            filteredResults.push(prevResult);
        }
        return filteredResults;
    }
}

function createParsingComponentsAtWeekday(reference, weekday, modifier) {
    const refDate = reference.getDateWithAdjustedTimezone();
    const daysToWeekday = getDaysToWeekday(refDate, weekday, modifier);
    let components = new ParsingComponents(reference);
    components = components.addDurationAsImplied({ day: daysToWeekday });
    components.assign("weekday", weekday);
    return components;
}
function getDaysToWeekday(refDate, weekday, modifier) {
    const refWeekday = refDate.getDay();
    switch (modifier) {
        case "this":
            return getDaysForwardToWeekday(refDate, weekday);
        case "last":
            return getBackwardDaysToWeekday(refDate, weekday);
        case "next":
            if (refWeekday == Weekday.SUNDAY) {
                return weekday == Weekday.SUNDAY ? 7 : weekday;
            }
            if (refWeekday == Weekday.SATURDAY) {
                if (weekday == Weekday.SATURDAY)
                    return 7;
                if (weekday == Weekday.SUNDAY)
                    return 8;
                return 1 + weekday;
            }
            if (weekday < refWeekday && weekday != Weekday.SUNDAY) {
                return getDaysForwardToWeekday(refDate, weekday);
            }
            else {
                return getDaysForwardToWeekday(refDate, weekday) + 7;
            }
    }
    return getDaysToWeekdayClosest(refDate, weekday);
}
function getDaysToWeekdayClosest(refDate, weekday) {
    const backward = getBackwardDaysToWeekday(refDate, weekday);
    const forward = getDaysForwardToWeekday(refDate, weekday);
    return forward < -backward ? forward : backward;
}
function getDaysForwardToWeekday(refDate, weekday) {
    const refWeekday = refDate.getDay();
    let forwardCount = weekday - refWeekday;
    if (forwardCount < 0) {
        forwardCount += 7;
    }
    return forwardCount;
}
function getBackwardDaysToWeekday(refDate, weekday) {
    const refWeekday = refDate.getDay();
    let backwardCount = weekday - refWeekday;
    if (backwardCount >= 0) {
        backwardCount -= 7;
    }
    return backwardCount;
}

class ForwardDateRefiner {
    refine(context, results) {
        if (!context.option.forwardDate) {
            return results;
        }
        results.forEach((result) => {
            let refDate = context.reference.getDateWithAdjustedTimezone();
            if (result.start.isOnlyTime() && context.reference.instant > result.start.date()) {
                const refDate = context.reference.getDateWithAdjustedTimezone();
                const refFollowingDay = new Date(refDate);
                refFollowingDay.setDate(refFollowingDay.getDate() + 1);
                implySimilarDate(result.start, refFollowingDay);
                context.debug(() => {
                    console.log(`${this.constructor.name} adjusted ${result} time from the ref date (${refDate}) to the following day (${refFollowingDay})`);
                });
                if (result.end && result.end.isOnlyTime()) {
                    implySimilarDate(result.end, refFollowingDay);
                    if (result.start.date() > result.end.date()) {
                        refFollowingDay.setDate(refFollowingDay.getDate() + 1);
                        implySimilarDate(result.end, refFollowingDay);
                    }
                }
            }
            if (result.start.isOnlyWeekdayComponent() && refDate > result.start.date()) {
                let daysToAdd = getDaysForwardToWeekday(refDate, result.start.get("weekday")) || 7;
                const forwardedWeekday = addDuration(refDate, { day: daysToAdd });
                implySimilarDate(result.start, forwardedWeekday);
                context.debug(() => {
                    console.log(`${this.constructor.name} adjusted ${result} weekday (${result.start})`);
                });
                if (result.end && result.start.date() > result.end.date()) {
                    let daysToAdd = getDaysForwardToWeekday(refDate, result.start.get("weekday")) || 7;
                    const forwardedWeekday = addDuration(refDate, { day: daysToAdd });
                    implySimilarDate(result.end, forwardedWeekday);
                    context.debug(() => {
                        console.log(`${this.constructor.name} adjusted ${result} weekday (${result.end})`);
                    });
                }
            }
            if (result.start.isDateWithUnknownYear() && refDate > result.start.date()) {
                for (let i = 0; i < 3 && refDate > result.start.date(); i++) {
                    result.start.imply("year", result.start.get("year") + 1);
                    context.debug(() => {
                        console.log(`${this.constructor.name} adjusted ${result} year (${result.start})`);
                    });
                    if (result.end && !result.end.isCertain("year")) {
                        result.end.imply("year", result.end.get("year") + 1);
                        context.debug(() => {
                            console.log(`${this.constructor.name} adjusted ${result} month (${result.start})`);
                        });
                    }
                }
            }
        });
        return results;
    }
}

class UnlikelyFormatFilter extends Filter {
    strictMode;
    constructor(strictMode) {
        super();
        this.strictMode = strictMode;
    }
    isValid(context, result) {
        if (result.text.replace(" ", "").match(/^\d*(\.\d*)?$/)) {
            context.debug(() => {
                console.log(`Removing unlikely result '${result.text}'`);
            });
            return false;
        }
        if (!result.start.isValidDate()) {
            context.debug(() => {
                console.log(`Removing invalid result: ${result} (${result.start})`);
            });
            return false;
        }
        if (result.end && !result.end.isValidDate()) {
            context.debug(() => {
                console.log(`Removing invalid result: ${result} (${result.end})`);
            });
            return false;
        }
        if (this.strictMode) {
            return this.isStrictModeValid(context, result);
        }
        return true;
    }
    isStrictModeValid(context, result) {
        if (result.start.isOnlyWeekdayComponent()) {
            context.debug(() => {
                console.log(`(Strict) Removing weekday only component: ${result} (${result.end})`);
            });
            return false;
        }
        return true;
    }
}

const PATTERN$14 = new RegExp("([0-9]{4})\\-([0-9]{1,2})\\-([0-9]{1,2})" +
    "(?:T" +
    "([0-9]{1,2}):([0-9]{1,2})" +
    "(?:" +
    ":([0-9]{1,2})(?:\\.(\\d{1,4}))?" +
    ")?" +
    "(" +
    "Z|([+-]\\d{2}):?(\\d{2})?" +
    ")?" +
    ")?" +
    "(?=\\W|$)", "i");
const YEAR_NUMBER_GROUP$3 = 1;
const MONTH_NUMBER_GROUP$2 = 2;
const DATE_NUMBER_GROUP$2 = 3;
const HOUR_NUMBER_GROUP = 4;
const MINUTE_NUMBER_GROUP = 5;
const SECOND_NUMBER_GROUP = 6;
const MILLISECOND_NUMBER_GROUP = 7;
const TZD_GROUP = 8;
const TZD_HOUR_OFFSET_GROUP = 9;
const TZD_MINUTE_OFFSET_GROUP = 10;
class ISOFormatParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$14;
    }
    innerExtract(context, match) {
        const components = context.createParsingComponents({
            "year": parseInt(match[YEAR_NUMBER_GROUP$3]),
            "month": parseInt(match[MONTH_NUMBER_GROUP$2]),
            "day": parseInt(match[DATE_NUMBER_GROUP$2]),
        });
        if (match[HOUR_NUMBER_GROUP] != null) {
            components.assign("hour", parseInt(match[HOUR_NUMBER_GROUP]));
            components.assign("minute", parseInt(match[MINUTE_NUMBER_GROUP]));
            if (match[SECOND_NUMBER_GROUP] != null) {
                components.assign("second", parseInt(match[SECOND_NUMBER_GROUP]));
            }
            if (match[MILLISECOND_NUMBER_GROUP] != null) {
                components.assign("millisecond", parseInt(match[MILLISECOND_NUMBER_GROUP]));
            }
            if (match[TZD_GROUP] != null) {
                let offset = 0;
                if (match[TZD_HOUR_OFFSET_GROUP]) {
                    const hourOffset = parseInt(match[TZD_HOUR_OFFSET_GROUP]);
                    let minuteOffset = 0;
                    if (match[TZD_MINUTE_OFFSET_GROUP] != null) {
                        minuteOffset = parseInt(match[TZD_MINUTE_OFFSET_GROUP]);
                    }
                    offset = hourOffset * 60;
                    if (offset < 0) {
                        offset -= minuteOffset;
                    }
                    else {
                        offset += minuteOffset;
                    }
                }
                components.assign("timezoneOffset", offset);
            }
        }
        return components.addTag("parser/ISOFormatParser");
    }
}

class MergeWeekdayComponentRefiner extends MergingRefiner {
    mergeResults(textBetween, currentResult, nextResult) {
        const newResult = nextResult.clone();
        newResult.index = currentResult.index;
        newResult.text = currentResult.text + textBetween + newResult.text;
        newResult.start.assign("weekday", currentResult.start.get("weekday"));
        if (newResult.end) {
            newResult.end.assign("weekday", currentResult.start.get("weekday"));
        }
        return newResult;
    }
    shouldMergeResults(textBetween, currentResult, nextResult) {
        const weekdayThenNormalDate = currentResult.start.isOnlyWeekdayComponent() &&
            !currentResult.start.isCertain("hour") &&
            nextResult.start.isCertain("day");
        return weekdayThenNormalDate && textBetween.match(/^,?\s*$/) != null;
    }
}

function includeCommonConfiguration(configuration, strictMode = false) {
    configuration.parsers.unshift(new ISOFormatParser());
    configuration.refiners.unshift(new MergeWeekdayComponentRefiner());
    configuration.refiners.unshift(new ExtractTimezoneOffsetRefiner());
    configuration.refiners.unshift(new OverlapRemovalRefiner());
    configuration.refiners.push(new ExtractTimezoneAbbrRefiner());
    configuration.refiners.push(new OverlapRemovalRefiner());
    configuration.refiners.push(new ForwardDateRefiner());
    configuration.refiners.push(new UnlikelyFormatFilter(strictMode));
    return configuration;
}

function now(reference) {
    const targetDate = reference.getDateWithAdjustedTimezone();
    const component = new ParsingComponents(reference, {});
    assignSimilarDate(component, targetDate);
    assignSimilarTime(component, targetDate);
    component.assign("timezoneOffset", reference.getTimezoneOffset());
    component.addTag("casualReference/now");
    return component;
}
function today(reference) {
    const targetDate = reference.getDateWithAdjustedTimezone();
    const component = new ParsingComponents(reference, {});
    assignSimilarDate(component, targetDate);
    implySimilarTime(component, targetDate);
    component.delete("meridiem");
    component.addTag("casualReference/today");
    return component;
}
function yesterday(reference) {
    return theDayBefore(reference, 1).addTag("casualReference/yesterday");
}
function tomorrow(reference) {
    return theDayAfter(reference, 1).addTag("casualReference/tomorrow");
}
function theDayBefore(reference, numDay) {
    return theDayAfter(reference, -numDay);
}
function theDayAfter(reference, nDays) {
    const targetDate = reference.getDateWithAdjustedTimezone();
    const component = new ParsingComponents(reference, {});
    const newDate = new Date(targetDate.getTime());
    newDate.setDate(newDate.getDate() + nDays);
    assignSimilarDate(component, newDate);
    implySimilarTime(component, newDate);
    component.delete("meridiem");
    return component;
}
function tonight(reference, implyHour = 22) {
    const targetDate = reference.getDateWithAdjustedTimezone();
    const component = new ParsingComponents(reference, {});
    assignSimilarDate(component, targetDate);
    component.imply("hour", implyHour);
    component.imply("meridiem", Meridiem.PM);
    component.addTag("casualReference/tonight");
    return component;
}
function lastNight(reference, implyHour = 0) {
    let targetDate = reference.getDateWithAdjustedTimezone();
    const component = new ParsingComponents(reference, {});
    if (targetDate.getHours() < 6) {
        targetDate = new Date(targetDate.getTime() - 24 * 60 * 60 * 1000);
    }
    assignSimilarDate(component, targetDate);
    component.imply("hour", implyHour);
    return component;
}
function evening(reference, implyHour = 20) {
    const component = new ParsingComponents(reference, {});
    component.imply("meridiem", Meridiem.PM);
    component.imply("hour", implyHour);
    component.addTag("casualReference/evening");
    return component;
}
function yesterdayEvening(reference, implyHour = 20) {
    let targetDate = reference.getDateWithAdjustedTimezone();
    const component = new ParsingComponents(reference, {});
    targetDate = new Date(targetDate.getTime() - 24 * 60 * 60 * 1000);
    assignSimilarDate(component, targetDate);
    component.imply("hour", implyHour);
    component.imply("meridiem", Meridiem.PM);
    component.addTag("casualReference/yesterday");
    component.addTag("casualReference/evening");
    return component;
}
function midnight(reference) {
    const component = new ParsingComponents(reference, {});
    if (reference.getDateWithAdjustedTimezone().getHours() > 2) {
        component.addDurationAsImplied({ day: 1 });
    }
    component.assign("hour", 0);
    component.imply("minute", 0);
    component.imply("second", 0);
    component.imply("millisecond", 0);
    component.addTag("casualReference/midnight");
    return component;
}
function morning(reference, implyHour = 6) {
    const component = new ParsingComponents(reference, {});
    component.imply("meridiem", Meridiem.AM);
    component.imply("hour", implyHour);
    component.imply("minute", 0);
    component.imply("second", 0);
    component.imply("millisecond", 0);
    component.addTag("casualReference/morning");
    return component;
}
function afternoon(reference, implyHour = 15) {
    const component = new ParsingComponents(reference, {});
    component.imply("meridiem", Meridiem.PM);
    component.imply("hour", implyHour);
    component.imply("minute", 0);
    component.imply("second", 0);
    component.imply("millisecond", 0);
    component.addTag("casualReference/afternoon");
    return component;
}
function noon(reference) {
    const component = new ParsingComponents(reference, {});
    component.imply("meridiem", Meridiem.AM);
    component.assign("hour", 12);
    component.imply("minute", 0);
    component.imply("second", 0);
    component.imply("millisecond", 0);
    component.addTag("casualReference/noon");
    return component;
}

const PATTERN$13 = /(now|today|tonight|tomorrow|overmorrow|tmr|tmrw|yesterday|last\s*night)(?=\W|$)/i;
class ENCasualDateParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return PATTERN$13;
    }
    innerExtract(context, match) {
        let targetDate = context.refDate;
        const lowerText = match[0].toLowerCase();
        let component = context.createParsingComponents();
        switch (lowerText) {
            case "now":
                component = now(context.reference);
                break;
            case "today":
                component = today(context.reference);
                break;
            case "yesterday":
                component = yesterday(context.reference);
                break;
            case "tomorrow":
            case "tmr":
            case "tmrw":
                component = tomorrow(context.reference);
                break;
            case "tonight":
                component = tonight(context.reference);
                break;
            case "overmorrow":
                component = theDayAfter(context.reference, 2);
                break;
            default:
                if (lowerText.match(/last\s*night/)) {
                    if (targetDate.getHours() > 6) {
                        const previousDay = new Date(targetDate.getTime());
                        previousDay.setDate(previousDay.getDate() - 1);
                        targetDate = previousDay;
                    }
                    assignSimilarDate(component, targetDate);
                    component.imply("hour", 0);
                }
                break;
        }
        component.addTag("parser/ENCasualDateParser");
        return component;
    }
}

const PATTERN$12 = /(?:this)?\s{0,3}(morning|afternoon|evening|night|midnight|midday|noon)(?=\W|$)/i;
class ENCasualTimeParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$12;
    }
    innerExtract(context, match) {
        let component = null;
        switch (match[1].toLowerCase()) {
            case "afternoon":
                component = afternoon(context.reference);
                break;
            case "evening":
            case "night":
                component = evening(context.reference);
                break;
            case "midnight":
                component = midnight(context.reference);
                break;
            case "morning":
                component = morning(context.reference);
                break;
            case "noon":
            case "midday":
                component = noon(context.reference);
                break;
        }
        if (component) {
            component.addTag("parser/ENCasualTimeParser");
        }
        return component;
    }
}

const PATTERN$11 = new RegExp("(?:(?:\\,|\\(|\\（)\\s*)?" +
    "(?:on\\s*?)?" +
    "(?:(this|last|past|next)\\s*)?" +
    `(${matchAnyPattern(WEEKDAY_DICTIONARY$b)}|weekend|weekday)` +
    "(?:\\s*(?:\\,|\\)|\\）))?" +
    "(?:\\s*(?:of\\s*)?(this|last|past|next)\\s*week)?" +
    "(?=\\W|$)", "i");
const PREFIX_GROUP$a = 1;
const WEEKDAY_GROUP$b = 2;
const POSTFIX_GROUP$7 = 3;
class ENWeekdayParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$11;
    }
    innerExtract(context, match) {
        const prefix = match[PREFIX_GROUP$a];
        const postfix = match[POSTFIX_GROUP$7];
        let modifierWord = prefix || postfix;
        modifierWord = modifierWord || "";
        modifierWord = modifierWord.toLowerCase();
        let modifier = null;
        if (modifierWord == "last" || modifierWord == "past") {
            modifier = "last";
        }
        else if (modifierWord == "next") {
            modifier = "next";
        }
        else if (modifierWord == "this") {
            modifier = "this";
        }
        const weekday_word = match[WEEKDAY_GROUP$b].toLowerCase();
        let weekday;
        if (WEEKDAY_DICTIONARY$b[weekday_word] !== undefined) {
            weekday = WEEKDAY_DICTIONARY$b[weekday_word];
        }
        else if (weekday_word == "weekend") {
            weekday = modifier == "last" ? Weekday.SUNDAY : Weekday.SATURDAY;
        }
        else if (weekday_word == "weekday") {
            const refWeekday = context.reference.getDateWithAdjustedTimezone().getDay();
            if (refWeekday == Weekday.SUNDAY || refWeekday == Weekday.SATURDAY) {
                weekday = modifier == "last" ? Weekday.FRIDAY : Weekday.MONDAY;
            }
            else {
                weekday = refWeekday - 1;
                weekday = modifier == "last" ? weekday - 1 : weekday + 1;
                weekday = (weekday % 5) + 1;
            }
        }
        else {
            return null;
        }
        return createParsingComponentsAtWeekday(context.reference, weekday, modifier);
    }
}

const PATTERN$10 = new RegExp(`(this|last|past|next|after\\s*this)\\s*(${matchAnyPattern(TIME_UNIT_DICTIONARY$a)})(?=\\s*)` + "(?=\\W|$)", "i");
const MODIFIER_WORD_GROUP$4 = 1;
const RELATIVE_WORD_GROUP$4 = 2;
class ENRelativeDateFormatParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$10;
    }
    innerExtract(context, match) {
        const modifier = match[MODIFIER_WORD_GROUP$4].toLowerCase();
        const unitWord = match[RELATIVE_WORD_GROUP$4].toLowerCase();
        const timeunit = TIME_UNIT_DICTIONARY$a[unitWord];
        if (modifier == "next" || modifier.startsWith("after")) {
            const timeUnits = {};
            timeUnits[timeunit] = 1;
            return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
        }
        if (modifier == "last" || modifier == "past") {
            const timeUnits = {};
            timeUnits[timeunit] = -1;
            return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
        }
        const components = context.createParsingComponents();
        let date = new Date(context.reference.instant.getTime());
        if (unitWord.match(/week/i)) {
            date.setDate(date.getDate() - date.getDay());
            components.imply("day", date.getDate());
            components.imply("month", date.getMonth() + 1);
            components.imply("year", date.getFullYear());
        }
        else if (unitWord.match(/month/i)) {
            date.setDate(1);
            components.imply("day", date.getDate());
            components.assign("year", date.getFullYear());
            components.assign("month", date.getMonth() + 1);
        }
        else if (unitWord.match(/year/i)) {
            date.setDate(1);
            date.setMonth(0);
            components.imply("day", date.getDate());
            components.imply("month", date.getMonth() + 1);
            components.assign("year", date.getFullYear());
        }
        return components;
    }
}

const PATTERN$$ = new RegExp("([^\\d]|^)" +
    "([0-3]{0,1}[0-9]{1})[\\/\\.\\-]([0-3]{0,1}[0-9]{1})" +
    "(?:[\\/\\.\\-]([0-9]{4}|[0-9]{2}))?" +
    "(\\W|$)", "i");
const OPENING_GROUP = 1;
const ENDING_GROUP = 5;
const FIRST_NUMBERS_GROUP = 2;
const SECOND_NUMBERS_GROUP = 3;
const YEAR_GROUP$n = 4;
class SlashDateFormatParser {
    groupNumberMonth;
    groupNumberDay;
    constructor(littleEndian) {
        this.groupNumberMonth = littleEndian ? SECOND_NUMBERS_GROUP : FIRST_NUMBERS_GROUP;
        this.groupNumberDay = littleEndian ? FIRST_NUMBERS_GROUP : SECOND_NUMBERS_GROUP;
    }
    pattern() {
        return PATTERN$$;
    }
    extract(context, match) {
        const index = match.index + match[OPENING_GROUP].length;
        const indexEnd = match.index + match[0].length - match[ENDING_GROUP].length;
        if (index > 0) {
            const textBefore = context.text.substring(0, index);
            if (textBefore.match("\\d/?$")) {
                return;
            }
        }
        if (indexEnd < context.text.length) {
            const textAfter = context.text.substring(indexEnd);
            if (textAfter.match("^/?\\d")) {
                return;
            }
        }
        const text = context.text.substring(index, indexEnd);
        if (text.match(/^\d\.\d$/) || text.match(/^\d\.\d{1,2}\.\d{1,2}\s*$/)) {
            return;
        }
        if (!match[YEAR_GROUP$n] && text.indexOf("/") < 0) {
            return;
        }
        const result = context.createParsingResult(index, text);
        let month = parseInt(match[this.groupNumberMonth]);
        let day = parseInt(match[this.groupNumberDay]);
        if (month < 1 || month > 12) {
            if (month > 12) {
                if (day >= 1 && day <= 12 && month <= 31) {
                    [day, month] = [month, day];
                }
                else {
                    return null;
                }
            }
        }
        if (day < 1 || day > 31) {
            return null;
        }
        result.start.assign("day", day);
        result.start.assign("month", month);
        if (match[YEAR_GROUP$n]) {
            const rawYearNumber = parseInt(match[YEAR_GROUP$n]);
            const year = findMostLikelyADYear(rawYearNumber);
            result.start.assign("year", year);
        }
        else {
            const year = findYearClosestToRef(context.refDate, day, month);
            result.start.imply("year", year);
        }
        return result.addTag("parser/SlashDateFormatParser");
    }
}

const PATTERN$_ = new RegExp(`(this|last|past|next|after|\\+|-)\\s*(${TIME_UNITS_PATTERN$a})(?=\\W|$)`, "i");
const PATTERN_NO_ABBR$2 = new RegExp(`(this|last|past|next|after|\\+|-)\\s*(${TIME_UNITS_NO_ABBR_PATTERN$2})(?=\\W|$)`, "i");
class ENTimeUnitCasualRelativeFormatParser$1 extends AbstractParserWithWordBoundaryChecking {
    allowAbbreviations;
    constructor(allowAbbreviations = true) {
        super();
        this.allowAbbreviations = allowAbbreviations;
    }
    innerPattern() {
        return this.allowAbbreviations ? PATTERN$_ : PATTERN_NO_ABBR$2;
    }
    innerExtract(context, match) {
        const prefix = match[1].toLowerCase();
        let duration = parseDuration$a(match[2]);
        if (!duration) {
            return null;
        }
        switch (prefix) {
            case "last":
            case "past":
            case "-":
                duration = reverseDuration(duration);
                break;
        }
        return ParsingComponents.createRelativeFromReference(context.reference, duration);
    }
}

function IsPositiveFollowingReference(result) {
    return result.text.match(/^[+-]/i) != null;
}
function IsNegativeFollowingReference(result) {
    return result.text.match(/^-/i) != null;
}
class ENMergeRelativeAfterDateRefiner extends MergingRefiner {
    shouldMergeResults(textBetween, currentResult, nextResult) {
        if (!textBetween.match(/^\s*$/i)) {
            return false;
        }
        return IsPositiveFollowingReference(nextResult) || IsNegativeFollowingReference(nextResult);
    }
    mergeResults(textBetween, currentResult, nextResult, context) {
        let timeUnits = parseDuration$a(nextResult.text);
        if (IsNegativeFollowingReference(nextResult)) {
            timeUnits = reverseDuration(timeUnits);
        }
        const components = ParsingComponents.createRelativeFromReference(ReferenceWithTimezone.fromDate(currentResult.start.date()), timeUnits);
        return new ParsingResult(currentResult.reference, currentResult.index, `${currentResult.text}${textBetween}${nextResult.text}`, components);
    }
}

function hasImpliedEarlierReferenceDate$1(result) {
    return result.text.match(/\s+(before|from)$/i) != null;
}
function hasImpliedLaterReferenceDate$1(result) {
    return result.text.match(/\s+(after|since)$/i) != null;
}
class ENMergeRelativeFollowByDateRefiner extends MergingRefiner {
    patternBetween() {
        return /^\s*$/i;
    }
    shouldMergeResults(textBetween, currentResult, nextResult) {
        if (!textBetween.match(this.patternBetween())) {
            return false;
        }
        if (!hasImpliedEarlierReferenceDate$1(currentResult) && !hasImpliedLaterReferenceDate$1(currentResult)) {
            return false;
        }
        return !!nextResult.start.get("day") && !!nextResult.start.get("month") && !!nextResult.start.get("year");
    }
    mergeResults(textBetween, currentResult, nextResult) {
        let duration = parseDuration$a(currentResult.text);
        if (hasImpliedEarlierReferenceDate$1(currentResult)) {
            duration = reverseDuration(duration);
        }
        const components = ParsingComponents.createRelativeFromReference(ReferenceWithTimezone.fromDate(nextResult.start.date()), duration);
        return new ParsingResult(nextResult.reference, currentResult.index, `${currentResult.text}${textBetween}${nextResult.text}`, components);
    }
}

const YEAR_SUFFIX_PATTERN = new RegExp(`^\\s*(${YEAR_PATTERN$9})`, "i");
const YEAR_GROUP$m = 1;
class ENExtractYearSuffixRefiner {
    refine(context, results) {
        results.forEach(function (result) {
            if (!result.start.isDateWithUnknownYear()) {
                return;
            }
            const suffix = context.text.substring(result.index + result.text.length);
            const match = YEAR_SUFFIX_PATTERN.exec(suffix);
            if (!match) {
                return;
            }
            if (match[0].trim().length <= 3) {
                return;
            }
            context.debug(() => {
                console.log(`Extracting year: '${match[0]}' into : ${result}`);
            });
            const year = parseYear$a(match[YEAR_GROUP$m]);
            if (result.end != null) {
                result.end.assign("year", year);
            }
            result.start.assign("year", year);
            result.text += match[0];
        });
        return results;
    }
}

class ENUnlikelyFormatFilter extends Filter {
    constructor() {
        super();
    }
    isValid(context, result) {
        const text = result.text.trim();
        if (text === context.text.trim()) {
            return true;
        }
        if (text.toLowerCase() === "may") {
            const textBefore = context.text.substring(0, result.index).trim();
            if (!textBefore.match(/\b(in)$/i)) {
                context.debug(() => {
                    console.log(`Removing unlikely result: ${result}`);
                });
                return false;
            }
        }
        if (text.toLowerCase().endsWith("the second")) {
            const textAfter = context.text.substring(result.index + result.text.length).trim();
            if (textAfter.length > 0) {
                context.debug(() => {
                    console.log(`Removing unlikely result: ${result}`);
                });
            }
            return false;
        }
        return true;
    }
}

class ENDefaultConfiguration {
    createCasualConfiguration(littleEndian = false) {
        const option = this.createConfiguration(false, littleEndian);
        option.parsers.push(new ENCasualDateParser());
        option.parsers.push(new ENCasualTimeParser());
        option.parsers.push(new ENMonthNameParser$1());
        option.parsers.push(new ENRelativeDateFormatParser());
        option.parsers.push(new ENTimeUnitCasualRelativeFormatParser$1());
        option.refiners.push(new ENUnlikelyFormatFilter());
        return option;
    }
    createConfiguration(strictMode = true, littleEndian = false) {
        const options = includeCommonConfiguration({
            parsers: [
                new SlashDateFormatParser(littleEndian),
                new ENTimeUnitWithinFormatParser$1(strictMode),
                new ENMonthNameLittleEndianParser$1(),
                new ENMonthNameMiddleEndianParser$1(littleEndian),
                new ENWeekdayParser(),
                new ENSlashMonthFormatParser$1(),
                new ENTimeExpressionParser$1(strictMode),
                new ENTimeUnitAgoFormatParser$1(strictMode),
                new ENTimeUnitLaterFormatParser$1(strictMode),
            ],
            refiners: [new ENMergeDateTimeRefiner$1()],
        }, strictMode);
        options.parsers.unshift(new ENYearMonthDayParser(strictMode));
        options.refiners.unshift(new ENMergeRelativeFollowByDateRefiner());
        options.refiners.unshift(new ENMergeRelativeAfterDateRefiner());
        options.refiners.unshift(new OverlapRemovalRefiner());
        options.refiners.push(new ENMergeDateTimeRefiner$1());
        options.refiners.push(new ENExtractYearSuffixRefiner());
        options.refiners.push(new ENMergeDateRangeRefiner$1());
        return options;
    }
}

class Chrono {
    parsers;
    refiners;
    defaultConfig = new ENDefaultConfiguration();
    constructor(configuration) {
        configuration = configuration || this.defaultConfig.createCasualConfiguration();
        this.parsers = [...configuration.parsers];
        this.refiners = [...configuration.refiners];
    }
    clone() {
        return new Chrono({
            parsers: [...this.parsers],
            refiners: [...this.refiners],
        });
    }
    parseDate(text, referenceDate, option) {
        const results = this.parse(text, referenceDate, option);
        return results.length > 0 ? results[0].start.date() : null;
    }
    parse(text, referenceDate, option) {
        const context = new ParsingContext(text, referenceDate, option);
        let results = [];
        this.parsers.forEach((parser) => {
            const parsedResults = Chrono.executeParser(context, parser);
            results = results.concat(parsedResults);
        });
        results.sort((a, b) => {
            return a.index - b.index;
        });
        this.refiners.forEach(function (refiner) {
            results = refiner.refine(context, results);
        });
        return results;
    }
    static executeParser(context, parser) {
        const results = [];
        const pattern = parser.pattern(context);
        const originalText = context.text;
        let remainingText = context.text;
        let match = pattern.exec(remainingText);
        while (match) {
            const index = match.index + originalText.length - remainingText.length;
            match.index = index;
            const result = parser.extract(context, match);
            if (!result) {
                remainingText = originalText.substring(match.index + 1);
                match = pattern.exec(remainingText);
                continue;
            }
            let parsedResult = null;
            if (result instanceof ParsingResult) {
                parsedResult = result;
            }
            else if (result instanceof ParsingComponents) {
                parsedResult = context.createParsingResult(match.index, match[0]);
                parsedResult.start = result;
            }
            else {
                parsedResult = context.createParsingResult(match.index, match[0], result);
            }
            const parsedIndex = parsedResult.index;
            const parsedText = parsedResult.text;
            context.debug(() => console.log(`${parser.constructor.name} extracted (at index=${parsedIndex}) '${parsedText}'`));
            results.push(parsedResult);
            remainingText = originalText.substring(parsedIndex + parsedText.length);
            match = pattern.exec(remainingText);
        }
        return results;
    }
}
class ParsingContext {
    text;
    option;
    reference;
    refDate;
    constructor(text, refDate, option) {
        this.text = text;
        this.option = option ?? {};
        this.reference = ReferenceWithTimezone.fromInput(refDate, this.option.timezones);
        this.refDate = this.reference.instant;
    }
    createParsingComponents(components) {
        if (components instanceof ParsingComponents) {
            return components;
        }
        return new ParsingComponents(this.reference, components);
    }
    createParsingResult(index, textOrEndIndex, startComponents, endComponents) {
        const text = typeof textOrEndIndex === "string" ? textOrEndIndex : this.text.substring(index, textOrEndIndex);
        const start = startComponents ? this.createParsingComponents(startComponents) : null;
        const end = endComponents ? this.createParsingComponents(endComponents) : null;
        return new ParsingResult(this.reference, index, text, start, end);
    }
    debug(block) {
        if (this.option.debug) {
            if (this.option.debug instanceof Function) {
                this.option.debug(block);
            }
            else {
                const handler = this.option.debug;
                handler.debug(block);
            }
        }
    }
}

const configuration = new ENDefaultConfiguration();
const casual$g = new Chrono(configuration.createCasualConfiguration(false));
const strict$g = new Chrono(configuration.createConfiguration(true, false));
const GB$1 = new Chrono(configuration.createCasualConfiguration(true));
function parse$g(text, ref, option) {
    return casual$g.parse(text, ref, option);
}
function parseDate$g(text, ref, option) {
    return casual$g.parseDate(text, ref, option);
}

var index$f = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Chrono: Chrono,
	ParsingResult: ParsingResult,
	ParsingComponents: ParsingComponents,
	ReferenceWithTimezone: ReferenceWithTimezone,
	get Meridiem () { return Meridiem; },
	get Weekday () { return Weekday; },
	configuration: configuration,
	casual: casual$g,
	strict: strict$g,
	GB: GB$1,
	parse: parse$g,
	parseDate: parseDate$g
});

class DETimeExpressionParser extends AbstractTimeExpressionParser {
    primaryPrefix() {
        return "(?:(?:um|von)\\s*)?";
    }
    followingPhase() {
        return "\\s*(?:\\-|\\–|\\~|\\〜|bis)\\s*";
    }
    extractPrimaryTimeComponents(context, match) {
        if (match[0].match(/^\s*\d{4}\s*$/)) {
            return null;
        }
        return super.extractPrimaryTimeComponents(context, match);
    }
}

const WEEKDAY_DICTIONARY$a = {
    "sonntag": 0,
    "so": 0,
    "montag": 1,
    "mo": 1,
    "dienstag": 2,
    "di": 2,
    "mittwoch": 3,
    "mi": 3,
    "donnerstag": 4,
    "do": 4,
    "freitag": 5,
    "fr": 5,
    "samstag": 6,
    "sa": 6,
};
const MONTH_DICTIONARY$a = {
    "januar": 1,
    "jänner": 1,
    "janner": 1,
    "jan": 1,
    "jan.": 1,
    "februar": 2,
    "feber": 2,
    "feb": 2,
    "feb.": 2,
    "märz": 3,
    "maerz": 3,
    "mär": 3,
    "mär.": 3,
    "mrz": 3,
    "mrz.": 3,
    "april": 4,
    "apr": 4,
    "apr.": 4,
    "mai": 5,
    "juni": 6,
    "jun": 6,
    "jun.": 6,
    "juli": 7,
    "jul": 7,
    "jul.": 7,
    "august": 8,
    "aug": 8,
    "aug.": 8,
    "september": 9,
    "sep": 9,
    "sep.": 9,
    "sept": 9,
    "sept.": 9,
    "oktober": 10,
    "okt": 10,
    "okt.": 10,
    "november": 11,
    "nov": 11,
    "nov.": 11,
    "dezember": 12,
    "dez": 12,
    "dez.": 12,
};
const INTEGER_WORD_DICTIONARY$9 = {
    "eins": 1,
    "eine": 1,
    "einem": 1,
    "einen": 1,
    "einer": 1,
    "zwei": 2,
    "drei": 3,
    "vier": 4,
    "fünf": 5,
    "fuenf": 5,
    "sechs": 6,
    "sieben": 7,
    "acht": 8,
    "neun": 9,
    "zehn": 10,
    "elf": 11,
    "zwölf": 12,
    "zwoelf": 12,
};
const TIME_UNIT_DICTIONARY$9 = {
    sek: "second",
    sekunde: "second",
    sekunden: "second",
    min: "minute",
    minute: "minute",
    minuten: "minute",
    h: "hour",
    std: "hour",
    stunde: "hour",
    stunden: "hour",
    tag: "day",
    tage: "day",
    tagen: "day",
    woche: "week",
    wochen: "week",
    monat: "month",
    monate: "month",
    monaten: "month",
    monats: "month",
    quartal: "quarter",
    quartals: "quarter",
    quartale: "quarter",
    quartalen: "quarter",
    a: "year",
    j: "year",
    jr: "year",
    jahr: "year",
    jahre: "year",
    jahren: "year",
    jahres: "year",
};
const NUMBER_PATTERN$9 = `(?:${matchAnyPattern(INTEGER_WORD_DICTIONARY$9)}|[0-9]+|[0-9]+\\.[0-9]+|halb?|halbe?|einigen?|wenigen?|mehreren?)`;
function parseNumberPattern$9(match) {
    const num = match.toLowerCase();
    if (INTEGER_WORD_DICTIONARY$9[num] !== undefined) {
        return INTEGER_WORD_DICTIONARY$9[num];
    }
    else if (num === "ein" || num === "einer" || num === "einem" || num === "einen" || num === "eine") {
        return 1;
    }
    else if (num.match(/wenigen/)) {
        return 2;
    }
    else if (num.match(/halb/) || num.match(/halben/)) {
        return 0.5;
    }
    else if (num.match(/einigen/)) {
        return 3;
    }
    else if (num.match(/mehreren/)) {
        return 7;
    }
    return parseFloat(num);
}
const YEAR_PATTERN$8 = `(?:[0-9]{1,4}(?:\\s*[vn]\\.?\\s*(?:C(?:hr)?|(?:u\\.?|d\\.?(?:\\s*g\\.?)?)?\\s*Z)\\.?|\\s*(?:u\\.?|d\\.?(?:\\s*g\\.)?)\\s*Z\\.?)?)`;
function parseYear$9(match) {
    if (/v/i.test(match)) {
        return -parseInt(match.replace(/[^0-9]+/gi, ""));
    }
    if (/n/i.test(match)) {
        return parseInt(match.replace(/[^0-9]+/gi, ""));
    }
    if (/z/i.test(match)) {
        return parseInt(match.replace(/[^0-9]+/gi, ""));
    }
    const rawYearNumber = parseInt(match);
    return findMostLikelyADYear(rawYearNumber);
}
const SINGLE_TIME_UNIT_PATTERN$9 = `(${NUMBER_PATTERN$9})\\s{0,5}(${matchAnyPattern(TIME_UNIT_DICTIONARY$9)})\\s{0,5}`;
const SINGLE_TIME_UNIT_REGEX$9 = new RegExp(SINGLE_TIME_UNIT_PATTERN$9, "i");
const TIME_UNITS_PATTERN$9 = repeatedTimeunitPattern("", SINGLE_TIME_UNIT_PATTERN$9);
function parseDuration$9(timeunitText) {
    const fragments = {};
    let remainingText = timeunitText;
    let match = SINGLE_TIME_UNIT_REGEX$9.exec(remainingText);
    while (match) {
        collectDateTimeFragment$8(fragments, match);
        remainingText = remainingText.substring(match[0].length);
        match = SINGLE_TIME_UNIT_REGEX$9.exec(remainingText);
    }
    return fragments;
}
function collectDateTimeFragment$8(fragments, match) {
    const num = parseNumberPattern$9(match[1]);
    const unit = TIME_UNIT_DICTIONARY$9[match[2].toLowerCase()];
    fragments[unit] = num;
}

const PATTERN$Z = new RegExp("(?:(?:\\,|\\(|\\（)\\s*)?" +
    "(?:a[mn]\\s*?)?" +
    "(?:(diese[mn]|letzte[mn]|n(?:ä|ae)chste[mn])\\s*)?" +
    `(${matchAnyPattern(WEEKDAY_DICTIONARY$a)})` +
    "(?:\\s*(?:\\,|\\)|\\）))?" +
    "(?:\\s*(diese|letzte|n(?:ä|ae)chste)\\s*woche)?" +
    "(?=\\W|$)", "i");
const PREFIX_GROUP$9 = 1;
const SUFFIX_GROUP$2 = 3;
const WEEKDAY_GROUP$a = 2;
class DEWeekdayParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$Z;
    }
    innerExtract(context, match) {
        const dayOfWeek = match[WEEKDAY_GROUP$a].toLowerCase();
        const offset = WEEKDAY_DICTIONARY$a[dayOfWeek];
        const prefix = match[PREFIX_GROUP$9];
        const postfix = match[SUFFIX_GROUP$2];
        let modifierWord = prefix || postfix;
        modifierWord = modifierWord || "";
        modifierWord = modifierWord.toLowerCase();
        let modifier = null;
        if (modifierWord.match(/letzte/)) {
            modifier = "last";
        }
        else if (modifierWord.match(/chste/)) {
            modifier = "next";
        }
        else if (modifierWord.match(/diese/)) {
            modifier = "this";
        }
        return createParsingComponentsAtWeekday(context.reference, offset, modifier);
    }
}

const FIRST_REG_PATTERN$4 = new RegExp("(^|\\s|T)" +
    "(?:(?:um|von)\\s*)?" +
    "(\\d{1,2})(?:h|:)?" +
    "(?:(\\d{1,2})(?:m|:)?)?" +
    "(?:(\\d{1,2})(?:s)?)?" +
    "(?:\\s*Uhr)?" +
    "(?:\\s*(morgens|vormittags|nachmittags|abends|nachts|am\\s+(?:Morgen|Vormittag|Nachmittag|Abend)|in\\s+der\\s+Nacht))?" +
    "(?=\\W|$)", "i");
const SECOND_REG_PATTERN$4 = new RegExp("^\\s*(\\-|\\–|\\~|\\〜|bis(?:\\s+um)?|\\?)\\s*" +
    "(\\d{1,2})(?:h|:)?" +
    "(?:(\\d{1,2})(?:m|:)?)?" +
    "(?:(\\d{1,2})(?:s)?)?" +
    "(?:\\s*Uhr)?" +
    "(?:\\s*(morgens|vormittags|nachmittags|abends|nachts|am\\s+(?:Morgen|Vormittag|Nachmittag|Abend)|in\\s+der\\s+Nacht))?" +
    "(?=\\W|$)", "i");
const HOUR_GROUP$5 = 2;
const MINUTE_GROUP$4 = 3;
const SECOND_GROUP$4 = 4;
const AM_PM_HOUR_GROUP$3 = 5;
class DESpecificTimeExpressionParser {
    pattern(context) {
        return FIRST_REG_PATTERN$4;
    }
    extract(context, match) {
        const result = context.createParsingResult(match.index + match[1].length, match[0].substring(match[1].length));
        if (result.text.match(/^\d{4}$/)) {
            match.index += match[0].length;
            return null;
        }
        result.start = DESpecificTimeExpressionParser.extractTimeComponent(result.start.clone(), match);
        if (!result.start) {
            match.index += match[0].length;
            return null;
        }
        const remainingText = context.text.substring(match.index + match[0].length);
        const secondMatch = SECOND_REG_PATTERN$4.exec(remainingText);
        if (secondMatch) {
            result.end = DESpecificTimeExpressionParser.extractTimeComponent(result.start.clone(), secondMatch);
            if (result.end) {
                result.text += secondMatch[0];
            }
        }
        return result;
    }
    static extractTimeComponent(extractingComponents, match) {
        let hour = 0;
        let minute = 0;
        let meridiem = null;
        hour = parseInt(match[HOUR_GROUP$5]);
        if (match[MINUTE_GROUP$4] != null) {
            minute = parseInt(match[MINUTE_GROUP$4]);
        }
        if (minute >= 60 || hour > 24) {
            return null;
        }
        if (hour >= 12) {
            meridiem = Meridiem.PM;
        }
        if (match[AM_PM_HOUR_GROUP$3] != null) {
            if (hour > 12)
                return null;
            const ampm = match[AM_PM_HOUR_GROUP$3].toLowerCase();
            if (ampm.match(/morgen|vormittag/)) {
                meridiem = Meridiem.AM;
                if (hour == 12) {
                    hour = 0;
                }
            }
            if (ampm.match(/nachmittag|abend/)) {
                meridiem = Meridiem.PM;
                if (hour != 12) {
                    hour += 12;
                }
            }
            if (ampm.match(/nacht/)) {
                if (hour == 12) {
                    meridiem = Meridiem.AM;
                    hour = 0;
                }
                else if (hour < 6) {
                    meridiem = Meridiem.AM;
                }
                else {
                    meridiem = Meridiem.PM;
                    hour += 12;
                }
            }
        }
        extractingComponents.assign("hour", hour);
        extractingComponents.assign("minute", minute);
        if (meridiem !== null) {
            extractingComponents.assign("meridiem", meridiem);
        }
        else {
            if (hour < 12) {
                extractingComponents.imply("meridiem", Meridiem.AM);
            }
            else {
                extractingComponents.imply("meridiem", Meridiem.PM);
            }
        }
        if (match[SECOND_GROUP$4] != null) {
            const second = parseInt(match[SECOND_GROUP$4]);
            if (second >= 60)
                return null;
            extractingComponents.assign("second", second);
        }
        return extractingComponents;
    }
}

class DEMergeDateRangeRefiner extends AbstractMergeDateRangeRefiner {
    patternBetween() {
        return /^\s*(bis(?:\s*(?:am|zum))?|-)\s*$/i;
    }
}

class DEMergeDateTimeRefiner extends AbstractMergeDateTimeRefiner {
    patternBetween() {
        return new RegExp("^\\s*(T|um|am|,|-)?\\s*$");
    }
}

class DECasualTimeParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return /(diesen)?\s*(morgen|vormittag|mittags?|nachmittag|abend|nacht|mitternacht)(?=\W|$)/i;
    }
    innerExtract(context, match) {
        const targetDate = context.refDate;
        const timeKeywordPattern = match[2].toLowerCase();
        const component = context.createParsingComponents();
        implySimilarTime(component, targetDate);
        return DECasualTimeParser.extractTimeComponents(component, timeKeywordPattern);
    }
    static extractTimeComponents(component, timeKeywordPattern) {
        switch (timeKeywordPattern) {
            case "morgen":
                component.imply("hour", 6);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", Meridiem.AM);
                break;
            case "vormittag":
                component.imply("hour", 9);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", Meridiem.AM);
                break;
            case "mittag":
            case "mittags":
                component.imply("hour", 12);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", Meridiem.AM);
                break;
            case "nachmittag":
                component.imply("hour", 15);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", Meridiem.PM);
                break;
            case "abend":
                component.imply("hour", 18);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", Meridiem.PM);
                break;
            case "nacht":
                component.imply("hour", 22);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", Meridiem.PM);
                break;
            case "mitternacht":
                if (component.get("hour") > 1) {
                    component.addDurationAsImplied({ "day": 1 });
                }
                component.imply("hour", 0);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", Meridiem.AM);
                break;
        }
        return component;
    }
}

const PATTERN$Y = new RegExp(`(jetzt|heute|morgen|übermorgen|uebermorgen|gestern|vorgestern|letzte\\s*nacht)` +
    `(?:\\s*(morgen|vormittag|mittags?|nachmittag|abend|nacht|mitternacht))?` +
    `(?=\\W|$)`, "i");
const DATE_GROUP$e = 1;
const TIME_GROUP$2 = 2;
class DECasualDateParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return PATTERN$Y;
    }
    innerExtract(context, match) {
        let targetDate = context.reference.getDateWithAdjustedTimezone();
        const dateKeyword = (match[DATE_GROUP$e] || "").toLowerCase();
        const timeKeyword = (match[TIME_GROUP$2] || "").toLowerCase();
        let component = context.createParsingComponents();
        switch (dateKeyword) {
            case "jetzt":
                component = now(context.reference);
                break;
            case "heute":
                component = today(context.reference);
                break;
            case "morgen":
                targetDate = addDuration(targetDate, { day: 1 });
                assignSimilarDate(component, targetDate);
                implySimilarTime(component, targetDate);
                break;
            case "übermorgen":
            case "uebermorgen":
                targetDate = addDuration(targetDate, { day: 2 });
                assignSimilarDate(component, targetDate);
                implySimilarTime(component, targetDate);
                break;
            case "gestern":
                targetDate = addDuration(targetDate, { day: -1 });
                assignSimilarDate(component, targetDate);
                implySimilarTime(component, targetDate);
                break;
            case "vorgestern":
                targetDate = addDuration(targetDate, { day: -2 });
                assignSimilarDate(component, targetDate);
                implySimilarTime(component, targetDate);
                break;
            default:
                if (dateKeyword.match(/letzte\s*nacht/)) {
                    if (targetDate.getHours() > 6) {
                        targetDate = addDuration(targetDate, { day: -1 });
                    }
                    assignSimilarDate(component, targetDate);
                    component.imply("hour", 0);
                }
                break;
        }
        if (timeKeyword) {
            component = DECasualTimeParser.extractTimeComponents(component, timeKeyword);
        }
        return component;
    }
}

const PATTERN$X = new RegExp("(?:am\\s*?)?" +
    "(?:den\\s*?)?" +
    `([0-9]{1,2})\\.` +
    `(?:\\s*(?:bis(?:\\s*(?:am|zum))?|\\-|\\–|\\s)\\s*([0-9]{1,2})\\.?)?\\s*` +
    `(${matchAnyPattern(MONTH_DICTIONARY$a)})` +
    `(?:(?:-|/|,?\\s*)(${YEAR_PATTERN$8}(?![^\\s]\\d)))?` +
    `(?=\\W|$)`, "i");
const DATE_GROUP$d = 1;
const DATE_TO_GROUP$a = 2;
const MONTH_NAME_GROUP$g = 3;
const YEAR_GROUP$l = 4;
class DEMonthNameLittleEndianParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$X;
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        const month = MONTH_DICTIONARY$a[match[MONTH_NAME_GROUP$g].toLowerCase()];
        const day = parseInt(match[DATE_GROUP$d]);
        if (day > 31) {
            match.index = match.index + match[DATE_GROUP$d].length;
            return null;
        }
        result.start.assign("month", month);
        result.start.assign("day", day);
        if (match[YEAR_GROUP$l]) {
            const yearNumber = parseYear$9(match[YEAR_GROUP$l]);
            result.start.assign("year", yearNumber);
        }
        else {
            const year = findYearClosestToRef(context.refDate, day, month);
            result.start.imply("year", year);
        }
        if (match[DATE_TO_GROUP$a]) {
            const endDate = parseInt(match[DATE_TO_GROUP$a]);
            result.end = result.start.clone();
            result.end.assign("day", endDate);
        }
        return result;
    }
}

class DETimeUnitAgoFormatParser extends AbstractParserWithWordBoundaryChecking {
    constructor() {
        super();
    }
    innerPattern() {
        return new RegExp(`(?:\\s*((?:nächste|kommende|folgende|letzte|vergangene|vorige|vor(?:her|an)gegangene)(?:s|n|m|r)?|vor|in)\\s*)?` +
            `(${NUMBER_PATTERN$9})?` +
            `(?:\\s*(nächste|kommende|folgende|letzte|vergangene|vorige|vor(?:her|an)gegangene)(?:s|n|m|r)?)?` +
            `\\s*(${matchAnyPattern(TIME_UNIT_DICTIONARY$9)})(?=\\W|$)`, "i");
    }
    innerExtract(context, match) {
        const num = match[2] ? parseNumberPattern$9(match[2]) : 1;
        const unit = TIME_UNIT_DICTIONARY$9[match[4].toLowerCase()];
        let timeUnits = {};
        timeUnits[unit] = num;
        let modifier = match[1] || match[3] || "";
        modifier = modifier.toLowerCase();
        if (!modifier) {
            return;
        }
        if (/vor/.test(modifier) || /letzte/.test(modifier) || /vergangen/.test(modifier)) {
            timeUnits = reverseDuration(timeUnits);
        }
        return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
    }
}

class DETimeUnitWithinFormatParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return new RegExp(`(?:in|für|während)\\s*(${TIME_UNITS_PATTERN$9})(?=\\W|$)`, "i");
    }
    innerExtract(context, match) {
        const timeUnits = parseDuration$9(match[1]);
        return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
    }
}

const casual$f = new Chrono(createCasualConfiguration$e());
const strict$f = new Chrono(createConfiguration$e(true));
function parse$f(text, ref, option) {
    return casual$f.parse(text, ref, option);
}
function parseDate$f(text, ref, option) {
    return casual$f.parseDate(text, ref, option);
}
function createCasualConfiguration$e(littleEndian = true) {
    const option = createConfiguration$e(false, littleEndian);
    option.parsers.unshift(new DECasualTimeParser());
    option.parsers.unshift(new DECasualDateParser());
    option.parsers.unshift(new DETimeUnitAgoFormatParser());
    return option;
}
function createConfiguration$e(strictMode = true, littleEndian = true) {
    return includeCommonConfiguration({
        parsers: [
            new ISOFormatParser(),
            new SlashDateFormatParser(littleEndian),
            new DETimeExpressionParser(),
            new DESpecificTimeExpressionParser(),
            new DEMonthNameLittleEndianParser(),
            new DEWeekdayParser(),
            new DETimeUnitWithinFormatParser(),
        ],
        refiners: [new DEMergeDateRangeRefiner(), new DEMergeDateTimeRefiner()],
    }, strictMode);
}

var index$e = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Chrono: Chrono,
	ParsingResult: ParsingResult,
	ParsingComponents: ParsingComponents,
	ReferenceWithTimezone: ReferenceWithTimezone,
	get Meridiem () { return Meridiem; },
	get Weekday () { return Weekday; },
	casual: casual$f,
	strict: strict$f,
	parse: parse$f,
	parseDate: parseDate$f,
	createCasualConfiguration: createCasualConfiguration$e,
	createConfiguration: createConfiguration$e
});

class FRCasualDateParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return /(maintenant|aujourd'hui|demain|hier|cette\s*nuit|la\s*veille)(?=\W|$)/i;
    }
    innerExtract(context, match) {
        const targetDate = context.refDate;
        const lowerText = match[0].toLowerCase();
        const component = context.createParsingComponents();
        switch (lowerText) {
            case "maintenant":
                return now(context.reference);
            case "aujourd'hui":
                return today(context.reference);
            case "hier":
                return yesterday(context.reference);
            case "demain":
                return tomorrow(context.reference);
            default:
                if (lowerText.match(/cette\s*nuit/)) {
                    assignSimilarDate(component, targetDate);
                    component.imply("hour", 22);
                    component.imply("meridiem", Meridiem.PM);
                }
                else if (lowerText.match(/la\s*veille/)) {
                    const previousDay = new Date(targetDate.getTime());
                    previousDay.setDate(previousDay.getDate() - 1);
                    assignSimilarDate(component, previousDay);
                    component.imply("hour", 0);
                }
        }
        return component;
    }
}

class FRCasualTimeParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return /(cet?)?\s*(matin|soir|après-midi|aprem|a midi|à minuit)(?=\W|$)/i;
    }
    innerExtract(context, match) {
        const suffixLower = match[2].toLowerCase();
        const component = context.createParsingComponents();
        switch (suffixLower) {
            case "après-midi":
            case "aprem":
                component.imply("hour", 14);
                component.imply("minute", 0);
                component.imply("meridiem", Meridiem.PM);
                break;
            case "soir":
                component.imply("hour", 18);
                component.imply("minute", 0);
                component.imply("meridiem", Meridiem.PM);
                break;
            case "matin":
                component.imply("hour", 8);
                component.imply("minute", 0);
                component.imply("meridiem", Meridiem.AM);
                break;
            case "a midi":
                component.imply("hour", 12);
                component.imply("minute", 0);
                component.imply("meridiem", Meridiem.AM);
                break;
            case "à minuit":
                component.imply("hour", 0);
                component.imply("meridiem", Meridiem.AM);
                break;
        }
        return component;
    }
}

class FRTimeExpressionParser extends AbstractTimeExpressionParser {
    primaryPrefix() {
        return "(?:(?:[àa])\\s*)?";
    }
    followingPhase() {
        return "\\s*(?:\\-|\\–|\\~|\\〜|[àa]|\\?)\\s*";
    }
    extractPrimaryTimeComponents(context, match) {
        if (match[0].match(/^\s*\d{4}\s*$/)) {
            return null;
        }
        return super.extractPrimaryTimeComponents(context, match);
    }
}

class FRMergeDateTimeRefiner extends AbstractMergeDateTimeRefiner {
    patternBetween() {
        return new RegExp("^\\s*(T|à|a|au|vers|de|,|-)?\\s*$");
    }
}

class FRMergeDateRangeRefiner extends AbstractMergeDateRangeRefiner {
    patternBetween() {
        return /^\s*(à|a|au|-)\s*$/i;
    }
}

const WEEKDAY_DICTIONARY$9 = {
    "dimanche": 0,
    "dim": 0,
    "lundi": 1,
    "lun": 1,
    "mardi": 2,
    "mar": 2,
    "mercredi": 3,
    "mer": 3,
    "jeudi": 4,
    "jeu": 4,
    "vendredi": 5,
    "ven": 5,
    "samedi": 6,
    "sam": 6,
};
const MONTH_DICTIONARY$9 = {
    "janvier": 1,
    "jan": 1,
    "jan.": 1,
    "février": 2,
    "fév": 2,
    "fév.": 2,
    "fevrier": 2,
    "fev": 2,
    "fev.": 2,
    "mars": 3,
    "mar": 3,
    "mar.": 3,
    "avril": 4,
    "avr": 4,
    "avr.": 4,
    "mai": 5,
    "juin": 6,
    "jun": 6,
    "juillet": 7,
    "juil": 7,
    "jul": 7,
    "jul.": 7,
    "août": 8,
    "aout": 8,
    "septembre": 9,
    "sep": 9,
    "sep.": 9,
    "sept": 9,
    "sept.": 9,
    "octobre": 10,
    "oct": 10,
    "oct.": 10,
    "novembre": 11,
    "nov": 11,
    "nov.": 11,
    "décembre": 12,
    "decembre": 12,
    "dec": 12,
    "dec.": 12,
};
const INTEGER_WORD_DICTIONARY$8 = {
    "un": 1,
    "deux": 2,
    "trois": 3,
    "quatre": 4,
    "cinq": 5,
    "six": 6,
    "sept": 7,
    "huit": 8,
    "neuf": 9,
    "dix": 10,
    "onze": 11,
    "douze": 12,
    "treize": 13,
};
const TIME_UNIT_DICTIONARY$8 = {
    "sec": "second",
    "seconde": "second",
    "secondes": "second",
    "min": "minute",
    "mins": "minute",
    "minute": "minute",
    "minutes": "minute",
    "h": "hour",
    "hr": "hour",
    "hrs": "hour",
    "heure": "hour",
    "heures": "hour",
    "jour": "day",
    "jours": "day",
    "semaine": "week",
    "semaines": "week",
    "mois": "month",
    "trimestre": "quarter",
    "trimestres": "quarter",
    "ans": "year",
    "année": "year",
    "années": "year",
};
const NUMBER_PATTERN$8 = `(?:${matchAnyPattern(INTEGER_WORD_DICTIONARY$8)}|[0-9]+|[0-9]+\\.[0-9]+|une?\\b|quelques?|demi-?)`;
function parseNumberPattern$8(match) {
    const num = match.toLowerCase();
    if (INTEGER_WORD_DICTIONARY$8[num] !== undefined) {
        return INTEGER_WORD_DICTIONARY$8[num];
    }
    else if (num === "une" || num === "un") {
        return 1;
    }
    else if (num.match(/quelques?/)) {
        return 3;
    }
    else if (num.match(/demi-?/)) {
        return 0.5;
    }
    return parseFloat(num);
}
const ORDINAL_NUMBER_PATTERN$4 = `(?:[0-9]{1,2}(?:er)?)`;
function parseOrdinalNumberPattern$4(match) {
    let num = match.toLowerCase();
    num = num.replace(/(?:er)$/i, "");
    return parseInt(num);
}
const YEAR_PATTERN$7 = `(?:[1-9][0-9]{0,3}\\s*(?:AC|AD|p\\.\\s*C(?:hr?)?\\.\\s*n\\.)|[1-2][0-9]{3}|[5-9][0-9])`;
function parseYear$8(match) {
    if (/AC/i.test(match)) {
        match = match.replace(/BC/i, "");
        return -parseInt(match);
    }
    if (/AD/i.test(match) || /C/i.test(match)) {
        match = match.replace(/[^\d]+/i, "");
        return parseInt(match);
    }
    let yearNumber = parseInt(match);
    if (yearNumber < 100) {
        if (yearNumber > 50) {
            yearNumber = yearNumber + 1900;
        }
        else {
            yearNumber = yearNumber + 2000;
        }
    }
    return yearNumber;
}
const SINGLE_TIME_UNIT_PATTERN$8 = `(${NUMBER_PATTERN$8})\\s{0,5}(${matchAnyPattern(TIME_UNIT_DICTIONARY$8)})\\s{0,5}`;
const SINGLE_TIME_UNIT_REGEX$8 = new RegExp(SINGLE_TIME_UNIT_PATTERN$8, "i");
const TIME_UNITS_PATTERN$8 = repeatedTimeunitPattern("", SINGLE_TIME_UNIT_PATTERN$8);
function parseDuration$8(timeunitText) {
    const fragments = {};
    let remainingText = timeunitText;
    let match = SINGLE_TIME_UNIT_REGEX$8.exec(remainingText);
    while (match) {
        collectDateTimeFragment$7(fragments, match);
        remainingText = remainingText.substring(match[0].length);
        match = SINGLE_TIME_UNIT_REGEX$8.exec(remainingText);
    }
    return fragments;
}
function collectDateTimeFragment$7(fragments, match) {
    const num = parseNumberPattern$8(match[1]);
    const unit = TIME_UNIT_DICTIONARY$8[match[2].toLowerCase()];
    fragments[unit] = num;
}

const PATTERN$W = new RegExp("(?:(?:\\,|\\(|\\（)\\s*)?" +
    "(?:(?:ce)\\s*)?" +
    `(${matchAnyPattern(WEEKDAY_DICTIONARY$9)})` +
    "(?:\\s*(?:\\,|\\)|\\）))?" +
    "(?:\\s*(dernier|prochain)\\s*)?" +
    "(?=\\W|\\d|$)", "i");
const WEEKDAY_GROUP$9 = 1;
const POSTFIX_GROUP$6 = 2;
class FRWeekdayParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$W;
    }
    innerExtract(context, match) {
        const dayOfWeek = match[WEEKDAY_GROUP$9].toLowerCase();
        const weekday = WEEKDAY_DICTIONARY$9[dayOfWeek];
        if (weekday === undefined) {
            return null;
        }
        let suffix = match[POSTFIX_GROUP$6];
        suffix = suffix || "";
        suffix = suffix.toLowerCase();
        let modifier = null;
        if (suffix == "dernier") {
            modifier = "last";
        }
        else if (suffix == "prochain") {
            modifier = "next";
        }
        return createParsingComponentsAtWeekday(context.reference, weekday, modifier);
    }
}

const FIRST_REG_PATTERN$3 = new RegExp("(^|\\s|T)" +
    "(?:(?:[àa])\\s*)?" +
    "(\\d{1,2})(?:h|:)?" +
    "(?:(\\d{1,2})(?:m|:)?)?" +
    "(?:(\\d{1,2})(?:s|:)?)?" +
    "(?:\\s*(A\\.M\\.|P\\.M\\.|AM?|PM?))?" +
    "(?=\\W|$)", "i");
const SECOND_REG_PATTERN$3 = new RegExp("^\\s*(\\-|\\–|\\~|\\〜|[àa]|\\?)\\s*" +
    "(\\d{1,2})(?:h|:)?" +
    "(?:(\\d{1,2})(?:m|:)?)?" +
    "(?:(\\d{1,2})(?:s|:)?)?" +
    "(?:\\s*(A\\.M\\.|P\\.M\\.|AM?|PM?))?" +
    "(?=\\W|$)", "i");
const HOUR_GROUP$4 = 2;
const MINUTE_GROUP$3 = 3;
const SECOND_GROUP$3 = 4;
const AM_PM_HOUR_GROUP$2 = 5;
class FRSpecificTimeExpressionParser {
    pattern(context) {
        return FIRST_REG_PATTERN$3;
    }
    extract(context, match) {
        const result = context.createParsingResult(match.index + match[1].length, match[0].substring(match[1].length));
        if (result.text.match(/^\d{4}$/)) {
            match.index += match[0].length;
            return null;
        }
        result.start = FRSpecificTimeExpressionParser.extractTimeComponent(result.start.clone(), match);
        if (!result.start) {
            match.index += match[0].length;
            return null;
        }
        const remainingText = context.text.substring(match.index + match[0].length);
        const secondMatch = SECOND_REG_PATTERN$3.exec(remainingText);
        if (secondMatch) {
            result.end = FRSpecificTimeExpressionParser.extractTimeComponent(result.start.clone(), secondMatch);
            if (result.end) {
                result.text += secondMatch[0];
            }
        }
        return result;
    }
    static extractTimeComponent(extractingComponents, match) {
        let hour = 0;
        let minute = 0;
        let meridiem = null;
        hour = parseInt(match[HOUR_GROUP$4]);
        if (match[MINUTE_GROUP$3] != null) {
            minute = parseInt(match[MINUTE_GROUP$3]);
        }
        if (minute >= 60 || hour > 24) {
            return null;
        }
        if (hour >= 12) {
            meridiem = Meridiem.PM;
        }
        if (match[AM_PM_HOUR_GROUP$2] != null) {
            if (hour > 12)
                return null;
            const ampm = match[AM_PM_HOUR_GROUP$2][0].toLowerCase();
            if (ampm == "a") {
                meridiem = Meridiem.AM;
                if (hour == 12) {
                    hour = 0;
                }
            }
            if (ampm == "p") {
                meridiem = Meridiem.PM;
                if (hour != 12) {
                    hour += 12;
                }
            }
        }
        extractingComponents.assign("hour", hour);
        extractingComponents.assign("minute", minute);
        if (meridiem !== null) {
            extractingComponents.assign("meridiem", meridiem);
        }
        else {
            if (hour < 12) {
                extractingComponents.imply("meridiem", Meridiem.AM);
            }
            else {
                extractingComponents.imply("meridiem", Meridiem.PM);
            }
        }
        if (match[SECOND_GROUP$3] != null) {
            const second = parseInt(match[SECOND_GROUP$3]);
            if (second >= 60)
                return null;
            extractingComponents.assign("second", second);
        }
        return extractingComponents;
    }
}

const PATTERN$V = new RegExp("(?:on\\s*?)?" +
    `(${ORDINAL_NUMBER_PATTERN$4})` +
    `(?:\\s*(?:au|\\-|\\–|jusqu'au?|\\s)\\s*(${ORDINAL_NUMBER_PATTERN$4}))?` +
    `(?:-|/|\\s*(?:de)?\\s*)` +
    `(${matchAnyPattern(MONTH_DICTIONARY$9)})` +
    `(?:(?:-|/|,?\\s*)(${YEAR_PATTERN$7}(?![^\\s]\\d)))?` +
    `(?=\\W|$)`, "i");
const DATE_GROUP$c = 1;
const DATE_TO_GROUP$9 = 2;
const MONTH_NAME_GROUP$f = 3;
const YEAR_GROUP$k = 4;
class FRMonthNameLittleEndianParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$V;
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        const month = MONTH_DICTIONARY$9[match[MONTH_NAME_GROUP$f].toLowerCase()];
        const day = parseOrdinalNumberPattern$4(match[DATE_GROUP$c]);
        if (day > 31) {
            match.index = match.index + match[DATE_GROUP$c].length;
            return null;
        }
        result.start.assign("month", month);
        result.start.assign("day", day);
        if (match[YEAR_GROUP$k]) {
            const yearNumber = parseYear$8(match[YEAR_GROUP$k]);
            result.start.assign("year", yearNumber);
        }
        else {
            const year = findYearClosestToRef(context.refDate, day, month);
            result.start.imply("year", year);
        }
        if (match[DATE_TO_GROUP$9]) {
            const endDate = parseOrdinalNumberPattern$4(match[DATE_TO_GROUP$9]);
            result.end = result.start.clone();
            result.end.assign("day", endDate);
        }
        return result;
    }
}

class FRTimeUnitAgoFormatParser$1 extends AbstractParserWithWordBoundaryChecking {
    constructor() {
        super();
    }
    innerPattern() {
        return new RegExp(`il y a\\s*(${TIME_UNITS_PATTERN$8})(?=(?:\\W|$))`, "i");
    }
    innerExtract(context, match) {
        const timeUnits = parseDuration$8(match[1]);
        const outputTimeUnits = reverseDuration(timeUnits);
        return ParsingComponents.createRelativeFromReference(context.reference, outputTimeUnits);
    }
}

class FRTimeUnitWithinFormatParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return new RegExp(`(?:dans|en|pour|pendant|de)\\s*(${TIME_UNITS_PATTERN$8})(?=\\W|$)`, "i");
    }
    innerExtract(context, match) {
        const timeUnits = parseDuration$8(match[1]);
        return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
    }
}

class FRTimeUnitAgoFormatParser extends AbstractParserWithWordBoundaryChecking {
    constructor() {
        super();
    }
    innerPattern() {
        return new RegExp(`(?:les?|la|l'|du|des?)\\s*` +
            `(${NUMBER_PATTERN$8})?` +
            `(?:\\s*(prochaine?s?|derni[eè]re?s?|pass[ée]e?s?|pr[ée]c[ée]dents?|suivante?s?))?` +
            `\\s*(${matchAnyPattern(TIME_UNIT_DICTIONARY$8)})` +
            `(?:\\s*(prochaine?s?|derni[eè]re?s?|pass[ée]e?s?|pr[ée]c[ée]dents?|suivante?s?))?`, "i");
    }
    innerExtract(context, match) {
        const num = match[1] ? parseNumberPattern$8(match[1]) : 1;
        const unit = TIME_UNIT_DICTIONARY$8[match[3].toLowerCase()];
        let timeUnits = {};
        timeUnits[unit] = num;
        let modifier = match[2] || match[4] || "";
        modifier = modifier.toLowerCase();
        if (!modifier) {
            return;
        }
        if (/derni[eè]re?s?/.test(modifier) || /pass[ée]e?s?/.test(modifier) || /pr[ée]c[ée]dents?/.test(modifier)) {
            timeUnits = reverseDuration(timeUnits);
        }
        return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
    }
}

const casual$e = new Chrono(createCasualConfiguration$d());
const strict$e = new Chrono(createConfiguration$d(true));
function parse$e(text, ref, option) {
    return casual$e.parse(text, ref, option);
}
function parseDate$e(text, ref, option) {
    return casual$e.parseDate(text, ref, option);
}
function createCasualConfiguration$d(littleEndian = true) {
    const option = createConfiguration$d(false, littleEndian);
    option.parsers.unshift(new FRCasualDateParser());
    option.parsers.unshift(new FRCasualTimeParser());
    option.parsers.unshift(new FRTimeUnitAgoFormatParser());
    return option;
}
function createConfiguration$d(strictMode = true, littleEndian = true) {
    return includeCommonConfiguration({
        parsers: [
            new SlashDateFormatParser(littleEndian),
            new FRMonthNameLittleEndianParser(),
            new FRTimeExpressionParser(),
            new FRSpecificTimeExpressionParser(),
            new FRTimeUnitAgoFormatParser$1(),
            new FRTimeUnitWithinFormatParser(),
            new FRWeekdayParser(),
        ],
        refiners: [new FRMergeDateTimeRefiner(), new FRMergeDateRangeRefiner()],
    }, strictMode);
}

var index$d = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Chrono: Chrono,
	ParsingResult: ParsingResult,
	ParsingComponents: ParsingComponents,
	ReferenceWithTimezone: ReferenceWithTimezone,
	get Meridiem () { return Meridiem; },
	get Weekday () { return Weekday; },
	casual: casual$e,
	strict: strict$e,
	parse: parse$e,
	parseDate: parseDate$e,
	createCasualConfiguration: createCasualConfiguration$d,
	createConfiguration: createConfiguration$d
});

const NUMBER$2 = {
    "零": 0,
    "〇": 0,
    "一": 1,
    "二": 2,
    "三": 3,
    "四": 4,
    "五": 5,
    "六": 6,
    "七": 7,
    "八": 8,
    "九": 9,
    "十": 10,
};
const WEEKDAY_OFFSET$2 = {
    "日": 0,
    "月": 1,
    "火": 2,
    "水": 3,
    "木": 4,
    "金": 5,
    "土": 6,
};
function toHankaku(text) {
    return String(text)
        .replace(/\u2019/g, "\u0027")
        .replace(/\u201D/g, "\u0022")
        .replace(/\u3000/g, "\u0020")
        .replace(/\uFFE5/g, "\u00A5")
        .replace(/[\uFF01\uFF03-\uFF06\uFF08\uFF09\uFF0C-\uFF19\uFF1C-\uFF1F\uFF21-\uFF3B\uFF3D\uFF3F\uFF41-\uFF5B\uFF5D\uFF5E]/g, alphaNum);
}
function alphaNum(token) {
    return String.fromCharCode(token.charCodeAt(0) - 65248);
}
function jaStringToNumber(text) {
    let number = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === "十") {
            number = number === 0 ? NUMBER$2[char] : number * NUMBER$2[char];
        }
        else {
            number += NUMBER$2[char];
        }
    }
    return number;
}

const PATTERN$U = /(?:(?:([同今本])|((昭和|平成|令和)?([0-9０-９]{1,4}|元)))年\s*)?([0-9０-９]{1,2})月\s*([0-9０-９]{1,2})日/i;
const SPECIAL_YEAR_GROUP = 1;
const TYPICAL_YEAR_GROUP = 2;
const ERA_GROUP = 3;
const YEAR_NUMBER_GROUP$2 = 4;
const MONTH_GROUP$7 = 5;
const DAY_GROUP$5 = 6;
class JPStandardParser {
    pattern() {
        return PATTERN$U;
    }
    extract(context, match) {
        const month = parseInt(toHankaku(match[MONTH_GROUP$7]));
        const day = parseInt(toHankaku(match[DAY_GROUP$5]));
        const components = context.createParsingComponents({
            day: day,
            month: month,
        });
        if (match[SPECIAL_YEAR_GROUP] && match[SPECIAL_YEAR_GROUP].match("同|今|本")) {
            components.assign("year", context.reference.getDateWithAdjustedTimezone().getFullYear());
        }
        if (match[TYPICAL_YEAR_GROUP]) {
            const yearNumText = match[YEAR_NUMBER_GROUP$2];
            let year = yearNumText == "元" ? 1 : parseInt(toHankaku(yearNumText));
            if (match[ERA_GROUP] == "令和") {
                year += 2018;
            }
            else if (match[ERA_GROUP] == "平成") {
                year += 1988;
            }
            else if (match[ERA_GROUP] == "昭和") {
                year += 1925;
            }
            components.assign("year", year);
        }
        else {
            const year = findYearClosestToRef(context.refDate, day, month);
            components.imply("year", year);
        }
        return components;
    }
}

class JPMergeDateRangeRefiner extends AbstractMergeDateRangeRefiner {
    patternBetween() {
        return /^\s*(から|－|ー|-|～|~)\s*$/i;
    }
}

const PATTERN$T = /今日|きょう|本日|ほんじつ|昨日|きのう|明日|あした|今夜|こんや|今夕|こんゆう|今晩|こんばん|今朝|けさ/i;
function normalizeTextToKanji(text) {
    switch (text) {
        case "きょう":
            return "今日";
        case "ほんじつ":
            return "本日";
        case "きのう":
            return "昨日";
        case "あした":
            return "明日";
        case "こんや":
            return "今夜";
        case "こんゆう":
            return "今夕";
        case "こんばん":
            return "今晩";
        case "けさ":
            return "今朝";
        default:
            return text;
    }
}
class JPCasualDateParser {
    pattern() {
        return PATTERN$T;
    }
    extract(context, match) {
        const text = normalizeTextToKanji(match[0]);
        const components = context.createParsingComponents();
        switch (text) {
            case "昨日":
                return yesterday(context.reference);
            case "明日":
                return tomorrow(context.reference);
            case "本日":
            case "今日":
                return today(context.reference);
        }
        if (text == "今夜" || text == "今夕" || text == "今晩") {
            components.imply("hour", 22);
            components.assign("meridiem", Meridiem.PM);
        }
        else if (text.match("今朝")) {
            components.imply("hour", 6);
            components.assign("meridiem", Meridiem.AM);
        }
        const date = context.refDate;
        components.assign("day", date.getDate());
        components.assign("month", date.getMonth() + 1);
        components.assign("year", date.getFullYear());
        return components;
    }
}

const PATTERN$S = new RegExp("((?<prefix>前の|次の|今週))?(?<weekday>" + Object.keys(WEEKDAY_OFFSET$2).join("|") + ")(?:曜日|曜)", "i");
class JPWeekdayParser {
    pattern() {
        return PATTERN$S;
    }
    extract(context, match) {
        const dayOfWeek = match.groups.weekday;
        const offset = WEEKDAY_OFFSET$2[dayOfWeek];
        if (offset === undefined)
            return null;
        const prefix = match.groups.prefix || "";
        let modifier = null;
        if (prefix.match(/前の/)) {
            modifier = "last";
        }
        else if (prefix.match(/次の/)) {
            modifier = "next";
        }
        else if (prefix.match(/今週/)) {
            modifier = "this";
        }
        return createParsingComponentsAtWeekday(context.reference, offset, modifier);
    }
}

const PATTERN$R = new RegExp("([0-9０-９]{4}[\\/|\\／])?" + "([0-1０-１]{0,1}[0-9０-９]{1})(?:[\\/|\\／]([0-3０-３]{0,1}[0-9０-９]{1}))", "i");
const YEAR_GROUP$j = 1;
const MONTH_GROUP$6 = 2;
const DAY_GROUP$4 = 3;
class JPSlashDateFormatParser {
    pattern() {
        return PATTERN$R;
    }
    extract(context, match) {
        const result = context.createParsingComponents();
        const month = parseInt(toHankaku(match[MONTH_GROUP$6]));
        const day = parseInt(toHankaku(match[DAY_GROUP$4]));
        if (month < 1 || month > 12) {
            return null;
        }
        if (day < 1 || day > 31) {
            return null;
        }
        result.assign("day", day);
        result.assign("month", month);
        if (match[YEAR_GROUP$j]) {
            const rawYearNumber = parseInt(toHankaku(match[YEAR_GROUP$j]));
            const year = findMostLikelyADYear(rawYearNumber);
            result.assign("year", year);
        }
        else {
            const year = findYearClosestToRef(context.reference.instant, day, month);
            result.imply("year", year);
        }
        return result;
    }
}

const FIRST_REG_PATTERN$2 = new RegExp("(?:" +
    "(午前|午後|A.M.|P.M.|AM|PM)" +
    ")?" +
    "(?:[\\s,，、]*)" +
    "(?:([0-9０-９]+|[" +
    Object.keys(NUMBER$2).join("") +
    "]+)(?:\\s*)(?:時(?!間)|:|：)" +
    "(?:\\s*)" +
    "([0-9０-９]+|半|[" +
    Object.keys(NUMBER$2).join("") +
    "]+)?(?:\\s*)(?:分|:|：)?" +
    "(?:\\s*)" +
    "([0-9０-９]+|[" +
    Object.keys(NUMBER$2).join("") +
    "]+)?(?:\\s*)(?:秒)?)" +
    "(?:\\s*(A.M.|P.M.|AM?|PM?))?", "i");
const SECOND_REG_PATTERN$2 = new RegExp("(?:^\\s*(?:から|\\-|\\–|\\－|\\~|\\〜)\\s*)" +
    "(?:" +
    "(午前|午後|A.M.|P.M.|AM|PM)" +
    ")?" +
    "(?:[\\s,，、]*)" +
    "(?:([0-9０-９]+|[" +
    Object.keys(NUMBER$2).join("") +
    "]+)(?:\\s*)(?:時|:|：)" +
    "(?:\\s*)" +
    "([0-9０-９]+|半|[" +
    Object.keys(NUMBER$2).join("") +
    "]+)?(?:\\s*)(?:分|:|：)?" +
    "(?:\\s*)" +
    "([0-9０-９]+|[" +
    Object.keys(NUMBER$2).join("") +
    "]+)?(?:\\s*)(?:秒)?)" +
    "(?:\\s*(A.M.|P.M.|AM?|PM?))?", "i");
const AM_PM_HOUR_GROUP_1 = 1;
const HOUR_GROUP$3 = 2;
const MINUTE_GROUP$2 = 3;
const SECOND_GROUP$2 = 4;
const AM_PM_HOUR_GROUP_2 = 5;
class JPTimeExpressionParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return FIRST_REG_PATTERN$2;
    }
    innerExtract(context, match) {
        if (match.index > 0 && context.text[match.index - 1].match(/\w/)) {
            return null;
        }
        const result = context.createParsingResult(match.index, match[0]);
        result.start = createTimeComponents(context, match[HOUR_GROUP$3], match[MINUTE_GROUP$2], match[SECOND_GROUP$2], match[AM_PM_HOUR_GROUP_1] ?? match[AM_PM_HOUR_GROUP_2]);
        if (!result.start) {
            match.index += match[0].length;
            return null;
        }
        match = SECOND_REG_PATTERN$2.exec(context.text.substring(result.index + result.text.length));
        if (!match) {
            return result;
        }
        result.text = result.text + match[0];
        result.end = createTimeComponents(context, match[HOUR_GROUP$3], match[MINUTE_GROUP$2], match[SECOND_GROUP$2], match[AM_PM_HOUR_GROUP_1] ?? match[AM_PM_HOUR_GROUP_2]);
        if (!result.end) {
            return null;
        }
        if (!result.end.isCertain("meridiem") && result.start.isCertain("meridiem")) {
            result.end.imply("meridiem", result.start.get("meridiem"));
            if (result.start.get("meridiem") === Meridiem.PM) {
                if (result.start.get("hour") - 12 > result.end.get("hour")) {
                    result.end.imply("meridiem", Meridiem.AM);
                }
                else if (result.end.get("hour") < 12) {
                    result.end.assign("hour", result.end.get("hour") + 12);
                }
            }
        }
        if (result.end.date().getTime() < result.start.date().getTime()) {
            result.end.imply("day", result.end.get("day") + 1);
        }
        return result;
    }
}
function createTimeComponents(context, matchHour, matchMinute, matchSecond, matchAmPm) {
    let hour = 0;
    let meridiem = -1;
    let targetComponents = context.createParsingComponents();
    hour = parseInt(toHankaku(matchHour));
    if (isNaN(hour)) {
        hour = jaStringToNumber(matchHour);
    }
    if (hour > 24) {
        return null;
    }
    if (matchMinute) {
        let minute;
        if (matchMinute === "半") {
            minute = 30;
        }
        else {
            minute = parseInt(toHankaku(matchMinute));
            if (isNaN(minute)) {
                minute = jaStringToNumber(matchMinute);
            }
        }
        if (minute >= 60)
            return null;
        targetComponents.assign("minute", minute);
    }
    if (matchSecond) {
        let second = parseInt(toHankaku(matchSecond));
        if (isNaN(second)) {
            second = jaStringToNumber(matchSecond);
        }
        if (second >= 60)
            return null;
        targetComponents.assign("second", second);
    }
    if (matchAmPm) {
        if (hour > 12) {
            return null;
        }
        const AMPMString = matchAmPm;
        if (AMPMString === "午前" || AMPMString[0].toLowerCase() === "a") {
            meridiem = Meridiem.AM;
            if (hour === 12)
                hour = 0;
        }
        else if (AMPMString === "午後" || AMPMString[0].toLowerCase() === "p") {
            meridiem = Meridiem.PM;
            if (hour != 12)
                hour += 12;
        }
    }
    targetComponents.assign("hour", hour);
    if (meridiem >= 0) {
        targetComponents.assign("meridiem", meridiem);
    }
    else {
        if (hour < 12) {
            targetComponents.imply("meridiem", Meridiem.AM);
        }
        else {
            targetComponents.imply("meridiem", Meridiem.PM);
        }
    }
    return targetComponents;
}

class JPMergeDateTimeRefiner extends AbstractMergeDateTimeRefiner {
    patternBetween() {
        return /^\s*(の)?\s*$/i;
    }
}

class JPMergeWeekdayComponentRefiner extends MergingRefiner {
    mergeResults(textBetween, currentResult, nextResult) {
        const newResult = currentResult.clone();
        newResult.text = currentResult.text + textBetween + nextResult.text;
        newResult.start.assign("weekday", nextResult.start.get("weekday"));
        if (newResult.end) {
            newResult.end.assign("weekday", nextResult.start.get("weekday"));
        }
        return newResult;
    }
    shouldMergeResults(textBetween, currentResult, nextResult) {
        const normalDateThenWeekday = currentResult.start.isCertain("day") &&
            nextResult.start.isOnlyWeekdayComponent() &&
            !nextResult.start.isCertain("hour");
        return normalDateThenWeekday && textBetween.match(/^[,、の]?\s*$/) !== null;
    }
}

const PATTERN$Q = new RegExp("(?:\\(|\\（)(?<weekday>" + Object.keys(WEEKDAY_OFFSET$2).join("|") + ")(?:\\)|\\）)", "i");
class JPWeekdayWithParenthesesParser {
    pattern() {
        return PATTERN$Q;
    }
    extract(context, match) {
        const dayOfWeek = match.groups.weekday;
        const offset = WEEKDAY_OFFSET$2[dayOfWeek];
        if (offset === undefined)
            return null;
        return createParsingComponentsAtWeekday(context.reference, offset);
    }
}

const casual$d = new Chrono(createCasualConfiguration$c());
const strict$d = new Chrono(createConfiguration$c(true));
function parse$d(text, ref, option) {
    return casual$d.parse(text, ref, option);
}
function parseDate$d(text, ref, option) {
    return casual$d.parseDate(text, ref, option);
}
function createCasualConfiguration$c() {
    const option = createConfiguration$c(false);
    option.parsers.unshift(new JPCasualDateParser());
    return option;
}
function createConfiguration$c(strictMode = true) {
    const configuration = includeCommonConfiguration({
        parsers: [
            new JPStandardParser(),
            new JPWeekdayParser(),
            new JPWeekdayWithParenthesesParser(),
            new JPSlashDateFormatParser(),
            new JPTimeExpressionParser(),
        ],
        refiners: [
            new JPMergeWeekdayComponentRefiner(),
            new JPMergeDateTimeRefiner(),
            new JPMergeDateRangeRefiner(),
        ],
    }, strictMode);
    configuration.refiners = configuration.refiners.filter((refiner) => !(refiner instanceof MergeWeekdayComponentRefiner));
    return configuration;
}

var index$c = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Chrono: Chrono,
	ParsingResult: ParsingResult,
	ParsingComponents: ParsingComponents,
	ReferenceWithTimezone: ReferenceWithTimezone,
	get Meridiem () { return Meridiem; },
	get Weekday () { return Weekday; },
	casual: casual$d,
	strict: strict$d,
	parse: parse$d,
	parseDate: parseDate$d,
	createCasualConfiguration: createCasualConfiguration$c,
	createConfiguration: createConfiguration$c
});

const WEEKDAY_DICTIONARY$8 = {
    "domingo": 0,
    "dom": 0,
    "segunda": 1,
    "segunda-feira": 1,
    "seg": 1,
    "terça": 2,
    "terça-feira": 2,
    "ter": 2,
    "quarta": 3,
    "quarta-feira": 3,
    "qua": 3,
    "quinta": 4,
    "quinta-feira": 4,
    "qui": 4,
    "sexta": 5,
    "sexta-feira": 5,
    "sex": 5,
    "sábado": 6,
    "sabado": 6,
    "sab": 6,
};
const MONTH_DICTIONARY$8 = {
    "janeiro": 1,
    "jan": 1,
    "jan.": 1,
    "fevereiro": 2,
    "fev": 2,
    "fev.": 2,
    "março": 3,
    "mar": 3,
    "mar.": 3,
    "abril": 4,
    "abr": 4,
    "abr.": 4,
    "maio": 5,
    "mai": 5,
    "mai.": 5,
    "junho": 6,
    "jun": 6,
    "jun.": 6,
    "julho": 7,
    "jul": 7,
    "jul.": 7,
    "agosto": 8,
    "ago": 8,
    "ago.": 8,
    "setembro": 9,
    "set": 9,
    "set.": 9,
    "outubro": 10,
    "out": 10,
    "out.": 10,
    "novembro": 11,
    "nov": 11,
    "nov.": 11,
    "dezembro": 12,
    "dez": 12,
    "dez.": 12,
};
const YEAR_PATTERN$6 = "[0-9]{1,4}(?![^\\s]\\d)(?:\\s*[a|d]\\.?\\s*c\\.?|\\s*a\\.?\\s*d\\.?)?";
function parseYear$7(match) {
    if (match.match(/^[0-9]{1,4}$/)) {
        let yearNumber = parseInt(match);
        if (yearNumber < 100) {
            if (yearNumber > 50) {
                yearNumber = yearNumber + 1900;
            }
            else {
                yearNumber = yearNumber + 2000;
            }
        }
        return yearNumber;
    }
    if (match.match(/a\.?\s*c\.?/i)) {
        match = match.replace(/a\.?\s*c\.?/i, "");
        return -parseInt(match);
    }
    return parseInt(match);
}

const PATTERN$P = new RegExp("(?:(?:\\,|\\(|\\（)\\s*)?" +
    "(?:(este|esta|passado|pr[oó]ximo)\\s*)?" +
    `(${matchAnyPattern(WEEKDAY_DICTIONARY$8)})` +
    "(?:\\s*(?:\\,|\\)|\\）))?" +
    "(?:\\s*(este|esta|passado|pr[óo]ximo)\\s*semana)?" +
    "(?=\\W|\\d|$)", "i");
const PREFIX_GROUP$8 = 1;
const WEEKDAY_GROUP$8 = 2;
const POSTFIX_GROUP$5 = 3;
class PTWeekdayParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$P;
    }
    innerExtract(context, match) {
        const dayOfWeek = match[WEEKDAY_GROUP$8].toLowerCase();
        const weekday = WEEKDAY_DICTIONARY$8[dayOfWeek];
        if (weekday === undefined) {
            return null;
        }
        const prefix = match[PREFIX_GROUP$8];
        const postfix = match[POSTFIX_GROUP$5];
        let norm = prefix || postfix || "";
        norm = norm.toLowerCase();
        let modifier = null;
        if (norm == "passado") {
            modifier = "this";
        }
        else if (norm == "próximo" || norm == "proximo") {
            modifier = "next";
        }
        else if (norm == "este") {
            modifier = "this";
        }
        return createParsingComponentsAtWeekday(context.reference, weekday, modifier);
    }
}

class PTTimeExpressionParser extends AbstractTimeExpressionParser {
    primaryPrefix() {
        return "(?:(?:ao?|às?|das|da|de|do)\\s*)?";
    }
    followingPhase() {
        return "\\s*(?:\\-|\\–|\\~|\\〜|a(?:o)?|\\?)\\s*";
    }
}

class PTMergeDateTimeRefiner extends AbstractMergeDateTimeRefiner {
    patternBetween() {
        return new RegExp("^\\s*(?:,|à)?\\s*$");
    }
}

class PTMergeDateRangeRefiner extends AbstractMergeDateRangeRefiner {
    patternBetween() {
        return /^\s*(?:-)\s*$/i;
    }
}

const PATTERN$O = new RegExp(`([0-9]{1,2})(?:º|ª|°)?` +
    "(?:\\s*(?:desde|de|\\-|\\–|ao?|\\s)\\s*([0-9]{1,2})(?:º|ª|°)?)?\\s*(?:de)?\\s*" +
    `(?:-|/|\\s*(?:de|,)?\\s*)` +
    `(${matchAnyPattern(MONTH_DICTIONARY$8)})` +
    `(?:\\s*(?:de|,)?\\s*(${YEAR_PATTERN$6}))?` +
    `(?=\\W|$)`, "i");
const DATE_GROUP$b = 1;
const DATE_TO_GROUP$8 = 2;
const MONTH_NAME_GROUP$e = 3;
const YEAR_GROUP$i = 4;
class PTMonthNameLittleEndianParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$O;
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        const month = MONTH_DICTIONARY$8[match[MONTH_NAME_GROUP$e].toLowerCase()];
        const day = parseInt(match[DATE_GROUP$b]);
        if (day > 31) {
            match.index = match.index + match[DATE_GROUP$b].length;
            return null;
        }
        result.start.assign("month", month);
        result.start.assign("day", day);
        if (match[YEAR_GROUP$i]) {
            const yearNumber = parseYear$7(match[YEAR_GROUP$i]);
            result.start.assign("year", yearNumber);
        }
        else {
            const year = findYearClosestToRef(context.refDate, day, month);
            result.start.imply("year", year);
        }
        if (match[DATE_TO_GROUP$8]) {
            const endDate = parseInt(match[DATE_TO_GROUP$8]);
            result.end = result.start.clone();
            result.end.assign("day", endDate);
        }
        return result;
    }
}

class PTCasualDateParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return /(agora|hoje|amanha|amanhã|ontem)(?=\W|$)/i;
    }
    innerExtract(context, match) {
        const lowerText = match[0].toLowerCase();
        const component = context.createParsingComponents();
        switch (lowerText) {
            case "agora":
                return now(context.reference);
            case "hoje":
                return today(context.reference);
            case "amanha":
            case "amanhã":
                return tomorrow(context.reference);
            case "ontem":
                return yesterday(context.reference);
        }
        return component;
    }
}

class PTCasualTimeParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return /(?:esta\s*)?(manha|manhã|tarde|meia-noite|meio-dia|noite)(?=\W|$)/i;
    }
    innerExtract(context, match) {
        const targetDate = context.refDate;
        const component = context.createParsingComponents();
        switch (match[1].toLowerCase()) {
            case "tarde":
                component.imply("meridiem", Meridiem.PM);
                component.imply("hour", 15);
                component.addTag("casualReference/afternoon");
                break;
            case "noite":
                component.imply("meridiem", Meridiem.PM);
                component.imply("hour", 22);
                component.addTag("casualReference/evening");
                break;
            case "manha":
            case "manhã":
                component.imply("meridiem", Meridiem.AM);
                component.imply("hour", 6);
                component.addTag("casualReference/morning");
                break;
            case "meia-noite":
                const nextDay = new Date(targetDate.getTime());
                nextDay.setDate(nextDay.getDate() + 1);
                assignSimilarDate(component, nextDay);
                implySimilarTime(component, nextDay);
                component.imply("hour", 0);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.addTag("casualReference/midnight");
                break;
            case "meio-dia":
                component.imply("meridiem", Meridiem.AM);
                component.imply("hour", 12);
                component.addTag("casualReference/noon");
                break;
        }
        return component;
    }
}

const casual$c = new Chrono(createCasualConfiguration$b());
const strict$c = new Chrono(createConfiguration$b(true));
function parse$c(text, ref, option) {
    return casual$c.parse(text, ref, option);
}
function parseDate$c(text, ref, option) {
    return casual$c.parseDate(text, ref, option);
}
function createCasualConfiguration$b(littleEndian = true) {
    const option = createConfiguration$b(false, littleEndian);
    option.parsers.push(new PTCasualDateParser());
    option.parsers.push(new PTCasualTimeParser());
    return option;
}
function createConfiguration$b(strictMode = true, littleEndian = true) {
    return includeCommonConfiguration({
        parsers: [
            new SlashDateFormatParser(littleEndian),
            new PTWeekdayParser(),
            new PTTimeExpressionParser(),
            new PTMonthNameLittleEndianParser(),
        ],
        refiners: [new PTMergeDateTimeRefiner(), new PTMergeDateRangeRefiner()],
    }, strictMode);
}

var index$b = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Chrono: Chrono,
	ParsingResult: ParsingResult,
	ParsingComponents: ParsingComponents,
	ReferenceWithTimezone: ReferenceWithTimezone,
	get Meridiem () { return Meridiem; },
	get Weekday () { return Weekday; },
	casual: casual$c,
	strict: strict$c,
	parse: parse$c,
	parseDate: parseDate$c,
	createCasualConfiguration: createCasualConfiguration$b,
	createConfiguration: createConfiguration$b
});

class NLMergeDateRangeRefiner extends AbstractMergeDateRangeRefiner {
    patternBetween() {
        return /^\s*(tot|-)\s*$/i;
    }
}

class NLMergeDateTimeRefiner extends AbstractMergeDateTimeRefiner {
    patternBetween() {
        return new RegExp("^\\s*(om|na|voor|in de|,|-)?\\s*$");
    }
}

class NLCasualDateParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return /(nu|vandaag|morgen|morgend|gisteren)(?=\W|$)/i;
    }
    innerExtract(context, match) {
        const lowerText = match[0].toLowerCase();
        const component = context.createParsingComponents();
        switch (lowerText) {
            case "nu":
                return now(context.reference);
            case "vandaag":
                return today(context.reference);
            case "morgen":
            case "morgend":
                return tomorrow(context.reference);
            case "gisteren":
                return yesterday(context.reference);
        }
        return component;
    }
}

const DAY_GROUP$3 = 1;
const MOMENT_GROUP = 2;
class NLCasualTimeParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return /(deze)?\s*(namiddag|avond|middernacht|ochtend|middag|'s middags|'s avonds|'s ochtends)(?=\W|$)/i;
    }
    innerExtract(context, match) {
        const targetDate = context.refDate;
        const component = context.createParsingComponents();
        if (match[DAY_GROUP$3] === "deze") {
            component.assign("day", context.refDate.getDate());
            component.assign("month", context.refDate.getMonth() + 1);
            component.assign("year", context.refDate.getFullYear());
        }
        switch (match[MOMENT_GROUP].toLowerCase()) {
            case "namiddag":
            case "'s namiddags":
                component.imply("meridiem", Meridiem.PM);
                component.imply("hour", 15);
                component.addTag("casualReference/afternoon");
                break;
            case "avond":
            case "'s avonds'":
                component.imply("meridiem", Meridiem.PM);
                component.imply("hour", 20);
                component.addTag("casualReference/evening");
                break;
            case "middernacht":
                const nextDay = new Date(targetDate.getTime());
                nextDay.setDate(nextDay.getDate() + 1);
                assignSimilarDate(component, nextDay);
                implySimilarTime(component, nextDay);
                component.imply("hour", 0);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.addTag("casualReference/midnight");
                break;
            case "ochtend":
            case "'s ochtends":
                component.imply("meridiem", Meridiem.AM);
                component.imply("hour", 6);
                component.addTag("casualReference/morning");
                break;
            case "middag":
            case "'s middags":
                component.imply("meridiem", Meridiem.AM);
                component.imply("hour", 12);
                component.addTag("casualReference/noon");
                break;
        }
        return component;
    }
}

const WEEKDAY_DICTIONARY$7 = {
    zondag: 0,
    zon: 0,
    "zon.": 0,
    zo: 0,
    "zo.": 0,
    maandag: 1,
    ma: 1,
    "ma.": 1,
    dinsdag: 2,
    din: 2,
    "din.": 2,
    di: 2,
    "di.": 2,
    woensdag: 3,
    woe: 3,
    "woe.": 3,
    wo: 3,
    "wo.": 3,
    donderdag: 4,
    dond: 4,
    "dond.": 4,
    do: 4,
    "do.": 4,
    vrijdag: 5,
    vrij: 5,
    "vrij.": 5,
    vr: 5,
    "vr.": 5,
    zaterdag: 6,
    zat: 6,
    "zat.": 6,
    "za": 6,
    "za.": 6,
};
const MONTH_DICTIONARY$7 = {
    januari: 1,
    jan: 1,
    "jan.": 1,
    februari: 2,
    feb: 2,
    "feb.": 2,
    maart: 3,
    mar: 3,
    "mar.": 3,
    mrt: 3,
    "mrt.": 3,
    april: 4,
    apr: 4,
    "apr.": 4,
    mei: 5,
    juni: 6,
    jun: 6,
    "jun.": 6,
    juli: 7,
    jul: 7,
    "jul.": 7,
    augustus: 8,
    aug: 8,
    "aug.": 8,
    september: 9,
    sep: 9,
    "sep.": 9,
    sept: 9,
    "sept.": 9,
    oktober: 10,
    okt: 10,
    "okt.": 10,
    november: 11,
    nov: 11,
    "nov.": 11,
    december: 12,
    dec: 12,
    "dec.": 12,
};
const INTEGER_WORD_DICTIONARY$7 = {
    een: 1,
    twee: 2,
    drie: 3,
    vier: 4,
    vijf: 5,
    zes: 6,
    zeven: 7,
    acht: 8,
    negen: 9,
    tien: 10,
    elf: 11,
    twaalf: 12,
};
const ORDINAL_WORD_DICTIONARY$3 = {
    eerste: 1,
    tweede: 2,
    derde: 3,
    vierde: 4,
    vijfde: 5,
    zesde: 6,
    zevende: 7,
    achtste: 8,
    negende: 9,
    tiende: 10,
    elfde: 11,
    twaalfde: 12,
    dertiende: 13,
    veertiende: 14,
    vijftiende: 15,
    zestiende: 16,
    zeventiende: 17,
    achttiende: 18,
    negentiende: 19,
    twintigste: 20,
    "eenentwintigste": 21,
    "tweeëntwintigste": 22,
    "drieentwintigste": 23,
    "vierentwintigste": 24,
    "vijfentwintigste": 25,
    "zesentwintigste": 26,
    "zevenentwintigste": 27,
    "achtentwintig": 28,
    "negenentwintig": 29,
    "dertigste": 30,
    "eenendertigste": 31,
};
const TIME_UNIT_DICTIONARY$7 = {
    sec: "second",
    second: "second",
    seconden: "second",
    min: "minute",
    mins: "minute",
    minute: "minute",
    minuut: "minute",
    minuten: "minute",
    minuutje: "minute",
    h: "hour",
    hr: "hour",
    hrs: "hour",
    uur: "hour",
    u: "hour",
    uren: "hour",
    dag: "day",
    dagen: "day",
    week: "week",
    weken: "week",
    maand: "month",
    maanden: "month",
    jaar: "year",
    jr: "year",
    jaren: "year",
};
const NUMBER_PATTERN$7 = `(?:${matchAnyPattern(INTEGER_WORD_DICTIONARY$7)}|[0-9]+|[0-9]+[\\.,][0-9]+|halve?|half|paar)`;
function parseNumberPattern$7(match) {
    const num = match.toLowerCase();
    if (INTEGER_WORD_DICTIONARY$7[num] !== undefined) {
        return INTEGER_WORD_DICTIONARY$7[num];
    }
    else if (num === "paar") {
        return 2;
    }
    else if (num === "half" || num.match(/halve?/)) {
        return 0.5;
    }
    return parseFloat(num.replace(",", "."));
}
const ORDINAL_NUMBER_PATTERN$3 = `(?:${matchAnyPattern(ORDINAL_WORD_DICTIONARY$3)}|[0-9]{1,2}(?:ste|de)?)`;
function parseOrdinalNumberPattern$3(match) {
    let num = match.toLowerCase();
    if (ORDINAL_WORD_DICTIONARY$3[num] !== undefined) {
        return ORDINAL_WORD_DICTIONARY$3[num];
    }
    num = num.replace(/(?:ste|de)$/i, "");
    return parseInt(num);
}
const YEAR_PATTERN$5 = `(?:[1-9][0-9]{0,3}\\s*(?:voor Christus|na Christus)|[1-2][0-9]{3}|[5-9][0-9])`;
function parseYear$6(match) {
    if (/voor Christus/i.test(match)) {
        match = match.replace(/voor Christus/i, "");
        return -parseInt(match);
    }
    if (/na Christus/i.test(match)) {
        match = match.replace(/na Christus/i, "");
        return parseInt(match);
    }
    const rawYearNumber = parseInt(match);
    return findMostLikelyADYear(rawYearNumber);
}
const SINGLE_TIME_UNIT_PATTERN$7 = `(${NUMBER_PATTERN$7})\\s{0,5}(${matchAnyPattern(TIME_UNIT_DICTIONARY$7)})\\s{0,5}`;
const SINGLE_TIME_UNIT_REGEX$7 = new RegExp(SINGLE_TIME_UNIT_PATTERN$7, "i");
const TIME_UNITS_PATTERN$7 = repeatedTimeunitPattern(`(?:(?:binnen|in)\\s*)?`, SINGLE_TIME_UNIT_PATTERN$7);
function parseDuration$7(timeunitText) {
    const fragments = {};
    let remainingText = timeunitText;
    let match = SINGLE_TIME_UNIT_REGEX$7.exec(remainingText);
    while (match) {
        collectDateTimeFragment$6(fragments, match);
        remainingText = remainingText.substring(match[0].length);
        match = SINGLE_TIME_UNIT_REGEX$7.exec(remainingText);
    }
    return fragments;
}
function collectDateTimeFragment$6(fragments, match) {
    const num = parseNumberPattern$7(match[1]);
    const unit = TIME_UNIT_DICTIONARY$7[match[2].toLowerCase()];
    fragments[unit] = num;
}

class NLTimeUnitWithinFormatParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return new RegExp(`(?:binnen|in|binnen de|voor)\\s*` + "(" + TIME_UNITS_PATTERN$7 + ")" + `(?=\\W|$)`, "i");
    }
    innerExtract(context, match) {
        const timeUnits = parseDuration$7(match[1]);
        return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
    }
}

const PATTERN$N = new RegExp("(?:(?:\\,|\\(|\\（)\\s*)?" +
    "(?:op\\s*?)?" +
    "(?:(deze|vorige|volgende)\\s*(?:week\\s*)?)?" +
    `(${matchAnyPattern(WEEKDAY_DICTIONARY$7)})` +
    "(?=\\W|$)", "i");
const PREFIX_GROUP$7 = 1;
const WEEKDAY_GROUP$7 = 2;
const POSTFIX_GROUP$4 = 3;
class NLWeekdayParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$N;
    }
    innerExtract(context, match) {
        const dayOfWeek = match[WEEKDAY_GROUP$7].toLowerCase();
        const weekday = WEEKDAY_DICTIONARY$7[dayOfWeek];
        const prefix = match[PREFIX_GROUP$7];
        const postfix = match[POSTFIX_GROUP$4];
        let modifierWord = prefix || postfix;
        modifierWord = modifierWord || "";
        modifierWord = modifierWord.toLowerCase();
        let modifier = null;
        if (modifierWord == "vorige") {
            modifier = "last";
        }
        else if (modifierWord == "volgende") {
            modifier = "next";
        }
        else if (modifierWord == "deze") {
            modifier = "this";
        }
        return createParsingComponentsAtWeekday(context.reference, weekday, modifier);
    }
}

const PATTERN$M = new RegExp("(?:on\\s*?)?" +
    `(${ORDINAL_NUMBER_PATTERN$3})` +
    "(?:\\s*" +
    "(?:tot|\\-|\\–|until|through|till|\\s)\\s*" +
    `(${ORDINAL_NUMBER_PATTERN$3})` +
    ")?" +
    "(?:-|/|\\s*(?:of)?\\s*)" +
    "(" +
    matchAnyPattern(MONTH_DICTIONARY$7) +
    ")" +
    "(?:" +
    "(?:-|/|,?\\s*)" +
    `(${YEAR_PATTERN$5}(?![^\\s]\\d))` +
    ")?" +
    "(?=\\W|$)", "i");
const MONTH_NAME_GROUP$d = 3;
const DATE_GROUP$a = 1;
const DATE_TO_GROUP$7 = 2;
const YEAR_GROUP$h = 4;
class NLMonthNameMiddleEndianParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$M;
    }
    innerExtract(context, match) {
        const month = MONTH_DICTIONARY$7[match[MONTH_NAME_GROUP$d].toLowerCase()];
        const day = parseOrdinalNumberPattern$3(match[DATE_GROUP$a]);
        if (day > 31) {
            match.index = match.index + match[DATE_GROUP$a].length;
            return null;
        }
        const components = context.createParsingComponents({
            day: day,
            month: month,
        });
        if (match[YEAR_GROUP$h]) {
            const year = parseYear$6(match[YEAR_GROUP$h]);
            components.assign("year", year);
        }
        else {
            const year = findYearClosestToRef(context.refDate, day, month);
            components.imply("year", year);
        }
        if (!match[DATE_TO_GROUP$7]) {
            return components;
        }
        const endDate = parseOrdinalNumberPattern$3(match[DATE_TO_GROUP$7]);
        const result = context.createParsingResult(match.index, match[0]);
        result.start = components;
        result.end = components.clone();
        result.end.assign("day", endDate);
        return result;
    }
}

const PATTERN$L = new RegExp(`(${matchAnyPattern(MONTH_DICTIONARY$7)})` +
    `\\s*` +
    `(?:` +
    `[,-]?\\s*(${YEAR_PATTERN$5})?` +
    ")?" +
    "(?=[^\\s\\w]|\\s+[^0-9]|\\s+$|$)", "i");
const MONTH_NAME_GROUP$c = 1;
const YEAR_GROUP$g = 2;
class NLMonthNameParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$L;
    }
    innerExtract(context, match) {
        const components = context.createParsingComponents();
        components.imply("day", 1);
        const monthName = match[MONTH_NAME_GROUP$c];
        const month = MONTH_DICTIONARY$7[monthName.toLowerCase()];
        components.assign("month", month);
        if (match[YEAR_GROUP$g]) {
            const year = parseYear$6(match[YEAR_GROUP$g]);
            components.assign("year", year);
        }
        else {
            const year = findYearClosestToRef(context.refDate, 1, month);
            components.imply("year", year);
        }
        return components;
    }
}

const PATTERN$K = new RegExp("([0-9]|0[1-9]|1[012])/([0-9]{4})" + "", "i");
const MONTH_GROUP$5 = 1;
const YEAR_GROUP$f = 2;
class NLSlashMonthFormatParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$K;
    }
    innerExtract(context, match) {
        const year = parseInt(match[YEAR_GROUP$f]);
        const month = parseInt(match[MONTH_GROUP$5]);
        return context.createParsingComponents().imply("day", 1).assign("month", month).assign("year", year);
    }
}

class NLTimeExpressionParser extends AbstractTimeExpressionParser {
    primaryPrefix() {
        return "(?:(?:om)\\s*)?";
    }
    followingPhase() {
        return "\\s*(?:\\-|\\–|\\~|\\〜|om|\\?)\\s*";
    }
    primarySuffix() {
        return "(?:\\s*(?:uur))?(?!/)(?=\\W|$)";
    }
    extractPrimaryTimeComponents(context, match) {
        if (match[0].match(/^\s*\d{4}\s*$/)) {
            return null;
        }
        return super.extractPrimaryTimeComponents(context, match);
    }
}

const PATTERN$J = new RegExp(`([0-9]{4})[\\.\\/\\s]` +
    `(?:(${matchAnyPattern(MONTH_DICTIONARY$7)})|([0-9]{1,2}))[\\.\\/\\s]` +
    `([0-9]{1,2})` +
    "(?=\\W|$)", "i");
const YEAR_NUMBER_GROUP$1 = 1;
const MONTH_NAME_GROUP$b = 2;
const MONTH_NUMBER_GROUP$1 = 3;
const DATE_NUMBER_GROUP$1 = 4;
class NLCasualYearMonthDayParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$J;
    }
    innerExtract(context, match) {
        const month = match[MONTH_NUMBER_GROUP$1]
            ? parseInt(match[MONTH_NUMBER_GROUP$1])
            : MONTH_DICTIONARY$7[match[MONTH_NAME_GROUP$b].toLowerCase()];
        if (month < 1 || month > 12) {
            return null;
        }
        const year = parseInt(match[YEAR_NUMBER_GROUP$1]);
        const day = parseInt(match[DATE_NUMBER_GROUP$1]);
        return {
            day: day,
            month: month,
            year: year,
        };
    }
}

const DATE_GROUP$9 = 1;
const TIME_OF_DAY_GROUP = 2;
class NLCasualDateTimeParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return /(gisteren|morgen|van)(ochtend|middag|namiddag|avond|nacht)(?=\W|$)/i;
    }
    innerExtract(context, match) {
        const dateText = match[DATE_GROUP$9].toLowerCase();
        const timeText = match[TIME_OF_DAY_GROUP].toLowerCase();
        const component = context.createParsingComponents();
        const targetDate = context.refDate;
        switch (dateText) {
            case "gisteren":
                const previousDay = new Date(targetDate.getTime());
                previousDay.setDate(previousDay.getDate() - 1);
                assignSimilarDate(component, previousDay);
                break;
            case "van":
                assignSimilarDate(component, targetDate);
                break;
            case "morgen":
                const nextDay = new Date(targetDate.getTime());
                nextDay.setDate(nextDay.getDate() + 1);
                assignSimilarDate(component, nextDay);
                implySimilarTime(component, nextDay);
                break;
        }
        switch (timeText) {
            case "ochtend":
                component.imply("meridiem", Meridiem.AM);
                component.imply("hour", 6);
                break;
            case "middag":
                component.imply("meridiem", Meridiem.AM);
                component.imply("hour", 12);
                break;
            case "namiddag":
                component.imply("meridiem", Meridiem.PM);
                component.imply("hour", 15);
                break;
            case "avond":
                component.imply("meridiem", Meridiem.PM);
                component.imply("hour", 20);
                break;
        }
        return component;
    }
}

const PATTERN$I = new RegExp(`(dit|deze|vorig|afgelopen|(?:aan)?komend|over|\\+|-)e?\\s*(${TIME_UNITS_PATTERN$7})(?=\\W|$)`, "i");
const PREFIX_WORD_GROUP = 1;
const TIME_UNIT_WORD_GROUP = 2;
class NLTimeUnitCasualRelativeFormatParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$I;
    }
    innerExtract(context, match) {
        const prefix = match[PREFIX_WORD_GROUP].toLowerCase();
        let timeUnits = parseDuration$7(match[TIME_UNIT_WORD_GROUP]);
        switch (prefix) {
            case "vorig":
            case "afgelopen":
            case "-":
                timeUnits = reverseDuration(timeUnits);
                break;
        }
        return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
    }
}

const PATTERN$H = new RegExp(`(dit|deze|(?:aan)?komend|volgend|afgelopen|vorig)e?\\s*(${matchAnyPattern(TIME_UNIT_DICTIONARY$7)})(?=\\s*)` +
    "(?=\\W|$)", "i");
const MODIFIER_WORD_GROUP$3 = 1;
const RELATIVE_WORD_GROUP$3 = 2;
class NLRelativeDateFormatParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$H;
    }
    innerExtract(context, match) {
        const modifier = match[MODIFIER_WORD_GROUP$3].toLowerCase();
        const unitWord = match[RELATIVE_WORD_GROUP$3].toLowerCase();
        const timeunit = TIME_UNIT_DICTIONARY$7[unitWord];
        if (modifier == "volgend" || modifier == "komend" || modifier == "aankomend") {
            const timeUnits = {};
            timeUnits[timeunit] = 1;
            return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
        }
        if (modifier == "afgelopen" || modifier == "vorig") {
            const timeUnits = {};
            timeUnits[timeunit] = -1;
            return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
        }
        const components = context.createParsingComponents();
        let date = new Date(context.reference.instant.getTime());
        if (unitWord.match(/week/i)) {
            date.setDate(date.getDate() - date.getDay());
            components.imply("day", date.getDate());
            components.imply("month", date.getMonth() + 1);
            components.imply("year", date.getFullYear());
        }
        else if (unitWord.match(/maand/i)) {
            date.setDate(1);
            components.imply("day", date.getDate());
            components.assign("year", date.getFullYear());
            components.assign("month", date.getMonth() + 1);
        }
        else if (unitWord.match(/jaar/i)) {
            date.setDate(1);
            date.setMonth(0);
            components.imply("day", date.getDate());
            components.imply("month", date.getMonth() + 1);
            components.assign("year", date.getFullYear());
        }
        return components;
    }
}

const PATTERN$G = new RegExp("" + "(" + TIME_UNITS_PATTERN$7 + ")" + "(?:geleden|voor|eerder)(?=(?:\\W|$))", "i");
const STRICT_PATTERN$3 = new RegExp("" + "(" + TIME_UNITS_PATTERN$7 + ")" + "geleden(?=(?:\\W|$))", "i");
class NLTimeUnitAgoFormatParser extends AbstractParserWithWordBoundaryChecking {
    strictMode;
    constructor(strictMode) {
        super();
        this.strictMode = strictMode;
    }
    innerPattern() {
        return this.strictMode ? STRICT_PATTERN$3 : PATTERN$G;
    }
    innerExtract(context, match) {
        const timeUnits = parseDuration$7(match[1]);
        const outputTimeUnits = reverseDuration(timeUnits);
        return ParsingComponents.createRelativeFromReference(context.reference, outputTimeUnits);
    }
}

const PATTERN$F = new RegExp("" + "(" + TIME_UNITS_PATTERN$7 + ")" + "(later|na|vanaf nu|voortaan|vooruit|uit)" + "(?=(?:\\W|$))", "i");
const STRICT_PATTERN$2 = new RegExp("" + "(" + TIME_UNITS_PATTERN$7 + ")" + "(later|vanaf nu)" + "(?=(?:\\W|$))", "i");
const GROUP_NUM_TIMEUNITS$1 = 1;
class NLTimeUnitLaterFormatParser extends AbstractParserWithWordBoundaryChecking {
    strictMode;
    constructor(strictMode) {
        super();
        this.strictMode = strictMode;
    }
    innerPattern() {
        return this.strictMode ? STRICT_PATTERN$2 : PATTERN$F;
    }
    innerExtract(context, match) {
        const fragments = parseDuration$7(match[GROUP_NUM_TIMEUNITS$1]);
        return ParsingComponents.createRelativeFromReference(context.reference, fragments);
    }
}

const casual$b = new Chrono(createCasualConfiguration$a());
const strict$b = new Chrono(createConfiguration$a(true));
function parse$b(text, ref, option) {
    return casual$b.parse(text, ref, option);
}
function parseDate$b(text, ref, option) {
    return casual$b.parseDate(text, ref, option);
}
function createCasualConfiguration$a(littleEndian = true) {
    const option = createConfiguration$a(false, littleEndian);
    option.parsers.unshift(new NLCasualDateParser());
    option.parsers.unshift(new NLCasualTimeParser());
    option.parsers.unshift(new NLCasualDateTimeParser());
    option.parsers.unshift(new NLMonthNameParser());
    option.parsers.unshift(new NLRelativeDateFormatParser());
    option.parsers.unshift(new NLTimeUnitCasualRelativeFormatParser());
    return option;
}
function createConfiguration$a(strictMode = true, littleEndian = true) {
    return includeCommonConfiguration({
        parsers: [
            new SlashDateFormatParser(littleEndian),
            new NLTimeUnitWithinFormatParser(),
            new NLMonthNameMiddleEndianParser(),
            new NLMonthNameParser(),
            new NLWeekdayParser(),
            new NLCasualYearMonthDayParser(),
            new NLSlashMonthFormatParser(),
            new NLTimeExpressionParser(strictMode),
            new NLTimeUnitAgoFormatParser(strictMode),
            new NLTimeUnitLaterFormatParser(strictMode),
        ],
        refiners: [new NLMergeDateTimeRefiner(), new NLMergeDateRangeRefiner()],
    }, strictMode);
}

var index$a = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Chrono: Chrono,
	ParsingResult: ParsingResult,
	ParsingComponents: ParsingComponents,
	ReferenceWithTimezone: ReferenceWithTimezone,
	get Meridiem () { return Meridiem; },
	get Weekday () { return Weekday; },
	casual: casual$b,
	strict: strict$b,
	parse: parse$b,
	parseDate: parseDate$b,
	createCasualConfiguration: createCasualConfiguration$a,
	createConfiguration: createConfiguration$a
});

const NUMBER$1 = {
    "零": 0,
    "〇": 0,
    "一": 1,
    "二": 2,
    "两": 2,
    "三": 3,
    "四": 4,
    "五": 5,
    "六": 6,
    "七": 7,
    "八": 8,
    "九": 9,
    "十": 10,
};
const WEEKDAY_OFFSET$1 = {
    "天": 0,
    "日": 0,
    "一": 1,
    "二": 2,
    "三": 3,
    "四": 4,
    "五": 5,
    "六": 6,
};
function zhStringToNumber$1(text) {
    let number = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === "十") {
            number = number === 0 ? NUMBER$1[char] : number * NUMBER$1[char];
        }
        else {
            number += NUMBER$1[char];
        }
    }
    return number;
}
function zhStringToYear$1(text) {
    let string = "";
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        string = string + NUMBER$1[char];
    }
    return parseInt(string);
}

const YEAR_GROUP$e = 1;
const MONTH_GROUP$4 = 2;
const DAY_GROUP$2 = 3;
class ZHHansDateParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return new RegExp("(" +
            "\\d{2,4}|" +
            "[" +
            Object.keys(NUMBER$1).join("") +
            "]{4}|" +
            "[" +
            Object.keys(NUMBER$1).join("") +
            "]{2}" +
            ")?" +
            "(?:\\s*)" +
            "(?:年)?" +
            "(?:[\\s|,|，]*)" +
            "(" +
            "\\d{1,2}|" +
            "[" +
            Object.keys(NUMBER$1).join("") +
            "]{1,3}" +
            ")" +
            "(?:\\s*)" +
            "(?:月)" +
            "(?:\\s*)" +
            "(" +
            "\\d{1,2}|" +
            "[" +
            Object.keys(NUMBER$1).join("") +
            "]{1,3}" +
            ")?" +
            "(?:\\s*)" +
            "(?:日|号)?");
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        let month = parseInt(match[MONTH_GROUP$4]);
        if (isNaN(month))
            month = zhStringToNumber$1(match[MONTH_GROUP$4]);
        result.start.assign("month", month);
        if (match[DAY_GROUP$2]) {
            let day = parseInt(match[DAY_GROUP$2]);
            if (isNaN(day))
                day = zhStringToNumber$1(match[DAY_GROUP$2]);
            result.start.assign("day", day);
        }
        else {
            result.start.imply("day", context.refDate.getDate());
        }
        if (match[YEAR_GROUP$e]) {
            let year = parseInt(match[YEAR_GROUP$e]);
            if (isNaN(year))
                year = zhStringToYear$1(match[YEAR_GROUP$e]);
            result.start.assign("year", year);
        }
        else {
            result.start.imply("year", context.refDate.getFullYear());
        }
        return result;
    }
}

const PATTERN$E = new RegExp("(\\d+|[" +
    Object.keys(NUMBER$1).join("") +
    "]+|半|几)(?:\\s*)" +
    "(?:个)?" +
    "(秒(?:钟)?|分钟|小时|钟|日|天|星期|礼拜|月|年)" +
    "(?:(?:之|过)?后|(?:之)?内)", "i");
const NUMBER_GROUP$1 = 1;
const UNIT_GROUP$1 = 2;
class ZHHansDeadlineFormatParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$E;
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        let number = parseInt(match[NUMBER_GROUP$1]);
        if (isNaN(number)) {
            number = zhStringToNumber$1(match[NUMBER_GROUP$1]);
        }
        if (isNaN(number)) {
            const string = match[NUMBER_GROUP$1];
            if (string === "几") {
                number = 3;
            }
            else if (string === "半") {
                number = 0.5;
            }
            else {
                return null;
            }
        }
        const duration = {};
        const unit = match[UNIT_GROUP$1];
        const unitAbbr = unit[0];
        if (unitAbbr.match(/[日天星礼月年]/)) {
            if (unitAbbr == "日" || unitAbbr == "天") {
                duration.day = number;
            }
            else if (unitAbbr == "星" || unitAbbr == "礼") {
                duration.week = number;
            }
            else if (unitAbbr == "月") {
                duration.month = number;
            }
            else if (unitAbbr == "年") {
                duration.year = number;
            }
            const date = addDuration(context.refDate, duration);
            result.start.assign("year", date.getFullYear());
            result.start.assign("month", date.getMonth() + 1);
            result.start.assign("day", date.getDate());
            return result;
        }
        if (unitAbbr == "秒") {
            duration.second = number;
        }
        else if (unitAbbr == "分") {
            duration.minute = number;
        }
        else if (unitAbbr == "小" || unitAbbr == "钟") {
            duration.hour = number;
        }
        const date = addDuration(context.refDate, duration);
        result.start.imply("year", date.getFullYear());
        result.start.imply("month", date.getMonth() + 1);
        result.start.imply("day", date.getDate());
        result.start.assign("hour", date.getHours());
        result.start.assign("minute", date.getMinutes());
        result.start.assign("second", date.getSeconds());
        return result;
    }
}

const PATTERN$D = new RegExp("(?<prefix>上|下|这)(?:个)?(?:星期|礼拜|周)(?<weekday>" + Object.keys(WEEKDAY_OFFSET$1).join("|") + ")");
class ZHHansRelationWeekdayParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$D;
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        const dayOfWeek = match.groups.weekday;
        const offset = WEEKDAY_OFFSET$1[dayOfWeek];
        if (offset === undefined)
            return null;
        let modifier = null;
        const prefix = match.groups.prefix;
        if (prefix == "上") {
            modifier = "last";
        }
        else if (prefix == "下") {
            modifier = "next";
        }
        else if (prefix == "这") {
            modifier = "this";
        }
        const date = new Date(context.refDate.getTime());
        let startMomentFixed = false;
        const refOffset = date.getDay();
        if (modifier == "last" || modifier == "past") {
            date.setDate(date.getDate() + (offset - 7 - refOffset));
            startMomentFixed = true;
        }
        else if (modifier == "next") {
            date.setDate(date.getDate() + (offset + 7 - refOffset));
            startMomentFixed = true;
        }
        else if (modifier == "this") {
            date.setDate(date.getDate() + (offset - refOffset));
        }
        else {
            let diff = offset - refOffset;
            if (Math.abs(diff - 7) < Math.abs(diff)) {
                diff -= 7;
            }
            if (Math.abs(diff + 7) < Math.abs(diff)) {
                diff += 7;
            }
            date.setDate(date.getDate() + diff);
        }
        result.start.assign("weekday", offset);
        if (startMomentFixed) {
            result.start.assign("day", date.getDate());
            result.start.assign("month", date.getMonth() + 1);
            result.start.assign("year", date.getFullYear());
        }
        else {
            result.start.imply("day", date.getDate());
            result.start.imply("month", date.getMonth() + 1);
            result.start.imply("year", date.getFullYear());
        }
        return result;
    }
}

const FIRST_REG_PATTERN$1 = new RegExp("(?:从|自)?" +
    "(?:" +
    "(今|明|前|大前|后|大后|昨)(早|朝|晚)|" +
    "(上(?:午)|早(?:上)|下(?:午)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨))|" +
    "(今|明|前|大前|后|大后|昨)(?:日|天)" +
    "(?:[\\s,，]*)" +
    "(?:(上(?:午)|早(?:上)|下(?:午)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨)))?" +
    ")?" +
    "(?:[\\s,，]*)" +
    "(?:(\\d+|[" +
    Object.keys(NUMBER$1).join("") +
    "]+)(?:\\s*)(?:点|时|:|：)" +
    "(?:\\s*)" +
    "(\\d+|半|正|整|[" +
    Object.keys(NUMBER$1).join("") +
    "]+)?(?:\\s*)(?:分|:|：)?" +
    "(?:\\s*)" +
    "(\\d+|[" +
    Object.keys(NUMBER$1).join("") +
    "]+)?(?:\\s*)(?:秒)?)" +
    "(?:\\s*(A.M.|P.M.|AM?|PM?))?", "i");
const SECOND_REG_PATTERN$1 = new RegExp("(?:^\\s*(?:到|至|\\-|\\–|\\~|\\〜)\\s*)" +
    "(?:" +
    "(今|明|前|大前|后|大后|昨)(早|朝|晚)|" +
    "(上(?:午)|早(?:上)|下(?:午)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨))|" +
    "(今|明|前|大前|后|大后|昨)(?:日|天)" +
    "(?:[\\s,，]*)" +
    "(?:(上(?:午)|早(?:上)|下(?:午)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨)))?" +
    ")?" +
    "(?:[\\s,，]*)" +
    "(?:(\\d+|[" +
    Object.keys(NUMBER$1).join("") +
    "]+)(?:\\s*)(?:点|时|:|：)" +
    "(?:\\s*)" +
    "(\\d+|半|正|整|[" +
    Object.keys(NUMBER$1).join("") +
    "]+)?(?:\\s*)(?:分|:|：)?" +
    "(?:\\s*)" +
    "(\\d+|[" +
    Object.keys(NUMBER$1).join("") +
    "]+)?(?:\\s*)(?:秒)?)" +
    "(?:\\s*(A.M.|P.M.|AM?|PM?))?", "i");
const DAY_GROUP_1$3 = 1;
const ZH_AM_PM_HOUR_GROUP_1$1 = 2;
const ZH_AM_PM_HOUR_GROUP_2$1 = 3;
const DAY_GROUP_3$3 = 4;
const ZH_AM_PM_HOUR_GROUP_3$1 = 5;
const HOUR_GROUP$2 = 6;
const MINUTE_GROUP$1 = 7;
const SECOND_GROUP$1 = 8;
const AM_PM_HOUR_GROUP$1 = 9;
class ZHHansTimeExpressionParser extends AbstractParserWithWordBoundaryChecking {
    patternLeftBoundary() {
        return "()";
    }
    innerPattern() {
        return FIRST_REG_PATTERN$1;
    }
    innerExtract(context, match) {
        if (match.index > 0 && context.text[match.index - 1].match(/\w/)) {
            return null;
        }
        const result = context.createParsingResult(match.index, match[0]);
        const startMoment = new Date(context.reference.instant.getTime());
        if (match[DAY_GROUP_1$3]) {
            const day1 = match[DAY_GROUP_1$3];
            if (day1 == "明") {
                if (context.reference.instant.getHours() > 1) {
                    startMoment.setDate(startMoment.getDate() + 1);
                }
            }
            else if (day1 == "昨") {
                startMoment.setDate(startMoment.getDate() - 1);
            }
            else if (day1 == "前") {
                startMoment.setDate(startMoment.getDate() - 2);
            }
            else if (day1 == "大前") {
                startMoment.setDate(startMoment.getDate() - 3);
            }
            else if (day1 == "后") {
                startMoment.setDate(startMoment.getDate() + 2);
            }
            else if (day1 == "大后") {
                startMoment.setDate(startMoment.getDate() + 3);
            }
            result.start.assign("day", startMoment.getDate());
            result.start.assign("month", startMoment.getMonth() + 1);
            result.start.assign("year", startMoment.getFullYear());
        }
        else if (match[DAY_GROUP_3$3]) {
            const day3 = match[DAY_GROUP_3$3];
            if (day3 == "明") {
                startMoment.setDate(startMoment.getDate() + 1);
            }
            else if (day3 == "昨") {
                startMoment.setDate(startMoment.getDate() - 1);
            }
            else if (day3 == "前") {
                startMoment.setDate(startMoment.getDate() - 2);
            }
            else if (day3 == "大前") {
                startMoment.setDate(startMoment.getDate() - 3);
            }
            else if (day3 == "后") {
                startMoment.setDate(startMoment.getDate() + 2);
            }
            else if (day3 == "大后") {
                startMoment.setDate(startMoment.getDate() + 3);
            }
            result.start.assign("day", startMoment.getDate());
            result.start.assign("month", startMoment.getMonth() + 1);
            result.start.assign("year", startMoment.getFullYear());
        }
        else {
            result.start.imply("day", startMoment.getDate());
            result.start.imply("month", startMoment.getMonth() + 1);
            result.start.imply("year", startMoment.getFullYear());
        }
        let hour = 0;
        let minute = 0;
        let meridiem = -1;
        if (match[SECOND_GROUP$1]) {
            let second = parseInt(match[SECOND_GROUP$1]);
            if (isNaN(second)) {
                second = zhStringToNumber$1(match[SECOND_GROUP$1]);
            }
            if (second >= 60)
                return null;
            result.start.assign("second", second);
        }
        hour = parseInt(match[HOUR_GROUP$2]);
        if (isNaN(hour)) {
            hour = zhStringToNumber$1(match[HOUR_GROUP$2]);
        }
        if (match[MINUTE_GROUP$1]) {
            if (match[MINUTE_GROUP$1] == "半") {
                minute = 30;
            }
            else if (match[MINUTE_GROUP$1] == "正" || match[MINUTE_GROUP$1] == "整") {
                minute = 0;
            }
            else {
                minute = parseInt(match[MINUTE_GROUP$1]);
                if (isNaN(minute)) {
                    minute = zhStringToNumber$1(match[MINUTE_GROUP$1]);
                }
            }
        }
        else if (hour > 100) {
            minute = hour % 100;
            hour = Math.floor(hour / 100);
        }
        if (minute >= 60) {
            return null;
        }
        if (hour > 24) {
            return null;
        }
        if (hour >= 12) {
            meridiem = 1;
        }
        if (match[AM_PM_HOUR_GROUP$1]) {
            if (hour > 12)
                return null;
            const ampm = match[AM_PM_HOUR_GROUP$1][0].toLowerCase();
            if (ampm == "a") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            if (ampm == "p") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        else if (match[ZH_AM_PM_HOUR_GROUP_1$1]) {
            const zhAMPMString1 = match[ZH_AM_PM_HOUR_GROUP_1$1];
            const zhAMPM1 = zhAMPMString1[0];
            if (zhAMPM1 == "早") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            else if (zhAMPM1 == "晚") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        else if (match[ZH_AM_PM_HOUR_GROUP_2$1]) {
            const zhAMPMString2 = match[ZH_AM_PM_HOUR_GROUP_2$1];
            const zhAMPM2 = zhAMPMString2[0];
            if (zhAMPM2 == "上" || zhAMPM2 == "早" || zhAMPM2 == "凌") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            else if (zhAMPM2 == "下" || zhAMPM2 == "晚") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        else if (match[ZH_AM_PM_HOUR_GROUP_3$1]) {
            const zhAMPMString3 = match[ZH_AM_PM_HOUR_GROUP_3$1];
            const zhAMPM3 = zhAMPMString3[0];
            if (zhAMPM3 == "上" || zhAMPM3 == "早" || zhAMPM3 == "凌") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            else if (zhAMPM3 == "下" || zhAMPM3 == "晚") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        result.start.assign("hour", hour);
        result.start.assign("minute", minute);
        if (meridiem >= 0) {
            result.start.assign("meridiem", meridiem);
        }
        else {
            if (hour < 12) {
                result.start.imply("meridiem", 0);
            }
            else {
                result.start.imply("meridiem", 1);
            }
        }
        const secondMatch = SECOND_REG_PATTERN$1.exec(context.text.substring(result.index + result.text.length));
        if (!secondMatch) {
            if (result.text.match(/^\d+$/)) {
                return null;
            }
            return result;
        }
        let endMoment = new Date(startMoment.getTime());
        if (secondMatch[DAY_GROUP_1$3] || secondMatch[DAY_GROUP_3$3]) {
            endMoment = new Date(context.reference.instant.getTime());
        }
        result.end = context.createParsingComponents();
        if (secondMatch[DAY_GROUP_1$3]) {
            const day1 = secondMatch[DAY_GROUP_1$3];
            if (day1 == "明") {
                if (context.reference.instant.getHours() > 1) {
                    endMoment.setDate(endMoment.getDate() + 1);
                }
            }
            else if (day1 == "昨") {
                endMoment.setDate(endMoment.getDate() - 1);
            }
            else if (day1 == "前") {
                endMoment.setDate(endMoment.getDate() - 2);
            }
            else if (day1 == "大前") {
                endMoment.setDate(endMoment.getDate() - 3);
            }
            else if (day1 == "后") {
                endMoment.setDate(endMoment.getDate() + 2);
            }
            else if (day1 == "大后") {
                endMoment.setDate(endMoment.getDate() + 3);
            }
            result.end.assign("day", endMoment.getDate());
            result.end.assign("month", endMoment.getMonth() + 1);
            result.end.assign("year", endMoment.getFullYear());
        }
        else if (secondMatch[DAY_GROUP_3$3]) {
            const day3 = secondMatch[DAY_GROUP_3$3];
            if (day3 == "明") {
                endMoment.setDate(endMoment.getDate() + 1);
            }
            else if (day3 == "昨") {
                endMoment.setDate(endMoment.getDate() - 1);
            }
            else if (day3 == "前") {
                endMoment.setDate(endMoment.getDate() - 2);
            }
            else if (day3 == "大前") {
                endMoment.setDate(endMoment.getDate() - 3);
            }
            else if (day3 == "后") {
                endMoment.setDate(endMoment.getDate() + 2);
            }
            else if (day3 == "大后") {
                endMoment.setDate(endMoment.getDate() + 3);
            }
            result.end.assign("day", endMoment.getDate());
            result.end.assign("month", endMoment.getMonth() + 1);
            result.end.assign("year", endMoment.getFullYear());
        }
        else {
            result.end.imply("day", endMoment.getDate());
            result.end.imply("month", endMoment.getMonth() + 1);
            result.end.imply("year", endMoment.getFullYear());
        }
        hour = 0;
        minute = 0;
        meridiem = -1;
        if (secondMatch[SECOND_GROUP$1]) {
            let second = parseInt(secondMatch[SECOND_GROUP$1]);
            if (isNaN(second)) {
                second = zhStringToNumber$1(secondMatch[SECOND_GROUP$1]);
            }
            if (second >= 60)
                return null;
            result.end.assign("second", second);
        }
        hour = parseInt(secondMatch[HOUR_GROUP$2]);
        if (isNaN(hour)) {
            hour = zhStringToNumber$1(secondMatch[HOUR_GROUP$2]);
        }
        if (secondMatch[MINUTE_GROUP$1]) {
            if (secondMatch[MINUTE_GROUP$1] == "半") {
                minute = 30;
            }
            else if (secondMatch[MINUTE_GROUP$1] == "正" || secondMatch[MINUTE_GROUP$1] == "整") {
                minute = 0;
            }
            else {
                minute = parseInt(secondMatch[MINUTE_GROUP$1]);
                if (isNaN(minute)) {
                    minute = zhStringToNumber$1(secondMatch[MINUTE_GROUP$1]);
                }
            }
        }
        else if (hour > 100) {
            minute = hour % 100;
            hour = Math.floor(hour / 100);
        }
        if (minute >= 60) {
            return null;
        }
        if (hour > 24) {
            return null;
        }
        if (hour >= 12) {
            meridiem = 1;
        }
        if (secondMatch[AM_PM_HOUR_GROUP$1]) {
            if (hour > 12)
                return null;
            const ampm = secondMatch[AM_PM_HOUR_GROUP$1][0].toLowerCase();
            if (ampm == "a") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            if (ampm == "p") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
            if (!result.start.isCertain("meridiem")) {
                if (meridiem == 0) {
                    result.start.imply("meridiem", 0);
                    if (result.start.get("hour") == 12) {
                        result.start.assign("hour", 0);
                    }
                }
                else {
                    result.start.imply("meridiem", 1);
                    if (result.start.get("hour") != 12) {
                        result.start.assign("hour", result.start.get("hour") + 12);
                    }
                }
            }
        }
        else if (secondMatch[ZH_AM_PM_HOUR_GROUP_1$1]) {
            const zhAMPMString1 = secondMatch[ZH_AM_PM_HOUR_GROUP_1$1];
            const zhAMPM1 = zhAMPMString1[0];
            if (zhAMPM1 == "早") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            else if (zhAMPM1 == "晚") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        else if (secondMatch[ZH_AM_PM_HOUR_GROUP_2$1]) {
            const zhAMPMString2 = secondMatch[ZH_AM_PM_HOUR_GROUP_2$1];
            const zhAMPM2 = zhAMPMString2[0];
            if (zhAMPM2 == "上" || zhAMPM2 == "早" || zhAMPM2 == "凌") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            else if (zhAMPM2 == "下" || zhAMPM2 == "晚") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        else if (secondMatch[ZH_AM_PM_HOUR_GROUP_3$1]) {
            const zhAMPMString3 = secondMatch[ZH_AM_PM_HOUR_GROUP_3$1];
            const zhAMPM3 = zhAMPMString3[0];
            if (zhAMPM3 == "上" || zhAMPM3 == "早" || zhAMPM3 == "凌") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            else if (zhAMPM3 == "下" || zhAMPM3 == "晚") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        result.text = result.text + secondMatch[0];
        result.end.assign("hour", hour);
        result.end.assign("minute", minute);
        if (meridiem >= 0) {
            result.end.assign("meridiem", meridiem);
        }
        else {
            const startAtPM = result.start.isCertain("meridiem") && result.start.get("meridiem") == 1;
            if (startAtPM && result.start.get("hour") > hour) {
                result.end.imply("meridiem", 0);
            }
            else if (hour > 12) {
                result.end.imply("meridiem", 1);
            }
        }
        if (result.end.date().getTime() < result.start.date().getTime()) {
            result.end.imply("day", result.end.get("day") + 1);
        }
        return result;
    }
}

const PATTERN$C = new RegExp("(?:星期|礼拜|周)(?<weekday>" + Object.keys(WEEKDAY_OFFSET$1).join("|") + ")");
class ZHHansWeekdayParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$C;
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        const dayOfWeek = match.groups.weekday;
        const offset = WEEKDAY_OFFSET$1[dayOfWeek];
        if (offset === undefined)
            return null;
        const date = new Date(context.refDate.getTime());
        const refOffset = date.getDay();
        let diff = offset - refOffset;
        if (Math.abs(diff - 7) < Math.abs(diff)) {
            diff -= 7;
        }
        if (Math.abs(diff + 7) < Math.abs(diff)) {
            diff += 7;
        }
        date.setDate(date.getDate() + diff);
        result.start.assign("weekday", offset);
        {
            result.start.imply("day", date.getDate());
            result.start.imply("month", date.getMonth() + 1);
            result.start.imply("year", date.getFullYear());
        }
        return result;
    }
}

const NOW_GROUP$1 = 1;
const DAY_GROUP_1$2 = 2;
const TIME_GROUP_1$1 = 3;
const TIME_GROUP_2$1 = 4;
const DAY_GROUP_3$2 = 5;
const TIME_GROUP_3$1 = 6;
class ZHHantCasualDateParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return new RegExp("(而家|立(?:刻|即)|即刻)|" +
            "(今|明|前|大前|後|大後|聽|昨|尋|琴)(早|朝|晚)|" +
            "(上(?:午|晝)|朝(?:早)|早(?:上)|下(?:午|晝)|晏(?:晝)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨))|" +
            "(今|明|前|大前|後|大後|聽|昨|尋|琴)(?:日|天)" +
            "(?:[\\s|,|，]*)" +
            "(?:(上(?:午|晝)|朝(?:早)|早(?:上)|下(?:午|晝)|晏(?:晝)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨)))?", "i");
    }
    innerExtract(context, match) {
        const index = match.index;
        const result = context.createParsingResult(index, match[0]);
        const refDate = context.refDate;
        let date = new Date(refDate.getTime());
        if (match[NOW_GROUP$1]) {
            result.start.imply("hour", refDate.getHours());
            result.start.imply("minute", refDate.getMinutes());
            result.start.imply("second", refDate.getSeconds());
            result.start.imply("millisecond", refDate.getMilliseconds());
        }
        else if (match[DAY_GROUP_1$2]) {
            const day1 = match[DAY_GROUP_1$2];
            const time1 = match[TIME_GROUP_1$1];
            if (day1 == "明" || day1 == "聽") {
                if (refDate.getHours() > 1) {
                    date.setDate(date.getDate() + 1);
                }
            }
            else if (day1 == "昨" || day1 == "尋" || day1 == "琴") {
                date.setDate(date.getDate() - 1);
            }
            else if (day1 == "前") {
                date.setDate(date.getDate() - 2);
            }
            else if (day1 == "大前") {
                date.setDate(date.getDate() - 3);
            }
            else if (day1 == "後") {
                date.setDate(date.getDate() + 2);
            }
            else if (day1 == "大後") {
                date.setDate(date.getDate() + 3);
            }
            if (time1 == "早" || time1 == "朝") {
                result.start.imply("hour", 6);
            }
            else if (time1 == "晚") {
                result.start.imply("hour", 22);
                result.start.imply("meridiem", 1);
            }
        }
        else if (match[TIME_GROUP_2$1]) {
            const timeString2 = match[TIME_GROUP_2$1];
            const time2 = timeString2[0];
            if (time2 == "早" || time2 == "朝" || time2 == "上") {
                result.start.imply("hour", 6);
            }
            else if (time2 == "下" || time2 == "晏") {
                result.start.imply("hour", 15);
                result.start.imply("meridiem", 1);
            }
            else if (time2 == "中") {
                result.start.imply("hour", 12);
                result.start.imply("meridiem", 1);
            }
            else if (time2 == "夜" || time2 == "晚") {
                result.start.imply("hour", 22);
                result.start.imply("meridiem", 1);
            }
            else if (time2 == "凌") {
                result.start.imply("hour", 0);
            }
        }
        else if (match[DAY_GROUP_3$2]) {
            const day3 = match[DAY_GROUP_3$2];
            if (day3 == "明" || day3 == "聽") {
                if (refDate.getHours() > 1) {
                    date.setDate(date.getDate() + 1);
                }
            }
            else if (day3 == "昨" || day3 == "尋" || day3 == "琴") {
                date.setDate(date.getDate() - 1);
            }
            else if (day3 == "前") {
                date.setDate(date.getDate() - 2);
            }
            else if (day3 == "大前") {
                date.setDate(date.getDate() - 3);
            }
            else if (day3 == "後") {
                date.setDate(date.getDate() + 2);
            }
            else if (day3 == "大後") {
                date.setDate(date.getDate() + 3);
            }
            const timeString3 = match[TIME_GROUP_3$1];
            if (timeString3) {
                const time3 = timeString3[0];
                if (time3 == "早" || time3 == "朝" || time3 == "上") {
                    result.start.imply("hour", 6);
                }
                else if (time3 == "下" || time3 == "晏") {
                    result.start.imply("hour", 15);
                    result.start.imply("meridiem", 1);
                }
                else if (time3 == "中") {
                    result.start.imply("hour", 12);
                    result.start.imply("meridiem", 1);
                }
                else if (time3 == "夜" || time3 == "晚") {
                    result.start.imply("hour", 22);
                    result.start.imply("meridiem", 1);
                }
                else if (time3 == "凌") {
                    result.start.imply("hour", 0);
                }
            }
        }
        result.start.assign("day", date.getDate());
        result.start.assign("month", date.getMonth() + 1);
        result.start.assign("year", date.getFullYear());
        return result;
    }
}

const NUMBER = {
    "零": 0,
    "一": 1,
    "二": 2,
    "兩": 2,
    "三": 3,
    "四": 4,
    "五": 5,
    "六": 6,
    "七": 7,
    "八": 8,
    "九": 9,
    "十": 10,
    "廿": 20,
    "卅": 30,
};
const WEEKDAY_OFFSET = {
    "天": 0,
    "日": 0,
    "一": 1,
    "二": 2,
    "三": 3,
    "四": 4,
    "五": 5,
    "六": 6,
};
function zhStringToNumber(text) {
    let number = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === "十") {
            number = number === 0 ? NUMBER[char] : number * NUMBER[char];
        }
        else {
            number += NUMBER[char];
        }
    }
    return number;
}
function zhStringToYear(text) {
    let string = "";
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        string = string + NUMBER[char];
    }
    return parseInt(string);
}

const YEAR_GROUP$d = 1;
const MONTH_GROUP$3 = 2;
const DAY_GROUP$1 = 3;
class ZHHantDateParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return new RegExp("(" +
            "\\d{2,4}|" +
            "[" + Object.keys(NUMBER).join("") + "]{4}|" +
            "[" + Object.keys(NUMBER).join("") + "]{2}" +
            ")?" +
            "(?:\\s*)" +
            "(?:年)?" +
            "(?:[\\s|,|，]*)" +
            "(" +
            "\\d{1,2}|" +
            "[" + Object.keys(NUMBER).join("") + "]{1,2}" +
            ")" +
            "(?:\\s*)" +
            "(?:月)" +
            "(?:\\s*)" +
            "(" +
            "\\d{1,2}|" +
            "[" + Object.keys(NUMBER).join("") + "]{1,2}" +
            ")?" +
            "(?:\\s*)" +
            "(?:日|號)?");
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        let month = parseInt(match[MONTH_GROUP$3]);
        if (isNaN(month))
            month = zhStringToNumber(match[MONTH_GROUP$3]);
        result.start.assign("month", month);
        if (match[DAY_GROUP$1]) {
            let day = parseInt(match[DAY_GROUP$1]);
            if (isNaN(day))
                day = zhStringToNumber(match[DAY_GROUP$1]);
            result.start.assign("day", day);
        }
        else {
            result.start.imply("day", context.refDate.getDate());
        }
        if (match[YEAR_GROUP$d]) {
            let year = parseInt(match[YEAR_GROUP$d]);
            if (isNaN(year))
                year = zhStringToYear(match[YEAR_GROUP$d]);
            result.start.assign("year", year);
        }
        else {
            result.start.imply("year", context.refDate.getFullYear());
        }
        return result;
    }
}

const PATTERN$B = new RegExp("(\\d+|[" +
    Object.keys(NUMBER).join("") +
    "]+|半|幾)(?:\\s*)" +
    "(?:個)?" +
    "(秒(?:鐘)?|分鐘|小時|鐘|日|天|星期|禮拜|月|年)" +
    "(?:(?:之|過)?後|(?:之)?內)", "i");
const NUMBER_GROUP = 1;
const UNIT_GROUP = 2;
class ZHHantDeadlineFormatParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$B;
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        let number = parseInt(match[NUMBER_GROUP]);
        if (isNaN(number)) {
            number = zhStringToNumber(match[NUMBER_GROUP]);
        }
        if (isNaN(number)) {
            const string = match[NUMBER_GROUP];
            if (string === "幾") {
                number = 3;
            }
            else if (string === "半") {
                number = 0.5;
            }
            else {
                return null;
            }
        }
        const duration = {};
        const unit = match[UNIT_GROUP];
        const unitAbbr = unit[0];
        if (unitAbbr.match(/[日天星禮月年]/)) {
            if (unitAbbr == "日" || unitAbbr == "天") {
                duration.day = number;
            }
            else if (unitAbbr == "星" || unitAbbr == "禮") {
                duration.week = number;
            }
            else if (unitAbbr == "月") {
                duration.month = number;
            }
            else if (unitAbbr == "年") {
                duration.year = number;
            }
            const date = addDuration(context.refDate, duration);
            result.start.assign("year", date.getFullYear());
            result.start.assign("month", date.getMonth() + 1);
            result.start.assign("day", date.getDate());
            return result;
        }
        if (unitAbbr == "秒") {
            duration.second = number;
        }
        else if (unitAbbr == "分") {
            duration.minute = number;
        }
        else if (unitAbbr == "小" || unitAbbr == "鐘") {
            duration.hour = number;
        }
        const date = addDuration(context.refDate, duration);
        result.start.imply("year", date.getFullYear());
        result.start.imply("month", date.getMonth() + 1);
        result.start.imply("day", date.getDate());
        result.start.assign("hour", date.getHours());
        result.start.assign("minute", date.getMinutes());
        result.start.assign("second", date.getSeconds());
        return result;
    }
}

const PATTERN$A = new RegExp("(?<prefix>上|今|下|這|呢)(?:個)?(?:星期|禮拜|週)(?<weekday>" + Object.keys(WEEKDAY_OFFSET).join("|") + ")");
class ZHHantRelationWeekdayParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$A;
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        const dayOfWeek = match.groups.weekday;
        const offset = WEEKDAY_OFFSET[dayOfWeek];
        if (offset === undefined)
            return null;
        let modifier = null;
        const prefix = match.groups.prefix;
        if (prefix == "上") {
            modifier = "last";
        }
        else if (prefix == "下") {
            modifier = "next";
        }
        else if (prefix == "今" || prefix == "這" || prefix == "呢") {
            modifier = "this";
        }
        const date = new Date(context.refDate.getTime());
        let startMomentFixed = false;
        const refOffset = date.getDay();
        if (modifier == "last" || modifier == "past") {
            date.setDate(date.getDate() + (offset - 7 - refOffset));
            startMomentFixed = true;
        }
        else if (modifier == "next") {
            date.setDate(date.getDate() + (offset + 7 - refOffset));
            startMomentFixed = true;
        }
        else if (modifier == "this") {
            date.setDate(date.getDate() + (offset - refOffset));
        }
        else {
            let diff = offset - refOffset;
            if (Math.abs(diff - 7) < Math.abs(diff)) {
                diff -= 7;
            }
            if (Math.abs(diff + 7) < Math.abs(diff)) {
                diff += 7;
            }
            date.setDate(date.getDate() + diff);
        }
        result.start.assign("weekday", offset);
        if (startMomentFixed) {
            result.start.assign("day", date.getDate());
            result.start.assign("month", date.getMonth() + 1);
            result.start.assign("year", date.getFullYear());
        }
        else {
            result.start.imply("day", date.getDate());
            result.start.imply("month", date.getMonth() + 1);
            result.start.imply("year", date.getFullYear());
        }
        return result;
    }
}

const FIRST_REG_PATTERN = new RegExp("(?:由|從|自)?" +
    "(?:" +
    "(今|明|前|大前|後|大後|聽|昨|尋|琴)(早|朝|晚)|" +
    "(上(?:午|晝)|朝(?:早)|早(?:上)|下(?:午|晝)|晏(?:晝)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨))|" +
    "(今|明|前|大前|後|大後|聽|昨|尋|琴)(?:日|天)" +
    "(?:[\\s,，]*)" +
    "(?:(上(?:午|晝)|朝(?:早)|早(?:上)|下(?:午|晝)|晏(?:晝)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨)))?" +
    ")?" +
    "(?:[\\s,，]*)" +
    "(?:(\\d+|[" +
    Object.keys(NUMBER).join("") +
    "]+)(?:\\s*)(?:點|時|:|：)" +
    "(?:\\s*)" +
    "(\\d+|半|正|整|[" +
    Object.keys(NUMBER).join("") +
    "]+)?(?:\\s*)(?:分|:|：)?" +
    "(?:\\s*)" +
    "(\\d+|[" +
    Object.keys(NUMBER).join("") +
    "]+)?(?:\\s*)(?:秒)?)" +
    "(?:\\s*(A.M.|P.M.|AM?|PM?))?", "i");
const SECOND_REG_PATTERN = new RegExp("(?:^\\s*(?:到|至|\\-|\\–|\\~|\\〜)\\s*)" +
    "(?:" +
    "(今|明|前|大前|後|大後|聽|昨|尋|琴)(早|朝|晚)|" +
    "(上(?:午|晝)|朝(?:早)|早(?:上)|下(?:午|晝)|晏(?:晝)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨))|" +
    "(今|明|前|大前|後|大後|聽|昨|尋|琴)(?:日|天)" +
    "(?:[\\s,，]*)" +
    "(?:(上(?:午|晝)|朝(?:早)|早(?:上)|下(?:午|晝)|晏(?:晝)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨)))?" +
    ")?" +
    "(?:[\\s,，]*)" +
    "(?:(\\d+|[" +
    Object.keys(NUMBER).join("") +
    "]+)(?:\\s*)(?:點|時|:|：)" +
    "(?:\\s*)" +
    "(\\d+|半|正|整|[" +
    Object.keys(NUMBER).join("") +
    "]+)?(?:\\s*)(?:分|:|：)?" +
    "(?:\\s*)" +
    "(\\d+|[" +
    Object.keys(NUMBER).join("") +
    "]+)?(?:\\s*)(?:秒)?)" +
    "(?:\\s*(A.M.|P.M.|AM?|PM?))?", "i");
const DAY_GROUP_1$1 = 1;
const ZH_AM_PM_HOUR_GROUP_1 = 2;
const ZH_AM_PM_HOUR_GROUP_2 = 3;
const DAY_GROUP_3$1 = 4;
const ZH_AM_PM_HOUR_GROUP_3 = 5;
const HOUR_GROUP$1 = 6;
const MINUTE_GROUP = 7;
const SECOND_GROUP = 8;
const AM_PM_HOUR_GROUP = 9;
class ZHHantTimeExpressionParser extends AbstractParserWithWordBoundaryChecking {
    patternLeftBoundary() {
        return "()";
    }
    innerPattern() {
        return FIRST_REG_PATTERN;
    }
    innerExtract(context, match) {
        if (match.index > 0 && context.text[match.index - 1].match(/\w/)) {
            return null;
        }
        const result = context.createParsingResult(match.index, match[0]);
        const startMoment = new Date(context.reference.instant.getTime());
        if (match[DAY_GROUP_1$1]) {
            const day1 = match[DAY_GROUP_1$1];
            if (day1 == "明" || day1 == "聽") {
                if (context.refDate.getHours() > 1) {
                    startMoment.setDate(startMoment.getDate() + 1);
                }
            }
            else if (day1 == "昨" || day1 == "尋" || day1 == "琴") {
                startMoment.setDate(startMoment.getDate() - 1);
            }
            else if (day1 == "前") {
                startMoment.setDate(startMoment.getDate() - 2);
            }
            else if (day1 == "大前") {
                startMoment.setDate(startMoment.getDate() - 3);
            }
            else if (day1 == "後") {
                startMoment.setDate(startMoment.getDate() + 2);
            }
            else if (day1 == "大後") {
                startMoment.setDate(startMoment.getDate() + 3);
            }
            result.start.assign("day", startMoment.getDate());
            result.start.assign("month", startMoment.getMonth() + 1);
            result.start.assign("year", startMoment.getFullYear());
        }
        else if (match[DAY_GROUP_3$1]) {
            const day3 = match[DAY_GROUP_3$1];
            if (day3 == "明" || day3 == "聽") {
                startMoment.setDate(startMoment.getDate() + 1);
            }
            else if (day3 == "昨" || day3 == "尋" || day3 == "琴") {
                startMoment.setDate(startMoment.getDate() - 1);
            }
            else if (day3 == "前") {
                startMoment.setDate(startMoment.getDate() - 2);
            }
            else if (day3 == "大前") {
                startMoment.setDate(startMoment.getDate() - 3);
            }
            else if (day3 == "後") {
                startMoment.setDate(startMoment.getDate() + 2);
            }
            else if (day3 == "大後") {
                startMoment.setDate(startMoment.getDate() + 3);
            }
            result.start.assign("day", startMoment.getDate());
            result.start.assign("month", startMoment.getMonth() + 1);
            result.start.assign("year", startMoment.getFullYear());
        }
        else {
            result.start.imply("day", startMoment.getDate());
            result.start.imply("month", startMoment.getMonth() + 1);
            result.start.imply("year", startMoment.getFullYear());
        }
        let hour = 0;
        let minute = 0;
        let meridiem = -1;
        if (match[SECOND_GROUP]) {
            var second = parseInt(match[SECOND_GROUP]);
            if (isNaN(second)) {
                second = zhStringToNumber(match[SECOND_GROUP]);
            }
            if (second >= 60)
                return null;
            result.start.assign("second", second);
        }
        hour = parseInt(match[HOUR_GROUP$1]);
        if (isNaN(hour)) {
            hour = zhStringToNumber(match[HOUR_GROUP$1]);
        }
        if (match[MINUTE_GROUP]) {
            if (match[MINUTE_GROUP] == "半") {
                minute = 30;
            }
            else if (match[MINUTE_GROUP] == "正" || match[MINUTE_GROUP] == "整") {
                minute = 0;
            }
            else {
                minute = parseInt(match[MINUTE_GROUP]);
                if (isNaN(minute)) {
                    minute = zhStringToNumber(match[MINUTE_GROUP]);
                }
            }
        }
        else if (hour > 100) {
            minute = hour % 100;
            hour = Math.floor(hour / 100);
        }
        if (minute >= 60) {
            return null;
        }
        if (hour > 24) {
            return null;
        }
        if (hour >= 12) {
            meridiem = 1;
        }
        if (match[AM_PM_HOUR_GROUP]) {
            if (hour > 12)
                return null;
            var ampm = match[AM_PM_HOUR_GROUP][0].toLowerCase();
            if (ampm == "a") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            if (ampm == "p") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        else if (match[ZH_AM_PM_HOUR_GROUP_1]) {
            var zhAMPMString1 = match[ZH_AM_PM_HOUR_GROUP_1];
            var zhAMPM1 = zhAMPMString1[0];
            if (zhAMPM1 == "朝" || zhAMPM1 == "早") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            else if (zhAMPM1 == "晚") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        else if (match[ZH_AM_PM_HOUR_GROUP_2]) {
            var zhAMPMString2 = match[ZH_AM_PM_HOUR_GROUP_2];
            var zhAMPM2 = zhAMPMString2[0];
            if (zhAMPM2 == "上" || zhAMPM2 == "朝" || zhAMPM2 == "早" || zhAMPM2 == "凌") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            else if (zhAMPM2 == "下" || zhAMPM2 == "晏" || zhAMPM2 == "晚") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        else if (match[ZH_AM_PM_HOUR_GROUP_3]) {
            var zhAMPMString3 = match[ZH_AM_PM_HOUR_GROUP_3];
            var zhAMPM3 = zhAMPMString3[0];
            if (zhAMPM3 == "上" || zhAMPM3 == "朝" || zhAMPM3 == "早" || zhAMPM3 == "凌") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            else if (zhAMPM3 == "下" || zhAMPM3 == "晏" || zhAMPM3 == "晚") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        result.start.assign("hour", hour);
        result.start.assign("minute", minute);
        if (meridiem >= 0) {
            result.start.assign("meridiem", meridiem);
        }
        else {
            if (hour < 12) {
                result.start.imply("meridiem", 0);
            }
            else {
                result.start.imply("meridiem", 1);
            }
        }
        const secondMatch = SECOND_REG_PATTERN.exec(context.text.substring(result.index + result.text.length));
        if (!secondMatch) {
            if (result.text.match(/^\d+$/)) {
                return null;
            }
            return result;
        }
        let endMoment = new Date(startMoment.getTime());
        if (secondMatch[DAY_GROUP_1$1] || secondMatch[DAY_GROUP_3$1]) {
            endMoment = new Date(context.reference.instant.getTime());
        }
        result.end = context.createParsingComponents();
        if (secondMatch[DAY_GROUP_1$1]) {
            const day1 = secondMatch[DAY_GROUP_1$1];
            if (day1 == "明" || day1 == "聽") {
                if (context.refDate.getHours() > 1) {
                    endMoment.setDate(endMoment.getDate() + 1);
                }
            }
            else if (day1 == "昨" || day1 == "尋" || day1 == "琴") {
                endMoment.setDate(endMoment.getDate() - 1);
            }
            else if (day1 == "前") {
                endMoment.setDate(endMoment.getDate() - 2);
            }
            else if (day1 == "大前") {
                endMoment.setDate(endMoment.getDate() - 3);
            }
            else if (day1 == "後") {
                endMoment.setDate(endMoment.getDate() + 2);
            }
            else if (day1 == "大後") {
                endMoment.setDate(endMoment.getDate() + 3);
            }
            result.end.assign("day", endMoment.getDate());
            result.end.assign("month", endMoment.getMonth() + 1);
            result.end.assign("year", endMoment.getFullYear());
        }
        else if (secondMatch[DAY_GROUP_3$1]) {
            const day3 = secondMatch[DAY_GROUP_3$1];
            if (day3 == "明" || day3 == "聽") {
                endMoment.setDate(endMoment.getDate() + 1);
            }
            else if (day3 == "昨" || day3 == "尋" || day3 == "琴") {
                endMoment.setDate(endMoment.getDate() - 1);
            }
            else if (day3 == "前") {
                endMoment.setDate(endMoment.getDate() - 2);
            }
            else if (day3 == "大前") {
                endMoment.setDate(endMoment.getDate() - 3);
            }
            else if (day3 == "後") {
                endMoment.setDate(endMoment.getDate() + 2);
            }
            else if (day3 == "大後") {
                endMoment.setDate(endMoment.getDate() + 3);
            }
            result.end.assign("day", endMoment.getDate());
            result.end.assign("month", endMoment.getMonth() + 1);
            result.end.assign("year", endMoment.getFullYear());
        }
        else {
            result.end.imply("day", endMoment.getDate());
            result.end.imply("month", endMoment.getMonth() + 1);
            result.end.imply("year", endMoment.getFullYear());
        }
        hour = 0;
        minute = 0;
        meridiem = -1;
        if (secondMatch[SECOND_GROUP]) {
            let second = parseInt(secondMatch[SECOND_GROUP]);
            if (isNaN(second)) {
                second = zhStringToNumber(secondMatch[SECOND_GROUP]);
            }
            if (second >= 60)
                return null;
            result.end.assign("second", second);
        }
        hour = parseInt(secondMatch[HOUR_GROUP$1]);
        if (isNaN(hour)) {
            hour = zhStringToNumber(secondMatch[HOUR_GROUP$1]);
        }
        if (secondMatch[MINUTE_GROUP]) {
            if (secondMatch[MINUTE_GROUP] == "半") {
                minute = 30;
            }
            else if (secondMatch[MINUTE_GROUP] == "正" || secondMatch[MINUTE_GROUP] == "整") {
                minute = 0;
            }
            else {
                minute = parseInt(secondMatch[MINUTE_GROUP]);
                if (isNaN(minute)) {
                    minute = zhStringToNumber(secondMatch[MINUTE_GROUP]);
                }
            }
        }
        else if (hour > 100) {
            minute = hour % 100;
            hour = Math.floor(hour / 100);
        }
        if (minute >= 60) {
            return null;
        }
        if (hour > 24) {
            return null;
        }
        if (hour >= 12) {
            meridiem = 1;
        }
        if (secondMatch[AM_PM_HOUR_GROUP]) {
            if (hour > 12)
                return null;
            var ampm = secondMatch[AM_PM_HOUR_GROUP][0].toLowerCase();
            if (ampm == "a") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            if (ampm == "p") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
            if (!result.start.isCertain("meridiem")) {
                if (meridiem == 0) {
                    result.start.imply("meridiem", 0);
                    if (result.start.get("hour") == 12) {
                        result.start.assign("hour", 0);
                    }
                }
                else {
                    result.start.imply("meridiem", 1);
                    if (result.start.get("hour") != 12) {
                        result.start.assign("hour", result.start.get("hour") + 12);
                    }
                }
            }
        }
        else if (secondMatch[ZH_AM_PM_HOUR_GROUP_1]) {
            const zhAMPMString1 = secondMatch[ZH_AM_PM_HOUR_GROUP_1];
            var zhAMPM1 = zhAMPMString1[0];
            if (zhAMPM1 == "朝" || zhAMPM1 == "早") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            else if (zhAMPM1 == "晚") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        else if (secondMatch[ZH_AM_PM_HOUR_GROUP_2]) {
            const zhAMPMString2 = secondMatch[ZH_AM_PM_HOUR_GROUP_2];
            var zhAMPM2 = zhAMPMString2[0];
            if (zhAMPM2 == "上" || zhAMPM2 == "朝" || zhAMPM2 == "早" || zhAMPM2 == "凌") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            else if (zhAMPM2 == "下" || zhAMPM2 == "晏" || zhAMPM2 == "晚") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        else if (secondMatch[ZH_AM_PM_HOUR_GROUP_3]) {
            const zhAMPMString3 = secondMatch[ZH_AM_PM_HOUR_GROUP_3];
            var zhAMPM3 = zhAMPMString3[0];
            if (zhAMPM3 == "上" || zhAMPM3 == "朝" || zhAMPM3 == "早" || zhAMPM3 == "凌") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            else if (zhAMPM3 == "下" || zhAMPM3 == "晏" || zhAMPM3 == "晚") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        result.text = result.text + secondMatch[0];
        result.end.assign("hour", hour);
        result.end.assign("minute", minute);
        if (meridiem >= 0) {
            result.end.assign("meridiem", meridiem);
        }
        else {
            const startAtPM = result.start.isCertain("meridiem") && result.start.get("meridiem") == 1;
            if (startAtPM && result.start.get("hour") > hour) {
                result.end.imply("meridiem", 0);
            }
            else if (hour > 12) {
                result.end.imply("meridiem", 1);
            }
        }
        if (result.end.date().getTime() < result.start.date().getTime()) {
            result.end.imply("day", result.end.get("day") + 1);
        }
        return result;
    }
}

const PATTERN$z = new RegExp("(?:星期|禮拜|週)(?<weekday>" + Object.keys(WEEKDAY_OFFSET).join("|") + ")");
class ZHHantWeekdayParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$z;
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        const dayOfWeek = match.groups.weekday;
        const offset = WEEKDAY_OFFSET[dayOfWeek];
        if (offset === undefined)
            return null;
        const date = new Date(context.refDate.getTime());
        const refOffset = date.getDay();
        let diff = offset - refOffset;
        if (Math.abs(diff - 7) < Math.abs(diff)) {
            diff -= 7;
        }
        if (Math.abs(diff + 7) < Math.abs(diff)) {
            diff += 7;
        }
        date.setDate(date.getDate() + diff);
        result.start.assign("weekday", offset);
        {
            result.start.imply("day", date.getDate());
            result.start.imply("month", date.getMonth() + 1);
            result.start.imply("year", date.getFullYear());
        }
        return result;
    }
}

class ZHHantMergeDateRangeRefiner extends AbstractMergeDateRangeRefiner {
    patternBetween() {
        return /^\s*(至|到|\-|\~|～|－|ー)\s*$/i;
    }
}

class ZHHantMergeDateTimeRefiner extends AbstractMergeDateTimeRefiner {
    patternBetween() {
        return /^\s*$/i;
    }
}

const hant = new Chrono(createCasualConfiguration$9());
const casual$a = new Chrono(createCasualConfiguration$9());
const strict$a = new Chrono(createConfiguration$9());
function parse$a(text, ref, option) {
    return casual$a.parse(text, ref, option);
}
function parseDate$a(text, ref, option) {
    return casual$a.parseDate(text, ref, option);
}
function createCasualConfiguration$9() {
    const option = createConfiguration$9();
    option.parsers.unshift(new ZHHantCasualDateParser());
    return option;
}
function createConfiguration$9() {
    const configuration = includeCommonConfiguration({
        parsers: [
            new ZHHantDateParser(),
            new ZHHantRelationWeekdayParser(),
            new ZHHantWeekdayParser(),
            new ZHHantTimeExpressionParser(),
            new ZHHantDeadlineFormatParser(),
        ],
        refiners: [new ZHHantMergeDateRangeRefiner(), new ZHHantMergeDateTimeRefiner()],
    });
    configuration.refiners = configuration.refiners.filter((refiner) => !(refiner instanceof ExtractTimezoneOffsetRefiner));
    return configuration;
}

var index$9 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Chrono: Chrono,
	ParsingResult: ParsingResult,
	ParsingComponents: ParsingComponents,
	ReferenceWithTimezone: ReferenceWithTimezone,
	get Meridiem () { return Meridiem; },
	get Weekday () { return Weekday; },
	hant: hant,
	casual: casual$a,
	strict: strict$a,
	parse: parse$a,
	parseDate: parseDate$a,
	createCasualConfiguration: createCasualConfiguration$9,
	createConfiguration: createConfiguration$9
});

const NOW_GROUP = 1;
const DAY_GROUP_1 = 2;
const TIME_GROUP_1 = 3;
const TIME_GROUP_2 = 4;
const DAY_GROUP_3 = 5;
const TIME_GROUP_3 = 6;
class ZHHansCasualDateParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return new RegExp("(现在|立(?:刻|即)|即刻)|" +
            "(今|明|前|大前|后|大后|昨)(早|晚)|" +
            "(上(?:午)|早(?:上)|下(?:午)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨))|" +
            "(今|明|前|大前|后|大后|昨)(?:日|天)" +
            "(?:[\\s|,|，]*)" +
            "(?:(上(?:午)|早(?:上)|下(?:午)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨)))?", "i");
    }
    innerExtract(context, match) {
        const index = match.index;
        const result = context.createParsingResult(index, match[0]);
        const refDate = context.refDate;
        let date = new Date(refDate.getTime());
        if (match[NOW_GROUP]) {
            result.start.imply("hour", refDate.getHours());
            result.start.imply("minute", refDate.getMinutes());
            result.start.imply("second", refDate.getSeconds());
            result.start.imply("millisecond", refDate.getMilliseconds());
        }
        else if (match[DAY_GROUP_1]) {
            const day1 = match[DAY_GROUP_1];
            const time1 = match[TIME_GROUP_1];
            if (day1 == "明") {
                if (refDate.getHours() > 1) {
                    date.setDate(date.getDate() + 1);
                }
            }
            else if (day1 == "昨") {
                date.setDate(date.getDate() - 1);
            }
            else if (day1 == "前") {
                date.setDate(date.getDate() - 2);
            }
            else if (day1 == "大前") {
                date.setDate(date.getDate() - 3);
            }
            else if (day1 == "后") {
                date.setDate(date.getDate() + 2);
            }
            else if (day1 == "大后") {
                date.setDate(date.getDate() + 3);
            }
            if (time1 == "早") {
                result.start.imply("hour", 6);
            }
            else if (time1 == "晚") {
                result.start.imply("hour", 22);
                result.start.imply("meridiem", 1);
            }
        }
        else if (match[TIME_GROUP_2]) {
            const timeString2 = match[TIME_GROUP_2];
            const time2 = timeString2[0];
            if (time2 == "早" || time2 == "上") {
                result.start.imply("hour", 6);
            }
            else if (time2 == "下") {
                result.start.imply("hour", 15);
                result.start.imply("meridiem", 1);
            }
            else if (time2 == "中") {
                result.start.imply("hour", 12);
                result.start.imply("meridiem", 1);
            }
            else if (time2 == "夜" || time2 == "晚") {
                result.start.imply("hour", 22);
                result.start.imply("meridiem", 1);
            }
            else if (time2 == "凌") {
                result.start.imply("hour", 0);
            }
        }
        else if (match[DAY_GROUP_3]) {
            const day3 = match[DAY_GROUP_3];
            if (day3 == "明") {
                if (refDate.getHours() > 1) {
                    date.setDate(date.getDate() + 1);
                }
            }
            else if (day3 == "昨") {
                date.setDate(date.getDate() - 1);
            }
            else if (day3 == "前") {
                date.setDate(date.getDate() - 2);
            }
            else if (day3 == "大前") {
                date.setDate(date.getDate() - 3);
            }
            else if (day3 == "后") {
                date.setDate(date.getDate() + 2);
            }
            else if (day3 == "大后") {
                date.setDate(date.getDate() + 3);
            }
            const timeString3 = match[TIME_GROUP_3];
            if (timeString3) {
                const time3 = timeString3[0];
                if (time3 == "早" || time3 == "上") {
                    result.start.imply("hour", 6);
                }
                else if (time3 == "下") {
                    result.start.imply("hour", 15);
                    result.start.imply("meridiem", 1);
                }
                else if (time3 == "中") {
                    result.start.imply("hour", 12);
                    result.start.imply("meridiem", 1);
                }
                else if (time3 == "夜" || time3 == "晚") {
                    result.start.imply("hour", 22);
                    result.start.imply("meridiem", 1);
                }
                else if (time3 == "凌") {
                    result.start.imply("hour", 0);
                }
            }
        }
        result.start.assign("day", date.getDate());
        result.start.assign("month", date.getMonth() + 1);
        result.start.assign("year", date.getFullYear());
        return result;
    }
}

class ZHHansMergeDateRangeRefiner extends AbstractMergeDateRangeRefiner {
    patternBetween() {
        return /^\s*(至|到|-|~|～|－|ー)\s*$/i;
    }
}

class ZHHansMergeDateTimeRefiner extends AbstractMergeDateTimeRefiner {
    patternBetween() {
        return /^\s*$/i;
    }
}

const hans = new Chrono(createCasualConfiguration$8());
const casual$9 = new Chrono(createCasualConfiguration$8());
const strict$9 = new Chrono(createConfiguration$8());
function parse$9(text, ref, option) {
    return casual$9.parse(text, ref, option);
}
function parseDate$9(text, ref, option) {
    return casual$9.parseDate(text, ref, option);
}
function createCasualConfiguration$8() {
    const option = createConfiguration$8();
    option.parsers.unshift(new ZHHansCasualDateParser());
    return option;
}
function createConfiguration$8() {
    const configuration = includeCommonConfiguration({
        parsers: [
            new ZHHansDateParser(),
            new ZHHansRelationWeekdayParser(),
            new ZHHansWeekdayParser(),
            new ZHHansTimeExpressionParser(),
            new ZHHansDeadlineFormatParser(),
        ],
        refiners: [new ZHHansMergeDateRangeRefiner(), new ZHHansMergeDateTimeRefiner()],
    });
    configuration.refiners = configuration.refiners.filter((refiner) => !(refiner instanceof ExtractTimezoneOffsetRefiner));
    return configuration;
}

var index$8 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Chrono: Chrono,
	ParsingResult: ParsingResult,
	ParsingComponents: ParsingComponents,
	ReferenceWithTimezone: ReferenceWithTimezone,
	get Meridiem () { return Meridiem; },
	get Weekday () { return Weekday; },
	hans: hans,
	casual: casual$9,
	strict: strict$9,
	parse: parse$9,
	parseDate: parseDate$9,
	createCasualConfiguration: createCasualConfiguration$8,
	createConfiguration: createConfiguration$8
});

const casual$8 = new Chrono(createCasualConfiguration$7());
const strict$8 = new Chrono(createConfiguration$7());
function parse$8(text, ref, option) {
    return casual$8.parse(text, ref, option);
}
function parseDate$8(text, ref, option) {
    return casual$8.parseDate(text, ref, option);
}
function createCasualConfiguration$7() {
    const option = createConfiguration$7();
    option.parsers.unshift(new ZHHantCasualDateParser());
    return option;
}
function createConfiguration$7() {
    const configuration = includeCommonConfiguration({
        parsers: [
            new ZHHantDateParser(),
            new ZHHansDateParser(),
            new ZHHantRelationWeekdayParser(),
            new ZHHansRelationWeekdayParser(),
            new ZHHantWeekdayParser(),
            new ZHHansWeekdayParser(),
            new ZHHantTimeExpressionParser(),
            new ZHHansTimeExpressionParser(),
            new ZHHantDeadlineFormatParser(),
            new ZHHansDeadlineFormatParser(),
        ],
        refiners: [new ZHHantMergeDateRangeRefiner(), new ZHHantMergeDateTimeRefiner()],
    });
    configuration.refiners = configuration.refiners.filter((refiner) => !(refiner instanceof ExtractTimezoneOffsetRefiner));
    return configuration;
}

var index$7 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Chrono: Chrono,
	ParsingResult: ParsingResult,
	ParsingComponents: ParsingComponents,
	ReferenceWithTimezone: ReferenceWithTimezone,
	get Meridiem () { return Meridiem; },
	get Weekday () { return Weekday; },
	casual: casual$8,
	strict: strict$8,
	parse: parse$8,
	parseDate: parseDate$8,
	createCasualConfiguration: createCasualConfiguration$7,
	createConfiguration: createConfiguration$7,
	hant: index$9,
	hans: index$8
});

const REGEX_PARTS$1 = {
    leftBoundary: "([^\\p{L}\\p{N}_]|^)",
    rightBoundary: "(?=[^\\p{L}\\p{N}_]|$)",
    flags: "iu",
};
const WEEKDAY_DICTIONARY$6 = {
    воскресенье: 0,
    воскресенья: 0,
    вск: 0,
    "вск.": 0,
    понедельник: 1,
    понедельника: 1,
    пн: 1,
    "пн.": 1,
    вторник: 2,
    вторника: 2,
    вт: 2,
    "вт.": 2,
    среда: 3,
    среды: 3,
    среду: 3,
    ср: 3,
    "ср.": 3,
    четверг: 4,
    четверга: 4,
    чт: 4,
    "чт.": 4,
    пятница: 5,
    пятницу: 5,
    пятницы: 5,
    пт: 5,
    "пт.": 5,
    суббота: 6,
    субботу: 6,
    субботы: 6,
    сб: 6,
    "сб.": 6,
};
const FULL_MONTH_NAME_DICTIONARY$2 = {
    январь: 1,
    января: 1,
    январе: 1,
    февраль: 2,
    февраля: 2,
    феврале: 2,
    март: 3,
    марта: 3,
    марте: 3,
    апрель: 4,
    апреля: 4,
    апреле: 4,
    май: 5,
    мая: 5,
    мае: 5,
    июнь: 6,
    июня: 6,
    июне: 6,
    июль: 7,
    июля: 7,
    июле: 7,
    август: 8,
    августа: 8,
    августе: 8,
    сентябрь: 9,
    сентября: 9,
    сентябре: 9,
    октябрь: 10,
    октября: 10,
    октябре: 10,
    ноябрь: 11,
    ноября: 11,
    ноябре: 11,
    декабрь: 12,
    декабря: 12,
    декабре: 12,
};
const MONTH_DICTIONARY$6 = {
    ...FULL_MONTH_NAME_DICTIONARY$2,
    янв: 1,
    "янв.": 1,
    фев: 2,
    "фев.": 2,
    мар: 3,
    "мар.": 3,
    апр: 4,
    "апр.": 4,
    авг: 8,
    "авг.": 8,
    сен: 9,
    "сен.": 9,
    окт: 10,
    "окт.": 10,
    ноя: 11,
    "ноя.": 11,
    дек: 12,
    "дек.": 12,
};
const INTEGER_WORD_DICTIONARY$6 = {
    один: 1,
    одна: 1,
    одной: 1,
    одну: 1,
    две: 2,
    два: 2,
    двух: 2,
    три: 3,
    трех: 3,
    трёх: 3,
    четыре: 4,
    четырех: 4,
    четырёх: 4,
    пять: 5,
    пяти: 5,
    шесть: 6,
    шести: 6,
    семь: 7,
    семи: 7,
    восемь: 8,
    восьми: 8,
    девять: 9,
    девяти: 9,
    десять: 10,
    десяти: 10,
    одиннадцать: 11,
    одиннадцати: 11,
    двенадцать: 12,
    двенадцати: 12,
};
const ORDINAL_WORD_DICTIONARY$2 = {
    первое: 1,
    первого: 1,
    второе: 2,
    второго: 2,
    третье: 3,
    третьего: 3,
    четвертое: 4,
    четвертого: 4,
    пятое: 5,
    пятого: 5,
    шестое: 6,
    шестого: 6,
    седьмое: 7,
    седьмого: 7,
    восьмое: 8,
    восьмого: 8,
    девятое: 9,
    девятого: 9,
    десятое: 10,
    десятого: 10,
    одиннадцатое: 11,
    одиннадцатого: 11,
    двенадцатое: 12,
    двенадцатого: 12,
    тринадцатое: 13,
    тринадцатого: 13,
    четырнадцатое: 14,
    четырнадцатого: 14,
    пятнадцатое: 15,
    пятнадцатого: 15,
    шестнадцатое: 16,
    шестнадцатого: 16,
    семнадцатое: 17,
    семнадцатого: 17,
    восемнадцатое: 18,
    восемнадцатого: 18,
    девятнадцатое: 19,
    девятнадцатого: 19,
    двадцатое: 20,
    двадцатого: 20,
    "двадцать первое": 21,
    "двадцать первого": 21,
    "двадцать второе": 22,
    "двадцать второго": 22,
    "двадцать третье": 23,
    "двадцать третьего": 23,
    "двадцать четвертое": 24,
    "двадцать четвертого": 24,
    "двадцать пятое": 25,
    "двадцать пятого": 25,
    "двадцать шестое": 26,
    "двадцать шестого": 26,
    "двадцать седьмое": 27,
    "двадцать седьмого": 27,
    "двадцать восьмое": 28,
    "двадцать восьмого": 28,
    "двадцать девятое": 29,
    "двадцать девятого": 29,
    "тридцатое": 30,
    "тридцатого": 30,
    "тридцать первое": 31,
    "тридцать первого": 31,
};
const TIME_UNIT_DICTIONARY$6 = {
    сек: "second",
    секунда: "second",
    секунд: "second",
    секунды: "second",
    секунду: "second",
    секундочка: "second",
    секундочки: "second",
    секундочек: "second",
    секундочку: "second",
    мин: "minute",
    минута: "minute",
    минут: "minute",
    минуты: "minute",
    минуту: "minute",
    минуток: "minute",
    минутки: "minute",
    минутку: "minute",
    минуточек: "minute",
    минуточки: "minute",
    минуточку: "minute",
    час: "hour",
    часов: "hour",
    часа: "hour",
    часу: "hour",
    часиков: "hour",
    часика: "hour",
    часике: "hour",
    часик: "hour",
    день: "day",
    дня: "day",
    дней: "day",
    суток: "day",
    сутки: "day",
    неделя: "week",
    неделе: "week",
    недели: "week",
    неделю: "week",
    недель: "week",
    недельке: "week",
    недельки: "week",
    неделек: "week",
    месяц: "month",
    месяце: "month",
    месяцев: "month",
    месяца: "month",
    квартал: "quarter",
    квартале: "quarter",
    кварталов: "quarter",
    год: "year",
    года: "year",
    году: "year",
    годов: "year",
    лет: "year",
    годик: "year",
    годика: "year",
    годиков: "year",
};
const NUMBER_PATTERN$6 = `(?:${matchAnyPattern(INTEGER_WORD_DICTIONARY$6)}|[0-9]+|[0-9]+\\.[0-9]+|пол|несколько|пар(?:ы|у)|\\s{0,3})`;
function parseNumberPattern$6(match) {
    const num = match.toLowerCase();
    if (INTEGER_WORD_DICTIONARY$6[num] !== undefined) {
        return INTEGER_WORD_DICTIONARY$6[num];
    }
    if (num.match(/несколько/)) {
        return 3;
    }
    else if (num.match(/пол/)) {
        return 0.5;
    }
    else if (num.match(/пар/)) {
        return 2;
    }
    else if (num === "") {
        return 1;
    }
    return parseFloat(num);
}
const ORDINAL_NUMBER_PATTERN$2 = `(?:${matchAnyPattern(ORDINAL_WORD_DICTIONARY$2)}|[0-9]{1,2}(?:го|ого|е|ое)?)`;
function parseOrdinalNumberPattern$2(match) {
    const num = match.toLowerCase();
    if (ORDINAL_WORD_DICTIONARY$2[num] !== undefined) {
        return ORDINAL_WORD_DICTIONARY$2[num];
    }
    return parseInt(num);
}
const year$1 = "(?:\\s+(?:году|года|год|г|г.))?";
const YEAR_PATTERN$4 = `(?:[1-9][0-9]{0,3}${year$1}\\s*(?:н.э.|до н.э.|н. э.|до н. э.)|[1-2][0-9]{3}${year$1}|[5-9][0-9]${year$1})`;
function parseYear$5(match) {
    if (/(год|года|г|г.)/i.test(match)) {
        match = match.replace(/(год|года|г|г.)/i, "");
    }
    if (/(до н.э.|до н. э.)/i.test(match)) {
        match = match.replace(/(до н.э.|до н. э.)/i, "");
        return -parseInt(match);
    }
    if (/(н. э.|н.э.)/i.test(match)) {
        match = match.replace(/(н. э.|н.э.)/i, "");
        return parseInt(match);
    }
    const rawYearNumber = parseInt(match);
    return findMostLikelyADYear(rawYearNumber);
}
const SINGLE_TIME_UNIT_PATTERN$6 = `(${NUMBER_PATTERN$6})\\s{0,3}(${matchAnyPattern(TIME_UNIT_DICTIONARY$6)})`;
const SINGLE_TIME_UNIT_REGEX$6 = new RegExp(SINGLE_TIME_UNIT_PATTERN$6, "i");
const TIME_UNITS_PATTERN$6 = repeatedTimeunitPattern(`(?:(?:около|примерно)\\s{0,3})?`, SINGLE_TIME_UNIT_PATTERN$6);
function parseDuration$6(timeunitText) {
    const fragments = {};
    let remainingText = timeunitText;
    let match = SINGLE_TIME_UNIT_REGEX$6.exec(remainingText);
    while (match) {
        collectDateTimeFragment$5(fragments, match);
        remainingText = remainingText.substring(match[0].length).trim();
        match = SINGLE_TIME_UNIT_REGEX$6.exec(remainingText);
    }
    return fragments;
}
function collectDateTimeFragment$5(fragments, match) {
    const num = parseNumberPattern$6(match[1]);
    const unit = TIME_UNIT_DICTIONARY$6[match[2].toLowerCase()];
    fragments[unit] = num;
}

const PATTERN$y = `(?:(?:около|примерно)\\s*(?:~\\s*)?)?(${TIME_UNITS_PATTERN$6})${REGEX_PARTS$1.rightBoundary}`;
class RUTimeUnitWithinFormatParser extends AbstractParserWithWordBoundaryChecking {
    patternLeftBoundary() {
        return REGEX_PARTS$1.leftBoundary;
    }
    innerPattern(context) {
        return context.option.forwardDate
            ? new RegExp(PATTERN$y, REGEX_PARTS$1.flags)
            : new RegExp(`(?:в течение|в течении)\\s*${PATTERN$y}`, REGEX_PARTS$1.flags);
    }
    innerExtract(context, match) {
        const timeUnits = parseDuration$6(match[1]);
        return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
    }
}

class AbstractParserWithLeftBoundaryChecking$1 extends AbstractParserWithWordBoundaryChecking {
    patternLeftBoundary() {
        return REGEX_PARTS$1.leftBoundary;
    }
    innerPattern(context) {
        return new RegExp(this.innerPatternString(context), REGEX_PARTS$1.flags);
    }
    innerPatternHasChange(context, currentInnerPattern) {
        return false;
    }
}
class AbstractParserWithLeftRightBoundaryChecking$1 extends AbstractParserWithLeftBoundaryChecking$1 {
    innerPattern(context) {
        return new RegExp(`${this.innerPatternString(context)}${REGEX_PARTS$1.rightBoundary}`, REGEX_PARTS$1.flags);
    }
}

const DATE_GROUP$8 = 1;
const DATE_TO_GROUP$6 = 2;
const MONTH_NAME_GROUP$a = 3;
const YEAR_GROUP$c = 4;
class RUMonthNameLittleEndianParser extends AbstractParserWithLeftRightBoundaryChecking$1 {
    innerPatternString(context) {
        return `(?:с)?\\s*(${ORDINAL_NUMBER_PATTERN$2})` +
            `(?:` +
            `\\s{0,3}(?:по|-|–|до)?\\s{0,3}` +
            `(${ORDINAL_NUMBER_PATTERN$2})` +
            `)?` +
            `(?:-|\\/|\\s{0,3}(?:of)?\\s{0,3})` +
            `(${matchAnyPattern(MONTH_DICTIONARY$6)})` +
            `(?:` +
            `(?:-|\\/|,?\\s{0,3})` +
            `(${YEAR_PATTERN$4}(?![^\\s]\\d))` +
            `)?`;
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        const month = MONTH_DICTIONARY$6[match[MONTH_NAME_GROUP$a].toLowerCase()];
        const day = parseOrdinalNumberPattern$2(match[DATE_GROUP$8]);
        if (day > 31) {
            match.index = match.index + match[DATE_GROUP$8].length;
            return null;
        }
        result.start.assign("month", month);
        result.start.assign("day", day);
        if (match[YEAR_GROUP$c]) {
            const yearNumber = parseYear$5(match[YEAR_GROUP$c]);
            result.start.assign("year", yearNumber);
        }
        else {
            const year = findYearClosestToRef(context.refDate, day, month);
            result.start.imply("year", year);
        }
        if (match[DATE_TO_GROUP$6]) {
            const endDate = parseOrdinalNumberPattern$2(match[DATE_TO_GROUP$6]);
            result.end = result.start.clone();
            result.end.assign("day", endDate);
        }
        return result;
    }
}

const MONTH_NAME_GROUP$9 = 2;
const YEAR_GROUP$b = 3;
class RUMonthNameParser extends AbstractParserWithLeftBoundaryChecking$1 {
    innerPatternString(context) {
        return (`((?:в)\\s*)?` +
            `(${matchAnyPattern(MONTH_DICTIONARY$6)})` +
            `\\s*` +
            `(?:` +
            `[,-]?\\s*(${YEAR_PATTERN$4})?` +
            `)?` +
            `(?=[^\\s\\w]|\\s+[^0-9]|\\s+$|$)`);
    }
    innerExtract(context, match) {
        const monthName = match[MONTH_NAME_GROUP$9].toLowerCase();
        if (match[0].length <= 3 && !FULL_MONTH_NAME_DICTIONARY$2[monthName]) {
            return null;
        }
        const result = context.createParsingResult(match.index, match.index + match[0].length);
        result.start.imply("day", 1);
        const month = MONTH_DICTIONARY$6[monthName];
        result.start.assign("month", month);
        if (match[YEAR_GROUP$b]) {
            const year = parseYear$5(match[YEAR_GROUP$b]);
            result.start.assign("year", year);
        }
        else {
            const year = findYearClosestToRef(context.refDate, 1, month);
            result.start.imply("year", year);
        }
        return result;
    }
}

class RUTimeExpressionParser extends AbstractTimeExpressionParser {
    constructor(strictMode) {
        super(strictMode);
    }
    patternFlags() {
        return REGEX_PARTS$1.flags;
    }
    primaryPatternLeftBoundary() {
        return `(^|\\s|T|(?:[^\\p{L}\\p{N}_]))`;
    }
    followingPhase() {
        return `\\s*(?:\\-|\\–|\\~|\\〜|до|и|по|\\?)\\s*`;
    }
    primaryPrefix() {
        return `(?:(?:в|с)\\s*)??`;
    }
    primarySuffix() {
        return `(?:\\s*(?:утра|вечера|после полудня))?(?!\\/)${REGEX_PARTS$1.rightBoundary}`;
    }
    extractPrimaryTimeComponents(context, match) {
        const components = super.extractPrimaryTimeComponents(context, match);
        if (components) {
            if (match[0].endsWith("вечера")) {
                const hour = components.get("hour");
                if (hour >= 6 && hour < 12) {
                    components.assign("hour", components.get("hour") + 12);
                    components.assign("meridiem", Meridiem.PM);
                }
                else if (hour < 6) {
                    components.assign("meridiem", Meridiem.AM);
                }
            }
            if (match[0].endsWith("после полудня")) {
                components.assign("meridiem", Meridiem.PM);
                const hour = components.get("hour");
                if (hour >= 0 && hour <= 6) {
                    components.assign("hour", components.get("hour") + 12);
                }
            }
            if (match[0].endsWith("утра")) {
                components.assign("meridiem", Meridiem.AM);
                const hour = components.get("hour");
                if (hour < 12) {
                    components.assign("hour", components.get("hour"));
                }
            }
        }
        return components;
    }
}

class RUTimeUnitAgoFormatParser extends AbstractParserWithLeftBoundaryChecking$1 {
    innerPatternString(context) {
        return `(${TIME_UNITS_PATTERN$6})\\s{0,5}назад(?=(?:\\W|$))`;
    }
    innerExtract(context, match) {
        const timeUnits = parseDuration$6(match[1]);
        const outputTimeUnits = reverseDuration(timeUnits);
        return ParsingComponents.createRelativeFromReference(context.reference, outputTimeUnits);
    }
}

class RUMergeDateRangeRefiner extends AbstractMergeDateRangeRefiner {
    patternBetween() {
        return /^\s*(и до|и по|до|по|-)\s*$/i;
    }
}

class RUMergeDateTimeRefiner extends AbstractMergeDateTimeRefiner {
    patternBetween() {
        return new RegExp(`^\\s*(T|в|,|-)?\\s*$`);
    }
}

class RUCasualDateParser extends AbstractParserWithLeftRightBoundaryChecking$1 {
    innerPatternString(context) {
        return `(?:с|со)?\\s*(сегодня|вчера|завтра|послезавтра|послепослезавтра|позапозавчера|позавчера)`;
    }
    innerExtract(context, match) {
        const lowerText = match[1].toLowerCase();
        const component = context.createParsingComponents();
        switch (lowerText) {
            case "сегодня":
                return today(context.reference);
            case "вчера":
                return yesterday(context.reference);
            case "завтра":
                return tomorrow(context.reference);
            case "послезавтра":
                return theDayAfter(context.reference, 2);
            case "послепослезавтра":
                return theDayAfter(context.reference, 3);
            case "позавчера":
                return theDayBefore(context.reference, 2);
            case "позапозавчера":
                return theDayBefore(context.reference, 3);
        }
        return component;
    }
}

class RUCasualTimeParser extends AbstractParserWithLeftRightBoundaryChecking$1 {
    innerPatternString(context) {
        return `(сейчас|прошлым\\s*вечером|прошлой\\s*ночью|следующей\\s*ночью|сегодня\\s*ночью|этой\\s*ночью|ночью|этим утром|утром|утра|в\\s*полдень|вечером|вечера|в\\s*полночь)`;
    }
    innerExtract(context, match) {
        let targetDate = context.refDate;
        const lowerText = match[0].toLowerCase();
        const component = context.createParsingComponents();
        if (lowerText === "сейчас") {
            return now(context.reference);
        }
        if (lowerText === "вечером" || lowerText === "вечера") {
            return evening(context.reference);
        }
        if (lowerText.endsWith("утром") || lowerText.endsWith("утра")) {
            return morning(context.reference);
        }
        if (lowerText.match(/в\s*полдень/)) {
            return noon(context.reference);
        }
        if (lowerText.match(/прошлой\s*ночью/)) {
            return lastNight(context.reference);
        }
        if (lowerText.match(/прошлым\s*вечером/)) {
            return yesterdayEvening(context.reference);
        }
        if (lowerText.match(/следующей\s*ночью/)) {
            const daysToAdd = targetDate.getHours() < 22 ? 1 : 2;
            const nextDay = new Date(targetDate.getTime());
            nextDay.setDate(nextDay.getDate() + daysToAdd);
            assignSimilarDate(component, nextDay);
            component.imply("hour", 0);
        }
        if (lowerText.match(/в\s*полночь/) || lowerText.endsWith("ночью")) {
            return midnight(context.reference);
        }
        return component;
    }
}

const PREFIX_GROUP$6 = 1;
const WEEKDAY_GROUP$6 = 2;
const POSTFIX_GROUP$3 = 3;
class RUWeekdayParser extends AbstractParserWithLeftRightBoundaryChecking$1 {
    innerPatternString(context) {
        return (`(?:(?:,|\\(|（)\\s*)?` +
            `(?:в\\s*?)?` +
            `(?:(эту|этот|прошлый|прошлую|следующий|следующую|следующего)\\s*)?` +
            `(${matchAnyPattern(WEEKDAY_DICTIONARY$6)})` +
            `(?:\\s*(?:,|\\)|）))?` +
            `(?:\\s*на\\s*(этой|прошлой|следующей)\\s*неделе)?`);
    }
    innerExtract(context, match) {
        const dayOfWeek = match[WEEKDAY_GROUP$6].toLowerCase();
        const weekday = WEEKDAY_DICTIONARY$6[dayOfWeek];
        const prefix = match[PREFIX_GROUP$6];
        const postfix = match[POSTFIX_GROUP$3];
        let modifierWord = prefix || postfix;
        modifierWord = modifierWord || "";
        modifierWord = modifierWord.toLowerCase();
        let modifier = null;
        if (modifierWord == "прошлый" || modifierWord == "прошлую" || modifierWord == "прошлой") {
            modifier = "last";
        }
        else if (modifierWord == "следующий" ||
            modifierWord == "следующую" ||
            modifierWord == "следующей" ||
            modifierWord == "следующего") {
            modifier = "next";
        }
        else if (modifierWord == "этот" || modifierWord == "эту" || modifierWord == "этой") {
            modifier = "this";
        }
        return createParsingComponentsAtWeekday(context.reference, weekday, modifier);
    }
}

const MODIFIER_WORD_GROUP$2 = 1;
const RELATIVE_WORD_GROUP$2 = 2;
class RURelativeDateFormatParser extends AbstractParserWithLeftRightBoundaryChecking$1 {
    innerPatternString(context) {
        return `(в прошлом|на прошлой|на следующей|в следующем|на этой|в этом)\\s*(${matchAnyPattern(TIME_UNIT_DICTIONARY$6)})`;
    }
    innerExtract(context, match) {
        const modifier = match[MODIFIER_WORD_GROUP$2].toLowerCase();
        const unitWord = match[RELATIVE_WORD_GROUP$2].toLowerCase();
        const timeunit = TIME_UNIT_DICTIONARY$6[unitWord];
        if (modifier == "на следующей" || modifier == "в следующем") {
            const timeUnits = {};
            timeUnits[timeunit] = 1;
            return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
        }
        if (modifier == "в прошлом" || modifier == "на прошлой") {
            const timeUnits = {};
            timeUnits[timeunit] = -1;
            return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
        }
        const components = context.createParsingComponents();
        let date = new Date(context.reference.instant.getTime());
        if (timeunit.match(/week/i)) {
            date.setDate(date.getDate() - date.getDay());
            components.imply("day", date.getDate());
            components.imply("month", date.getMonth() + 1);
            components.imply("year", date.getFullYear());
        }
        else if (timeunit.match(/month/i)) {
            date.setDate(1);
            components.imply("day", date.getDate());
            components.assign("year", date.getFullYear());
            components.assign("month", date.getMonth() + 1);
        }
        else if (timeunit.match(/year/i)) {
            date.setDate(1);
            date.setMonth(0);
            components.imply("day", date.getDate());
            components.imply("month", date.getMonth() + 1);
            components.assign("year", date.getFullYear());
        }
        return components;
    }
}

class RUTimeUnitCasualRelativeFormatParser extends AbstractParserWithLeftRightBoundaryChecking$1 {
    innerPatternString(context) {
        return `(эти|последние|прошлые|следующие|после|спустя|через|\\+|-)\\s*(${TIME_UNITS_PATTERN$6})`;
    }
    innerExtract(context, match) {
        const prefix = match[1].toLowerCase();
        let timeUnits = parseDuration$6(match[2]);
        switch (prefix) {
            case "последние":
            case "прошлые":
            case "-":
                timeUnits = reverseDuration(timeUnits);
                break;
        }
        return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
    }
}

const casual$7 = new Chrono(createCasualConfiguration$6());
const strict$7 = new Chrono(createConfiguration$6(true));
function parse$7(text, ref, option) {
    return casual$7.parse(text, ref, option);
}
function parseDate$7(text, ref, option) {
    return casual$7.parseDate(text, ref, option);
}
function createCasualConfiguration$6() {
    const option = createConfiguration$6(false);
    option.parsers.unshift(new RUCasualDateParser());
    option.parsers.unshift(new RUCasualTimeParser());
    option.parsers.unshift(new RUMonthNameParser());
    option.parsers.unshift(new RURelativeDateFormatParser());
    option.parsers.unshift(new RUTimeUnitCasualRelativeFormatParser());
    return option;
}
function createConfiguration$6(strictMode = true) {
    return includeCommonConfiguration({
        parsers: [
            new SlashDateFormatParser(true),
            new RUTimeUnitWithinFormatParser(),
            new RUMonthNameLittleEndianParser(),
            new RUWeekdayParser(),
            new RUTimeExpressionParser(strictMode),
            new RUTimeUnitAgoFormatParser(),
        ],
        refiners: [new RUMergeDateTimeRefiner(), new RUMergeDateRangeRefiner()],
    }, strictMode);
}

var index$6 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Chrono: Chrono,
	ParsingResult: ParsingResult,
	ParsingComponents: ParsingComponents,
	ReferenceWithTimezone: ReferenceWithTimezone,
	get Meridiem () { return Meridiem; },
	get Weekday () { return Weekday; },
	casual: casual$7,
	strict: strict$7,
	parse: parse$7,
	parseDate: parseDate$7,
	createCasualConfiguration: createCasualConfiguration$6,
	createConfiguration: createConfiguration$6
});

const WEEKDAY_DICTIONARY$5 = {
    "domingo": 0,
    "dom": 0,
    "lunes": 1,
    "lun": 1,
    "martes": 2,
    "mar": 2,
    "miércoles": 3,
    "miercoles": 3,
    "mié": 3,
    "mie": 3,
    "jueves": 4,
    "jue": 4,
    "viernes": 5,
    "vie": 5,
    "sábado": 6,
    "sabado": 6,
    "sáb": 6,
    "sab": 6,
};
const MONTH_DICTIONARY$5 = {
    "enero": 1,
    "ene": 1,
    "ene.": 1,
    "febrero": 2,
    "feb": 2,
    "feb.": 2,
    "marzo": 3,
    "mar": 3,
    "mar.": 3,
    "abril": 4,
    "abr": 4,
    "abr.": 4,
    "mayo": 5,
    "may": 5,
    "may.": 5,
    "junio": 6,
    "jun": 6,
    "jun.": 6,
    "julio": 7,
    "jul": 7,
    "jul.": 7,
    "agosto": 8,
    "ago": 8,
    "ago.": 8,
    "septiembre": 9,
    "setiembre": 9,
    "sep": 9,
    "sep.": 9,
    "octubre": 10,
    "oct": 10,
    "oct.": 10,
    "noviembre": 11,
    "nov": 11,
    "nov.": 11,
    "diciembre": 12,
    "dic": 12,
    "dic.": 12,
};
const INTEGER_WORD_DICTIONARY$5 = {
    "uno": 1,
    "dos": 2,
    "tres": 3,
    "cuatro": 4,
    "cinco": 5,
    "seis": 6,
    "siete": 7,
    "ocho": 8,
    "nueve": 9,
    "diez": 10,
    "once": 11,
    "doce": 12,
    "trece": 13,
};
const TIME_UNIT_DICTIONARY$5 = {
    "sec": "second",
    "segundo": "second",
    "segundos": "second",
    "min": "minute",
    "mins": "minute",
    "minuto": "minute",
    "minutos": "minute",
    "h": "hour",
    "hr": "hour",
    "hrs": "hour",
    "hora": "hour",
    "horas": "hour",
    "día": "day",
    "días": "day",
    "semana": "week",
    "semanas": "week",
    "mes": "month",
    "meses": "month",
    "cuarto": "quarter",
    "cuartos": "quarter",
    "año": "year",
    "años": "year",
};
const NUMBER_PATTERN$5 = `(?:${matchAnyPattern(INTEGER_WORD_DICTIONARY$5)}|[0-9]+|[0-9]+\\.[0-9]+|un?|uno?|una?|algunos?|unos?|demi-?)`;
function parseNumberPattern$5(match) {
    const num = match.toLowerCase();
    if (INTEGER_WORD_DICTIONARY$5[num] !== undefined) {
        return INTEGER_WORD_DICTIONARY$5[num];
    }
    else if (num === "un" || num === "una" || num === "uno") {
        return 1;
    }
    else if (num.match(/algunos?/)) {
        return 3;
    }
    else if (num.match(/unos?/)) {
        return 3;
    }
    else if (num.match(/media?/)) {
        return 0.5;
    }
    return parseFloat(num);
}
const YEAR_PATTERN$3 = "[0-9]{1,4}(?![^\\s]\\d)(?:\\s*[a|d]\\.?\\s*c\\.?|\\s*a\\.?\\s*d\\.?)?";
function parseYear$4(match) {
    if (match.match(/^[0-9]{1,4}$/)) {
        let yearNumber = parseInt(match);
        if (yearNumber < 100) {
            if (yearNumber > 50) {
                yearNumber = yearNumber + 1900;
            }
            else {
                yearNumber = yearNumber + 2000;
            }
        }
        return yearNumber;
    }
    if (match.match(/a\.?\s*c\.?/i)) {
        match = match.replace(/a\.?\s*c\.?/i, "");
        return -parseInt(match);
    }
    return parseInt(match);
}
const SINGLE_TIME_UNIT_PATTERN$5 = `(${NUMBER_PATTERN$5})\\s{0,5}(${matchAnyPattern(TIME_UNIT_DICTIONARY$5)})\\s{0,5}`;
const SINGLE_TIME_UNIT_REGEX$5 = new RegExp(SINGLE_TIME_UNIT_PATTERN$5, "i");
const TIME_UNITS_PATTERN$5 = repeatedTimeunitPattern("", SINGLE_TIME_UNIT_PATTERN$5);
function parseDuration$5(timeunitText) {
    const fragments = {};
    let remainingText = timeunitText;
    let match = SINGLE_TIME_UNIT_REGEX$5.exec(remainingText);
    while (match) {
        collectDateTimeFragment$4(fragments, match);
        remainingText = remainingText.substring(match[0].length);
        match = SINGLE_TIME_UNIT_REGEX$5.exec(remainingText);
    }
    return fragments;
}
function collectDateTimeFragment$4(fragments, match) {
    const num = parseNumberPattern$5(match[1]);
    const unit = TIME_UNIT_DICTIONARY$5[match[2].toLowerCase()];
    fragments[unit] = num;
}

const PATTERN$x = new RegExp("(?:(?:\\,|\\(|\\（)\\s*)?" +
    "(?:(este|esta|pasado|pr[oó]ximo)\\s*)?" +
    `(${matchAnyPattern(WEEKDAY_DICTIONARY$5)})` +
    "(?:\\s*(?:\\,|\\)|\\）))?" +
    "(?:\\s*(este|esta|pasado|pr[óo]ximo)\\s*semana)?" +
    "(?=\\W|\\d|$)", "i");
const PREFIX_GROUP$5 = 1;
const WEEKDAY_GROUP$5 = 2;
const POSTFIX_GROUP$2 = 3;
class ESWeekdayParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$x;
    }
    innerExtract(context, match) {
        const dayOfWeek = match[WEEKDAY_GROUP$5].toLowerCase();
        const weekday = WEEKDAY_DICTIONARY$5[dayOfWeek];
        if (weekday === undefined) {
            return null;
        }
        const prefix = match[PREFIX_GROUP$5];
        const postfix = match[POSTFIX_GROUP$2];
        let norm = prefix || postfix || "";
        norm = norm.toLowerCase();
        let modifier = null;
        if (norm == "pasado") {
            modifier = "this";
        }
        else if (norm == "próximo" || norm == "proximo") {
            modifier = "next";
        }
        else if (norm == "este") {
            modifier = "this";
        }
        return createParsingComponentsAtWeekday(context.reference, weekday, modifier);
    }
}

class ESTimeExpressionParser extends AbstractTimeExpressionParser {
    primaryPrefix() {
        return "(?:(?:aslas|deslas|las?|al?|de|del)\\s*)?";
    }
    followingPhase() {
        return "\\s*(?:\\-|\\–|\\~|\\〜|a(?:l)?|\\?)\\s*";
    }
}

class ESMergeDateTimeRefiner extends AbstractMergeDateTimeRefiner {
    patternBetween() {
        return new RegExp("^\\s*(?:,|de|aslas|a)?\\s*$");
    }
}

class ESMergeDateRangeRefiner extends AbstractMergeDateRangeRefiner {
    patternBetween() {
        return /^\s*(?:-)\s*$/i;
    }
}

const PATTERN$w = new RegExp(`([0-9]{1,2})(?:º|ª|°)?` +
    "(?:\\s*(?:desde|de|\\-|\\–|ao?|\\s)\\s*([0-9]{1,2})(?:º|ª|°)?)?\\s*(?:de)?\\s*" +
    `(?:-|/|\\s*(?:de|,)?\\s*)` +
    `(${matchAnyPattern(MONTH_DICTIONARY$5)})` +
    `(?:\\s*(?:de|,)?\\s*(${YEAR_PATTERN$3}))?` +
    `(?=\\W|$)`, "i");
const DATE_GROUP$7 = 1;
const DATE_TO_GROUP$5 = 2;
const MONTH_NAME_GROUP$8 = 3;
const YEAR_GROUP$a = 4;
class ESMonthNameLittleEndianParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$w;
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        const month = MONTH_DICTIONARY$5[match[MONTH_NAME_GROUP$8].toLowerCase()];
        const day = parseInt(match[DATE_GROUP$7]);
        if (day > 31) {
            match.index = match.index + match[DATE_GROUP$7].length;
            return null;
        }
        result.start.assign("month", month);
        result.start.assign("day", day);
        if (match[YEAR_GROUP$a]) {
            const yearNumber = parseYear$4(match[YEAR_GROUP$a]);
            result.start.assign("year", yearNumber);
        }
        else {
            const year = findYearClosestToRef(context.refDate, day, month);
            result.start.imply("year", year);
        }
        if (match[DATE_TO_GROUP$5]) {
            const endDate = parseInt(match[DATE_TO_GROUP$5]);
            result.end = result.start.clone();
            result.end.assign("day", endDate);
        }
        return result;
    }
}

class ESCasualDateParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return /(ahora|hoy|mañana|ayer)(?=\W|$)/i;
    }
    innerExtract(context, match) {
        const lowerText = match[0].toLowerCase();
        const component = context.createParsingComponents();
        switch (lowerText) {
            case "ahora":
                return now(context.reference);
            case "hoy":
                return today(context.reference);
            case "mañana":
                return tomorrow(context.reference);
            case "ayer":
                return yesterday(context.reference);
        }
        return component;
    }
}

class ESCasualTimeParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return /(?:esta\s*)?(mañana|tarde|medianoche|mediodia|mediodía|noche)(?=\W|$)/i;
    }
    innerExtract(context, match) {
        const targetDate = context.refDate;
        const component = context.createParsingComponents();
        switch (match[1].toLowerCase()) {
            case "tarde":
                component.imply("meridiem", Meridiem.PM);
                component.imply("hour", 15);
                component.addTag("casualReference/afternoon");
                break;
            case "noche":
                component.imply("meridiem", Meridiem.PM);
                component.imply("hour", 22);
                component.addTag("casualReference/evening");
                break;
            case "mañana":
                component.imply("meridiem", Meridiem.AM);
                component.imply("hour", 6);
                component.addTag("casualReference/morning");
                break;
            case "medianoche":
                const nextDay = new Date(targetDate.getTime());
                nextDay.setDate(nextDay.getDate() + 1);
                assignSimilarDate(component, nextDay);
                implySimilarTime(component, nextDay);
                component.imply("hour", 0);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.addTag("casualReference/midnight");
                break;
            case "mediodia":
            case "mediodía":
                component.imply("meridiem", Meridiem.AM);
                component.imply("hour", 12);
                component.addTag("casualReference/noon");
                break;
        }
        return component;
    }
}

class ESTimeUnitWithinFormatParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return new RegExp(`(?:en|por|durante|de|dentro de)\\s*(${TIME_UNITS_PATTERN$5})(?=\\W|$)`, "i");
    }
    innerExtract(context, match) {
        const timeUnits = parseDuration$5(match[1]);
        return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
    }
}

const casual$6 = new Chrono(createCasualConfiguration$5());
const strict$6 = new Chrono(createConfiguration$5(true));
function parse$6(text, ref, option) {
    return casual$6.parse(text, ref, option);
}
function parseDate$6(text, ref, option) {
    return casual$6.parseDate(text, ref, option);
}
function createCasualConfiguration$5(littleEndian = true) {
    const option = createConfiguration$5(false, littleEndian);
    option.parsers.push(new ESCasualDateParser());
    option.parsers.push(new ESCasualTimeParser());
    return option;
}
function createConfiguration$5(strictMode = true, littleEndian = true) {
    return includeCommonConfiguration({
        parsers: [
            new SlashDateFormatParser(littleEndian),
            new ESWeekdayParser(),
            new ESTimeExpressionParser(),
            new ESMonthNameLittleEndianParser(),
            new ESTimeUnitWithinFormatParser(),
        ],
        refiners: [new ESMergeDateTimeRefiner(), new ESMergeDateRangeRefiner()],
    }, strictMode);
}

var index$5 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Chrono: Chrono,
	ParsingResult: ParsingResult,
	ParsingComponents: ParsingComponents,
	ReferenceWithTimezone: ReferenceWithTimezone,
	get Meridiem () { return Meridiem; },
	get Weekday () { return Weekday; },
	casual: casual$6,
	strict: strict$6,
	parse: parse$6,
	parseDate: parseDate$6,
	createCasualConfiguration: createCasualConfiguration$5,
	createConfiguration: createConfiguration$5
});

const REGEX_PARTS = {
    leftBoundary: "([^\\p{L}\\p{N}_]|^)",
    rightBoundary: "(?=[^\\p{L}\\p{N}_]|$)",
    flags: "iu",
};
const WEEKDAY_DICTIONARY$4 = {
    "неділя": 0,
    "неділі": 0,
    "неділю": 0,
    "нд": 0,
    "нд.": 0,
    "понеділок": 1,
    "понеділка": 1,
    "пн": 1,
    "пн.": 1,
    "вівторок": 2,
    "вівторка": 2,
    "вт": 2,
    "вт.": 2,
    "середа": 3,
    "середи": 3,
    "середу": 3,
    "ср": 3,
    "ср.": 3,
    "четвер": 4,
    "четверга": 4,
    "четвергу": 4,
    "чт": 4,
    "чт.": 4,
    "п'ятниця": 5,
    "п'ятниці": 5,
    "п'ятницю": 5,
    "пт": 5,
    "пт.": 5,
    "субота": 6,
    "суботи": 6,
    "суботу": 6,
    "сб": 6,
    "сб.": 6,
};
const FULL_MONTH_NAME_DICTIONARY$1 = {
    "січень": 1,
    "січня": 1,
    "січні": 1,
    "лютий": 2,
    "лютого": 2,
    "лютому": 2,
    "березень": 3,
    "березня": 3,
    "березні": 3,
    "квітень": 4,
    "квітня": 4,
    "квітні": 4,
    "травень": 5,
    "травня": 5,
    "травні": 5,
    "червень": 6,
    "червня": 6,
    "червні": 6,
    "липень": 7,
    "липня": 7,
    "липні": 7,
    "серпень": 8,
    "серпня": 8,
    "серпні": 8,
    "вересень": 9,
    "вересня": 9,
    "вересні": 9,
    "жовтень": 10,
    "жовтня": 10,
    "жовтні": 10,
    "листопад": 11,
    "листопада": 11,
    "листопаду": 11,
    "грудень": 12,
    "грудня": 12,
    "грудні": 12,
};
const MONTH_DICTIONARY$4 = {
    ...FULL_MONTH_NAME_DICTIONARY$1,
    "січ": 1,
    "січ.": 1,
    "лют": 2,
    "лют.": 2,
    "бер": 3,
    "бер.": 3,
    "квіт": 4,
    "квіт.": 4,
    "трав": 5,
    "трав.": 5,
    "черв": 6,
    "черв.": 6,
    "лип": 7,
    "лип.": 7,
    "серп": 8,
    "серп.": 8,
    "сер": 8,
    "cер.": 8,
    "вер": 9,
    "вер.": 9,
    "верес": 9,
    "верес.": 9,
    "жовт": 10,
    "жовт.": 10,
    "листоп": 11,
    "листоп.": 11,
    "груд": 12,
    "груд.": 12,
};
const INTEGER_WORD_DICTIONARY$4 = {
    "один": 1,
    "одна": 1,
    "одної": 1,
    "одну": 1,
    "дві": 2,
    "два": 2,
    "двох": 2,
    "три": 3,
    "трьох": 3,
    "чотири": 4,
    "чотирьох": 4,
    "п'ять": 5,
    "п'яти": 5,
    "шість": 6,
    "шести": 6,
    "сім": 7,
    "семи": 7,
    "вісім": 8,
    "восьми": 8,
    "дев'ять": 9,
    "дев'яти": 9,
    "десять": 10,
    "десяти": 10,
    "одинадцять": 11,
    "одинадцяти": 11,
    "дванадцять": 12,
    "дванадцяти": 12,
};
const ORDINAL_WORD_DICTIONARY$1 = {
    "перше": 1,
    "першого": 1,
    "друге": 2,
    "другого": 2,
    "третє": 3,
    "третього": 3,
    "четверте": 4,
    "четвертого": 4,
    "п'яте": 5,
    "п'ятого": 5,
    "шосте": 6,
    "шостого": 6,
    "сьоме": 7,
    "сьомого": 7,
    "восьме": 8,
    "восьмого": 8,
    "дев'яте": 9,
    "дев'ятого": 9,
    "десяте": 10,
    "десятого": 10,
    "одинадцяте": 11,
    "одинадцятого": 11,
    "дванадцяте": 12,
    "дванадцятого": 12,
    "тринадцяте": 13,
    "тринадцятого": 13,
    "чотирнадцяте": 14,
    "чотинрнадцятого": 14,
    "п'ятнадцяте": 15,
    "п'ятнадцятого": 15,
    "шістнадцяте": 16,
    "шістнадцятого": 16,
    "сімнадцяте": 17,
    "сімнадцятого": 17,
    "вісімнадцяте": 18,
    "вісімнадцятого": 18,
    "дев'ятнадцяте": 19,
    "дев'ятнадцятого": 19,
    "двадцяте": 20,
    "двадцятого": 20,
    "двадцять перше": 21,
    "двадцять першого": 21,
    "двадцять друге": 22,
    "двадцять другого": 22,
    "двадцять третє": 23,
    "двадцять третього": 23,
    "двадцять четверте": 24,
    "двадцять четвертого": 24,
    "двадцять п'яте": 25,
    "двадцять п'ятого": 25,
    "двадцять шосте": 26,
    "двадцять шостого": 26,
    "двадцять сьоме": 27,
    "двадцять сьомого": 27,
    "двадцять восьме": 28,
    "двадцять восьмого": 28,
    "двадцять дев'яте": 29,
    "двадцять дев'ятого": 29,
    "тридцяте": 30,
    "тридцятого": 30,
    "тридцять перше": 31,
    "тридцять першого": 31,
};
const TIME_UNIT_DICTIONARY$4 = {
    сек: "second",
    секунда: "second",
    секунд: "second",
    секунди: "second",
    секунду: "second",
    секундочок: "second",
    секундочки: "second",
    секундочку: "second",
    хв: "minute",
    хвилина: "minute",
    хвилин: "minute",
    хвилини: "minute",
    хвилину: "minute",
    хвилинок: "minute",
    хвилинки: "minute",
    хвилинку: "minute",
    хвилиночок: "minute",
    хвилиночки: "minute",
    хвилиночку: "minute",
    год: "hour",
    година: "hour",
    годин: "hour",
    години: "hour",
    годину: "hour",
    годинка: "hour",
    годинок: "hour",
    годинки: "hour",
    годинку: "hour",
    день: "day",
    дня: "day",
    днів: "day",
    дні: "day",
    доба: "day",
    добу: "day",
    тиждень: "week",
    тижню: "week",
    тижня: "week",
    тижні: "week",
    тижнів: "week",
    місяць: "month",
    місяців: "month",
    місяці: "month",
    місяця: "month",
    квартал: "quarter",
    кварталу: "quarter",
    квартала: "quarter",
    кварталів: "quarter",
    кварталі: "quarter",
    рік: "year",
    року: "year",
    році: "year",
    років: "year",
    роки: "year",
};
const NUMBER_PATTERN$4 = `(?:${matchAnyPattern(INTEGER_WORD_DICTIONARY$4)}|[0-9]+|[0-9]+\\.[0-9]+|пів|декілька|пар(?:у)|\\s{0,3})`;
function parseNumberPattern$4(match) {
    const num = match.toLowerCase();
    if (INTEGER_WORD_DICTIONARY$4[num] !== undefined) {
        return INTEGER_WORD_DICTIONARY$4[num];
    }
    if (num.match(/декілька/)) {
        return 2;
    }
    else if (num.match(/пів/)) {
        return 0.5;
    }
    else if (num.match(/пар/)) {
        return 2;
    }
    else if (num === "") {
        return 1;
    }
    return parseFloat(num);
}
const ORDINAL_NUMBER_PATTERN$1 = `(?:${matchAnyPattern(ORDINAL_WORD_DICTIONARY$1)}|[0-9]{1,2}(?:го|ого|е)?)`;
function parseOrdinalNumberPattern$1(match) {
    const num = match.toLowerCase();
    if (ORDINAL_WORD_DICTIONARY$1[num] !== undefined) {
        return ORDINAL_WORD_DICTIONARY$1[num];
    }
    return parseInt(num);
}
const year = "(?:\\s+(?:року|рік|р|р.))?";
const YEAR_PATTERN$2 = `(?:[1-9][0-9]{0,3}${year}\\s*(?:н.е.|до н.е.|н. е.|до н. е.)|[1-2][0-9]{3}${year}|[5-9][0-9]${year})`;
function parseYearPattern(match) {
    if (/(рік|року|р|р.)/i.test(match)) {
        match = match.replace(/(рік|року|р|р.)/i, "");
    }
    if (/(до н.е.|до н. е.)/i.test(match)) {
        match = match.replace(/(до н.е.|до н. е.)/i, "");
        return -parseInt(match);
    }
    if (/(н. е.|н.е.)/i.test(match)) {
        match = match.replace(/(н. е.|н.е.)/i, "");
        return parseInt(match);
    }
    const rawYearNumber = parseInt(match);
    return findMostLikelyADYear(rawYearNumber);
}
const SINGLE_TIME_UNIT_PATTERN$4 = `(${NUMBER_PATTERN$4})\\s{0,3}(${matchAnyPattern(TIME_UNIT_DICTIONARY$4)})`;
const SINGLE_TIME_UNIT_REGEX$4 = new RegExp(SINGLE_TIME_UNIT_PATTERN$4, "i");
const TIME_UNITS_PATTERN$4 = repeatedTimeunitPattern(`(?:(?:близько|приблизно)\\s{0,3})?`, SINGLE_TIME_UNIT_PATTERN$4);
function parseDuration$4(timeunitText) {
    const fragments = {};
    let remainingText = timeunitText;
    let match = SINGLE_TIME_UNIT_REGEX$4.exec(remainingText);
    while (match) {
        collectDateTimeFragment$3(fragments, match);
        remainingText = remainingText.substring(match[0].length).trim();
        match = SINGLE_TIME_UNIT_REGEX$4.exec(remainingText);
    }
    return fragments;
}
function collectDateTimeFragment$3(fragments, match) {
    const num = parseNumberPattern$4(match[1]);
    const unit = TIME_UNIT_DICTIONARY$4[match[2].toLowerCase()];
    fragments[unit] = num;
}

const PATTERN$v = `(?:(?:приблизно|орієнтовно)\\s*(?:~\\s*)?)?(${TIME_UNITS_PATTERN$4})${REGEX_PARTS.rightBoundary}`;
class UKTimeUnitWithinFormatParser extends AbstractParserWithWordBoundaryChecking {
    patternLeftBoundary() {
        return REGEX_PARTS.leftBoundary;
    }
    innerPattern(context) {
        return context.option.forwardDate
            ? new RegExp(PATTERN$v, "i")
            : new RegExp(`(?:протягом|на протязі|протягом|упродовж|впродовж)\\s*${PATTERN$v}`, REGEX_PARTS.flags);
    }
    innerExtract(context, match) {
        const timeUnits = parseDuration$4(match[1]);
        return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
    }
}

class AbstractParserWithLeftBoundaryChecking extends AbstractParserWithWordBoundaryChecking {
    patternLeftBoundary() {
        return REGEX_PARTS.leftBoundary;
    }
    innerPattern(context) {
        return new RegExp(this.innerPatternString(context), REGEX_PARTS.flags);
    }
    innerPatternHasChange(context, currentInnerPattern) {
        return false;
    }
}
class AbstractParserWithLeftRightBoundaryChecking extends AbstractParserWithLeftBoundaryChecking {
    innerPattern(context) {
        return new RegExp(`${this.innerPatternString(context)}${REGEX_PARTS.rightBoundary}`, REGEX_PARTS.flags);
    }
}

const DATE_GROUP$6 = 1;
const DATE_TO_GROUP$4 = 2;
const MONTH_NAME_GROUP$7 = 3;
const YEAR_GROUP$9 = 4;
class UKMonthNameLittleEndianParser extends AbstractParserWithLeftRightBoundaryChecking {
    innerPatternString(context) {
        return (`(?:з|із)?\\s*(${ORDINAL_NUMBER_PATTERN$1})` +
            `(?:` +
            `\\s{0,3}(?:по|-|–|до)?\\s{0,3}` +
            `(${ORDINAL_NUMBER_PATTERN$1})` +
            `)?` +
            `(?:-|\\/|\\s{0,3}(?:of)?\\s{0,3})` +
            `(${matchAnyPattern(MONTH_DICTIONARY$4)})` +
            `(?:` +
            `(?:-|\\/|,?\\s{0,3})` +
            `(${YEAR_PATTERN$2}(?![^\\s]\\d))` +
            `)?`);
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        const month = MONTH_DICTIONARY$4[match[MONTH_NAME_GROUP$7].toLowerCase()];
        const day = parseOrdinalNumberPattern$1(match[DATE_GROUP$6]);
        if (day > 31) {
            match.index = match.index + match[DATE_GROUP$6].length;
            return null;
        }
        result.start.assign("month", month);
        result.start.assign("day", day);
        if (match[YEAR_GROUP$9]) {
            const yearNumber = parseYearPattern(match[YEAR_GROUP$9]);
            result.start.assign("year", yearNumber);
        }
        else {
            const year = findYearClosestToRef(context.reference.instant, day, month);
            result.start.imply("year", year);
        }
        if (match[DATE_TO_GROUP$4]) {
            const endDate = parseOrdinalNumberPattern$1(match[DATE_TO_GROUP$4]);
            result.end = result.start.clone();
            result.end.assign("day", endDate);
        }
        return result;
    }
}

const MONTH_NAME_GROUP$6 = 2;
const YEAR_GROUP$8 = 3;
class UkMonthNameParser extends AbstractParserWithLeftBoundaryChecking {
    innerPatternString(context) {
        return (`((?:в|у)\\s*)?` +
            `(${matchAnyPattern(MONTH_DICTIONARY$4)})` +
            `\\s*` +
            `(?:` +
            `[,-]?\\s*(${YEAR_PATTERN$2})?` +
            `)?` +
            `(?=[^\\s\\w]|\\s+[^0-9]|\\s+$|$)`);
    }
    innerExtract(context, match) {
        const monthName = match[MONTH_NAME_GROUP$6].toLowerCase();
        if (match[0].length <= 3 && !FULL_MONTH_NAME_DICTIONARY$1[monthName]) {
            return null;
        }
        const result = context.createParsingResult(match.index, match.index + match[0].length);
        result.start.imply("day", 1);
        const month = MONTH_DICTIONARY$4[monthName];
        result.start.assign("month", month);
        if (match[YEAR_GROUP$8]) {
            const year = parseYearPattern(match[YEAR_GROUP$8]);
            result.start.assign("year", year);
        }
        else {
            const year = findYearClosestToRef(context.reference.instant, 1, month);
            result.start.imply("year", year);
        }
        return result;
    }
}

class UKTimeExpressionParser extends AbstractTimeExpressionParser {
    constructor(strictMode) {
        super(strictMode);
    }
    patternFlags() {
        return REGEX_PARTS.flags;
    }
    primaryPatternLeftBoundary() {
        return `(^|\\s|T|(?:[^\\p{L}\\p{N}_]))`;
    }
    followingPhase() {
        return `\\s*(?:\\-|\\–|\\~|\\〜|до|і|по|\\?)\\s*`;
    }
    primaryPrefix() {
        return `(?:(?:в|у|о|об|з|із|від)\\s*)??`;
    }
    primarySuffix() {
        return `(?:\\s*(?:ранку|вечора|по обіді|після обіду))?(?!\\/)${REGEX_PARTS.rightBoundary}`;
    }
    extractPrimaryTimeComponents(context, match) {
        const components = super.extractPrimaryTimeComponents(context, match);
        if (components) {
            if (match[0].endsWith("вечора")) {
                const hour = components.get("hour");
                if (hour >= 6 && hour < 12) {
                    components.assign("hour", components.get("hour") + 12);
                    components.assign("meridiem", Meridiem.PM);
                }
                else if (hour < 6) {
                    components.assign("meridiem", Meridiem.AM);
                }
            }
            if (match[0].endsWith("по обіді") || match[0].endsWith("після обіду")) {
                components.assign("meridiem", Meridiem.PM);
                const hour = components.get("hour");
                if (hour >= 0 && hour <= 6) {
                    components.assign("hour", components.get("hour") + 12);
                }
            }
            if (match[0].endsWith("ранку")) {
                components.assign("meridiem", Meridiem.AM);
                const hour = components.get("hour");
                if (hour < 12) {
                    components.assign("hour", components.get("hour"));
                }
            }
        }
        return components;
    }
}

class UKTimeUnitAgoFormatParser extends AbstractParserWithLeftBoundaryChecking {
    innerPatternString(context) {
        return `(${TIME_UNITS_PATTERN$4})\\s{0,5}тому(?=(?:\\W|$))`;
    }
    innerExtract(context, match) {
        const timeUnits = parseDuration$4(match[1]);
        const outputTimeUnits = reverseDuration(timeUnits);
        return ParsingComponents.createRelativeFromReference(context.reference, outputTimeUnits);
    }
}

class UKMergeDateRangeRefiner extends AbstractMergeDateRangeRefiner {
    patternBetween() {
        return /^\s*(і до|і по|до|по|-)\s*$/i;
    }
}

class UKMergeDateTimeRefiner extends AbstractMergeDateTimeRefiner {
    patternBetween() {
        return new RegExp(`^\\s*(T|в|у|о|,|-)?\\s*$`);
    }
}

class UKCasualDateParser extends AbstractParserWithLeftRightBoundaryChecking {
    innerPatternString(context) {
        return `(?:з|із|від)?\\s*(сьогодні|вчора|завтра|післязавтра|післяпіслязавтра|позапозавчора|позавчора)`;
    }
    innerExtract(context, match) {
        const lowerText = match[1].toLowerCase();
        const component = context.createParsingComponents();
        switch (lowerText) {
            case "сьогодні":
                return today(context.reference);
            case "вчора":
                return yesterday(context.reference);
            case "завтра":
                return tomorrow(context.reference);
            case "післязавтра":
                return theDayAfter(context.reference, 2);
            case "післяпіслязавтра":
                return theDayAfter(context.reference, 3);
            case "позавчора":
                return theDayBefore(context.reference, 2);
            case "позапозавчора":
                return theDayBefore(context.reference, 3);
        }
        return component;
    }
}

class UKCasualTimeParser extends AbstractParserWithLeftRightBoundaryChecking {
    innerPatternString(context) {
        return `(зараз|минулого\\s*вечора|минулої\\s*ночі|наступної\\s*ночі|сьогодні\\s*вночі|цієї\\s*ночі|цього ранку|вранці|ранку|зранку|опівдні|ввечері|вечора|опівночі|вночі)`;
    }
    innerExtract(context, match) {
        let targetDate = context.refDate;
        const lowerText = match[0].toLowerCase();
        const component = context.createParsingComponents();
        if (lowerText === "зараз") {
            return now(context.reference);
        }
        if (lowerText === "ввечері" || lowerText === "вечора") {
            return evening(context.reference);
        }
        if (lowerText.endsWith("вранці") || lowerText.endsWith("ранку") || lowerText.endsWith("зранку")) {
            return morning(context.reference);
        }
        if (lowerText.endsWith("опівдні")) {
            return noon(context.reference);
        }
        if (lowerText.match(/минулої\s*ночі/)) {
            return lastNight(context.reference);
        }
        if (lowerText.match(/минулого\s*вечора/)) {
            return yesterdayEvening(context.reference);
        }
        if (lowerText.match(/наступної\s*ночі/)) {
            const daysToAdd = targetDate.getHours() < 22 ? 1 : 2;
            const nextDay = new Date(targetDate.getTime());
            nextDay.setDate(nextDay.getDate() + daysToAdd);
            assignSimilarDate(component, nextDay);
            component.imply("hour", 1);
        }
        if (lowerText.match(/цієї\s*ночі/)) {
            return midnight(context.reference);
        }
        if (lowerText.endsWith("опівночі") || lowerText.endsWith("вночі")) {
            return midnight(context.reference);
        }
        return component;
    }
}

const PREFIX_GROUP$4 = 1;
const WEEKDAY_GROUP$4 = 2;
const POSTFIX_GROUP$1 = 3;
class UKWeekdayParser extends AbstractParserWithLeftRightBoundaryChecking {
    innerPatternString(context) {
        return (`(?:(?:,|\\(|（)\\s*)?` +
            `(?:в\\s*?)?` +
            `(?:у\\s*?)?` +
            `(?:(цей|минулого|минулий|попередній|попереднього|наступного|наступний|наступному)\\s*)?` +
            `(${matchAnyPattern(WEEKDAY_DICTIONARY$4)})` +
            `(?:\\s*(?:,|\\)|）))?` +
            `(?:\\s*(на|у|в)\\s*(цьому|минулому|наступному)\\s*тижні)?`);
    }
    innerExtract(context, match) {
        const dayOfWeek = match[WEEKDAY_GROUP$4].toLocaleLowerCase();
        const weekday = WEEKDAY_DICTIONARY$4[dayOfWeek];
        const prefix = match[PREFIX_GROUP$4];
        const postfix = match[POSTFIX_GROUP$1];
        let modifierWord = prefix || postfix;
        modifierWord = modifierWord || "";
        modifierWord = modifierWord.toLocaleLowerCase();
        let modifier = null;
        if (modifierWord == "минулого" ||
            modifierWord == "минулий" ||
            modifierWord == "попередній" ||
            modifierWord == "попереднього") {
            modifier = "last";
        }
        else if (modifierWord == "наступного" || modifierWord == "наступний") {
            modifier = "next";
        }
        else if (modifierWord == "цей" || modifierWord == "цього" || modifierWord == "цьому") {
            modifier = "this";
        }
        return createParsingComponentsAtWeekday(context.reference, weekday, modifier);
    }
}

const MODIFIER_WORD_GROUP$1 = 1;
const RELATIVE_WORD_GROUP$1 = 2;
class UKRelativeDateFormatParser extends AbstractParserWithLeftRightBoundaryChecking {
    innerPatternString(context) {
        return (`(в минулому|у минулому|на минулому|минулого|на наступному|в наступному|у наступному|наступного|на цьому|в цьому|у цьому|цього)\\s*` +
            `(${matchAnyPattern(TIME_UNIT_DICTIONARY$4)})(?=\\s*)`);
    }
    innerExtract(context, match) {
        const modifier = match[MODIFIER_WORD_GROUP$1].toLowerCase();
        const unitWord = match[RELATIVE_WORD_GROUP$1].toLowerCase();
        const timeunit = TIME_UNIT_DICTIONARY$4[unitWord];
        if (modifier == "на наступному" ||
            modifier == "в наступному" ||
            modifier == "у наступному" ||
            modifier == "наступного") {
            const timeUnits = {};
            timeUnits[timeunit] = 1;
            return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
        }
        if (modifier == "на минулому" ||
            modifier == "в минулому" ||
            modifier == "у минулому" ||
            modifier == "минулого") {
            const timeUnits = {};
            timeUnits[timeunit] = -1;
            return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
        }
        const components = context.createParsingComponents();
        let date = new Date(context.reference.instant.getTime());
        if (timeunit.match(/week/i)) {
            date.setDate(date.getDate() - date.getDay());
            components.imply("day", date.getDate());
            components.imply("month", date.getMonth() + 1);
            components.imply("year", date.getFullYear());
        }
        else if (timeunit.match(/month/i)) {
            date.setDate(1);
            components.imply("day", date.getDate());
            components.assign("year", date.getFullYear());
            components.assign("month", date.getMonth() + 1);
        }
        else if (timeunit.match(/year/i)) {
            date.setDate(1);
            date.setMonth(0);
            components.imply("day", date.getDate());
            components.imply("month", date.getMonth() + 1);
            components.assign("year", date.getFullYear());
        }
        return components;
    }
}

class UKTimeUnitCasualRelativeFormatParser extends AbstractParserWithLeftRightBoundaryChecking {
    innerPatternString(context) {
        return `(ці|останні|минулі|майбутні|наступні|після|через|\\+|-)\\s*(${TIME_UNITS_PATTERN$4})`;
    }
    innerExtract(context, match) {
        const prefix = match[1].toLowerCase();
        let timeUnits = parseDuration$4(match[3]);
        switch (prefix) {
            case "останні":
            case "минулі":
            case "-":
                timeUnits = reverseDuration(timeUnits);
                break;
        }
        return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
    }
}

const casual$5 = new Chrono(createCasualConfiguration$4());
const strict$5 = new Chrono(createConfiguration$4(true));
function createCasualConfiguration$4() {
    const option = createConfiguration$4(false);
    option.parsers.unshift(new UKCasualDateParser());
    option.parsers.unshift(new UKCasualTimeParser());
    option.parsers.unshift(new UkMonthNameParser());
    option.parsers.unshift(new UKRelativeDateFormatParser());
    option.parsers.unshift(new UKTimeUnitCasualRelativeFormatParser());
    return option;
}
function createConfiguration$4(strictMode) {
    return includeCommonConfiguration({
        parsers: [
            new ISOFormatParser(),
            new SlashDateFormatParser(true),
            new UKTimeUnitWithinFormatParser(),
            new UKMonthNameLittleEndianParser(),
            new UKWeekdayParser(),
            new UKTimeExpressionParser(strictMode),
            new UKTimeUnitAgoFormatParser(),
        ],
        refiners: [new UKMergeDateTimeRefiner(), new UKMergeDateRangeRefiner()],
    }, strictMode);
}
function parse$5(text, ref, option) {
    return casual$5.parse(text, ref, option);
}
function parseDate$5(text, ref, option) {
    return casual$5.parseDate(text, ref, option);
}

var index$4 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Chrono: Chrono,
	ParsingResult: ParsingResult,
	ParsingComponents: ParsingComponents,
	ReferenceWithTimezone: ReferenceWithTimezone,
	get Meridiem () { return Meridiem; },
	get Weekday () { return Weekday; },
	casual: casual$5,
	strict: strict$5,
	createCasualConfiguration: createCasualConfiguration$4,
	createConfiguration: createConfiguration$4,
	parse: parse$5,
	parseDate: parseDate$5
});

const WEEKDAY_DICTIONARY$3 = {
    "domenica": 0,
    "dom": 0,
    "lunedì": 1,
    "lun": 1,
    "martedì": 2,
    "mar": 2,
    "mercoledì": 3,
    "merc": 3,
    "giovedì": 4,
    "giov": 4,
    "venerdì": 5,
    "ven": 5,
    "sabato": 6,
    "sab": 6,
};
const FULL_MONTH_NAME_DICTIONARY = {};
const MONTH_DICTIONARY$3 = {
    ...FULL_MONTH_NAME_DICTIONARY,
    "gennaio": 1,
    "gen": 1,
    "gen.": 1,
    "febbraio": 2,
    "feb": 2,
    "feb.": 2,
    "febraio": 2,
    "febb": 2,
    "febb.": 2,
    "marzo": 3,
    "mar": 3,
    "mar.": 3,
    "aprile": 4,
    "apr": 4,
    "apr.": 4,
    "maggio": 5,
    "mag": 5,
    "giugno": 6,
    "giu": 6,
    "luglio": 7,
    "lug": 7,
    "lugl": 7,
    "lug.": 7,
    "agosto": 8,
    "ago": 8,
    "settembre": 9,
    "set": 9,
    "set.": 9,
    "sett": 9,
    "sett.": 9,
    "ottobre": 10,
    "ott": 10,
    "ott.": 10,
    "novembre": 11,
    "nov": 11,
    "nov.": 11,
    "dicembre": 12,
    "dic": 12,
    "dice": 12,
    "dic.": 12,
};
const INTEGER_WORD_DICTIONARY$3 = {
    "uno": 1,
    "due": 2,
    "tre": 3,
    "quattro": 4,
    "cinque": 5,
    "sei": 6,
    "sette": 7,
    "otto": 8,
    "nove": 9,
    "dieci": 10,
    "undici": 11,
    "dodici": 12,
};
const ORDINAL_WORD_DICTIONARY = {
    "primo": 1,
    "secondo": 2,
    "terzo": 3,
    "quarto": 4,
    "quinto": 5,
    "sesto": 6,
    "settimo": 7,
    "ottavo": 8,
    "nono": 9,
    "decimo": 10,
    "undicesimo": 11,
    "dodicesimo": 12,
    "tredicesimo": 13,
    "quattordicesimo": 14,
    "quindicesimo": 15,
    "sedicesimo": 16,
    "diciassettesimo": 17,
    "diciottesimo": 18,
    "diciannovesimo": 19,
    "ventesimo": 20,
    "ventunesimo": 21,
    "ventiduesimo": 22,
    "ventitreesimo": 23,
    "ventiquattresimo": 24,
    "venticinquesimo": 25,
    "ventiseiesimo": 26,
    "ventisettesimo": 27,
    "ventottesimo": 28,
    "ventinovesimo": 29,
    "trentesimo": 30,
    "trentunesimo": 31,
};
const TIME_UNIT_DICTIONARY$3 = {
    "sec": "second",
    "secondo": "second",
    "secondi": "second",
    "min": "minute",
    "mins": "minute",
    "minuti": "minute",
    "h": "hour",
    "hr": "hour",
    "o": "hour",
    "ora": "hour",
    "ore": "hour",
    "giorno": "day",
    "giorni": "day",
    "settimana": "week",
    "settimane": "week",
    "mese": "month",
    "trimestre": "quarter",
    "trimestri": "quarter",
    "anni": "year",
    "anno": "year",
};
const NUMBER_PATTERN$3 = `(?:${matchAnyPattern(INTEGER_WORD_DICTIONARY$3)}|[0-9]+|[0-9]+\\.[0-9]+|half(?:\\s{0,2}un?)?|un?\\b(?:\\s{0,2}qualcuno)?|qualcuno|molti|a?\\s{0,2}alcuni\\s{0,2}(?:of)?)`;
function parseNumberPattern$3(match) {
    const num = match.toLowerCase();
    if (INTEGER_WORD_DICTIONARY$3[num] !== undefined) {
        return INTEGER_WORD_DICTIONARY$3[num];
    }
    else if (num === "un" || num === "una") {
        return 1;
    }
    else if (num.match(/alcuni/)) {
        return 3;
    }
    else if (num.match(/metá/)) {
        return 0.5;
    }
    else if (num.match(/paio/)) {
        return 2;
    }
    else if (num.match(/molti/)) {
        return 7;
    }
    return parseFloat(num);
}
const ORDINAL_NUMBER_PATTERN = `(?:${matchAnyPattern(ORDINAL_WORD_DICTIONARY)}|[0-9]{1,2}(?:mo|ndo|rzo|simo|esimo)?)`;
function parseOrdinalNumberPattern(match) {
    let num = match.toLowerCase();
    if (ORDINAL_WORD_DICTIONARY[num] !== undefined) {
        return ORDINAL_WORD_DICTIONARY[num];
    }
    num = num.replace(/(?:imo|ndo|rzo|rto|nto|sto|tavo|nono|cimo|timo|esimo)$/i, "");
    return parseInt(num);
}
const YEAR_PATTERN$1 = `(?:[1-9][0-9]{0,3}\\s{0,2}(?:BE|AD|BC|BCE|CE)|[1-2][0-9]{3}|[5-9][0-9])`;
function parseYear$3(match) {
    if (/BE/i.test(match)) {
        match = match.replace(/BE/i, "");
        return parseInt(match) - 543;
    }
    if (/BCE?/i.test(match)) {
        match = match.replace(/BCE?/i, "");
        return -parseInt(match);
    }
    if (/(AD|CE)/i.test(match)) {
        match = match.replace(/(AD|CE)/i, "");
        return parseInt(match);
    }
    const rawYearNumber = parseInt(match);
    return findMostLikelyADYear(rawYearNumber);
}
const SINGLE_TIME_UNIT_PATTERN$3 = `(${NUMBER_PATTERN$3})\\s{0,3}(${matchAnyPattern(TIME_UNIT_DICTIONARY$3)})`;
const SINGLE_TIME_UNIT_REGEX$3 = new RegExp(SINGLE_TIME_UNIT_PATTERN$3, "i");
const TIME_UNITS_PATTERN$3 = repeatedTimeunitPattern(`(?:(?:about|around)\\s{0,3})?`, SINGLE_TIME_UNIT_PATTERN$3);
function parseDuration$3(timeunitText) {
    const fragments = {};
    let remainingText = timeunitText;
    let match = SINGLE_TIME_UNIT_REGEX$3.exec(remainingText);
    while (match) {
        collectDateTimeFragment$2(fragments, match);
        remainingText = remainingText.substring(match[0].length).trim();
        match = SINGLE_TIME_UNIT_REGEX$3.exec(remainingText);
    }
    return fragments;
}
function collectDateTimeFragment$2(fragments, match) {
    const num = parseNumberPattern$3(match[1]);
    const unit = TIME_UNIT_DICTIONARY$3[match[2].toLowerCase()];
    fragments[unit] = num;
}

const PATTERN_WITH_PREFIX = new RegExp(`(?:within|in|for)\\s*` +
    `(?:(?:più o meno|intorno|approssimativamente|verso|verso le)\\s*(?:~\\s*)?)?(${TIME_UNITS_PATTERN$3})(?=\\W|$)`, "i");
const PATTERN_WITHOUT_PREFIX = new RegExp(`(?:(?:più o meno|intorno|approssimativamente|verso|verso le)\\s*(?:~\\s*)?)?(${TIME_UNITS_PATTERN$3})(?=\\W|$)`, "i");
class ENTimeUnitWithinFormatParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return context.option.forwardDate ? PATTERN_WITHOUT_PREFIX : PATTERN_WITH_PREFIX;
    }
    innerExtract(context, match) {
        const timeUnits = parseDuration$3(match[1]);
        return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
    }
}

const PATTERN$u = new RegExp(`(?:on\\s{0,3})?` +
    `(${ORDINAL_NUMBER_PATTERN})` +
    `(?:` +
    `\\s{0,3}(?:al|\\-|\\–|fino|alle|allo)?\\s{0,3}` +
    `(${ORDINAL_NUMBER_PATTERN})` +
    ")?" +
    `(?:-|/|\\s{0,3}(?:dal)?\\s{0,3})` +
    `(${matchAnyPattern(MONTH_DICTIONARY$3)})` +
    "(?:" +
    `(?:-|/|,?\\s{0,3})` +
    `(${YEAR_PATTERN$1}(?![^\\s]\\d))` +
    ")?" +
    "(?=\\W|$)", "i");
const DATE_GROUP$5 = 1;
const DATE_TO_GROUP$3 = 2;
const MONTH_NAME_GROUP$5 = 3;
const YEAR_GROUP$7 = 4;
class ENMonthNameLittleEndianParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$u;
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        const month = MONTH_DICTIONARY$3[match[MONTH_NAME_GROUP$5].toLowerCase()];
        const day = parseOrdinalNumberPattern(match[DATE_GROUP$5]);
        if (day > 31) {
            match.index = match.index + match[DATE_GROUP$5].length;
            return null;
        }
        result.start.assign("month", month);
        result.start.assign("day", day);
        if (match[YEAR_GROUP$7]) {
            const yearNumber = parseYear$3(match[YEAR_GROUP$7]);
            result.start.assign("year", yearNumber);
        }
        else {
            const year = findYearClosestToRef(context.refDate, day, month);
            result.start.imply("year", year);
        }
        if (match[DATE_TO_GROUP$3]) {
            const endDate = parseOrdinalNumberPattern(match[DATE_TO_GROUP$3]);
            result.end = result.start.clone();
            result.end.assign("day", endDate);
        }
        return result;
    }
}

const PATTERN$t = new RegExp(`(${matchAnyPattern(MONTH_DICTIONARY$3)})` +
    "(?:-|/|\\s*,?\\s*)" +
    `(${ORDINAL_NUMBER_PATTERN})(?!\\s*(?:am|pm))\\s*` +
    "(?:" +
    "(?:al|\\-|\\alle|\\del|\\s)\\s*" +
    `(${ORDINAL_NUMBER_PATTERN})\\s*` +
    ")?" +
    "(?:" +
    "(?:-|/|\\s*,?\\s*)" +
    `(${YEAR_PATTERN$1})` +
    ")?" +
    "(?=\\W|$)(?!\\:\\d)", "i");
const MONTH_NAME_GROUP$4 = 1;
const DATE_GROUP$4 = 2;
const DATE_TO_GROUP$2 = 3;
const YEAR_GROUP$6 = 4;
class ENMonthNameMiddleEndianParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$t;
    }
    innerExtract(context, match) {
        const month = MONTH_DICTIONARY$3[match[MONTH_NAME_GROUP$4].toLowerCase()];
        const day = parseOrdinalNumberPattern(match[DATE_GROUP$4]);
        if (day > 31) {
            return null;
        }
        const components = context.createParsingComponents({
            day: day,
            month: month,
        });
        if (match[YEAR_GROUP$6]) {
            const year = parseYear$3(match[YEAR_GROUP$6]);
            components.assign("year", year);
        }
        else {
            const year = findYearClosestToRef(context.refDate, day, month);
            components.imply("year", year);
        }
        if (!match[DATE_TO_GROUP$2]) {
            return components;
        }
        const endDate = parseOrdinalNumberPattern(match[DATE_TO_GROUP$2]);
        const result = context.createParsingResult(match.index, match[0]);
        result.start = components;
        result.end = components.clone();
        result.end.assign("day", endDate);
        return result;
    }
}

const PATTERN$s = new RegExp(`((?:in)\\s*)?` +
    `(${matchAnyPattern(MONTH_DICTIONARY$3)})` +
    `\\s*` +
    `(?:` +
    `[,-]?\\s*(${YEAR_PATTERN$1})?` +
    ")?" +
    "(?=[^\\s\\w]|\\s+[^0-9]|\\s+$|$)", "i");
const PREFIX_GROUP$3 = 1;
const MONTH_NAME_GROUP$3 = 2;
const YEAR_GROUP$5 = 3;
class ENMonthNameParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$s;
    }
    innerExtract(context, match) {
        const monthName = match[MONTH_NAME_GROUP$3].toLowerCase();
        if (match[0].length <= 3 && !FULL_MONTH_NAME_DICTIONARY[monthName]) {
            return null;
        }
        const result = context.createParsingResult(match.index + (match[PREFIX_GROUP$3] || "").length, match.index + match[0].length);
        result.start.imply("day", 1);
        const month = MONTH_DICTIONARY$3[monthName];
        result.start.assign("month", month);
        if (match[YEAR_GROUP$5]) {
            const year = parseYear$3(match[YEAR_GROUP$5]);
            result.start.assign("year", year);
        }
        else {
            const year = findYearClosestToRef(context.refDate, 1, month);
            result.start.imply("year", year);
        }
        return result;
    }
}

const PATTERN$r = new RegExp(`([0-9]{4})[\\.\\/\\s]` +
    `(?:(${matchAnyPattern(MONTH_DICTIONARY$3)})|([0-9]{1,2}))[\\.\\/\\s]` +
    `([0-9]{1,2})` +
    "(?=\\W|$)", "i");
const YEAR_NUMBER_GROUP = 1;
const MONTH_NAME_GROUP$2 = 2;
const MONTH_NUMBER_GROUP = 3;
const DATE_NUMBER_GROUP = 4;
class ENCasualYearMonthDayParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$r;
    }
    innerExtract(context, match) {
        const month = match[MONTH_NUMBER_GROUP]
            ? parseInt(match[MONTH_NUMBER_GROUP])
            : MONTH_DICTIONARY$3[match[MONTH_NAME_GROUP$2].toLowerCase()];
        if (month < 1 || month > 12) {
            return null;
        }
        const year = parseInt(match[YEAR_NUMBER_GROUP]);
        const day = parseInt(match[DATE_NUMBER_GROUP]);
        return {
            day: day,
            month: month,
            year: year,
        };
    }
}

const PATTERN$q = new RegExp("([0-9]|0[1-9]|1[012])/([0-9]{4})" + "", "i");
const MONTH_GROUP$2 = 1;
const YEAR_GROUP$4 = 2;
class ENSlashMonthFormatParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$q;
    }
    innerExtract(context, match) {
        const year = parseInt(match[YEAR_GROUP$4]);
        const month = parseInt(match[MONTH_GROUP$2]);
        return context.createParsingComponents().imply("day", 1).assign("month", month).assign("year", year);
    }
}

class ENTimeExpressionParser extends AbstractTimeExpressionParser {
    constructor(strictMode) {
        super(strictMode);
    }
    followingPhase() {
        return "\\s*(?:\\-|\\–|\\~|\\〜|to|\\?)\\s*";
    }
    primaryPrefix() {
        return "(?:(?:alle|dalle)\\s*)??";
    }
    primarySuffix() {
        return "(?:\\s*(?:in punto|o\\W*in punto|(?:di|del|della|in|al|alla|alle)\\s*(?:mattina|pomeriggio|sera)))?(?!/)(?=\\W|$)";
    }
    extractPrimaryTimeComponents(context, match) {
        const components = super.extractPrimaryTimeComponents(context, match);
        if (components) {
            if (match[0].endsWith("sera")) {
                const hour = components.get("hour");
                if (hour >= 6 && hour < 12) {
                    components.assign("hour", components.get("hour") + 12);
                    components.assign("meridiem", Meridiem.PM);
                }
                else if (hour < 6) {
                    components.assign("meridiem", Meridiem.AM);
                }
            }
            if (match[0].endsWith("pomeriggio")) {
                components.assign("meridiem", Meridiem.PM);
                const hour = components.get("hour");
                if (hour >= 0 && hour <= 6) {
                    components.assign("hour", components.get("hour") + 12);
                }
            }
            if (match[0].endsWith("mattina")) {
                components.assign("meridiem", Meridiem.AM);
                const hour = components.get("hour");
                if (hour < 12) {
                    components.assign("hour", components.get("hour"));
                }
            }
        }
        return components;
    }
}

const PATTERN$p = new RegExp(`(${TIME_UNITS_PATTERN$3})\\s{0,5}(?:fa|prima|precedente)(?=(?:\\W|$))`, "i");
const STRICT_PATTERN$1 = new RegExp(`(${TIME_UNITS_PATTERN$3})\\s{0,5}fa(?=(?:\\W|$))`, "i");
class ENTimeUnitAgoFormatParser extends AbstractParserWithWordBoundaryChecking {
    strictMode;
    constructor(strictMode) {
        super();
        this.strictMode = strictMode;
    }
    innerPattern() {
        return this.strictMode ? STRICT_PATTERN$1 : PATTERN$p;
    }
    innerExtract(context, match) {
        const timeUnits = parseDuration$3(match[1]);
        const outputTimeUnits = reverseDuration(timeUnits);
        return ParsingComponents.createRelativeFromReference(context.reference, outputTimeUnits);
    }
}

const PATTERN$o = new RegExp(`(${TIME_UNITS_PATTERN$3})\\s{0,5}(?:dopo|più tardi|da adesso|avanti|oltre|a seguire)` + "(?=(?:\\W|$))", "i");
const STRICT_PATTERN = new RegExp("" + "(" + TIME_UNITS_PATTERN$3 + ")" + "(dopo|più tardi)" + "(?=(?:\\W|$))", "i");
const GROUP_NUM_TIMEUNITS = 1;
class ENTimeUnitLaterFormatParser extends AbstractParserWithWordBoundaryChecking {
    strictMode;
    constructor(strictMode) {
        super();
        this.strictMode = strictMode;
    }
    innerPattern() {
        return this.strictMode ? STRICT_PATTERN : PATTERN$o;
    }
    innerExtract(context, match) {
        const fragments = parseDuration$3(match[GROUP_NUM_TIMEUNITS]);
        return ParsingComponents.createRelativeFromReference(context.reference, fragments);
    }
}

class ENMergeDateRangeRefiner extends AbstractMergeDateRangeRefiner {
    patternBetween() {
        return /^\s*(to|-)\s*$/i;
    }
}

class ENMergeDateTimeRefiner extends AbstractMergeDateTimeRefiner {
    patternBetween() {
        return new RegExp("^\\s*(T|alle|dopo|prima|il|di|del|delle|,|-)?\\s*$");
    }
}

const PATTERN$n = /(ora|oggi|stasera|questa sera|domani|dmn|ieri\s*sera)(?=\W|$)/i;
class ITCasualDateParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return PATTERN$n;
    }
    innerExtract(context, match) {
        let targetDate = context.refDate;
        const lowerText = match[0].toLowerCase();
        const component = context.createParsingComponents();
        switch (lowerText) {
            case "ora":
                return now(context.reference);
            case "oggi":
                return today(context.reference);
            case "ieri":
                return yesterday(context.reference);
            case "domani":
            case "dmn":
                return tomorrow(context.reference);
            case "stasera":
            case "questa sera":
                return tonight(context.reference);
            default:
                if (lowerText.match(/ieri\s*sera/)) {
                    if (targetDate.getHours() > 6) {
                        const previousDay = new Date(targetDate.getTime());
                        previousDay.setDate(previousDay.getDate() - 1);
                        targetDate = previousDay;
                    }
                    assignSimilarDate(component, targetDate);
                    component.imply("hour", 0);
                }
                break;
        }
        return component;
    }
}

const PATTERN$m = /(?:questo|questa)?\s{0,3}(mattina|pomeriggio|sera|notte|mezzanotte|mezzogiorno)(?=\W|$)/i;
class ITCasualTimeParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$m;
    }
    innerExtract(context, match) {
        const targetDate = context.refDate;
        const component = context.createParsingComponents();
        switch (match[1].toLowerCase()) {
            case "pomeriggio":
                component.imply("meridiem", Meridiem.PM);
                component.imply("hour", 15);
                break;
            case "sera":
            case "notte":
                component.imply("meridiem", Meridiem.PM);
                component.imply("hour", 20);
                break;
            case "mezzanotte":
                const nextDay = new Date(targetDate.getTime());
                nextDay.setDate(nextDay.getDate() + 1);
                assignSimilarDate(component, nextDay);
                implySimilarTime(component, nextDay);
                component.imply("hour", 0);
                component.imply("minute", 0);
                component.imply("second", 0);
                break;
            case "mattina":
                component.imply("meridiem", Meridiem.AM);
                component.imply("hour", 6);
                break;
            case "mezzogiorno":
                component.imply("meridiem", Meridiem.AM);
                component.imply("hour", 12);
                break;
        }
        return component;
    }
}

const PATTERN$l = new RegExp("(?:(?:\\,|\\(|\\（)\\s*)?" +
    "(?:il\\s*?)?" +
    "(?:(questa|l'ultima|scorsa|prossima)\\s*)?" +
    `(${matchAnyPattern(WEEKDAY_DICTIONARY$3)})` +
    "(?:\\s*(?:\\,|\\)|\\）))?" +
    "(?:\\s*(questa|l'ultima|scorsa|prossima)\\s*settimana)?" +
    "(?=\\W|$)", "i");
const PREFIX_GROUP$2 = 1;
const WEEKDAY_GROUP$3 = 2;
const POSTFIX_GROUP = 3;
class ITWeekdayParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$l;
    }
    innerExtract(context, match) {
        const dayOfWeek = match[WEEKDAY_GROUP$3].toLowerCase();
        const weekday = WEEKDAY_DICTIONARY$3[dayOfWeek];
        const prefix = match[PREFIX_GROUP$2];
        const postfix = match[POSTFIX_GROUP];
        let modifierWord = prefix || postfix;
        modifierWord = modifierWord || "";
        modifierWord = modifierWord.toLowerCase();
        let modifier = null;
        if (modifierWord == "ultima" || modifierWord == "scorsa") {
            modifier = "ultima";
        }
        else if (modifierWord == "prossima") {
            modifier = "prossima";
        }
        else if (modifierWord == "questa") {
            modifier = "questa";
        }
        return createParsingComponentsAtWeekday(context.reference, weekday, modifier);
    }
}

const PATTERN$k = new RegExp(`(questo|ultimo|scorso|prossimo|dopo\\s*questo|questa|ultima|scorsa|prossima\\s*questa)\\s*(${matchAnyPattern(TIME_UNIT_DICTIONARY$3)})(?=\\s*)` + "(?=\\W|$)", "i");
const MODIFIER_WORD_GROUP = 1;
const RELATIVE_WORD_GROUP = 2;
class ITRelativeDateFormatParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$k;
    }
    innerExtract(context, match) {
        const modifier = match[MODIFIER_WORD_GROUP].toLowerCase();
        const unitWord = match[RELATIVE_WORD_GROUP].toLowerCase();
        const timeunit = TIME_UNIT_DICTIONARY$3[unitWord];
        if (modifier == "prossimo" || modifier.startsWith("dopo")) {
            const timeUnits = {};
            timeUnits[timeunit] = 1;
            return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
        }
        if (modifier == "prima" || modifier == "precedente") {
            const timeUnits = {};
            timeUnits[timeunit] = -1;
            return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
        }
        const components = context.createParsingComponents();
        let date = new Date(context.reference.instant.getTime());
        if (unitWord.match(/settimana/i)) {
            date.setDate(date.getDate() - date.getDay());
            components.imply("day", date.getDate());
            components.imply("month", date.getMonth() + 1);
            components.imply("year", date.getFullYear());
        }
        else if (unitWord.match(/mese/i)) {
            date.setDate(1);
            components.imply("day", date.getDate());
            components.assign("year", date.getFullYear());
            components.assign("month", date.getMonth() + 1);
        }
        else if (unitWord.match(/anno/i)) {
            date.setDate(1);
            date.setMonth(0);
            components.imply("day", date.getDate());
            components.imply("month", date.getMonth() + 1);
            components.assign("year", date.getFullYear());
        }
        return components;
    }
}

const PATTERN$j = new RegExp(`(questo|ultimo|passato|prossimo|dopo|questa|ultima|passata|prossima|\\+|-)\\s*(${TIME_UNITS_PATTERN$3})(?=\\W|$)`, "i");
class ENTimeUnitCasualRelativeFormatParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$j;
    }
    innerExtract(context, match) {
        const prefix = match[1].toLowerCase();
        let timeUnits = parseDuration$3(match[2]);
        switch (prefix) {
            case "last":
            case "past":
            case "-":
                timeUnits = reverseDuration(timeUnits);
                break;
        }
        return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
    }
}

function hasImpliedEarlierReferenceDate(result) {
    return result.text.match(/\s+(prima|dal)$/i) != null;
}
function hasImpliedLaterReferenceDate(result) {
    return result.text.match(/\s+(dopo|dal|fino)$/i) != null;
}
class ENMergeRelativeDateRefiner extends MergingRefiner {
    patternBetween() {
        return /^\s*$/i;
    }
    shouldMergeResults(textBetween, currentResult, nextResult) {
        if (!textBetween.match(this.patternBetween())) {
            return false;
        }
        if (!hasImpliedEarlierReferenceDate(currentResult) && !hasImpliedLaterReferenceDate(currentResult)) {
            return false;
        }
        return !!nextResult.start.get("day") && !!nextResult.start.get("month") && !!nextResult.start.get("year");
    }
    mergeResults(textBetween, currentResult, nextResult) {
        let timeUnits = parseDuration$3(currentResult.text);
        if (hasImpliedEarlierReferenceDate(currentResult)) {
            timeUnits = reverseDuration(timeUnits);
        }
        const components = ParsingComponents.createRelativeFromReference(ReferenceWithTimezone.fromDate(nextResult.start.date()), timeUnits);
        return new ParsingResult(nextResult.reference, currentResult.index, `${currentResult.text}${textBetween}${nextResult.text}`, components);
    }
}

const casual$4 = new Chrono(createCasualConfiguration$3(false));
const strict$4 = new Chrono(createConfiguration$3(true, false));
const GB = new Chrono(createConfiguration$3(false, true));
function parse$4(text, ref, option) {
    return casual$4.parse(text, ref, option);
}
function parseDate$4(text, ref, option) {
    return casual$4.parseDate(text, ref, option);
}
function createCasualConfiguration$3(littleEndian = false) {
    const option = createConfiguration$3(false, littleEndian);
    option.parsers.unshift(new ITCasualDateParser());
    option.parsers.unshift(new ITCasualTimeParser());
    option.parsers.unshift(new ENMonthNameParser());
    option.parsers.unshift(new ITRelativeDateFormatParser());
    option.parsers.unshift(new ENTimeUnitCasualRelativeFormatParser());
    return option;
}
function createConfiguration$3(strictMode = true, littleEndian = false) {
    return includeCommonConfiguration({
        parsers: [
            new SlashDateFormatParser(littleEndian),
            new ENTimeUnitWithinFormatParser(),
            new ENMonthNameLittleEndianParser(),
            new ENMonthNameMiddleEndianParser(),
            new ITWeekdayParser(),
            new ENCasualYearMonthDayParser(),
            new ENSlashMonthFormatParser(),
            new ENTimeExpressionParser(strictMode),
            new ENTimeUnitAgoFormatParser(strictMode),
            new ENTimeUnitLaterFormatParser(strictMode),
        ],
        refiners: [new ENMergeRelativeDateRefiner(), new ENMergeDateTimeRefiner(), new ENMergeDateRangeRefiner()],
    }, strictMode);
}

var index$3 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	casual: casual$4,
	strict: strict$4,
	GB: GB,
	parse: parse$4,
	parseDate: parseDate$4,
	createCasualConfiguration: createCasualConfiguration$3,
	createConfiguration: createConfiguration$3
});

const WEEKDAY_DICTIONARY$2 = {
    "söndag": 0,
    "sön": 0,
    "so": 0,
    "måndag": 1,
    "mån": 1,
    "må": 1,
    "tisdag": 2,
    "tis": 2,
    "ti": 2,
    "onsdag": 3,
    "ons": 3,
    "on": 3,
    "torsdag": 4,
    "tors": 4,
    "to": 4,
    "fredag": 5,
    "fre": 5,
    "fr": 5,
    "lördag": 6,
    "lör": 6,
    "lö": 6,
};
const MONTH_DICTIONARY$2 = {
    "januari": 1,
    "jan": 1,
    "jan.": 1,
    "februari": 2,
    "feb": 2,
    "feb.": 2,
    "mars": 3,
    "mar": 3,
    "mar.": 3,
    "april": 4,
    "apr": 4,
    "apr.": 4,
    "maj": 5,
    "juni": 6,
    "jun": 6,
    "jun.": 6,
    "juli": 7,
    "jul": 7,
    "jul.": 7,
    "augusti": 8,
    "aug": 8,
    "aug.": 8,
    "september": 9,
    "sep": 9,
    "sep.": 9,
    "sept": 9,
    "oktober": 10,
    "okt": 10,
    "okt.": 10,
    "november": 11,
    "nov": 11,
    "nov.": 11,
    "december": 12,
    "dec": 12,
    "dec.": 12,
};
const ORDINAL_NUMBER_DICTIONARY = {
    "första": 1,
    "andra": 2,
    "tredje": 3,
    "fjärde": 4,
    "femte": 5,
    "sjätte": 6,
    "sjunde": 7,
    "åttonde": 8,
    "nionde": 9,
    "tionde": 10,
    "elfte": 11,
    "tolfte": 12,
    "trettonde": 13,
    "fjortonde": 14,
    "femtonde": 15,
    "sextonde": 16,
    "sjuttonde": 17,
    "artonde": 18,
    "nittonde": 19,
    "tjugonde": 20,
    "tjugoförsta": 21,
    "tjugoandra": 22,
    "tjugotredje": 23,
    "tjugofjärde": 24,
    "tjugofemte": 25,
    "tjugosjätte": 26,
    "tjugosjunde": 27,
    "tjugoåttonde": 28,
    "tjugonionde": 29,
    "trettionde": 30,
    "trettioförsta": 31,
};
const INTEGER_WORD_DICTIONARY$2 = {
    "en": 1,
    "ett": 1,
    "två": 2,
    "tre": 3,
    "fyra": 4,
    "fem": 5,
    "sex": 6,
    "sju": 7,
    "åtta": 8,
    "nio": 9,
    "tio": 10,
    "elva": 11,
    "tolv": 12,
    "tretton": 13,
    "fjorton": 14,
    "femton": 15,
    "sexton": 16,
    "sjutton": 17,
    "arton": 18,
    "nitton": 19,
    "tjugo": 20,
    "trettiо": 30,
    "fyrtio": 40,
    "femtio": 50,
    "sextio": 60,
    "sjuttio": 70,
    "åttio": 80,
    "nittio": 90,
    "hundra": 100,
    "tusen": 1000,
};
const TIME_UNIT_DICTIONARY$2 = {
    "sek": "second",
    "sekund": "second",
    "sekunder": "second",
    "min": "minute",
    "minut": "minute",
    "minuter": "minute",
    "tim": "hour",
    "timme": "hour",
    "timmar": "hour",
    "dag": "day",
    "dagar": "day",
    "vecka": "week",
    "veckor": "week",
    "mån": "month",
    "månad": "month",
    "månader": "month",
    "år": "year",
    "kvartаl": "quarter",
    "kvartal": "quarter",
};
const TIME_UNIT_NO_ABBR_DICTIONARY$1 = {
    "sekund": "second",
    "sekunder": "second",
    "minut": "minute",
    "minuter": "minute",
    "timme": "hour",
    "timmar": "hour",
    "dag": "day",
    "dagar": "day",
    "vecka": "week",
    "veckor": "week",
    "månad": "month",
    "månader": "month",
    "år": "year",
    "kvartal": "quarter",
};
function parseDuration$2(timeunitText) {
    const fragments = {};
    let remainingText = timeunitText;
    let match = SINGLE_TIME_UNIT_REGEX$2.exec(remainingText);
    while (match) {
        collectDateTimeFragment$1(fragments, match);
        remainingText = remainingText.substring(match[0].length);
        match = SINGLE_TIME_UNIT_REGEX$2.exec(remainingText);
    }
    return fragments;
}
function collectDateTimeFragment$1(fragments, match) {
    const num = parseNumberPattern$2(match[1]);
    const unit = TIME_UNIT_DICTIONARY$2[match[2].toLowerCase()];
    fragments[unit] = num;
}
const NUMBER_PATTERN$2 = `(?:${matchAnyPattern(INTEGER_WORD_DICTIONARY$2)}|\\d+)`;
`(?:${matchAnyPattern(ORDINAL_NUMBER_DICTIONARY)}|\\d{1,2}(?:e|:e))`;
`(?:${matchAnyPattern(TIME_UNIT_DICTIONARY$2)})`;
const SINGLE_TIME_UNIT_PATTERN$2 = `(${NUMBER_PATTERN$2})\\s{0,5}(${matchAnyPattern(TIME_UNIT_DICTIONARY$2)})\\s{0,5}`;
const SINGLE_TIME_UNIT_REGEX$2 = new RegExp(SINGLE_TIME_UNIT_PATTERN$2, "i");
const SINGLE_TIME_UNIT_NO_ABBR_PATTERN$1 = `(${NUMBER_PATTERN$2})\\s{0,5}(${matchAnyPattern(TIME_UNIT_NO_ABBR_DICTIONARY$1)})\\s{0,5}`;
const TIME_UNITS_PATTERN$2 = repeatedTimeunitPattern("", SINGLE_TIME_UNIT_PATTERN$2);
const TIME_UNITS_NO_ABBR_PATTERN$1 = repeatedTimeunitPattern("", SINGLE_TIME_UNIT_NO_ABBR_PATTERN$1);
function parseNumberPattern$2(match) {
    const num = match.toLowerCase();
    if (INTEGER_WORD_DICTIONARY$2[num] !== undefined) {
        return INTEGER_WORD_DICTIONARY$2[num];
    }
    return parseInt(num);
}
function parseYear$2(match) {
    if (/\d+/.test(match)) {
        let yearNumber = parseInt(match);
        if (yearNumber < 100) {
            yearNumber = findMostLikelyADYear(yearNumber);
        }
        return yearNumber;
    }
    const num = match.toLowerCase();
    if (INTEGER_WORD_DICTIONARY$2[num] !== undefined) {
        return INTEGER_WORD_DICTIONARY$2[num];
    }
    return parseInt(match);
}

const PATTERN$i = new RegExp("(?:(?:\\,|\\(|\\（)\\s*)?" +
    "(?:på\\s*?)?" +
    "(?:(förra|senaste|nästa|kommande)\\s*)?" +
    `(${matchAnyPattern(WEEKDAY_DICTIONARY$2)})` +
    "(?:\\s*(?:\\,|\\)|\\）))?" +
    "(?:\\s*(förra|senaste|nästa|kommande)\\s*vecka)?" +
    "(?=\\W|$)", "i");
const PREFIX_GROUP$1 = 1;
const SUFFIX_GROUP$1 = 3;
const WEEKDAY_GROUP$2 = 2;
class SVWeekdayParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$i;
    }
    innerExtract(context, match) {
        const dayOfWeek = match[WEEKDAY_GROUP$2].toLowerCase();
        const offset = WEEKDAY_DICTIONARY$2[dayOfWeek];
        const prefix = match[PREFIX_GROUP$1];
        const postfix = match[SUFFIX_GROUP$1];
        let modifierWord = prefix || postfix;
        modifierWord = modifierWord || "";
        modifierWord = modifierWord.toLowerCase();
        let modifier = null;
        if (modifierWord.match(/förra|senaste/)) {
            modifier = "last";
        }
        else if (modifierWord.match(/nästa|kommande/)) {
            modifier = "next";
        }
        return createParsingComponentsAtWeekday(context.reference, offset, modifier);
    }
}

const PATTERN$h = new RegExp("(?:den\\s*?)?" +
    `([0-9]{1,2})` +
    `(?:\\s*(?:till|\\-|\\–|\\s)\\s*([0-9]{1,2}))?\\s*` +
    `(${matchAnyPattern(MONTH_DICTIONARY$2)})` +
    `(?:(?:-|/|,?\\s*)([0-9]{4}(?![^\\s]\\d)))?` +
    `(?=\\W|$)`, "i");
const DATE_GROUP$3 = 1;
const DATE_TO_GROUP$1 = 2;
const MONTH_NAME_GROUP$1 = 3;
const YEAR_GROUP$3 = 4;
class SVMonthNameLittleEndianParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$h;
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        const month = MONTH_DICTIONARY$2[match[MONTH_NAME_GROUP$1].toLowerCase()];
        const day = parseInt(match[DATE_GROUP$3]);
        if (day > 31) {
            match.index = match.index + match[DATE_GROUP$3].length;
            return null;
        }
        result.start.assign("month", month);
        result.start.assign("day", day);
        if (match[YEAR_GROUP$3]) {
            const yearNumber = parseYear$2(match[YEAR_GROUP$3]);
            result.start.assign("year", yearNumber);
        }
        else {
            const year = findYearClosestToRef(context.refDate, day, month);
            result.start.imply("year", year);
        }
        if (match[DATE_TO_GROUP$1]) {
            const endDate = parseInt(match[DATE_TO_GROUP$1]);
            result.end = result.start.clone();
            result.end.assign("day", endDate);
        }
        return result;
    }
}

const PATTERN$g = new RegExp(`(denna|den här|förra|passerade|nästa|kommande|efter|\\+|-)\\s*(${TIME_UNITS_PATTERN$2})(?=\\W|$)`, "i");
const PATTERN_NO_ABBR$1 = new RegExp(`(denna|den här|förra|passerade|nästa|kommande|efter|\\+|-)\\s*(${TIME_UNITS_NO_ABBR_PATTERN$1})(?=\\W|$)`, "i");
class SVTimeUnitCasualRelativeFormatParser extends AbstractParserWithWordBoundaryChecking {
    allowAbbreviations;
    constructor(allowAbbreviations = true) {
        super();
        this.allowAbbreviations = allowAbbreviations;
    }
    innerPattern() {
        return this.allowAbbreviations ? PATTERN$g : PATTERN_NO_ABBR$1;
    }
    innerExtract(context, match) {
        const prefix = match[1].toLowerCase();
        let duration = parseDuration$2(match[2]);
        if (!duration) {
            return null;
        }
        switch (prefix) {
            case "förra":
            case "passerade":
            case "-":
                duration = reverseDuration(duration);
                break;
        }
        return ParsingComponents.createRelativeFromReference(context.reference, duration);
    }
}

const PATTERN$f = new RegExp(`(nu|idag|imorgon|övermorgon|igår|förrgår|i\\s*förrgår)` +
    `(?:\\s*(?:på\\s*)?(morgonen?|förmiddagen?|middagen?|eftermiddagen?|kvällen?|natten?|midnatt))?` +
    `(?=\\W|$)`, "i");
const DATE_GROUP$2 = 1;
const TIME_GROUP$1 = 2;
class SVCasualDateParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return PATTERN$f;
    }
    innerExtract(context, match) {
        const targetDate = context.refDate;
        const dateKeyword = (match[DATE_GROUP$2] || "").toLowerCase();
        const timeKeyword = (match[TIME_GROUP$1] || "").toLowerCase();
        let component = context.createParsingComponents();
        switch (dateKeyword) {
            case "nu":
                component = now(context.reference);
                break;
            case "idag":
                component = today(context.reference);
                break;
            case "imorgon":
            case "imorn":
                const nextDay = new Date(targetDate.getTime());
                nextDay.setDate(nextDay.getDate() + 1);
                assignSimilarDate(component, nextDay);
                implySimilarTime(component, nextDay);
                break;
            case "igår":
                const previousDay = new Date(targetDate.getTime());
                previousDay.setDate(previousDay.getDate() - 1);
                assignSimilarDate(component, previousDay);
                implySimilarTime(component, previousDay);
                break;
            case "förrgår":
            case "i förrgår":
                const twoDaysAgo = new Date(targetDate.getTime());
                twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
                assignSimilarDate(component, twoDaysAgo);
                implySimilarTime(component, twoDaysAgo);
                break;
        }
        switch (timeKeyword) {
            case "morgon":
            case "morgonen":
                component.imply("hour", 6);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("millisecond", 0);
                break;
            case "förmiddag":
            case "förmiddagen":
                component.imply("hour", 9);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("millisecond", 0);
                break;
            case "middag":
            case "middagen":
                component.imply("hour", 12);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("millisecond", 0);
                break;
            case "eftermiddag":
            case "eftermiddagen":
                component.imply("hour", 15);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("millisecond", 0);
                break;
            case "kväll":
            case "kvällen":
                component.imply("hour", 20);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("millisecond", 0);
                break;
            case "natt":
            case "natten":
            case "midnatt":
                if (timeKeyword === "midnatt") {
                    component.imply("hour", 0);
                }
                else {
                    component.imply("hour", 2);
                }
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("millisecond", 0);
                break;
        }
        return component;
    }
}

const casual$3 = new Chrono(createCasualConfiguration$2());
const strict$3 = new Chrono(createConfiguration$2(true));
function parse$3(text, ref, option) {
    return casual$3.parse(text, ref, option);
}
function parseDate$3(text, ref, option) {
    return casual$3.parseDate(text, ref, option);
}
function createCasualConfiguration$2(littleEndian = true) {
    const option = createConfiguration$2(false, littleEndian);
    option.parsers.unshift(new SVCasualDateParser());
    return option;
}
function createConfiguration$2(strictMode = true, littleEndian = true) {
    return includeCommonConfiguration({
        parsers: [
            new ISOFormatParser(),
            new SlashDateFormatParser(littleEndian),
            new SVMonthNameLittleEndianParser(),
            new SVWeekdayParser(),
            new SVTimeUnitCasualRelativeFormatParser(),
        ],
        refiners: [],
    }, strictMode);
}

var index$2 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Chrono: Chrono,
	ParsingResult: ParsingResult,
	ParsingComponents: ParsingComponents,
	ReferenceWithTimezone: ReferenceWithTimezone,
	get Meridiem () { return Meridiem; },
	get Weekday () { return Weekday; },
	casual: casual$3,
	strict: strict$3,
	parse: parse$3,
	parseDate: parseDate$3,
	createCasualConfiguration: createCasualConfiguration$2,
	createConfiguration: createConfiguration$2
});

class FITimeExpressionParser extends AbstractTimeExpressionParser {
    primaryPrefix() {
        return "(?:(?:klo|kello)\\s*)?";
    }
    followingPhase() {
        return "\\s*(?:\\-|\\–|\\~|\\〜)\\s*";
    }
    extractPrimaryTimeComponents(context, match) {
        if (match[0].match(/^\s*\d{4}\s*$/)) {
            return null;
        }
        return super.extractPrimaryTimeComponents(context, match);
    }
}

const WEEKDAY_DICTIONARY$1 = {
    "sunnuntai": 0,
    "sunnuntaina": 0,
    "su": 0,
    "maanantai": 1,
    "maanantaina": 1,
    "ma": 1,
    "tiistai": 2,
    "tiistaina": 2,
    "ti": 2,
    "keskiviikko": 3,
    "keskiviikkona": 3,
    "ke": 3,
    "torstai": 4,
    "torstaina": 4,
    "to": 4,
    "perjantai": 5,
    "perjantaina": 5,
    "pe": 5,
    "lauantai": 6,
    "lauantaina": 6,
    "la": 6,
};
const MONTH_DICTIONARY$1 = {
    "tammikuu": 1,
    "tammikuuta": 1,
    "tammikuun": 1,
    "tammi": 1,
    "helmikuu": 2,
    "helmikuuta": 2,
    "helmikuun": 2,
    "helmi": 2,
    "maaliskuu": 3,
    "maaliskuuta": 3,
    "maaliskuun": 3,
    "maalis": 3,
    "huhtikuu": 4,
    "huhtikuuta": 4,
    "huhtikuun": 4,
    "huhti": 4,
    "toukokuu": 5,
    "toukokuuta": 5,
    "toukokuun": 5,
    "touko": 5,
    "kesäkuu": 6,
    "kesäkuuta": 6,
    "kesäkuun": 6,
    "kesä": 6,
    "heinäkuu": 7,
    "heinäkuuta": 7,
    "heinäkuun": 7,
    "heinä": 7,
    "elokuu": 8,
    "elokuuta": 8,
    "elokuun": 8,
    "elo": 8,
    "syyskuu": 9,
    "syyskuuta": 9,
    "syyskuun": 9,
    "syys": 9,
    "lokakuu": 10,
    "lokakuuta": 10,
    "lokakuun": 10,
    "loka": 10,
    "marraskuu": 11,
    "marraskuuta": 11,
    "marraskuun": 11,
    "marras": 11,
    "joulukuu": 12,
    "joulukuuta": 12,
    "joulukuun": 12,
    "joulu": 12,
};
const INTEGER_WORD_DICTIONARY$1 = {
    "yksi": 1,
    "yhden": 1,
    "kaksi": 2,
    "kahden": 2,
    "kolme": 3,
    "kolmen": 3,
    "neljä": 4,
    "neljän": 4,
    "viisi": 5,
    "viiden": 5,
    "kuusi": 6,
    "kuuden": 6,
    "seitsemän": 7,
    "kahdeksan": 8,
    "yhdeksän": 9,
    "kymmenen": 10,
};
const TIME_UNIT_DICTIONARY$1 = {
    "s": "second",
    "sek": "second",
    "sekunti": "second",
    "sekuntia": "second",
    "sekunnin": "second",
    "min": "minute",
    "minuutti": "minute",
    "minuuttia": "minute",
    "minuutin": "minute",
    "t": "hour",
    "tunti": "hour",
    "tuntia": "hour",
    "tunnin": "hour",
    "pv": "day",
    "päivä": "day",
    "päivää": "day",
    "päivän": "day",
    "vk": "week",
    "viikko": "week",
    "viikkoa": "week",
    "viikon": "week",
    "kk": "month",
    "kuukausi": "month",
    "kuukautta": "month",
    "kuukauden": "month",
    "vuosi": "year",
    "vuotta": "year",
    "vuoden": "year",
};
const TIME_UNIT_NO_ABBR_DICTIONARY = {
    "sekunti": "second",
    "sekuntia": "second",
    "sekunnin": "second",
    "minuutti": "minute",
    "minuuttia": "minute",
    "minuutin": "minute",
    "tunti": "hour",
    "tuntia": "hour",
    "tunnin": "hour",
    "päivä": "day",
    "päivää": "day",
    "päivän": "day",
    "viikko": "week",
    "viikkoa": "week",
    "viikon": "week",
    "kuukausi": "month",
    "kuukautta": "month",
    "kuukauden": "month",
    "vuosi": "year",
    "vuotta": "year",
    "vuoden": "year",
};
function parseDuration$1(timeunitText) {
    const fragments = {};
    let remainingText = timeunitText;
    let match = SINGLE_TIME_UNIT_REGEX$1.exec(remainingText);
    while (match) {
        collectDateTimeFragment(fragments, match);
        remainingText = remainingText.substring(match[0].length);
        match = SINGLE_TIME_UNIT_REGEX$1.exec(remainingText);
    }
    return fragments;
}
function collectDateTimeFragment(fragments, match) {
    const num = parseNumberPattern$1(match[1]);
    const unit = TIME_UNIT_DICTIONARY$1[match[2].toLowerCase()];
    fragments[unit] = num;
}
const NUMBER_PATTERN$1 = `(?:${matchAnyPattern(INTEGER_WORD_DICTIONARY$1)}|\\d+)`;
`(?:${matchAnyPattern(TIME_UNIT_DICTIONARY$1)})`;
const SINGLE_TIME_UNIT_PATTERN$1 = `(${NUMBER_PATTERN$1})\\s{0,5}(${matchAnyPattern(TIME_UNIT_DICTIONARY$1)})\\s{0,5}`;
const SINGLE_TIME_UNIT_REGEX$1 = new RegExp(SINGLE_TIME_UNIT_PATTERN$1, "i");
const SINGLE_TIME_UNIT_NO_ABBR_PATTERN = `(${NUMBER_PATTERN$1})\\s{0,5}(${matchAnyPattern(TIME_UNIT_NO_ABBR_DICTIONARY)})\\s{0,5}`;
const TIME_UNITS_PATTERN$1 = repeatedTimeunitPattern("", SINGLE_TIME_UNIT_PATTERN$1);
const TIME_UNITS_NO_ABBR_PATTERN = repeatedTimeunitPattern("", SINGLE_TIME_UNIT_NO_ABBR_PATTERN);
function parseNumberPattern$1(match) {
    const num = match.toLowerCase();
    if (INTEGER_WORD_DICTIONARY$1[num] !== undefined) {
        return INTEGER_WORD_DICTIONARY$1[num];
    }
    return parseInt(num);
}
function parseYear$1(match) {
    if (/\d+/.test(match)) {
        let yearNumber = parseInt(match);
        if (yearNumber < 100) {
            yearNumber = findMostLikelyADYear(yearNumber);
        }
        return yearNumber;
    }
    const num = match.toLowerCase();
    if (INTEGER_WORD_DICTIONARY$1[num] !== undefined) {
        return INTEGER_WORD_DICTIONARY$1[num];
    }
    return parseInt(match);
}

const PATTERN$e = new RegExp("(?:(?:\\,|\\(|\\（)\\s*)?" +
    "(?:(viime|edellinen|edellisenä|ensi|seuraava|seuraavana|tämä|tänä)\\s*)?" +
    `(${matchAnyPattern(WEEKDAY_DICTIONARY$1)})` +
    "(?:\\s*(?:\\,|\\)|\\）))?" +
    "(?:\\s*(viime|ensi|seuraava)\\s*viikolla)?" +
    "(?=\\W|$)", "i");
const PREFIX_GROUP = 1;
const WEEKDAY_GROUP$1 = 2;
const SUFFIX_GROUP = 3;
class FIWeekdayParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$e;
    }
    innerExtract(context, match) {
        const dayOfWeek = match[WEEKDAY_GROUP$1].toLowerCase();
        const offset = WEEKDAY_DICTIONARY$1[dayOfWeek];
        const prefix = match[PREFIX_GROUP];
        const postfix = match[SUFFIX_GROUP];
        let modifierWord = prefix || postfix;
        modifierWord = modifierWord || "";
        modifierWord = modifierWord.toLowerCase();
        let modifier = null;
        if (modifierWord.match(/viime|edellinen|edellisenä/)) {
            modifier = "last";
        }
        else if (modifierWord.match(/ensi|seuraava|seuraavana/)) {
            modifier = "next";
        }
        return createParsingComponentsAtWeekday(context.reference, offset, modifier);
    }
}

const PATTERN$d = new RegExp(`([0-9]{1,2})\\.?` +
    `(?:\\s*(?:\\-|\\–|\\s)\\s*([0-9]{1,2})\\.?)?\\s*` +
    `(${matchAnyPattern(MONTH_DICTIONARY$1)})` +
    `(?:(?:-|/|,?\\s*)([0-9]{4}(?![^\\s]\\d)))?` +
    `(?=\\W|$)`, "i");
const DATE_GROUP$1 = 1;
const DATE_TO_GROUP = 2;
const MONTH_NAME_GROUP = 3;
const YEAR_GROUP$2 = 4;
class FIMonthNameLittleEndianParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$d;
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        const month = MONTH_DICTIONARY$1[match[MONTH_NAME_GROUP].toLowerCase()];
        const day = parseInt(match[DATE_GROUP$1]);
        if (day > 31) {
            match.index = match.index + match[DATE_GROUP$1].length;
            return null;
        }
        result.start.assign("month", month);
        result.start.assign("day", day);
        if (match[YEAR_GROUP$2]) {
            const yearNumber = parseYear$1(match[YEAR_GROUP$2]);
            result.start.assign("year", yearNumber);
        }
        else {
            const year = findYearClosestToRef(context.refDate, day, month);
            result.start.imply("year", year);
        }
        if (match[DATE_TO_GROUP]) {
            const endDate = parseInt(match[DATE_TO_GROUP]);
            result.end = result.start.clone();
            result.end.assign("day", endDate);
        }
        return result;
    }
}

const PATTERN$c = new RegExp(`(seuraava|seuraavat|seuraavien|edellinen|edelliset|edellisten|viimeiset|viimeisten|kuluneet|kuluneiden|\\+|-)\\s*(${TIME_UNITS_PATTERN$1})(?=\\W|$)`, "i");
const PATTERN_NO_ABBR = new RegExp(`(seuraava|seuraavat|seuraavien|edellinen|edelliset|edellisten|viimeiset|viimeisten|kuluneet|kuluneiden|\\+|-)\\s*(${TIME_UNITS_NO_ABBR_PATTERN})(?=\\W|$)`, "i");
class FITimeUnitCasualRelativeFormatParser extends AbstractParserWithWordBoundaryChecking {
    allowAbbreviations;
    constructor(allowAbbreviations = true) {
        super();
        this.allowAbbreviations = allowAbbreviations;
    }
    innerPattern() {
        return this.allowAbbreviations ? PATTERN$c : PATTERN_NO_ABBR;
    }
    innerExtract(context, match) {
        const prefix = match[1].toLowerCase();
        let duration = parseDuration$1(match[2]);
        if (!duration) {
            return null;
        }
        switch (prefix) {
            case "edellinen":
            case "edelliset":
            case "edellisten":
            case "viimeiset":
            case "viimeisten":
            case "kuluneet":
            case "kuluneiden":
            case "-":
                duration = reverseDuration(duration);
                break;
        }
        return ParsingComponents.createRelativeFromReference(context.reference, duration);
    }
}

class FITimeUnitAgoFormatParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return new RegExp(`(${TIME_UNITS_PATTERN$1})\\s*sitten(?=\\W|$)`, "i");
    }
    innerExtract(context, match) {
        const timeUnits = parseDuration$1(match[1]);
        const outputTimeUnits = reverseDuration(timeUnits);
        return ParsingComponents.createRelativeFromReference(context.reference, outputTimeUnits);
    }
}

class FITimeUnitWithinFormatParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return new RegExp(`(${TIME_UNITS_PATTERN$1})\\s*(?:sisällä|kuluessa|päästä)(?=\\W|$)`, "i");
    }
    innerExtract(context, match) {
        const timeUnits = parseDuration$1(match[1]);
        return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
    }
}

class FICasualTimeParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return /(tänä\s*)?(aamulla|aamuna|aamupäivällä|päivällä|iltapäivällä|illalla|yöllä|keskiyöllä)(?=\W|$)/i;
    }
    innerExtract(context, match) {
        const targetDate = context.refDate;
        const timeKeywordPattern = match[2].toLowerCase();
        const component = context.createParsingComponents();
        implySimilarTime(component, targetDate);
        return FICasualTimeParser.extractTimeComponents(component, timeKeywordPattern);
    }
    static extractTimeComponents(component, timeKeywordPattern) {
        switch (timeKeywordPattern) {
            case "aamulla":
            case "aamuna":
                component.imply("hour", 6);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", Meridiem.AM);
                break;
            case "aamupäivällä":
                component.imply("hour", 9);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", Meridiem.AM);
                break;
            case "päivällä":
                component.imply("hour", 12);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", Meridiem.AM);
                break;
            case "iltapäivällä":
                component.imply("hour", 15);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", Meridiem.PM);
                break;
            case "illalla":
                component.imply("hour", 18);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", Meridiem.PM);
                break;
            case "yöllä":
                component.imply("hour", 22);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", Meridiem.PM);
                break;
            case "keskiyöllä":
                if (component.get("hour") > 1) {
                    component.addDurationAsImplied({ "day": 1 });
                }
                component.imply("hour", 0);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", Meridiem.AM);
                break;
        }
        return component;
    }
}

const PATTERN$b = new RegExp(`(nyt|tänään|huomenna|ylihuomenna|eilen|toissapäivänä|viime\\s*yönä)` +
    `(?:\\s*(aamulla|aamuna|aamupäivällä|päivällä|iltapäivällä|illalla|yöllä|keskiyöllä))?` +
    `(?=\\W|$)`, "i");
const DATE_GROUP = 1;
const TIME_GROUP = 2;
class FICasualDateParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return PATTERN$b;
    }
    innerExtract(context, match) {
        let targetDate = context.reference.getDateWithAdjustedTimezone();
        const dateKeyword = (match[DATE_GROUP] || "").toLowerCase();
        const timeKeyword = (match[TIME_GROUP] || "").toLowerCase();
        let component = context.createParsingComponents();
        switch (dateKeyword) {
            case "nyt":
                component = now(context.reference);
                break;
            case "tänään":
                component = today(context.reference);
                break;
            case "huomenna":
                targetDate = addDuration(targetDate, { day: 1 });
                assignSimilarDate(component, targetDate);
                implySimilarTime(component, targetDate);
                break;
            case "ylihuomenna":
                targetDate = addDuration(targetDate, { day: 2 });
                assignSimilarDate(component, targetDate);
                implySimilarTime(component, targetDate);
                break;
            case "eilen":
                targetDate = addDuration(targetDate, { day: -1 });
                assignSimilarDate(component, targetDate);
                implySimilarTime(component, targetDate);
                break;
            case "toissapäivänä":
                targetDate = addDuration(targetDate, { day: -2 });
                assignSimilarDate(component, targetDate);
                implySimilarTime(component, targetDate);
                break;
            default:
                if (dateKeyword.match(/viime\s*yönä/)) {
                    if (targetDate.getHours() > 6) {
                        targetDate = addDuration(targetDate, { day: -1 });
                    }
                    assignSimilarDate(component, targetDate);
                    component.imply("hour", 0);
                }
                break;
        }
        if (timeKeyword) {
            component = FICasualTimeParser.extractTimeComponents(component, timeKeyword);
        }
        return component;
    }
}

class FIMergeDateRangeRefiner extends AbstractMergeDateRangeRefiner {
    patternBetween() {
        return /^\s*(-|–)\s*$/i;
    }
}

class FIMergeDateTimeRefiner extends AbstractMergeDateTimeRefiner {
    patternBetween() {
        return new RegExp("^\\s*(T|klo|kello|,|-)?\\s*$");
    }
}

const casual$2 = new Chrono(createCasualConfiguration$1());
const strict$2 = new Chrono(createConfiguration$1(true));
function parse$2(text, ref, option) {
    return casual$2.parse(text, ref, option);
}
function parseDate$2(text, ref, option) {
    return casual$2.parseDate(text, ref, option);
}
function createCasualConfiguration$1(littleEndian = true) {
    const option = createConfiguration$1(false, littleEndian);
    option.parsers.unshift(new FICasualTimeParser());
    option.parsers.unshift(new FICasualDateParser());
    option.parsers.unshift(new FITimeUnitCasualRelativeFormatParser());
    return option;
}
function createConfiguration$1(strictMode = true, littleEndian = true) {
    return includeCommonConfiguration({
        parsers: [
            new ISOFormatParser(),
            new SlashDateFormatParser(littleEndian),
            new FITimeExpressionParser(),
            new FIMonthNameLittleEndianParser(),
            new FIWeekdayParser(),
            new FITimeUnitWithinFormatParser(),
            new FITimeUnitAgoFormatParser(),
        ],
        refiners: [new FIMergeDateRangeRefiner(), new FIMergeDateTimeRefiner()],
    }, strictMode);
}

var index$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Chrono: Chrono,
	ParsingResult: ParsingResult,
	ParsingComponents: ParsingComponents,
	ReferenceWithTimezone: ReferenceWithTimezone,
	get Meridiem () { return Meridiem; },
	get Weekday () { return Weekday; },
	casual: casual$2,
	strict: strict$2,
	parse: parse$2,
	parseDate: parseDate$2,
	createCasualConfiguration: createCasualConfiguration$1,
	createConfiguration: createConfiguration$1
});

const WEEKDAY_DICTIONARY = {
    "ch\u1ee7 nh\u1eadt": 0,
    "cn": 0,
    "th\u1ee9 hai": 1,
    "t2": 1,
    "th\u1ee9 ba": 2,
    "t3": 2,
    "th\u1ee9 t\u01b0": 3,
    "t4": 3,
    "th\u1ee9 n\u0103m": 4,
    "t5": 4,
    "th\u1ee9 s\u00e1u": 5,
    "t6": 5,
    "th\u1ee9 b\u1ea3y": 6,
    "t7": 6,
};
const MONTH_DICTIONARY = {
    "th\u00e1ng 1": 1,
    "th\u00e1ng m\u1ed9t": 1,
    "th\u00e1ng gi\u00eang": 1,
    "th\u00e1ng 2": 2,
    "th\u00e1ng hai": 2,
    "th\u00e1ng 3": 3,
    "th\u00e1ng ba": 3,
    "th\u00e1ng 4": 4,
    "th\u00e1ng t\u01b0": 4,
    "th\u00e1ng 5": 5,
    "th\u00e1ng n\u0103m": 5,
    "th\u00e1ng 6": 6,
    "th\u00e1ng s\u00e1u": 6,
    "th\u00e1ng 7": 7,
    "th\u00e1ng b\u1ea3y": 7,
    "th\u00e1ng 8": 8,
    "th\u00e1ng t\u00e1m": 8,
    "th\u00e1ng 9": 9,
    "th\u00e1ng ch\u00edn": 9,
    "th\u00e1ng 10": 10,
    "th\u00e1ng m\u01b0\u1eddi": 10,
    "th\u00e1ng 11": 11,
    "th\u00e1ng m\u01b0\u1eddi m\u1ed9t": 11,
    "th\u00e1ng 12": 12,
    "th\u00e1ng m\u01b0\u1eddi hai": 12,
    "th\u00e1ng ch\u1ea1p": 12,
};
const INTEGER_WORD_DICTIONARY = {
    "m\u1ed9t": 1,
    "hai": 2,
    "ba": 3,
    "b\u1ed1n": 4,
    "n\u0103m": 5,
    "s\u00e1u": 6,
    "b\u1ea3y": 7,
    "t\u00e1m": 8,
    "ch\u00edn": 9,
    "m\u01b0\u1eddi": 10,
    "m\u01b0\u1eddi m\u1ed9t": 11,
    "m\u01b0\u1eddi hai": 12,
};
const TIME_UNIT_DICTIONARY = {
    "gi\u00e2y": "second",
    "ph\u00fat": "minute",
    "gi\u1edd": "hour",
    "ng\u00e0y": "day",
    "tu\u1ea7n": "week",
    "th\u00e1ng": "month",
    "n\u0103m": "year",
};
const NUMBER_PATTERN = "(?:" + matchAnyPattern(INTEGER_WORD_DICTIONARY) + "|[0-9]+|[0-9]+\\.[0-9]+)";
function parseNumberPattern(match) {
    const num = match.toLowerCase();
    if (INTEGER_WORD_DICTIONARY[num] !== undefined)
        return INTEGER_WORD_DICTIONARY[num];
    return parseFloat(num);
}
const YEAR_PATTERN = "(?:[0-9]{1,4}(?:\\s*TCN)?)";
function parseYear(match) {
    const upper = match.toUpperCase();
    const num = parseInt(match.replace(/[^0-9]+/g, ""));
    if (/TCN/.test(upper))
        return -num;
    return findMostLikelyADYear(num);
}
const SINGLE_TIME_UNIT_PATTERN = "(" + NUMBER_PATTERN + ")\\s{0,5}(" + matchAnyPattern(TIME_UNIT_DICTIONARY) + ")\\s{0,5}";
const SINGLE_TIME_UNIT_REGEX = new RegExp(SINGLE_TIME_UNIT_PATTERN, "i");
const TIME_UNITS_PATTERN = repeatedTimeunitPattern("", SINGLE_TIME_UNIT_PATTERN);
function parseDuration(timeunitText) {
    const fragments = {};
    let remainingText = timeunitText;
    let match = SINGLE_TIME_UNIT_REGEX.exec(remainingText);
    while (match) {
        const num = parseNumberPattern(match[1]);
        const unit = TIME_UNIT_DICTIONARY[match[2].toLowerCase()];
        fragments[unit] = num;
        remainingText = remainingText.substring(match[0].length);
        match = SINGLE_TIME_UNIT_REGEX.exec(remainingText);
    }
    return fragments;
}

const PATTERN$a = new RegExp("(?:ng\u00e0y\\s*)?" +
    "([0-9]{1,2})" +
    "\\s*th\u00e1ng\\s*" +
    "([0-9]{1,2})" +
    "(?:\\s*n\u0103m\\s*(" +
    YEAR_PATTERN +
    "))?" +
    "(?=\\W|$)", "i");
const DAY_GROUP = 1;
const MONTH_GROUP$1 = 2;
const YEAR_GROUP$1 = 3;
class VIStandardParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$a;
    }
    innerExtract(context, match) {
        const day = parseInt(match[DAY_GROUP]);
        const month = parseInt(match[MONTH_GROUP$1]);
        if (day > 31 || month > 12)
            return null;
        const result = context.createParsingResult(match.index, match[0]);
        result.start.assign("day", day);
        result.start.assign("month", month);
        if (match[YEAR_GROUP$1]) {
            result.start.assign("year", parseYear(match[YEAR_GROUP$1]));
        }
        else {
            result.start.imply("year", findYearClosestToRef(context.refDate, day, month));
        }
        return result;
    }
}

const PATTERN$9 = new RegExp("(" + matchAnyPattern(MONTH_DICTIONARY) + ")" + "(?:\\s*(?:năm|/)\\s*(" + YEAR_PATTERN + "))?" + "(?=\\W|$)", "i");
const MONTH_GROUP = 1;
const YEAR_GROUP = 2;
class VIMonthYearParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$9;
    }
    innerExtract(context, match) {
        const month = MONTH_DICTIONARY[match[MONTH_GROUP].toLowerCase()];
        if (!month)
            return null;
        const result = context.createParsingResult(match.index, match[0]);
        result.start.assign("month", month);
        result.start.imply("day", 1);
        if (match[YEAR_GROUP]) {
            result.start.assign("year", parseYear(match[YEAR_GROUP]));
        }
        else {
            result.start.imply("year", context.reference.getDateWithAdjustedTimezone().getFullYear());
        }
        return result;
    }
}

const PATTERN$8 = new RegExp("(?:\\bnăm\\s*(" + YEAR_PATTERN + ")|\\b([0-9]{1,4})\\s*(TCN))(?=\\W|$)", "i");
const YEAR_WITH_NAM_GROUP = 1;
const BARE_BC_YEAR_GROUP = 2;
const BARE_BC_SUFFIX_GROUP = 3;
class VIYearParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$8;
    }
    innerExtract(context, match) {
        let yearText;
        if (match[YEAR_WITH_NAM_GROUP]) {
            yearText = match[YEAR_WITH_NAM_GROUP];
        }
        else {
            yearText = match[BARE_BC_YEAR_GROUP] + " " + match[BARE_BC_SUFFIX_GROUP];
        }
        const result = context.createParsingResult(match.index, match[0]);
        result.start.assign("year", parseYear(yearText));
        result.start.imply("month", 1);
        result.start.imply("day", 1);
        return result;
    }
}

const PATTERN$7 = /\b(hôm nay|hôm qua|hôm kia|ngày mai|ngày kia|bây giờ|lúc này)(?=\W|$)/i;
class VICasualDateParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$7;
    }
    innerExtract(context, match) {
        switch (match[1].toLowerCase()) {
            case "bây giờ":
            case "lúc này":
                return now(context.reference);
            case "hôm nay":
                return today(context.reference);
            case "hôm qua":
                return yesterday(context.reference);
            case "hôm kia":
                return theDayBefore(context.reference, 2);
            case "ngày mai":
                return tomorrow(context.reference);
            case "ngày kia":
                return theDayAfter(context.reference, 2);
        }
        return context.createParsingComponents();
    }
}

const PATTERN$6 = /(buổi\s*)?(sáng sớm|sáng|trưa|chiều|tối|đêm|nửa đêm|bình minh)(?=\W|$)/i;
class VICasualTimeParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$6;
    }
    innerExtract(context, match) {
        const component = context.createParsingComponents();
        implySimilarTime(component, context.refDate);
        return VICasualTimeParser.extractTimeComponents(component, match[2].toLowerCase());
    }
    static extractTimeComponents(component, keyword) {
        switch (keyword) {
            case "b\u00ecnh minh":
            case "s\u00e1ng s\u1edbm":
                component.imply("hour", 6);
                component.imply("minute", 0);
                component.imply("meridiem", Meridiem.AM);
                break;
            case "s\u00e1ng":
                component.imply("hour", 9);
                component.imply("minute", 0);
                component.imply("meridiem", Meridiem.AM);
                break;
            case "tr\u01b0a":
                component.imply("hour", 12);
                component.imply("minute", 0);
                component.imply("meridiem", Meridiem.PM);
                break;
            case "chi\u1ec1u":
                component.imply("hour", 15);
                component.imply("minute", 0);
                component.imply("meridiem", Meridiem.PM);
                break;
            case "t\u1ed1i":
                component.imply("hour", 19);
                component.imply("minute", 0);
                component.imply("meridiem", Meridiem.PM);
                break;
            case "\u0111\u00eam":
                component.imply("hour", 22);
                component.imply("minute", 0);
                component.imply("meridiem", Meridiem.PM);
                break;
            case "n\u1eeda \u0111\u00eam":
                component.imply("hour", 0);
                component.imply("minute", 0);
                component.imply("meridiem", Meridiem.AM);
                break;
        }
        return component;
    }
}

const PATTERN$5 = new RegExp("(" +
    matchAnyPattern(WEEKDAY_DICTIONARY) +
    ")" +
    "(?:\\s*(này|tới|sau(?!\\s*khi)|qua))?" +
    "(?=\\W|$)", "i");
const WEEKDAY_GROUP = 1;
const MODIFIER_GROUP = 2;
class VIWeekdayParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$5;
    }
    innerExtract(context, match) {
        const dowText = match[WEEKDAY_GROUP].toLowerCase();
        const dow = WEEKDAY_DICTIONARY[dowText];
        if (dow === undefined)
            return null;
        const modifier = match[MODIFIER_GROUP];
        let modifierType = null;
        if (modifier) {
            const m = modifier.toLowerCase();
            if (m.includes("tới") || m.includes("sau"))
                modifierType = "next";
            else if (m.includes("qua"))
                modifierType = "last";
        }
        return createParsingComponentsAtWeekday(context.reference, dow, modifierType);
    }
}

const PATTERN$4 = new RegExp("(?:l\u00fac\\s*|v\u00e0o\\s*)?" +
    "([0-9]{1,2})" +
    "(?:\\s*gi\u1edd\\s*([0-9]{1,2})?\\s*(?:ph\u00fat\\s*)?" +
    "(s\u00e1ng|tr\u01b0a|chi\u1ec1u|t\u1ed1i|\u0111\u00eam)?" +
    "|:([0-9]{2}))" +
    "(?=\\W|$)", "i");
const HOUR_GROUP = 1;
const MINUTE_GIO_GROUP = 2;
const MERIDIEM_GROUP = 3;
const MINUTE_COLON_GROUP = 4;
class VITimeExpressionParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$4;
    }
    innerExtract(context, match) {
        const hour = parseInt(match[HOUR_GROUP]);
        if (hour > 23)
            return null;
        const result = context.createParsingResult(match.index, match[0]);
        result.start.assign("hour", hour);
        const minute = match[MINUTE_COLON_GROUP]
            ? parseInt(match[MINUTE_COLON_GROUP])
            : match[MINUTE_GIO_GROUP]
                ? parseInt(match[MINUTE_GIO_GROUP])
                : 0;
        if (minute >= 60)
            return null;
        result.start.assign("minute", minute);
        const meridiem = match[MERIDIEM_GROUP]?.toLowerCase();
        if (meridiem === "sáng") {
            result.start.assign("meridiem", Meridiem.AM);
            if (hour === 12)
                result.start.assign("hour", 0);
        }
        else if (meridiem === "trưa") {
            if (hour < 10) {
                result.start.assign("meridiem", Meridiem.PM);
                result.start.assign("hour", hour + 12);
            }
            else {
                result.start.assign("meridiem", hour >= 12 ? Meridiem.PM : Meridiem.AM);
            }
        }
        else if (meridiem === "chiều" || meridiem === "tối" || meridiem === "đêm") {
            result.start.assign("meridiem", Meridiem.PM);
            if (hour < 12)
                result.start.assign("hour", hour + 12);
        }
        result.start.imply("second", 0);
        result.start.imply("millisecond", 0);
        return result;
    }
}

const PATTERN$3 = new RegExp("(" + TIME_UNITS_PATTERN + ")" + "\\s{0,5}(?:tr\u01b0\u1edbc|qua)(?=\\W|$)", "i");
class VITimeUnitAgoFormatParser extends AbstractParserWithWordBoundaryChecking {
    strictMode;
    constructor(strictMode = false) {
        super();
        this.strictMode = strictMode;
    }
    innerPattern() {
        return PATTERN$3;
    }
    innerExtract(context, match) {
        const duration = parseDuration(match[1]);
        if (!duration)
            return null;
        return ParsingComponents.createRelativeFromReference(context.reference, reverseDuration(duration));
    }
}

const PATTERN$2 = new RegExp("(" + TIME_UNITS_PATTERN + ")" + "\\s{0,5}(?:sau|n\u1eefa|t\u1edbi|ti\u1ebfp)(?=\\W|$)", "i");
class VITimeUnitLaterFormatParser extends AbstractParserWithWordBoundaryChecking {
    strictMode;
    constructor(strictMode = false) {
        super();
        this.strictMode = strictMode;
    }
    innerPattern() {
        return PATTERN$2;
    }
    innerExtract(context, match) {
        const duration = parseDuration(match[1]);
        if (!duration)
            return null;
        return ParsingComponents.createRelativeFromReference(context.reference, duration);
    }
}

const PATTERN$1 = new RegExp("(?:trong\\s*(?:v\u00f2ng\\s*)?)" + "(" + TIME_UNITS_PATTERN + ")(?=\\W|$)", "i");
class VITimeUnitWithinFormatParser extends AbstractParserWithWordBoundaryChecking {
    strictMode;
    constructor(strictMode = false) {
        super();
        this.strictMode = strictMode;
    }
    innerPattern() {
        return PATTERN$1;
    }
    innerExtract(context, match) {
        const timeUnits = parseDuration(match[1]);
        if (!timeUnits)
            return null;
        return ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
    }
}

const CASUAL_UNIT_PATTERN = "(?:" + NUMBER_PATTERN + "\\s{0,5})?(?:" + matchAnyPattern(TIME_UNIT_DICTIONARY) + ")";
const PATTERN = new RegExp("(này|trước|qua|sau|tới|tiếp)\\s*(" +
    CASUAL_UNIT_PATTERN +
    ")" +
    "|(" +
    CASUAL_UNIT_PATTERN +
    ")\\s*(này|trước|qua|sau|tới|tiếp)" +
    "(?=\\W|$)", "i");
class VITimeUnitCasualRelativeFormatParser extends AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN;
    }
    innerExtract(context, match) {
        const modifier = (match[1] || match[4] || "").toLowerCase();
        const unitText = (match[2] || match[3] || "").toLowerCase();
        let duration = parseDuration(unitText);
        if (Object.keys(duration).length === 0) {
            const unit = TIME_UNIT_DICTIONARY[unitText];
            if (!unit)
                return null;
            duration = { [unit]: 1 };
        }
        if (modifier === "trước" || modifier === "qua") {
            duration = reverseDuration(duration);
        }
        return ParsingComponents.createRelativeFromReference(context.reference, duration);
    }
}

class VIMergeDateRangeRefiner extends AbstractMergeDateRangeRefiner {
    patternBetween() {
        return /^\s*(?:–|-|đến|tới|và)\s*$/;
    }
}

class VIMergeDateTimeRefiner extends AbstractMergeDateTimeRefiner {
    patternBetween() {
        return /^\s*(?:lúc|vào|,|T|-)?\s*$/;
    }
}

class VIMergeWeekdayComponentRefiner extends MergeWeekdayComponentRefiner {
}

const casual$1 = new Chrono(createCasualConfiguration());
const strict$1 = new Chrono(createConfiguration(true));
function parse$1(text, ref, option) {
    return casual$1.parse(text, ref, option);
}
function parseDate$1(text, ref, option) {
    return casual$1.parseDate(text, ref, option);
}
function createCasualConfiguration(littleEndian = true) {
    const option = createConfiguration(false, littleEndian);
    option.parsers.unshift(new VICasualTimeParser());
    option.parsers.unshift(new VICasualDateParser());
    option.parsers.unshift(new VITimeUnitCasualRelativeFormatParser());
    return option;
}
function createConfiguration(strictMode = true, littleEndian = true) {
    return includeCommonConfiguration({
        parsers: [
            new ISOFormatParser(),
            new SlashDateFormatParser(littleEndian),
            new VIStandardParser(),
            new VIMonthYearParser(),
            new VIYearParser(),
            new VIWeekdayParser(),
            new VITimeExpressionParser(),
            new VITimeUnitAgoFormatParser(strictMode),
            new VITimeUnitLaterFormatParser(strictMode),
            new VITimeUnitWithinFormatParser(strictMode),
        ],
        refiners: [
            new VIMergeWeekdayComponentRefiner(),
            new VIMergeDateRangeRefiner(),
            new VIMergeDateTimeRefiner(),
        ],
    }, strictMode);
}

var index = /*#__PURE__*/Object.freeze({
	__proto__: null,
	Chrono: Chrono,
	ParsingResult: ParsingResult,
	ParsingComponents: ParsingComponents,
	ReferenceWithTimezone: ReferenceWithTimezone,
	get Meridiem () { return Meridiem; },
	get Weekday () { return Weekday; },
	casual: casual$1,
	strict: strict$1,
	parse: parse$1,
	parseDate: parseDate$1,
	createCasualConfiguration: createCasualConfiguration,
	createConfiguration: createConfiguration
});

const strict = strict$g;
const casual = casual$g;
function parse(text, ref, option) {
    return casual.parse(text, ref, option);
}
function parseDate(text, ref, option) {
    return casual.parseDate(text, ref, option);
}

var chrono = /*#__PURE__*/Object.freeze({
	__proto__: null,
	en: index$f,
	Chrono: Chrono,
	ParsingContext: ParsingContext,
	ParsingResult: ParsingResult,
	ParsingComponents: ParsingComponents,
	ReferenceWithTimezone: ReferenceWithTimezone,
	get Meridiem () { return Meridiem; },
	get Weekday () { return Weekday; },
	de: index$e,
	fr: index$d,
	ja: index$c,
	pt: index$b,
	nl: index$a,
	zh: index$7,
	ru: index$6,
	es: index$5,
	uk: index$4,
	it: index$3,
	sv: index$2,
	fi: index$1,
	vi: index,
	strict: strict,
	casual: casual,
	parse: parse,
	parseDate: parseDate
});

/**
 * Système de logging structuré pour Natural Language Dates
 */
/**
 * Formate une entrée de log avec timestamp
 */
function formatLogEntry(level, message, context) {
    const timestamp = new Date().toISOString();
    if (context) {
        return `[${timestamp}] [${level.toUpperCase()}] ${message} | Context: ${JSON.stringify(context)}`;
    }
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
}
/**
 * Système de logging structuré
 */
const logger = {
    /**
     * Log de niveau debug (pour le développement)
     */
    debug(message, context) {
        const formatted = formatLogEntry('debug', message, context);
        console.debug(formatted);
    },
    /**
     * Log de niveau info (informations générales)
     */
    info(message, context) {
        const formatted = formatLogEntry('info', message, context);
        console.debug(formatted);
    },
    /**
     * Log de niveau warn (avertissements)
     */
    warn(message, context) {
        const formatted = formatLogEntry('warn', message, context);
        console.warn(formatted);
    },
    /**
     * Log de niveau error (erreurs)
     */
    error(message, context) {
        const formatted = formatLogEntry('error', message, context);
        console.error(formatted);
    },
};

// CHANGEMENT ICI : On utilise "import * as chrono" car la version 2.x n'a plus d'export par défaut
function getOrdinalDateParser() {
    return {
        pattern: () => new RegExp(ORDINAL_NUMBER_PATTERN$6),
        extract: (context, match) => {
            return {
                day: parseOrdinalNumberPattern$6(match[0]),
                // moment(...).month() is 0-indexed (Jan=0), but chrono-node's
                // ParsingComponents.month is 1-indexed (Jan=1) -- verified against
                // chrono-node's own locale constants. Without the +1 this always
                // resolved to the wrong month (and, via forwardDate, sometimes the
                // wrong year too).
                // Must use context.refDate (the date chrono was asked to parse
                // relative to), not moment() (the real current wall-clock time):
                // callers can and do pass an explicit reference date, e.g. tests, or
                // getParsedDateResult()'s callers in parser.ts.
                month: moment(context.refDate).month() + 1,
            };
        },
    };
}
function getChronos(languages) {
    const locale = moment.locale();
    const isGB = locale === 'en-gb';
    const chronos = [];
    const ordinalDateParser = getOrdinalDateParser();
    // Builds a Chrono instance for a locale module, supporting both chrono-node
    // API shapes: older locales still expose createCasualConfiguration(isGB),
    // but as of chrono-node 2.x the "en" locale instead exports pre-built
    // Chrono instances (casual/GB/strict) with no config factory at all. A
    // locale missing both would previously be silently treated as unsupported
    // (logged at "warn" only) and every match for that language would fall
    // through to today/now with no visible error -- this happened for English
    // specifically, for every user who enabled it, since createCasualConfiguration
    // is exactly what disappeared from that module.
    const buildChronoForModule = (langModule) => {
        if (!langModule)
            return null;
        if (langModule.createCasualConfiguration) {
            const config = langModule.createCasualConfiguration(isGB);
            // Chrono constructor accepts Configuration type - cast needed because createCasualConfiguration returns unknown
            return new Chrono(config);
        }
        if (langModule.casual) {
            // Clone so we don't mutate chrono-node's shared singleton instance
            // (multiple NLDParser instances would otherwise all push their own
            // ordinalDateParser onto the same shared object).
            const base = (isGB && langModule.GB) ? langModule.GB : langModule.casual;
            return base.clone();
        }
        return null;
    };
    languages.forEach(l => {
        try {
            // On accède aux langues dynamiquement via Record
            const langModule = chrono[l];
            const c = buildChronoForModule(langModule);
            if (!c) {
                logger.warn(`Language is not supported by chrono-node`, { language: l });
                return;
            }
            c.parsers.push(ordinalDateParser);
            chronos.push(c);
            logger.debug("Chrono initialized for language", { language: l });
        }
        catch (error) {
            logger.error(`Failed to initialize chrono for language`, {
                language: l,
                error: describeError(error),
            });
        }
    });
    // Si aucune langue n'a pu être initialisée, utiliser l'anglais par défaut
    if (chronos.length === 0) {
        logger.warn('No languages could be initialized, attempting English fallback');
        try {
            const enModule = index$f;
            const c = buildChronoForModule(enModule);
            if (c) {
                c.parsers.push(ordinalDateParser);
                chronos.push(c);
                logger.info('Default English chrono initialized successfully');
            }
            else {
                logger.error('English chrono module not available');
            }
        }
        catch (error) {
            logger.error('Failed to initialize default English chrono', {
                error: describeError(error),
            });
        }
    }
    return chronos;
}

/**
 * Classe pour détecter si un texte contient une composante d'heure
 */
class TimeDetector {
    constructor(dependencies) {
        this.languages = dependencies.languages;
        this.chronos = dependencies.chronos;
        this.regexRelative = dependencies.regexRelative;
        this.regexRelativeCombined = dependencies.regexRelativeCombined;
        this.regexWeekday = dependencies.regexWeekday;
        this.regexWeekdayWithTime = dependencies.regexWeekdayWithTime;
    }
    /**
     * Vérifie si le texte contient une composante d'heure
     */
    hasTimeComponent(text) {
        // 1. If it's "now" in any language, YES.
        // Translations can list several variants pipe-separated (e.g. Italian
        // "adesso|ora", Chinese "現在|现在"); split each language's "now" entry
        // directly instead of trying to match individual immediateKeywords
        // entries (already split, for all of now/today/tomorrow/yesterday
        // combined) against the raw, unsplit translation string, which could
        // never equal a single already-split variant.
        const nowWords = this.languages.flatMap(lang => t('now', lang).toLowerCase().split('|').map(w => w.trim()).filter(w => w));
        // Exact, case-insensitive match against the whole string -- no need to
        // compile a RegExp per word per call for that, a plain lowercase +
        // includes() does the same thing more simply and more cheaply.
        if (nowWords.includes(text.toLowerCase().trim())) {
            return true;
        }
        // 2. First check combinations "in X weeks and Y days"
        const relCombinedMatch = text.match(this.regexRelativeCombined);
        if (relCombinedMatch) {
            const unitStr1 = relCombinedMatch[2].toLowerCase();
            const unitStr2 = relCombinedMatch[4].toLowerCase();
            // If one of the units is hours or minutes -> YES
            if (unitStr1.startsWith('h') || unitStr1 === 'm' || unitStr1.startsWith('min') ||
                unitStr2.startsWith('h') || unitStr2 === 'm' || unitStr2.startsWith('min')) {
                return true;
            }
            // Otherwise -> NO (days, weeks, months, years)
            return false;
        }
        // 3. If it's a simple delay in HOURS or MINUTES -> YES
        const relMatch = text.match(this.regexRelative);
        if (relMatch) {
            const unitStr = relMatch[2].toLowerCase();
            // m, min, minutes, h, hours...
            if (unitStr.startsWith('h') || unitStr === 'm' || unitStr.startsWith('min')) {
                return true;
            }
            // Days, months, years -> NO
            return false;
        }
        // 4. If it's a specific day with time (Next Monday at 3pm) -> YES
        if (this.regexWeekdayWithTime && this.regexWeekdayWithTime.test(text)) {
            return true;
        }
        // 5. If it's a specific day without time (Next Monday) or Tomorrow -> NO (Generally we just want the date)
        // If you want time for "Tomorrow", remove the lines below.
        if (this.regexWeekday.test(text)) {
            return false;
        }
        // Check today/tomorrow/yesterday keywords in all languages
        const dateKeywords = ['today', 'tomorrow', 'yesterday'];
        const dateWords = [];
        for (const key of dateKeywords) {
            for (const lang of this.languages) {
                // t() always falls back to English (lang/helper.ts), and en.ts
                // always defines today/tomorrow/yesterday, so this guard can't
                // actually be false for these three keys -- kept for safety in case
                // that invariant ever changes.
                const word = t(key, lang);
                if (word && word !== "NOTFOUND") {
                    dateWords.push(word.toLowerCase());
                }
            }
        }
        if (dateWords.some(w => new RegExp(`^${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i').test(text))) {
            return false;
        }
        // 6. Otherwise, ask the library if it sees an explicit time (ex: "Tomorrow at 5pm")
        if (!this.chronos) {
            return false;
        }
        for (const c of this.chronos) {
            try {
                const parsedResult = c.parse(text);
                if (parsedResult && parsedResult.length > 0) {
                    const start = parsedResult[0].start;
                    if (start && (start.isCertain("hour") || start.isCertain("minute"))) {
                        return true;
                    }
                }
            }
            catch {
                // Ignore parsing errors
            }
        }
        return false;
    }
}

/**
 * Implémentation d'un cache LRU (Least Recently Used) avec limite de taille
 * Utilisé pour limiter la mémoire utilisée par les caches
 */
class LRUCache {
    /**
     * Creates a new LRU cache with the specified maximum size
     *
     * @param maxSize - Maximum number of items to store in the cache (default: 500)
     */
    constructor(maxSize = 500) {
        if (maxSize <= 0) {
            throw new Error("LRU Cache maxSize must be greater than 0");
        }
        this.maxSize = maxSize;
        this.cache = new Map();
    }
    /**
     * Checks if a key exists in the cache
     * Vérifie si une clé existe dans le cache
     *
     * @param key - The key to check
     * @returns True if the key exists, false otherwise
     */
    has(key) {
        return this.cache.has(key);
    }
    /**
     * Obtient une valeur du cache et la marque comme récemment utilisée
     * Gets a value from the cache by key
     * If the key exists, it is moved to the end (most recently used)
     *
     * @param key - The key to retrieve
     * @returns The value associated with the key, or undefined if not found
     */
    get(key) {
        const value = this.cache.get(key);
        if (value !== undefined) {
            // Déplacer la clé à la fin (most recently used)
            this.cache.delete(key);
            this.cache.set(key, value);
        }
        return value;
    }
    /**
     * Ajoute ou met à jour une valeur dans le cache
     * Sets a value in the cache
     * If the key already exists, it is updated and moved to the end
     * Si la taille maximale est atteinte, supprime l'entrée la moins récemment utilisée
     *
     * @param key - The key to set
     * @param value - The value to store
     */
    set(key, value) {
        // Si la clé existe déjà, la supprimer d'abord pour la déplacer à la fin
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        else if (this.cache.size >= this.maxSize) {
            // Supprimer l'entrée la moins récemment utilisée (première entrée)
            // Map iterator's IteratorResult.value type defaults to "T | any" (the
            // return-position type param defaults to any), which TS collapses to
            // any -- cast explicitly rather than just annotating the variable.
            const firstKey = this.cache.keys().next().value;
            if (firstKey !== undefined) {
                this.cache.delete(firstKey);
            }
        }
        // Ajouter la nouvelle entrée à la fin
        this.cache.set(key, value);
    }
    /**
     * Supprime une entrée du cache
     * Deletes an entry from the cache
     *
     * @param key - The key to delete
     * @returns True if the key was deleted, false otherwise
     */
    delete(key) {
        return this.cache.delete(key);
    }
    /**
     * Vide complètement le cache
     * Clears all entries from the cache
     */
    clear() {
        this.cache.clear();
    }
    /**
     * Retourne la taille actuelle du cache
     * Gets the current size of the cache
     *
     * @returns The number of items in the cache
     */
    get size() {
        return this.cache.size;
    }
    /**
     * Retourne la taille maximale du cache
     * Gets the maximum size limit of the cache
     *
     * @returns The maximum number of items that can be stored
     */
    get maxSizeLimit() {
        return this.maxSize;
    }
    /**
     * Retourne un itérateur sur toutes les entrées du cache
     * Returns an iterator over all entries in the cache
     * Utile pour le nettoyage périodique
     * Useful for periodic cleanup
     *
     * @returns Iterator over [key, value] pairs
     */
    entries() {
        return this.cache.entries();
    }
    /**
     * Retourne un itérateur sur toutes les clés du cache
     * Returns an iterator over all keys in the cache
     *
     * @returns Iterator over keys
     */
    keys() {
        return this.cache.keys();
    }
}

class NLDParser {
    constructor(languages) {
        this.MAX_CACHE_SIZE = 500;
        this.languages = languages;
        this.chronos = getChronos(languages);
        this.tc = new TranslationCollector(languages);
        this.initializeRegex();
        this.initializeKeywords();
        this.cache = new LRUCache(this.MAX_CACHE_SIZE);
        this.cacheDay = this.getDayOfYear();
        // Initialize time detector
        this.timeDetector = new TimeDetector({
            languages: this.languages,
            chronos: this.chronos,
            regexRelative: this.regexRelative,
            regexRelativeCombined: this.regexRelativeCombined,
            regexWeekday: this.regexWeekday,
            regexWeekdayWithTime: this.regexWeekdayWithTime,
        });
    }
    // Initializes dynamic regex from translations
    initializeRegex() {
        const inWords = this.tc.collectWords("in");
        const nextWords = this.tc.collectWords("next");
        const lastWords = this.tc.collectWords("last");
        const thisWords = this.tc.collectWords("this");
        const andWords = this.tc.collectWords("and");
        const atWords = this.tc.collectWords("at");
        const fromWords = this.tc.collectWords("from");
        const toWords = this.tc.collectWords("to");
        // Collect weekdays (lowercased) across all languages, plus the common
        // English abbreviations (mon/tue/...) which aren't part of the dictionary.
        const weekdayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const weekdays = weekdayKeys.flatMap(key => this.tc.collectWords(key, { lowercase: true }));
        if (this.languages.includes('en')) {
            weekdays.push('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');
        }
        // Collect time units (minute/hour/day/week/month/year) across all languages
        const timeUnitKeys = ['minute', 'hour', 'day', 'week', 'month', 'year'];
        const timeUnits = timeUnitKeys.flatMap(key => this.tc.collectWords(key));
        const inPattern = this.tc.buildAlternation(inWords);
        const prefixPattern = this.tc.buildAlternation([...thisWords, ...nextWords, ...lastWords]);
        const weekdayPattern = this.tc.buildAlternation(weekdays);
        const timeUnitPattern = this.tc.buildAlternation(timeUnits);
        const andPattern = this.tc.buildAlternation(andWords);
        const atPattern = this.tc.buildAlternation(atWords);
        const fromPattern = this.tc.buildAlternation(fromWords);
        const toPattern = this.tc.buildAlternation(toWords);
        // Simple regex for "in 2 minutes"
        this.regexRelative = new RegExp(`^\\s*(?:${inPattern})\\s+(\\d+)\\s*(${timeUnitPattern})\\s*$`, 'i');
        // Regex for combinations "in 2 weeks and 3 days"
        this.regexRelativeCombined = new RegExp(`^\\s*(?:${inPattern})\\s+(\\d+)\\s*(${timeUnitPattern})\\s+(?:${andPattern})\\s+(\\d+)\\s*(${timeUnitPattern})\\s*$`, 'i');
        // Simple regex for "next Monday"
        // Uses \s* (not \s+) between prefix and weekday so languages without spaces
        // between words (e.g. Chinese "下一個星期一") still match.
        this.regexWeekday = new RegExp(`^\\s*(${prefixPattern})\\s*(${weekdayPattern})\\s*$`, 'i');
        // Regex for "next Monday at 3pm" - captures day and time
        this.regexWeekdayWithTime = new RegExp(`^\\s*(${prefixPattern})\\s*(${weekdayPattern})\\s+(?:${atPattern})\\s+(.+)$`, 'i');
        // Regex for simple weekday without prefix (e.g., "wednesday", "friday")
        this.regexWeekdayOnly = new RegExp(`^\\s*(${weekdayPattern})\\s*$`, 'i');
        // Regex for "from Monday to Friday" - captures two weekdays
        this.regexDateRange = new RegExp(`^\\s*(?:${fromPattern})\\s*(${weekdayPattern})\\s*(?:${toPattern})\\s*(${weekdayPattern})\\s*$`, 'i');
        const ofPattern = this.tc.buildAlternationFor("of");
        const firstPattern = this.tc.buildAlternationFor("first");
        // Regex for "the 15th of next month" or "le 15 du mois prochain"
        // Pattern: (optional "the"/"le"/"der") (ordinal number like "15th", "15ème", "15.") "of"/"du"/"des" (next/last/this) (month)
        // Also handles French inversion: "le 15 du mois prochain" (month before prefix)
        // Also handles German: "der 15. des nächsten Monats" (prefix between "of" and month)
        // Using ORDINAL_NUMBER_PATTERN from utils.ts for ordinal matching
        this.regexOrdinalOfMonth = new RegExp(`^\\s*(?:the|le|der|das|el|il|o|de|het)?\\s*(${ORDINAL_NUMBER_PATTERN$6})\\s+(?:${ofPattern})\\s+(?:(${prefixPattern})\\s+)?(${timeUnitPattern})(?:\\s+(${prefixPattern}))?\\s*$`, 'i');
        // Regex for "last day of month" or "dernier jour du mois"
        const dayPattern = this.tc.buildAlternationFor("day");
        // Make prefix optional - "last day of month" without prefix means "this month"
        // "last" here is an adjective modifying "day", not a temporal prefix
        // Also handle French inversion: "dernier jour du mois prochain" (month before prefix)
        // Pattern: (optional prefix) "last" (day word) "of" (optional prefix) (month) (optional prefix after month)
        // Reuse lastWords collected above (line 148-150)
        const lastAdjectivePattern = this.tc.buildAlternation(lastWords);
        this.regexLastDayOfMonth = new RegExp(`^\\s*(?:(${prefixPattern})\\s+)?(${lastAdjectivePattern})\\s+(${dayPattern})\\s+(?:${ofPattern})\\s+(?:(${prefixPattern})\\s+)?(${timeUnitPattern})(?:\\s+(${prefixPattern}))?\\s*$`, 'i');
        // Regex for "first Monday of month" or "premier lundi du mois" or "last Monday of month"
        // Also handle French inversion: "premier lundi du mois prochain" (month before prefix)
        this.regexWeekdayOfMonth = new RegExp(`^\\s*(${firstPattern}|${prefixPattern})\\s+(${weekdayPattern})\\s+(?:${ofPattern})\\s+(?:(${prefixPattern})\\s+)?(${timeUnitPattern})(?:\\s+(${prefixPattern}))?\\s*$`, 'i');
        // Suffix-style languages (e.g. Chinese "2天後"/"2天后", Japanese "2日後") put
        // the "later" marker after the number and unit instead of using an "in"
        // prefix. Each language can list its marker(s) explicitly under the
        // "later" key (e.g. Chinese "後|后" for both scripts); this key is never
        // used for display/interpolation, only for this matching, so it's safe to
        // list multiple script variants with "|" the same way weekday/prefix words
        // do. The "indays" template itself must stay a single form since it's
        // also used verbatim in autosuggest labels, and templates with
        // %{timeDelta} don't get split on "|" like plain word lists do.
        //
        // Languages that don't define "later" fall back to inferring the marker
        // from their "indays" template (e.g. "%{timeDelta}天後" -> marker "後"),
        // so this still works for any language authored without the extra key.
        const suffixMarkers = new Set();
        for (const lang of this.languages) {
            const laterWord = this.tc.translate('later', lang);
            if (laterWord && laterWord !== 'NOTFOUND') {
                for (const marker of laterWord.split('|').map(w => w.trim()).filter(w => w)) {
                    suffixMarkers.add(marker);
                }
                continue;
            }
            const template = this.tc.translate('indays', lang);
            if (!template || template === 'NOTFOUND' || template.indexOf('%{timeDelta}') !== 0) {
                continue;
            }
            const remainder = template.slice('%{timeDelta}'.length);
            const dayWord = this.tc.translate('day', lang);
            if (!dayWord || dayWord === 'NOTFOUND')
                continue;
            const unitUsed = dayWord.split('|').map(w => w.trim()).filter(w => w).find(v => remainder.startsWith(v));
            if (!unitUsed)
                continue;
            const marker = remainder.slice(unitUsed.length).trim();
            if (marker)
                suffixMarkers.add(marker);
        }
        if (suffixMarkers.size > 0) {
            const suffixPattern = this.tc.buildAlternation(Array.from(suffixMarkers));
            this.regexRelativeSuffix = new RegExp(`^\\s*(\\d+)\\s*(${timeUnitPattern})\\s*(?:${suffixPattern})\\s*$`, 'i');
            this.regexRelativeCombinedSuffix = new RegExp(`^\\s*(\\d+)\\s*(${timeUnitPattern})\\s*(?:${andPattern})\\s*(\\d+)\\s*(${timeUnitPattern})\\s*(?:${suffixPattern})\\s*$`, 'i');
        }
        else {
            this.regexRelativeSuffix = null;
            this.regexRelativeCombinedSuffix = null;
        }
        // Suffix-style PAST languages (e.g. Portuguese "3 dias atrás" = "3 days"
        // + "atrás" = "ago"), the past-direction mirror of the "later" mechanism
        // above. Unlike "later", there's no template to infer this marker from
        // (the daysago template already has its own %{timeDelta}-prefix form, "há
        // %{timeDelta} dias", which doesn't imply a suffix variant also exists),
        // so languages must opt in explicitly via the "agosuffix" key.
        const agoSuffixMarkers = new Set();
        for (const lang of this.languages) {
            const agoSuffixWord = this.tc.translate('agosuffix', lang);
            if (agoSuffixWord && agoSuffixWord !== 'NOTFOUND') {
                for (const marker of agoSuffixWord.split('|').map(w => w.trim()).filter(w => w)) {
                    agoSuffixMarkers.add(marker);
                }
            }
        }
        if (agoSuffixMarkers.size > 0) {
            const agoSuffixPattern = this.tc.buildAlternation(Array.from(agoSuffixMarkers));
            this.regexAgoSuffix = new RegExp(`^\\s*(\\d+)\\s*(${timeUnitPattern})\\s*(?:${agoSuffixPattern})\\s*$`, 'i');
        }
        else {
            this.regexAgoSuffix = null;
        }
    }
    // Initializes keywords for fast detection
    initializeKeywords() {
        this.immediateKeywords = new Set(['now', 'today', 'tomorrow', 'yesterday'].flatMap(key => this.tc.collectWords(key, { lowercase: true })));
        this.prefixKeywords = {
            this: new Set(this.tc.collectWords("this", { lowercase: true })),
            next: new Set(this.tc.collectWords("next", { lowercase: true })),
            last: new Set(this.tc.collectWords("last", { lowercase: true })),
        };
        // Time units with mapping to Moment.js units
        const unitMappings = [
            { key: 'minute', momentUnit: 'minutes' },
            { key: 'hour', momentUnit: 'hours' },
            { key: 'day', momentUnit: 'days' },
            { key: 'week', momentUnit: 'weeks' },
            { key: 'month', momentUnit: 'months' },
            { key: 'year', momentUnit: 'years' },
        ];
        this.timeUnitMap = new Map();
        for (const mapping of unitMappings) {
            for (const word of this.tc.collectWords(mapping.key, { lowercase: true })) {
                this.timeUnitMap.set(word, mapping.momentUnit);
            }
        }
    }
    // --- UTILITY FUNCTION: DAY NAME → NUMERIC INDEX CONVERSION ---
    // Converts day names from all languages to numeric indices (0-6)
    // Moment.js uses: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
    getDayOfWeekIndex(dayName) {
        const normalized = dayName.toLowerCase();
        // English day names/abbreviations, always available regardless of active languages
        const dayMap = {
            'sunday': 0, 'sun': 0,
            'monday': 1, 'mon': 1,
            'tuesday': 2, 'tue': 2, 'tues': 2,
            'wednesday': 3, 'wed': 3,
            'thursday': 4, 'thu': 4, 'thur': 4, 'thurs': 4,
            'friday': 5, 'fri': 5,
            'saturday': 6, 'sat': 6,
        };
        // Add days from all enabled languages
        const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        dayKeys.forEach((key, i) => {
            for (const variant of this.tc.collectWords(key, { lowercase: true })) {
                dayMap[variant] = i;
            }
        });
        return dayMap[normalized] ?? 0; // Default to Sunday if not recognized
    }
    // --- CACHE UTILITIES ---
    // Get day of year (1-365/366) for cache invalidation
    getDayOfYear() {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const diff = now.getTime() - start.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
    // Generate cache key from selectedText, weekStartPreference, and current day
    generateCacheKey(selectedText, weekStartPreference) {
        const currentDay = this.getDayOfYear();
        // Include day in key to automatically invalidate cache when day changes
        return `${selectedText.trim()}|${weekStartPreference}|${currentDay}`;
    }
    // Store result in cache and return it
    cacheAndReturn(cacheKey, result) {
        // Créer une nouvelle instance de Date pour éviter les références partagées
        const cachedDate = new Date(result.getTime());
        this.cache.set(cacheKey, cachedDate);
        return new Date(result.getTime());
    }
    // --- MAIN ENGINE ---
    /**
     * Parses a natural language date string and returns a Date object.
     *
     * Supports multiple languages and various date expressions:
     * - Immediate dates: "today", "tomorrow", "yesterday", "now"
     * - Relative dates: "in 2 days", "in 3 weeks", "in 1 month"
     * - Combined durations: "in 2 weeks and 3 days"
     * - Weekdays: "next Monday", "last Friday", "this Wednesday"
     * - Weekdays with time: "next Monday at 3pm"
     * - Periods: "next week", "next month", "next year"
     *
     * @param selectedText - Natural language date string to parse (e.g., "tomorrow", "in 2 days", "next Monday")
     * @param weekStartPreference - Day of week to consider as week start (affects "next week" calculations)
     * @returns Parsed Date object, or current date if parsing fails
     *
     * @example
     * ```typescript
     * const parser = new NLDParser(['en', 'fr']);
     * const date = parser.getParsedDate("tomorrow", "monday");
     * console.log(date); // Date object for tomorrow
     * ```
     */
    getParsedDate(selectedText, weekStartPreference) {
        // Nettoyer les caractères spéciaux en fin de chaîne (ex: "tomorrow!!!")
        const cleanedText = selectedText.trim().replace(/[!?.]+$/, '');
        const text = cleanedText.toLowerCase();
        // "now"/"today", "X ago", and "in X units" all resolve relative to the
        // exact current instant (not just the current day), so caching them at
        // the cache's day-sized granularity would return a stale time on every
        // call after the first within that day (e.g. "in 20 minutes" or "now"
        // always returning the first result they ever produced that day).
        // Always compute these fresh, bypassing the cache entirely.
        // "tomorrow"/"yesterday" resolve to a specific calendar day like the
        // other cached expressions below, so they stay on the cached path
        // (handled by tryImmediateKeywords further down).
        const nowWords = this.tc.collectWords('now', { lowercase: true });
        const todayWords = this.tc.collectWords('today', { lowercase: true });
        const volatileResult = (nowWords.includes(text) || todayWords.includes(text) ? new Date() : null) ??
            this.tryPastExpressions(text, cleanedText) ??
            this.tryRelativeCalculation(cleanedText);
        if (volatileResult)
            return volatileResult;
        // Vérifier si le jour a changé pour invalider le cache
        const currentDay = this.getDayOfYear();
        if (currentDay !== this.cacheDay) {
            this.cache.clear();
            this.cacheDay = currentDay;
        }
        // Générer la clé du cache avec le texte nettoyé pour que "tomorrow" et "tomorrow!!!" utilisent la même clé
        const cacheKey = this.generateCacheKey(cleanedText, weekStartPreference);
        // Vérifier le cache avant de parser
        const cachedDate = this.cache.get(cacheKey);
        if (cachedDate) {
            // Créer une nouvelle instance de Date pour éviter les références partagées
            return new Date(cachedDate.getTime());
        }
        // Each try*() method below returns null when it doesn't recognize the
        // input, letting the next level have a shot -- same LEVEL 1-4 order this
        // file has always used, just split into named, independently readable
        // methods instead of one function that used to run ~570 lines.
        const result = this.tryImmediateKeywords(text) ??
            this.tryDateRangeShortcut(cleanedText) ??
            this.tryWeekdays(cleanedText) ??
            this.tryOrdinalOfMonth(cleanedText) ??
            this.tryLastDayOfMonth(cleanedText) ??
            this.tryWeekdayOfMonth(cleanedText) ??
            this.tryNextPeriodShortcut(cleanedText) ??
            this.chronoFallback(selectedText, weekStartPreference);
        return this.cacheAndReturn(cacheKey, result);
    }
    // ============================================================
    // LEVEL 1: IMMEDIATE KEYWORDS (Speed and Precision)
    // ============================================================
    tryImmediateKeywords(text) {
        if (!this.immediateKeywords.has(text))
            return null;
        if (this.tc.collectWords('now', { lowercase: true }).includes(text)) {
            return new Date();
        }
        if (this.tc.collectWords('today', { lowercase: true }).includes(text)) {
            return new Date();
        }
        if (this.tc.collectWords('tomorrow', { lowercase: true }).includes(text)) {
            return moment().add(1, 'days').toDate();
        }
        if (this.tc.collectWords('yesterday', { lowercase: true }).includes(text)) {
            return moment().subtract(1, 'days').toDate();
        }
        return null;
    }
    // ============================================================
    // LEVEL 1.5: PAST EXPRESSIONS (2 days ago, il y a 3 min)
    // ============================================================
    tryPastExpressions(text, cleanedText) {
        // Check for "ago" expressions in English (e.g., "2 days ago"). Unlike
        // every other unit-capturing regex in this file, this one captures the
        // unit generically (\w+, not restricted to known translated words), so
        // guessUnit()'s abbreviation-guessing fallback is genuinely reachable
        // here for units no enabled language's dictionary recognizes.
        const agoMatch = text.match(/^(\d+)\s+(\w+)\s+ago$/i);
        if (agoMatch) {
            const value = parseInt(agoMatch[1]);
            const unitStr = agoMatch[2].toLowerCase().trim();
            const unit = this.guessUnit(unitStr);
            return moment().subtract(value, unit).toDate();
        }
        // Check for past expressions in all languages (e.g., "il y a 3 minutes", "vor 2 Stunden", etc.)
        for (const lang of this.languages) {
            const minutesAgoPattern = this.tc.translate("minutesago", lang);
            const hoursAgoPattern = this.tc.translate("hoursago", lang);
            const daysAgoPattern = this.tc.translate("daysago", lang);
            const weeksAgoPattern = this.tc.translate("weeksago", lang);
            const monthsAgoPattern = this.tc.translate("monthsago", lang);
            const patterns = [
                { pattern: minutesAgoPattern, unit: 'minutes' },
                { pattern: hoursAgoPattern, unit: 'hours' },
                { pattern: daysAgoPattern, unit: 'days' },
                { pattern: weeksAgoPattern, unit: 'weeks' },
                { pattern: monthsAgoPattern, unit: 'months' },
            ];
            for (const { pattern, unit } of patterns) {
                const regex = this.buildAgoRegex(pattern);
                if (regex) {
                    const match = cleanedText.match(regex);
                    if (match) {
                        const value = parseInt(match[1]);
                        return moment().subtract(value, unit).toDate();
                    }
                }
            }
        }
        // Suffix-style past expressions, e.g. Portuguese "3 dias atrás" (3 days ago)
        const agoSuffixMatch = this.regexAgoSuffix ? cleanedText.match(this.regexAgoSuffix) : null;
        if (agoSuffixMatch) {
            const value = parseInt(agoSuffixMatch[1]);
            const unitStr = agoSuffixMatch[2].toLowerCase().trim();
            const unit = this.guessUnit(unitStr);
            return moment().subtract(value, unit).toDate();
        }
        return null;
    }
    // Converts an "X ago" translation template into a matching regex.
    // Example: "il y a %{timeDelta} minutes" -> "il y a (\d+) minutes"
    // Example: "через %{timeDelta} минут|минуту|минуты назад" (Russian
    // grammatical forms) -> "через (\d+) (?:минут|минуту|минуты) назад"
    // Example: "%{timeDelta}天前" (Chinese, no spaces) -> "(\d+)天前"
    buildAgoRegex(pattern) {
        if (!pattern || pattern === "NOTFOUND")
            return null;
        const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Placeholder swapped in before escaping and back out afterwards, so
        // %{timeDelta} becomes a real capture group instead of being mangled by
        // escaping its own inserted "(\d+)", and so it still works when embedded
        // in a token with no surrounding whitespace (e.g. Chinese "%{timeDelta}天前").
        const PLACEHOLDER = '\u0000TIMEDELTA\u0000';
        const regexStr = pattern
            .split(/\s+/)
            .map(token => {
            const withPlaceholder = token.replace(/%\{timeDelta\}/g, PLACEHOLDER);
            // "|" inside a token means multiple grammatical forms of the same
            // word (e.g. Russian "минут|минуту|минуты"): turn it into an
            // alternation instead of escaping it into a literal pipe.
            if (withPlaceholder.includes('|')) {
                const alternatives = withPlaceholder
                    .split('|')
                    .map(alt => escapeRegex(alt).split(PLACEHOLDER).join('(\\d+)'));
                return `(?:${alternatives.join('|')})`;
            }
            return escapeRegex(withPlaceholder).split(PLACEHOLDER).join('(\\d+)');
        })
            .join('\\s+');
        return new RegExp(`^${regexStr}$`, 'i');
    }
    // Shared abbreviation-guessing fallback for unit words that aren't in any
    // enabled language's dictionary. Only reachable from callers whose regex
    // captures the unit generically (the hardcoded English "ago" regex above,
    // and the multi-unit "in X and Y" split below) -- regexRelative and the
    // suffix regexes restrict their capture group to already-known words, so
    // this fallback can never fire for them (verified empirically before the
    // dead branches that used to sit in those paths were removed).
    guessUnit(unitStr) {
        const mapped = this.timeUnitMap.get(unitStr);
        if (mapped) {
            return mapped;
        }
        if (unitStr.startsWith('h'))
            return 'hours';
        else if (unitStr.startsWith('d') || unitStr.startsWith('j'))
            return 'days';
        else if (unitStr.startsWith('w') || unitStr.startsWith('s'))
            return 'weeks';
        else if (unitStr === 'm' || unitStr.startsWith('min'))
            return 'minutes';
        else if (unitStr.startsWith('mo') || unitStr === 'M' || unitStr.startsWith('mois'))
            return 'months';
        else if (unitStr.startsWith('y') || unitStr.startsWith('a'))
            return 'years';
        return 'days';
    }
    // ============================================================
    // LEVEL 2: RELATIVE CALCULATION (in 2 minutes, in 1 year...)
    // ============================================================
    tryRelativeCalculation(cleanedText) {
        // First check combinations "in 2 weeks and 3 days" or multiple combinations
        // Try to parse multiple combinations like "in 1 year and 2 months and 3 weeks and 4 days"
        let hasMultiUnits = false;
        const totalMoment = moment();
        // Try to match all "X unit" patterns after "in"
        const inPatterns = Array.from(new Set(this.languages.map(l => this.tc.translate("in", l)).filter(v => v !== "NOTFOUND").flatMap(v => v.split("|"))));
        const andPatterns = Array.from(new Set(this.languages.map(l => this.tc.translate("and", l)).filter(v => v !== "NOTFOUND").flatMap(v => v.split("|"))));
        const inRegex = new RegExp(`^(${this.tc.buildAlternation(inPatterns)})\\s+`, 'i');
        const andRegex = new RegExp(`\\s+(${this.tc.buildAlternation(andPatterns)})\\s+`, 'gi');
        if (cleanedText.match(inRegex)) {
            const withoutIn = cleanedText.replace(inRegex, '');
            const parts = withoutIn.split(andRegex).filter(p => p && !andPatterns.some(a => a.toLowerCase() === p.trim().toLowerCase()));
            if (parts.length >= 2) {
                // Multiple units detected (2 or more)
                for (const part of parts) {
                    const unitMatch = part.trim().match(/^(\d+)\s+([^\s]+)$/i);
                    if (unitMatch) {
                        const value = parseInt(unitMatch[1]);
                        const unitStr = unitMatch[2].toLowerCase().trim();
                        totalMoment.add(value, this.guessUnit(unitStr));
                        hasMultiUnits = true;
                    }
                }
                if (hasMultiUnits) {
                    return totalMoment.toDate();
                }
            }
        }
        // Suffix-style combinations, e.g. Chinese "2週和3天後" (2 weeks and 3 days later)
        const relCombinedSuffixMatch = this.regexRelativeCombinedSuffix ? cleanedText.match(this.regexRelativeCombinedSuffix) : null;
        if (relCombinedSuffixMatch) {
            const value1 = parseInt(relCombinedSuffixMatch[1]);
            const unitStr1 = relCombinedSuffixMatch[2].toLowerCase().trim();
            const value2 = parseInt(relCombinedSuffixMatch[3]);
            const unitStr2 = relCombinedSuffixMatch[4].toLowerCase().trim();
            const unit1 = this.guessUnit(unitStr1);
            const unit2 = this.guessUnit(unitStr2);
            return moment().add(value1, unit1).add(value2, unit2).toDate();
        }
        // Then check simple expressions "in 2 minutes"
        const relMatch = cleanedText.match(this.regexRelative);
        if (relMatch) {
            const value = parseInt(relMatch[1]);
            const unitStr = relMatch[2].toLowerCase().trim();
            // unitStr is guaranteed to be a registered key here: regexRelative's
            // unit capture group is built from this.tc.collectWords() for the same
            // six keys that populate timeUnitMap, so a successful regex match
            // already implies a hit -- the fallback below is unreachable.
            const unit = this.timeUnitMap.get(unitStr) ?? this.guessUnit(unitStr);
            // MomentJS handles year transitions perfectly
            return moment().add(value, unit).toDate();
        }
        // Suffix-style simple expressions, e.g. Chinese "2天後" (2 days later)
        const relSuffixMatch = this.regexRelativeSuffix ? cleanedText.match(this.regexRelativeSuffix) : null;
        if (relSuffixMatch) {
            const value = parseInt(relSuffixMatch[1]);
            const unitStr = relSuffixMatch[2].toLowerCase().trim();
            const unit = this.guessUnit(unitStr);
            return moment().add(value, unit).toDate();
        }
        return null;
    }
    // ============================================================
    // LEVEL 2.5: DATE RANGES (from Monday to Friday)
    // ============================================================
    // Returns just the start date, for getParsedDate()'s single-Date contract
    // -- see getParsedDateRange() for the full range with a date list.
    tryDateRangeShortcut(cleanedText) {
        const rangeMatch = cleanedText.match(this.regexDateRange);
        if (!rangeMatch)
            return null;
        const startDayName = rangeMatch[1].toLowerCase();
        const m = moment();
        const startDayIndex = this.getDayOfWeekIndex(startDayName);
        const startMoment = moment().day(startDayIndex);
        if (startMoment.isBefore(m, 'day')) {
            startMoment.add(1, 'week');
        }
        return startMoment.toDate();
    }
    // ============================================================
    // LEVEL 3: WEEKDAYS (next friday...)
    // ============================================================
    tryWeekdays(cleanedText) {
        // First check "next Monday at 3pm"
        const weekWithTimeMatch = cleanedText.match(this.regexWeekdayWithTime);
        if (weekWithTimeMatch) {
            const prefix = weekWithTimeMatch[1].toLowerCase();
            const dayName = weekWithTimeMatch[2].toLowerCase();
            const timePart = weekWithTimeMatch[3].trim();
            const m = moment();
            const dayIndex = this.getDayOfWeekIndex(dayName);
            if (this.prefixKeywords.this.has(prefix)) {
                m.day(dayIndex);
            }
            else if (this.prefixKeywords.next.has(prefix)) {
                m.add(1, 'weeks').day(dayIndex);
            }
            else if (this.prefixKeywords.last.has(prefix)) {
                // Pour "last/dernier <jour>", on cible toujours la semaine précédente
                m.day(dayIndex).subtract(1, 'week');
            }
            // Parse time with chrono-node. getParsedDateResult returns null
            // (rather than a "now" placeholder) when nothing matched, so a time
            // part chrono-node can't parse (e.g. "next Monday at zzqqxx") falls
            // back to the already-computed weekday date below, instead of
            // silently discarding it in favor of the actual current date/time.
            const timeResult = this.getParsedDateResult(timePart, m.toDate());
            if (timeResult) {
                return timeResult;
            }
            // If time parsing fails, return just the date
            return m.toDate();
        }
        // Then check simple expressions "next Monday"
        const weekMatch = cleanedText.match(this.regexWeekday);
        if (weekMatch) {
            const prefix = weekMatch[1].toLowerCase();
            const dayName = weekMatch[2].toLowerCase();
            const m = moment();
            const dayIndex = this.getDayOfWeekIndex(dayName);
            if (this.prefixKeywords.this.has(prefix)) {
                m.day(dayIndex);
            }
            else if (this.prefixKeywords.next.has(prefix)) {
                m.add(1, 'weeks').day(dayIndex);
            }
            else if (this.prefixKeywords.last.has(prefix)) {
                // Pour "last/dernier <jour>", on cible toujours la semaine précédente
                m.day(dayIndex).subtract(1, 'week');
            }
            return m.toDate();
        }
        // Check for weekday without prefix (e.g., "wednesday", "friday")
        // This should be interpreted as "next [day]" or "this [day]" if today
        const weekOnlyMatch = cleanedText.match(this.regexWeekdayOnly);
        if (weekOnlyMatch) {
            const dayName = weekOnlyMatch[1].toLowerCase();
            const m = moment();
            const dayIndex = this.getDayOfWeekIndex(dayName);
            m.day(dayIndex);
            // If the day is in the past (before today), move to next week
            if (m.isBefore(moment(), 'day')) {
                m.add(1, 'week');
            }
            return m.toDate();
        }
        return null;
    }
    // ============================================================
    // LEVEL 3.5a: "the Xth of next month" / "the Nth of next year"
    // ============================================================
    tryOrdinalOfMonth(cleanedText) {
        const ordinalOfMonthMatch = cleanedText.match(this.regexOrdinalOfMonth);
        if (!ordinalOfMonthMatch)
            return null;
        const ordinalStr = ordinalOfMonthMatch[1].trim();
        // Groups: [1]=ordinal, [2]=prefix before month (optional), [3]=month, [4]=prefix after month (optional, for French)
        const prefixBefore = ordinalOfMonthMatch[2]?.toLowerCase() || '';
        const periodStr = ordinalOfMonthMatch[3]?.toLowerCase() || '';
        const prefixAfter = ordinalOfMonthMatch[4]?.toLowerCase() || '';
        // Use prefix after month if present (French inversion), otherwise prefix before
        const prefix = prefixAfter || prefixBefore;
        // Parse ordinal number (e.g., "15th" -> 15, "first" -> 1)
        const dayNumber = parseOrdinalNumberPattern$6(ordinalStr);
        // Determine which period (month/year) to target
        const targetMoment = moment();
        const isMonth = this.tc.collectWords('month', { lowercase: true }).includes(periodStr);
        const isYear = !isMonth && this.tc.collectWords('year', { lowercase: true }).includes(periodStr);
        if (isMonth) {
            if (prefix && this.prefixKeywords.next.has(prefix)) {
                targetMoment.add(1, 'months').startOf('month');
            }
            else if (prefix && this.prefixKeywords.last.has(prefix)) {
                targetMoment.subtract(1, 'months').startOf('month');
            }
            else {
                // "this"/no prefix both mean "this month"
                targetMoment.startOf('month');
            }
            // Set the day of month (clamp to valid range)
            const daysInMonth = targetMoment.daysInMonth();
            const targetDay = Math.min(dayNumber, daysInMonth);
            targetMoment.date(targetDay);
        }
        else if (isYear) {
            if (prefix && this.prefixKeywords.next.has(prefix)) {
                targetMoment.add(1, 'years').startOf('year');
            }
            else if (prefix && this.prefixKeywords.last.has(prefix)) {
                targetMoment.subtract(1, 'years').startOf('year');
            }
            else {
                targetMoment.startOf('year');
            }
            // For year, interpret as day of year (1-365/366)
            const daysInYear = targetMoment.isLeapYear() ? 366 : 365;
            const targetDayOfYear = Math.min(dayNumber, daysInYear);
            targetMoment.dayOfYear(targetDayOfYear);
        }
        return targetMoment.toDate();
    }
    // ============================================================
    // LEVEL 3.5b: "last day of month" / "dernier jour du mois"
    // ============================================================
    tryLastDayOfMonth(cleanedText) {
        const lastDayOfMonthMatch = cleanedText.match(this.regexLastDayOfMonth);
        if (!lastDayOfMonthMatch)
            return null;
        // Groups: [1]=prefix before "last" (optional), [2]="last", [3]=day, [4]=prefix before month (optional), [5]=month, [6]=prefix after month (optional, for French)
        const prefixBefore = lastDayOfMonthMatch[1]?.toLowerCase() || '';
        const periodStr = lastDayOfMonthMatch[5]?.toLowerCase() || '';
        const prefixAfter = lastDayOfMonthMatch[6]?.toLowerCase() || '';
        const prefixBeforeMonth = lastDayOfMonthMatch[4]?.toLowerCase() || '';
        // Use prefix after month if present (French inversion), otherwise prefix before month, otherwise prefix before "last"
        const prefix = prefixAfter || prefixBeforeMonth || prefixBefore;
        const targetMoment = moment();
        const isMonth = this.tc.collectWords('month', { lowercase: true }).includes(periodStr);
        if (!isMonth)
            return null;
        if (prefix && this.prefixKeywords.next.has(prefix)) {
            targetMoment.add(1, 'months').endOf('month');
        }
        else if (prefix && this.prefixKeywords.last.has(prefix)) {
            targetMoment.subtract(1, 'months').endOf('month');
        }
        else {
            // "this"/no prefix both mean "this month"
            targetMoment.endOf('month');
        }
        return targetMoment.toDate();
    }
    // ============================================================
    // LEVEL 3.5c: "first Monday of month" / "last Friday of next month"
    // ============================================================
    tryWeekdayOfMonth(cleanedText) {
        const weekdayOfMonthMatch = cleanedText.match(this.regexWeekdayOfMonth);
        if (!weekdayOfMonthMatch)
            return null;
        // Groups: [1]=first/prefix, [2]=weekday, [3]=prefix before month (optional), [4]=month, [5]=prefix after month (optional, for French)
        const prefixOrFirst = weekdayOfMonthMatch[1].toLowerCase();
        const dayName = weekdayOfMonthMatch[2].toLowerCase();
        const prefixBeforeMonth = weekdayOfMonthMatch[3]?.toLowerCase() || '';
        const periodStr = weekdayOfMonthMatch[4]?.toLowerCase() || '';
        const prefixAfter = weekdayOfMonthMatch[5]?.toLowerCase() || '';
        // Use prefix after month if present (French inversion), otherwise prefix before month, otherwise prefixOrFirst
        const monthPrefix = prefixAfter || prefixBeforeMonth;
        const dayIndex = this.getDayOfWeekIndex(dayName);
        const isFirst = this.tc.collectWords("first", { lowercase: true }).includes(prefixOrFirst);
        const isMonth = this.tc.collectWords('month', { lowercase: true }).includes(periodStr);
        if (!isMonth)
            return null;
        const isLast = !isFirst && this.prefixKeywords.last.has(prefixOrFirst);
        let targetMoment = moment();
        if (isFirst) {
            // First weekday of month
            if (monthPrefix && this.prefixKeywords.next.has(monthPrefix)) {
                targetMoment.add(1, 'months').startOf('month');
            }
            else if (monthPrefix && this.prefixKeywords.last.has(monthPrefix)) {
                targetMoment.subtract(1, 'months').startOf('month');
            }
            else {
                targetMoment.startOf('month');
            }
            // Find the first occurrence of the weekday in the target month
            const firstDayOfMonth = targetMoment.clone().startOf('month');
            const firstWeekdayIndex = firstDayOfMonth.day();
            const daysToAdd = (dayIndex - firstWeekdayIndex + 7) % 7;
            targetMoment = firstDayOfMonth.add(daysToAdd, 'days');
        }
        else if (isLast) {
            // Last weekday of month
            if (monthPrefix && this.prefixKeywords.next.has(monthPrefix)) {
                targetMoment.add(1, 'months').endOf('month');
            }
            else if (monthPrefix && this.prefixKeywords.last.has(monthPrefix)) {
                targetMoment.subtract(1, 'months').endOf('month');
            }
            else {
                // "this"/no prefix both mean "this month"
                targetMoment.endOf('month');
            }
            // Find the last occurrence of the weekday by going to end of month and working backwards
            const lastDayOfMonth = targetMoment.clone().endOf('month');
            const lastWeekdayIndex = lastDayOfMonth.day();
            const daysToSubtract = (lastWeekdayIndex - dayIndex + 7) % 7;
            targetMoment = lastDayOfMonth.subtract(daysToSubtract, 'days');
        }
        else {
            // Prefix-based (next/this) - default to first
            if (monthPrefix && this.prefixKeywords.next.has(monthPrefix)) {
                targetMoment.add(1, 'months').startOf('month');
            }
            else {
                // "this"/no prefix both mean "this month"
                targetMoment.startOf('month');
            }
            // Find the first occurrence of the weekday in the target month
            const firstDayOfMonth = targetMoment.clone().startOf('month');
            const firstWeekdayIndex = firstDayOfMonth.day();
            const daysToAdd = (dayIndex - firstWeekdayIndex + 7) % 7;
            targetMoment = firstDayOfMonth.add(daysToAdd, 'days');
        }
        return targetMoment.toDate();
    }
    // ============================================================
    // LEVEL 4a: "next month" / "next year" shortcut (before falling to chrono-node)
    // ============================================================
    // Note: "next week" is intentionally NOT handled here -- it's left to
    // getParsedDateRange() to generate a full date list, so that case falls
    // through to the chrono-node fallback instead.
    tryNextPeriodShortcut(cleanedText) {
        // Uses \s* (not \s+) so this also matches languages without spaces between
        // words (e.g. Chinese "下一個星期"). The period is matched against the known
        // week/month/year words directly (not a generic \S+/\w+ capture): otherwise a
        // shorter word that is a prefix of a longer one (e.g. French "prochain" vs
        // "prochaine") can match first and leave the remaining letters to be
        // mis-captured as the period.
        const nextPattern = this.tc.buildAlternation(Array.from(this.prefixKeywords.next));
        const periodWordsAll = ['week', 'month', 'year'].flatMap(key => this.tc.collectWords(key));
        const periodPatternAll = this.tc.buildAlternation(periodWordsAll);
        const nextDateMatch = cleanedText.match(new RegExp(`(${nextPattern})\\s*(${periodPatternAll})`, 'i'));
        if (!nextDateMatch)
            return null;
        const period = nextDateMatch[2].toLowerCase();
        const isNextWeek = this.tc.collectWords('week', { lowercase: true }).includes(period);
        if (isNextWeek)
            return null;
        if (this.tc.collectWords('month', { lowercase: true }).includes(period)) {
            return moment().add(1, 'months').startOf('month').toDate();
        }
        if (this.tc.collectWords('year', { lowercase: true }).includes(period)) {
            return moment().add(1, 'years').startOf('year').toDate();
        }
        return null;
    }
    // ============================================================
    // LEVEL 4b: THE REST (chrono-node library, final fallback)
    // ============================================================
    chronoFallback(selectedText, weekStartPreference) {
        if (!this.chronos || this.chronos.length === 0)
            return new Date();
        // We use the "Best Score" technique to choose between EN and FR
        const weekStart = weekStartPreference === "locale-default" ? getLocaleWeekStart() : weekStartPreference;
        const locale = { weekStart: getWeekNumber(weekStart) };
        const referenceDate = new Date();
        // Standard library call with forced forwardDate
        const chronoResult = this.getParsedDateResult(selectedText, referenceDate, {
            locale,
            forwardDate: true
        });
        // Nothing matched anywhere: this is the final fallback level, so (per
        // this method's documented contract) fall back to the current date.
        return chronoResult ?? new Date();
    }
    /**
     * Parses a natural language date range string and returns a range result.
     *
     * Supports various range expressions:
     * - Weekday ranges: "from Monday to Friday"
     * - Week ranges: "next week" (returns all days of next week)
     * - Works in all enabled languages with native translations
     *
     * @param selectedText - Natural language date range string (e.g., "from Monday to Friday", "next week")
     * @param weekStartPreference - Day of week to consider as week start
     * @returns NLDRangeResult object with start/end dates and date list, or null if not a range
     *
     * @example
     * ```typescript
     * const parser = new NLDParser(['en', 'fr']);
     * const range = parser.getParsedDateRange("from Monday to Friday", "monday");
     * if (range) {
     *   console.log(range.dateList?.length); // 5 (Monday through Friday)
     * }
     * ```
     */
    getParsedDateRange(selectedText, weekStartPreference) {
        // Check "from Monday to Friday"
        const rangeMatch = selectedText.match(this.regexDateRange);
        if (rangeMatch) {
            const startDayName = rangeMatch[1].toLowerCase();
            const endDayName = rangeMatch[2].toLowerCase();
            const m = moment();
            const startDayIndex = this.getDayOfWeekIndex(startDayName);
            const endDayIndex = this.getDayOfWeekIndex(endDayName);
            // Find next start day
            const startMoment = moment().day(startDayIndex);
            if (startMoment.isBefore(m, 'day')) {
                startMoment.add(1, 'week');
            }
            // Find next end day (must be after or equal to start day)
            let endMoment = moment().day(endDayIndex);
            // If end day is before start day, take the one from next week
            if (endMoment.isBefore(startMoment, 'day')) {
                endMoment.add(1, 'week');
            }
            // Ensure endMoment is always after or equal to startMoment
            if (endMoment.isBefore(startMoment, 'day')) {
                endMoment = startMoment.clone().add(1, 'week').day(endDayIndex);
            }
            const format = "YYYY-MM-DD";
            const startFormatted = startMoment.format(format);
            const endFormatted = endMoment.format(format);
            // Generate list of all dates in range
            const dateList = [];
            const currentMoment = startMoment.clone();
            while (currentMoment.isSameOrBefore(endMoment, 'day')) {
                dateList.push(currentMoment.clone());
                currentMoment.add(1, 'day');
            }
            const result = {
                formattedString: `${startFormatted} to ${endFormatted}`,
                startDate: startMoment.toDate(),
                endDate: endMoment.toDate(),
                startMoment: startMoment.clone(),
                endMoment: endMoment.clone(),
                isRange: true,
                dateList: dateList,
            };
            return result;
        }
        // Check "next week" as range (both "next week" and "week next" for languages like French)
        // Uses \s* (not \s+) so this also matches languages without spaces between
        // words (e.g. Chinese "下一個星期"). The period is matched against the known
        // "week" words directly (not a generic \S+/\w+ capture): otherwise a shorter
        // word that is a prefix of a longer one (e.g. French "prochain" vs "prochaine")
        // can match first and leave the remaining letters to be mis-captured as the period.
        const nextPattern = this.tc.buildAlternation(Array.from(this.prefixKeywords.next));
        const weekPatternAll = this.tc.buildAlternationFor('week');
        // First try "next week" pattern
        let nextWeekMatch = selectedText.match(new RegExp(`(${nextPattern})\\s*(${weekPatternAll})`, 'i'));
        let periodIndex = 2; // Index of period in match array
        if (!nextWeekMatch) {
            // Try reverse pattern "week next" for languages like French
            nextWeekMatch = selectedText.match(new RegExp(`(${weekPatternAll})\\s*(${nextPattern})`, 'i'));
            if (nextWeekMatch) {
                periodIndex = 1; // Period is now at index 1
            }
        }
        if (nextWeekMatch) {
            const period = nextWeekMatch[periodIndex].toLowerCase();
            if (this.tc.collectWords('week', { lowercase: true }).includes(period)) {
                // Next week -> return from Monday to Sunday of next week
                const weekStart = weekStartPreference === "locale-default" ? getLocaleWeekStart() : weekStartPreference;
                const weekStartIndex = this.getDayOfWeekIndex(String(weekStart));
                const startMoment = moment().add(1, 'weeks').day(weekStartIndex);
                const endMoment = startMoment.clone().add(6, 'days');
                const format = "YYYY-MM-DD";
                const startFormatted = startMoment.format(format);
                const endFormatted = endMoment.format(format);
                // Generate list of all dates in range
                const dateList = [];
                const currentMoment = startMoment.clone();
                while (currentMoment.isSameOrBefore(endMoment, 'day')) {
                    dateList.push(currentMoment.clone());
                    currentMoment.add(1, 'day');
                }
                const result = {
                    formattedString: `${startFormatted} to ${endFormatted}`,
                    startDate: startMoment.toDate(),
                    endDate: endMoment.toDate(),
                    startMoment: startMoment.clone(),
                    endMoment: endMoment.clone(),
                    isRange: true,
                    dateList: dateList,
                };
                return result;
            }
        }
        return null;
    }
    // --- UTILITY FUNCTION: WHO HAS THE BEST SCORE? ---
    // Returns null (rather than a "now" placeholder) when chrono-node found no
    // match, so callers can tell "nothing parsed" apart from "parsed to right
    // now" and fall back accordingly instead of silently accepting a bogus
    // current-date/time result.
    getParsedDateResult(text, referenceDate, option) {
        if (!this.chronos || this.chronos.length === 0)
            return null;
        let bestResult = null;
        let bestScore = 0;
        for (const c of this.chronos) {
            try {
                const results = c.parse(text, referenceDate, option);
                // chrono can return several disjoint matches for one string (e.g.
                // "today in 3 minutes" -> ["today", "in 3 minutes"], parsed as two
                // independent candidates, neither containing the other). Comparing
                // every candidate's score -- not just results[0] -- means the more
                // specific/informative one wins instead of always picking whichever
                // chrono happened to list first, which silently discarded "in 3
                // minutes" and returned the current time unmodified.
                for (const match of results || []) {
                    if (match.text.length > bestScore) {
                        bestScore = match.text.length;
                        bestResult = match;
                    }
                }
            }
            catch (e) {
                logger.warn('Chrono parsing error in getParsedDateResult', {
                    text,
                    error: describeError(e),
                });
            }
        }
        return bestResult ? bestResult.start.date() : null;
    }
    getParsedResult(text) {
        if (!this.chronos)
            return [];
        let bestResults = [];
        let bestScore = 0;
        for (const c of this.chronos) {
            try {
                const results = c.parse(text);
                if (results && results.length > 0) {
                    if (results[0].text.length > bestScore) {
                        bestScore = results[0].text.length;
                        bestResults = results;
                    }
                }
            }
            catch (e) {
                logger.warn('Chrono parsing error in getParsedResult', {
                    text,
                    error: describeError(e),
                });
            }
        }
        return bestResults;
    }
    // --- TIME DETECTION (FOR DISPLAY) ---
    /**
     * Checks if a text string contains a time component.
     *
     * Detects various time expressions:
     * - Explicit times: "at 3pm", "at 15:00", "à 15h"
     * - Time in relative expressions: "in 2 hours", "dans 2 heures"
     * - Works with all enabled languages
     *
     * @param text - Text string to check for time component
     * @returns true if a time component is detected, false otherwise
     *
     * @example
     * ```typescript
     * const parser = new NLDParser(['en', 'fr']);
     * parser.hasTimeComponent("next Monday at 3pm"); // true
     * parser.hasTimeComponent("tomorrow"); // false
     * parser.hasTimeComponent("in 2 hours"); // true
     * ```
     */
    hasTimeComponent(text) {
        return this.timeDetector.hasTimeComponent(text);
    }
    // --- CACHE STATISTICS (FOR MONITORING) ---
    /**
     * Retourne les statistiques du cache de parsing
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            maxSize: this.cache.maxSizeLimit,
        };
    }
}

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
// Optimal String Alignment (OSA) edit distance: like Levenshtein, but also
// treats swapping two adjacent characters as a single edit (e.g. "heir" vs
// "hier" is distance 1, not 2) -- an adjacent-letter transposition is one of
// the most common typing mistakes, and plain Levenshtein would otherwise
// count it as two substitutions and push it past the threshold in
// fuzzyMatchesQuery() below. Space is kept to three rolling rows of length
// b.length + 1 (instead of a full (a.length+1) x (b.length+1) table) since
// this runs on every keystroke against every candidate.
function editDistance(a, b) {
    const n = b.length;
    let twoRowsAgo = new Array(n + 1).fill(0);
    let prevRow = Array.from({ length: n + 1 }, (_, j) => j);
    let currentRow = new Array(n + 1).fill(0);
    for (let i = 1; i <= a.length; i++) {
        currentRow[0] = i;
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            let value = Math.min(prevRow[j] + 1, // deletion
            currentRow[j - 1] + 1, // insertion
            prevRow[j - 1] + cost // substitution
            );
            if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
                value = Math.min(value, twoRowsAgo[j - 2] + 1); // transposition
            }
            currentRow[j] = value;
        }
        [twoRowsAgo, prevRow, currentRow] = [prevRow, currentRow, twoRowsAgo];
    }
    return prevRow[n];
}
// Prefix match if possible (fast, exact, and the only behavior for queries
// too short to fuzzy-match reliably); otherwise tolerate a small edit
// distance between the query and candidate prefixes of similar length, so a
// single wrong/missing/transposed letter near the start of the query still
// surfaces the intended suggestion instead of none at all. Checks a window
// of prefix lengths around the query's own length (query.length ± threshold)
// rather than a single fixed-length slice -- comparing against a prefix
// that's forced to be longer than the query by more than the threshold would
// otherwise make the edit distance at least that length difference, which
// can exceed the threshold even for an exact-prefix match (e.g. "tomur"
// against a fixed 7-character slice of "tomorrow" is already 2 edits away
// before accounting for the actual typo). Only used for short, fixed
// candidate lists (today/tomorrow, weekdays, history/context) -- the
// multi-stage progressive-typing suggestion generators elsewhere in this
// file keep strict prefix matching, since fuzzy matching interacts
// unpredictably with their partial-completion logic.
function fuzzyMatchesQuery(candidate, query) {
    const c = candidate.toLowerCase();
    const q = query.toLowerCase();
    if (!q || c.startsWith(q))
        return true;
    if (q.length <= 2)
        return false; // too short to fuzzy-match without noise
    const threshold = q.length <= 5 ? 1 : 2;
    const minLen = Math.max(1, q.length - threshold);
    const maxLen = Math.min(c.length, q.length + threshold);
    for (let len = minLen; len <= maxLen; len++) {
        if (editDistance(c.slice(0, len), q) <= threshold)
            return true;
    }
    return false;
}
class DateSuggest extends require$$0.EditorSuggest {
    constructor(app, plugin) {
        super(app);
        this.app = app;
        this.plugin = plugin;
        // Type assertion needed: Obsidian's EditorSuggest scope doesn't expose register method in types,
        // but it exists at runtime. This allows us to register custom keyboard shortcuts.
        const scope = this.scope;
        scope.register(["Shift"], "Enter", (evt) => {
            // Type assertion needed: EditorSuggest's internal suggestions API is not fully typed.
            // This allows access to useSelectedItem method which exists at runtime for Shift+Enter functionality.
            const editorSuggest = this;
            editorSuggest.suggestions.useSelectedItem(evt);
            return false;
        });
        if (this.plugin.settings.autosuggestToggleLink) {
            this.setInstructions([{ command: "Shift", purpose: "Keep text as alias" }]);
        }
    }
    getSuggestions(context) {
        // handle no matches
        const suggestions = this.getDateSuggestions(context);
        return suggestions.length ? suggestions : [context.query];
    }
    getDateSuggestions(context) {
        // Récupérer les suggestions standard
        const standardSuggestions = this.unique(this.plugin.settings.languages.flatMap(language => {
            let suggestions = this.getTimeSuggestions(context.query, language);
            if (suggestions)
                return suggestions;
            suggestions = this.getImmediateSuggestions(context.query, language);
            if (suggestions)
                return suggestions;
            suggestions = this.getRelativeSuggestions(context.query, language);
            if (suggestions)
                return suggestions;
            suggestions = this.getWeekdaySuggestions(context.query, language);
            if (suggestions)
                return suggestions;
            return this.defaultSuggestions(context.query, language);
        }));
        // Si les suggestions intelligentes sont désactivées, retourner les suggestions standard
        if (!this.plugin.settings.enableSmartSuggestions) {
            return standardSuggestions;
        }
        // Récupérer les suggestions intelligentes (historique + contexte)
        const smartSuggestions = this.getSmartSuggestions(context, standardSuggestions);
        // Fusionner : suggestions intelligentes en priorité, puis suggestions standard
        const merged = [...smartSuggestions];
        for (const suggestion of standardSuggestions) {
            if (!merged.includes(suggestion)) {
                merged.push(suggestion);
            }
        }
        return merged;
    }
    /**
     * Récupère les suggestions intelligentes basées sur l'historique et le contexte
     */
    getSmartSuggestions(context, _standardSuggestions) {
        const smartSuggestions = [];
        const query = context.query.toLowerCase();
        // Suggestions basées sur l'historique
        if (this.plugin.settings.enableHistorySuggestions && this.plugin.historyManager) {
            try {
                const historySuggestions = this.plugin.historyManager.getTopSuggestionsSync(15);
                for (const suggestion of historySuggestions) {
                    // Vérifier que la suggestion correspond à la requête (tolère une petite faute de frappe)
                    if (fuzzyMatchesQuery(suggestion, query) && !smartSuggestions.includes(suggestion)) {
                        smartSuggestions.push(suggestion);
                    }
                }
            }
            catch {
                // Ignorer les erreurs silencieusement
            }
        }
        // Suggestions basées sur le contexte
        if (this.plugin.settings.enableContextSuggestions && this.plugin.contextAnalyzer && context.editor) {
            try {
                const contextInfo = this.plugin.contextAnalyzer.analyzeContextSync(context.editor, context.start.line);
                // Ajouter les dates trouvées dans le contexte (tolère une petite faute de frappe)
                for (const dateStr of contextInfo.datesInContext) {
                    if (fuzzyMatchesQuery(dateStr, query) && !smartSuggestions.includes(dateStr)) {
                        smartSuggestions.push(dateStr);
                    }
                }
            }
            catch {
                // Ignorer les erreurs silencieusement
            }
        }
        return smartSuggestions;
    }
    getTimeSuggestions(inputStr, lang) {
        // Only the first variant of a pipe-separated translation (e.g. Chinese
        // "時間|时间") is used for display/matching -- embedding the raw
        // multi-variant string would both garble the suggestion text and, since
        // "|" is a regex metacharacter, silently break the "^" anchor below.
        const timeWord = t("time", lang).split('|')[0];
        const nowWord = t("now", lang).split('|')[0];
        if (inputStr.match(new RegExp(`^${escapeRegex(timeWord)}`, "i"))) {
            const suggestions = [
                nowWord,
                t("plusminutes", lang, { timeDelta: "15" }),
                t("plushour", lang, { timeDelta: "1" }),
                t("minusminutes", lang, { timeDelta: "15" }),
                t("minushour", lang, { timeDelta: "1" }),
            ]
                .map(val => `${timeWord}:${val}`)
                .filter(item => item.toLowerCase().startsWith(inputStr.toLowerCase()));
            return suggestions.length > 0 ? suggestions : undefined;
        }
    }
    getImmediateSuggestions(inputStr, lang) {
        // Escape each translation's variants individually before joining into
        // an alternation: a language's own "|"-separated variants stay
        // meaningful alternation, but any other regex metacharacter one might
        // contain can't corrupt the pattern. Anchored with "^" like the other
        // suggestion generators in this file -- otherwise a short, common
        // substring (e.g. Chinese "next": "下一個|下一个|下", the last variant
        // being a single bare character) can match in the middle of unrelated
        // input.
        const buildPattern = (translation) => translation.split('|').map(v => escapeRegex(v.trim())).filter(Boolean).join('|');
        const prefixPattern = [t("next", lang), t("last", lang), t("this", lang)]
            .map(buildPattern)
            .join('|');
        const regexp = new RegExp(`^(${prefixPattern})`, "i");
        const match = inputStr.match(regexp);
        if (match) {
            const reference = match[1];
            // Prendre seulement la première variante (avant le |) pour les suggestions
            const getFirstVariant = (val) => val.split('|')[0];
            const suggestions = [
                t("week", lang),
                t("month", lang),
                t("year", lang),
                t("sunday", lang),
                t("monday", lang),
                t("tuesday", lang),
                t("wednesday", lang),
                t("thursday", lang),
                t("friday", lang),
                t("saturday", lang),
            ]
                .map(val => {
                const firstVariant = getFirstVariant(val);
                // Capitaliser la première lettre pour un meilleur affichage
                return firstVariant.charAt(0).toUpperCase() + firstVariant.slice(1);
            })
                .map(val => `${reference} ${val}`)
                .filter(items => items.toLowerCase().startsWith(inputStr.toLowerCase()));
            return suggestions.length > 0 ? suggestions : undefined;
        }
    }
    getRelativeSuggestions(inputStr, lang) {
        // Vérifier d'abord les expressions combinées comme "in 1 month and" ou "dans 1 mois et"
        // Permettre la saisie progressive : "in 1 month and", "in 1 month and 3", "in 3 month and", etc.
        const andPattern = t("and", lang).split('|')[0]; // Prendre la première variante
        // Regex plus flexible qui permet la saisie après "and"
        const combinedRegex = new RegExp(`^(${t("in", lang)} )?([+-]?\\d+)\\s+(${t("minute", lang)}|${t("hour", lang)}|${t("day", lang)}|${t("week", lang)}|${t("month", lang)}|${t("year", lang)})\\s+(${andPattern})(\\s+.*)?$`, "i");
        const combinedMatch = inputStr.match(combinedRegex);
        if (combinedMatch) {
            const afterAnd = combinedMatch[5] ? combinedMatch[5].trim() : '';
            // Extraire la partie avant "and" pour reconstruire correctement
            const beforeAnd = inputStr.substring(0, inputStr.indexOf(combinedMatch[4]) + combinedMatch[4].length).trimEnd();
            // Si on a déjà commencé à taper après "and", extraire le nombre s'il y en a un
            let suggestedNumber = "1";
            let afterAndWithoutNumber = afterAnd;
            if (afterAnd) {
                const numberMatch = afterAnd.match(/^(\d+)(.*)$/);
                if (numberMatch) {
                    suggestedNumber = numberMatch[1];
                    afterAndWithoutNumber = numberMatch[2].trim();
                }
            }
            const suggestions = [
                t("inminutes", lang, { timeDelta: suggestedNumber }),
                t("inhours", lang, { timeDelta: suggestedNumber }),
                t("indays", lang, { timeDelta: suggestedNumber }),
                t("inweeks", lang, { timeDelta: suggestedNumber }),
                t("inmonths", lang, { timeDelta: suggestedNumber }),
            ]
                .map(s => {
                const unitPart = s.replace(/^dans |^in /i, '');
                // unitPart est comme "3 days" ou "5 minutes"
                if (afterAnd) {
                    // Si on a déjà commencé à taper, compléter intelligemment
                    // unitPart commence par le nombre (ex: "3 days")
                    const unitWords = unitPart.split(' ');
                    if (unitWords.length > 1 && unitWords[0] === suggestedNumber) {
                        // Le nombre correspond, on peut suggérer le reste (ex: "days")
                        const remaining = unitPart.substring(suggestedNumber.length).trim();
                        if (afterAndWithoutNumber) {
                            // Si on a tapé quelque chose après le nombre, vérifier si ça correspond
                            // NOTE: known rough edge -- this drops the space between the
                            // number and unit (e.g. typing "3 day" after "and" produces
                            // "...and 3s" instead of "...and 3 days"), so the rebuilt
                            // candidate then fails the outer prefix filter below and this
                            // whole branch silently contributes no suggestion. Verified
                            // as the actual current behavior; left alone as a narrow
                            // autosuggest-text polish issue rather than fixed here.
                            if (remaining.toLowerCase().startsWith(afterAndWithoutNumber.toLowerCase())) {
                                return `${beforeAnd} ${suggestedNumber}${remaining.substring(afterAndWithoutNumber.length)}`;
                            }
                            return null;
                        }
                        else {
                            // On a juste tapé le nombre, suggérer le reste
                            return `${beforeAnd} ${unitPart}`;
                        }
                    }
                    // Reached for languages that don't separate the number and unit
                    // with a space (e.g. Chinese "3天後", Japanese "3日後"): unitPart
                    // then has no space at all, so unitWords.length > 1 above is
                    // false regardless of whether the number matches. Note this has
                    // its own rough edge symmetric to the one above -- since
                    // unitPart has no space, unitPart.indexOf(' ') is -1 and
                    // unitWithoutNumber ends up being the *whole* unitPart
                    // (including its own leading number), so the returned suggestion
                    // duplicates the number (e.g. "在 3 天 和 4 4分鐘後" instead of
                    // "...和 4分鐘後"). Verified as the actual current behavior;
                    // left alone as the same kind of narrow autosuggest-text polish
                    // issue as the one documented above, not fixed here.
                    const unitWithoutNumber = unitPart.substring(unitPart.indexOf(' ') + 1);
                    if (unitWithoutNumber.toLowerCase().startsWith(afterAnd.toLowerCase())) {
                        return `${beforeAnd} ${suggestedNumber} ${unitWithoutNumber}`;
                    }
                    return null;
                }
                return `${beforeAnd} ${unitPart}`;
            })
                .filter((item) => item !== null)
                .filter(items => items.toLowerCase().startsWith(inputStr.toLowerCase()));
            return suggestions.length > 0 ? suggestions : undefined;
        }
        // Vérifier les plages de dates partielles comme "de lundi à" ou "from monday to"
        // Permettre la saisie progressive : "de lundi a", "de lundi a v", "de lundi a ve", etc.
        const fromPattern = t("from", lang).split('|')[0];
        const toPattern = t("to", lang).split('|')[0];
        // Regex plus flexible qui permet la saisie progressive après "à" ou "a"
        const rangePartialRegex = new RegExp(`^(${fromPattern}|de|du)\\s+(${t("sunday", lang)}|${t("monday", lang)}|${t("tuesday", lang)}|${t("wednesday", lang)}|${t("thursday", lang)}|${t("friday", lang)}|${t("saturday", lang)})\\s+(${toPattern}|à|a)(\\s+.*)?$`, "i");
        const rangePartialMatch = inputStr.match(rangePartialRegex);
        if (rangePartialMatch) {
            const afterTo = rangePartialMatch[4] ? rangePartialMatch[4].trim() : '';
            // Extraire la partie avant "à" ou "a" pour reconstruire correctement
            const beforeTo = inputStr.substring(0, inputStr.indexOf(rangePartialMatch[3]) + rangePartialMatch[3].length).trimEnd();
            // Générer des suggestions pour les jours de fin possibles
            const allDays = [
                t("sunday", lang),
                t("monday", lang),
                t("tuesday", lang),
                t("wednesday", lang),
                t("thursday", lang),
                t("friday", lang),
                t("saturday", lang),
            ];
            const suggestions = allDays
                .map(day => {
                if (afterTo) {
                    // Si on a déjà commencé à taper, filtrer les jours qui commencent par ce texte
                    if (day.toLowerCase().startsWith(afterTo.toLowerCase())) {
                        // Remplacer "afterTo" par le jour complet
                        return `${beforeTo} ${day}`;
                    }
                    return null;
                }
                return `${beforeTo} ${day}`;
            })
                .filter((item) => item !== null)
                .filter(items => items.toLowerCase().startsWith(inputStr.toLowerCase()));
            return suggestions.length > 0 ? suggestions : undefined;
        }
        // Pattern standard pour les dates relatives simples
        const regexp = new RegExp(`^(${t("in", lang)} )?([+-]?\\d+)`, "i");
        const relativeDate = inputStr.match(regexp);
        if (relativeDate) {
            const timeDelta = relativeDate[relativeDate.length - 1];
            const suggestions = [
                t("inminutes", lang, { timeDelta }),
                t("inhours", lang, { timeDelta }),
                t("indays", lang, { timeDelta }),
                t("inweeks", lang, { timeDelta }),
                t("inmonths", lang, { timeDelta }),
                t("minutesago", lang, { timeDelta }),
                t("hoursago", lang, { timeDelta }),
                t("daysago", lang, { timeDelta }),
                t("weeksago", lang, { timeDelta }),
                t("monthsago", lang, { timeDelta }),
            ].filter(items => items.toLowerCase().startsWith(inputStr.toLowerCase()));
            // Don't return an empty array here: any digit-led input (including
            // suffix-style "3 dias atrás") matches this regexp too, since its
            // prefix group is optional -- returning unconditionally would make
            // the suffix-pattern check below unreachable dead code for every
            // suffix-only language.
            if (suggestions.length > 0) {
                return suggestions;
            }
        }
        // Suffix-style past expressions, e.g. Portuguese/Spanish "3 dias atrás"
        // (X unit + agosuffix marker), the past-tense mirror of the prefix
        // suggestions above.
        const agoSuffix = t("agosuffix", lang);
        if (agoSuffix && agoSuffix !== "NOTFOUND") {
            const suffixMatch = inputStr.match(/^(\d+)\s+(\w*)/i);
            if (suffixMatch) {
                const timeDelta = suffixMatch[1];
                const suffixVariant = agoSuffix.split('|')[0];
                const unitTypes = ['minute', 'hour', 'day', 'week', 'month', 'year'];
                const suggestions = [];
                for (const unitType of unitTypes) {
                    const words = t(unitType, lang).split('|').map(w => w.trim()).slice(0, 2);
                    for (const word of words) {
                        suggestions.push(`${timeDelta} ${word} ${suffixVariant}`);
                    }
                }
                const filtered = suggestions.filter(item => item.toLowerCase().startsWith(inputStr.toLowerCase()));
                if (filtered.length > 0) {
                    return filtered;
                }
            }
        }
    }
    getWeekdaySuggestions(inputStr, lang) {
        // Le parser peut gérer les abréviations (thu, mon, sat, etc.), donc on doit les proposer aussi
        const weekdays = [
            { key: 'sunday', abbr: ['sun'] },
            { key: 'monday', abbr: ['mon'] },
            { key: 'tuesday', abbr: ['tue', 'tues'] },
            { key: 'wednesday', abbr: ['wed'] },
            { key: 'thursday', abbr: ['thu', 'thur', 'thurs'] },
            { key: 'friday', abbr: ['fri'] },
            { key: 'saturday', abbr: ['sat'] },
        ];
        const inputLower = inputStr.toLowerCase();
        const suggestions = [];
        for (const day of weekdays) {
            // t() always falls back to English, and en.ts always defines all
            // seven weekdays, so this guard can't actually be false.
            const dayName = t(day.key, lang);
            if (!dayName || dayName === "NOTFOUND")
                continue;
            const firstVariant = dayName.split('|')[0].trim();
            const dayNameLower = firstVariant.toLowerCase();
            // Vérifier si le nom complet commence par l'input (tolère une petite faute de frappe)
            if (fuzzyMatchesQuery(dayNameLower, inputLower)) {
                const capitalized = firstVariant.charAt(0).toUpperCase() + firstVariant.slice(1);
                if (!suggestions.includes(capitalized)) {
                    suggestions.push(capitalized);
                }
            }
            // Vérifier si une abréviation correspond -- the abbreviations below are
            // English-only (e.g. "mon"), but dayName/firstVariant is translated
            // (e.g. French "lundi"), so for any non-English language the full-name
            // check above never matches while this abbreviation check still does.
            // This is what lets English weekday abbreviations work as a shortcut
            // regardless of which language is active (verified: typing "mon" with
            // only French enabled correctly suggests "Lundi").
            for (const abbr of day.abbr) {
                if (abbr.startsWith(inputLower)) {
                    const capitalized = firstVariant.charAt(0).toUpperCase() + firstVariant.slice(1);
                    if (!suggestions.includes(capitalized)) {
                        suggestions.push(capitalized);
                    }
                }
            }
        }
        return suggestions.length > 0 ? suggestions : undefined;
    }
    defaultSuggestions(inputStr, lang) {
        return [
            t("today", lang),
            t("yesterday", lang),
            t("tomorrow", lang),
        ].filter(item => fuzzyMatchesQuery(item, inputStr));
    }
    renderSuggestion(suggestion, el) {
        el.setText(suggestion);
    }
    selectSuggestion(suggestion, event) {
        // Utiliser l'éditeur du contexte si disponible, sinon chercher l'éditeur actif
        let editor = null;
        if (this.context?.editor) {
            editor = this.context.editor;
        }
        else {
            editor = getActiveEditor(this.app.workspace);
        }
        if (!editor) {
            return;
        }
        const includeAlias = event.shiftKey;
        // When keeping the typed text as alias (Shift), prefer what the user
        // actually typed over the suggestion's canonical dictionary casing
        // (e.g. French "demain" vs the dictionary's "Demain") -- but only when
        // they typed the complete word/phrase, just in a different casing; a
        // partial query ("demai") would make for a broken-looking alias, so
        // fall back to the full suggestion text in that case. Language-agnostic:
        // this only compares the typed text to the suggestion text.
        const typedQuery = this.context?.query;
        const aliasText = (typedQuery && typedQuery.toLowerCase() === suggestion.toLowerCase())
            ? typedQuery
            : suggestion;
        let dateStr = "";
        let makeIntoLink = this.plugin.settings.autosuggestToggleLink;
        // We check if the input contains a time component using the parser logic.
        let hasTime = this.plugin.hasTimeComponent(suggestion);
        // --- CORRECTION MULTILANGUE ---
        // Si le parser n'a pas détecté l'heure (souvent le cas en anglais pour "in 2 minutes"),
        // on force la détection si on voit des mots clés explicites (min, hour, etc).
        // IMPORTANT: Ne pas matcher "m" dans "month" - vérifier que c'est bien un mot de temps
        if (!hasTime) {
            // Regex pour détecter un chiffre suivi de min/hour/heure/h (mais pas "m" seul qui pourrait être "month")
            // On vérifie que "m" est suivi de "in", "ins", ou est en fin de mot, et pas "onth" (month)
            const explicitTimeRegex = /\d+\s*(min|mins|minute|minutes|h|hour|hours|heure|heures|sec|second|seconds)(?![a-z])/i;
            if (suggestion.match(explicitTimeRegex)) {
                hasTime = true;
            }
        }
        // -----------------------------
        if (this.suggestionIsTime(suggestion)) {
            const timePart = suggestion.substring(this.getTimePrefixLength(suggestion));
            dateStr = this.plugin.parseTime(timePart).formattedString;
            makeIntoLink = false;
        }
        else {
            // Vérifier d'abord si c'est une plage de dates
            const dateRange = this.plugin.parseDateRange(suggestion);
            if (dateRange) {
                // C'est une plage de dates
                // Si on a une liste de dates, générer une liste de liens au lieu d'une plage
                if (dateRange.dateList && dateRange.dateList.length > 0) {
                    const dateLinks = dateRange.dateList.map(m => {
                        const formatted = m.format(this.plugin.settings.format);
                        return makeIntoLink
                            ? generateMarkdownLink(this.app, formatted)
                            : formatted;
                    });
                    dateStr = dateLinks.join(', ');
                }
                else {
                    // Fallback vers l'ancien comportement (plage)
                    const startFormatted = dateRange.startMoment.format(this.plugin.settings.format);
                    const endFormatted = dateRange.endMoment.format(this.plugin.settings.format);
                    // Obtenir la traduction de "to" selon la langue principale
                    const primaryLang = this.plugin.settings.languages[0] || 'en';
                    const toTranslation = t("to", primaryLang).split('|')[0]; // Prendre la première variante
                    if (makeIntoLink) {
                        dateStr = generateMarkdownLink(this.app, startFormatted, includeAlias ? aliasText : undefined) + ` ${toTranslation} ` + generateMarkdownLink(this.app, endFormatted);
                    }
                    else {
                        dateStr = `${startFormatted} ${toTranslation} ${endFormatted}`;
                    }
                }
                makeIntoLink = false; // Déjà géré ci-dessus
            }
            else {
                const parsedResult = this.plugin.parseDate(suggestion);
                // --- OPTIMISATION : Omettre la date pour expressions relatives courtes aujourd'hui ---
                const isToday = parsedResult.moment.isSame(moment(), 'day');
                const isRelativeShortTerm = shouldOmitDateForShortRelative(suggestion, this.plugin.settings.languages);
                const shouldOmitDate = this.plugin.settings.omitDateForShortRelative && isToday && isRelativeShortTerm && hasTime;
                // --- HYBRID LINK LOGIC START ---
                // If a time is detected AND linking is enabled, we split the link.
                // Expected result: [[YYYY-MM-DD]] HH:mm
                if (hasTime && makeIntoLink) {
                    if (shouldOmitDate) {
                        // CAS OPTIMISÉ : Juste l'heure pour "dans X min/heures" aujourd'hui
                        const timePart = parsedResult.moment.format(this.plugin.settings.timeFormat || "HH:mm");
                        dateStr = timePart;
                        makeIntoLink = false; // Pas de lien nécessaire
                    }
                    else {
                        // 1. Format the date part
                        const datePart = parsedResult.moment.format(this.plugin.settings.format);
                        // 2. Format the time part (fallback to HH:mm if not set)
                        const timePart = parsedResult.moment.format(this.plugin.settings.timeFormat || "HH:mm");
                        // 3. Generate the markdown link ONLY for the date part
                        dateStr = generateMarkdownLink(this.app, datePart, includeAlias ? aliasText : undefined) + " " + timePart; // Append time as plain text
                        // 4. Disable standard linking since we constructed it manually above
                        makeIntoLink = false;
                    }
                }
                else if (hasTime && !makeIntoLink) {
                    // Même logique si pas de lien mais avec heure
                    if (shouldOmitDate) {
                        const timePart = parsedResult.moment.format(this.plugin.settings.timeFormat || "HH:mm");
                        dateStr = timePart;
                    }
                    else {
                        const datePart = parsedResult.moment.format(this.plugin.settings.format);
                        const timePart = parsedResult.moment.format(this.plugin.settings.timeFormat || "HH:mm");
                        dateStr = `${datePart} ${timePart}`;
                    }
                }
                else {
                    // Standard behavior for dates without time (e.g., @tomorrow)
                    dateStr = parsedResult.formattedString;
                }
                // --- HYBRID LINK LOGIC END ---
            }
        }
        if (makeIntoLink) {
            dateStr = generateMarkdownLink(this.app, dateStr, includeAlias ? aliasText : undefined);
        }
        if (!this.context) {
            logger.error('DateSuggest: context is undefined');
            return;
        }
        editor.replaceRange(dateStr, this.context.start, this.context.end);
        // Enregistrer la sélection dans l'historique (de manière asynchrone)
        if (this.plugin.settings.enableSmartSuggestions &&
            this.plugin.settings.enableHistorySuggestions &&
            this.plugin.historyManager) {
            this.plugin.historyManager.recordSelection(suggestion).catch(_err => {
                // Ignorer les erreurs silencieusement
            });
        }
    }
    onTrigger(cursor, editor, _file) {
        if (!this.plugin.settings.isAutosuggestEnabled) {
            return null;
        }
        const triggerPhrase = this.plugin.settings.autocompleteTriggerPhrase;
        const startPos = this.context?.start || {
            line: cursor.line,
            ch: cursor.ch - triggerPhrase.length,
        };
        const query = editor.getRange(startPos, cursor);
        if (!query.startsWith(triggerPhrase)) {
            return null;
        }
        const precedingChar = editor.getRange({
            line: startPos.line,
            ch: startPos.ch - 1,
        }, startPos);
        // Short-circuit if `@` as a part of a word (e.g. part of an email address)
        if (precedingChar && /[`a-zA-Z0-9]/.test(precedingChar)) {
            return null;
        }
        return {
            start: startPos,
            end: cursor,
            query: editor.getRange(startPos, cursor).substring(triggerPhrase.length),
        };
    }
    suggestionIsTime(suggestion) {
        return this.plugin.settings.languages.some(lang => {
            const timeWord = t("time", lang).split('|')[0];
            return suggestion.startsWith(`${timeWord}:`);
        });
    }
    // Length of the "<TimeWord>:" prefix that getTimeSuggestions() builds its
    // suggestions with, so callers can strip exactly that many characters
    // instead of a hardcoded length -- "Time:" is 5 chars only in English and
    // a few others by coincidence (e.g. French "heure:" is 6, Italian "ora:"
    // is 4, Chinese "時間:" is 3 UTF-16 code units).
    getTimePrefixLength(suggestion) {
        for (const lang of this.plugin.settings.languages) {
            const timeWord = t("time", lang).split('|')[0];
            const prefix = `${timeWord}:`;
            if (suggestion.startsWith(prefix)) {
                return prefix.length;
            }
        }
        return 0;
    }
    unique(suggestions) {
        return suggestions.filter(function (item, pos) {
            return suggestions.indexOf(item) == pos;
        });
    }
}

function getParseCommand(plugin, mode) {
    const { workspace } = plugin.app;
    const editor = getActiveEditor(workspace);
    // L'éditeur pourrait ne pas être disponible (par exemple dans une vue non-markdown)
    if (!editor) {
        return;
    }
    const selectedText = getSelectedText(editor);
    // Captured after getSelectedText(): when nothing was selected, that call
    // expands the selection to the word at the cursor, which moves where the
    // selection actually ends. Capturing the cursor beforehand would anchor
    // adjustCursor()'s offset math to the pre-expansion position instead of
    // the edge of the text that's about to be replaced.
    const cursor = editor.getCursor("to");
    // Vérifier d'abord si c'est une plage de dates
    const dateRange = plugin.parseDateRange(selectedText);
    if (dateRange) {
        // C'est une plage de dates
        let newStr = "";
        // Si on a une liste de dates, générer une liste de liens au lieu d'une plage
        if (dateRange.dateList && dateRange.dateList.length > 0) {
            const dateLinks = dateRange.dateList.map(m => {
                const formatted = m.format(plugin.settings.format);
                if (mode == "replace") {
                    return `[[${formatted}]]`;
                }
                else if (mode == "link") {
                    return `[${formatted}](${formatted})`;
                }
                else {
                    // "clean" and "time" both resolve to the plain formatted date here:
                    // each dateList entry is a whole calendar day with no parsed time
                    // component, so "time" for a range means the same as "clean" (see
                    // the identical mode == "time" case in the non-list branch below).
                    return formatted;
                }
            });
            newStr = dateLinks.join(', ');
        }
        else {
            // Fallback vers l'ancien comportement (plage)
            const startFormatted = dateRange.startMoment.format(plugin.settings.format);
            const endFormatted = dateRange.endMoment.format(plugin.settings.format);
            // Obtenir la traduction de "to" selon la langue principale
            const primaryLang = plugin.settings.languages[0] || 'en';
            const toTranslation = t("to", primaryLang).split('|')[0]; // Prendre la première variante
            if (mode == "replace") {
                // Générer des liens pour la plage : [[start]] to [[end]]
                newStr = `[[${startFormatted}]] ${toTranslation} [[${endFormatted}]]`;
            }
            else if (mode == "link") {
                // Lien Markdown standard
                newStr = `[${selectedText}](${dateRange.formattedString})`;
            }
            else if (mode == "clean") {
                // Texte brut sans lien
                newStr = `${startFormatted} ${toTranslation} ${endFormatted}`;
            }
            else if (mode == "time") {
                // Pas d'heure pour les plages
                newStr = `${startFormatted} ${toTranslation} ${endFormatted}`;
            }
        }
        editor.replaceSelection(newStr);
        adjustCursor(editor, cursor, newStr, selectedText);
        editor.focus();
        return;
    }
    // Sinon, traiter comme une date normale
    const date = plugin.parseDate(selectedText);
    if (!date.moment.isValid()) {
        // Do nothing
        editor.setCursor({
            line: cursor.line,
            ch: cursor.ch,
        });
        return;
    }
    // --- MODIFICATION INTELLIGENTE V0.9 ---
    // On vérifie si une heure est présente dans le texte sélectionné
    const hasTime = plugin.hasTimeComponent(selectedText);
    // --- OPTIMISATION : Omettre la date pour expressions relatives courtes aujourd'hui ---
    const isToday = date.moment.isSame(moment(), 'day');
    const isRelativeShortTerm = shouldOmitDateForShortRelative(selectedText, plugin.settings.languages);
    const shouldOmitDate = plugin.settings.omitDateForShortRelative && isToday && isRelativeShortTerm && hasTime;
    let newStr = "";
    if (mode == "replace") {
        // C'est le mode par défaut (Create Link)
        if (hasTime) {
            if (shouldOmitDate) {
                // CAS OPTIMISÉ : Juste l'heure pour "dans X min/heures" aujourd'hui
                const timePart = date.moment.format(plugin.settings.timeFormat || "HH:mm");
                newStr = timePart;
            }
            else {
                // CAS HYBRIDE : [[Date]] Heure
                const datePart = date.moment.format(plugin.settings.format);
                // Si l'utilisateur n'a pas mis de format d'heure, on force HH:mm par sécurité
                const timePart = date.moment.format(plugin.settings.timeFormat || "HH:mm");
                newStr = `[[${datePart}]] ${timePart}`;
            }
        }
        else {
            // CAS CLASSIQUE : [[Date]]
            newStr = `[[${date.formattedString}]]`;
        }
    }
    else if (mode == "link") {
        // Lien Markdown standard [texte](date)
        newStr = `[${selectedText}](${date.formattedString})`;
    }
    else if (mode == "clean") {
        // Texte brut sans lien
        newStr = `${date.formattedString}`;
    }
    else if (mode == "time") {
        // Juste l'heure
        const time = plugin.parseTime(selectedText);
        newStr = `${time.formattedString}`;
    }
    editor.replaceSelection(newStr);
    adjustCursor(editor, cursor, newStr, selectedText);
    editor.focus();
}
function insertMomentCommand(plugin, date, format) {
    const { workspace } = plugin.app;
    const editor = getActiveEditor(workspace);
    if (editor) {
        editor.replaceSelection(moment(date).format(format));
    }
}
function getNowCommand(plugin) {
    const format = `${plugin.settings.format}${plugin.settings.separator}${plugin.settings.timeFormat}`;
    const date = new Date();
    insertMomentCommand(plugin, date, format);
}
function getCurrentDateCommand(plugin) {
    const format = plugin.settings.format;
    const date = new Date();
    insertMomentCommand(plugin, date, format);
}
function getCurrentTimeCommand(plugin) {
    const format = plugin.settings.timeFormat;
    const date = new Date();
    insertMomentCommand(plugin, date, format);
}

const MAX_HISTORY_SIZE = 100; // Limite du nombre d'entrées dans l'historique
const HISTORY_FILE = "plugins/nldates-revived/history.json";
const CLEANUP_INTERVAL$1 = 300000; // Nettoyage périodique toutes les 5 minutes
// A suggestion's rank is frequency weighted by recency, not raw lifetime
// count: without decay, something selected 50 times six months ago would
// permanently outrank something selected 3 times this week, even though
// the latter is clearly more relevant *now*. Halving the weight every
// HALF_LIFE_MS of inactivity means every reuse "refreshes" an entry, while
// genuinely stale entries fade out instead of camping the top of the list
// forever.
const HALF_LIFE_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours
class HistoryManager {
    constructor(plugin) {
        this.history = {};
        this.historyLoaded = false;
        this.cachedTopSuggestions = [];
        this.cacheValid = false;
        this.cleanupInterval = null; // ID de l'intervalle de nettoyage
        this.plugin = plugin;
        this.startPeriodicCleanup();
    }
    /**
     * Démarre le nettoyage périodique de l'historique
     */
    startPeriodicCleanup() {
        // Nettoyer toutes les 5 minutes
        this.cleanupInterval = window.setInterval(() => {
            this.performPeriodicCleanup();
        }, CLEANUP_INTERVAL$1);
    }
    /**
     * Arrête le nettoyage périodique (à appeler lors de la destruction)
     */
    stopPeriodicCleanup() {
        if (this.cleanupInterval !== null) {
            window.clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
    /**
     * Effectue un nettoyage périodique de l'historique
     * Réduit la taille si nécessaire et nettoie les entrées peu utilisées
     */
    performPeriodicCleanup() {
        if (!this.historyLoaded) {
            return;
        }
        const currentSize = Object.keys(this.history).length;
        // Si l'historique dépasse la limite, le réduire
        if (currentSize > MAX_HISTORY_SIZE) {
            this.trimHistory();
            logger.debug(`Nettoyage périodique de l'historique: réduit de ${currentSize} à ${Object.keys(this.history).length} entrées`);
        }
        // Mettre à jour le cache des suggestions
        this.updateCache();
    }
    /**
     * Convertit un historique chargé depuis le disque vers le format actuel.
     * Les fichiers écrits par une version antérieure du plugin stockent un
     * simple compteur (`{ [suggestion]: number }`) au lieu de
     * `{ [suggestion]: HistoryEntry }` -- on donne à ces entrées un
     * lastUsed de "maintenant" pour ne pas les faire disparaître
     * immédiatement du classement le temps qu'un nouvel usage les rafraîchisse.
     */
    migrateHistory(raw) {
        const migrated = {};
        // typeof [] === "object", so a top-level JSON array (corrupted file,
        // stray manual edit) would otherwise sail through the caller's
        // `typeof parsed === "object"` check and get walked here: Object.entries()
        // on an array yields numeric-string keys ("0", "1", ...) that would be
        // migrated into bogus history entries.
        if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
            return migrated;
        }
        const now = Date.now();
        for (const [key, value] of Object.entries(raw)) {
            if (typeof value === "number") {
                migrated[key] = { count: value, lastUsed: now };
            }
            else if (value &&
                typeof value === "object" &&
                typeof value.count === "number" &&
                typeof value.lastUsed === "number") {
                // Copy only the two expected fields rather than keeping the whole
                // parsed object reference, so unexpected extra properties on a
                // malformed entry aren't silently carried forward and re-persisted.
                migrated[key] = {
                    count: value.count,
                    lastUsed: value.lastUsed,
                };
            }
            // Anything else (malformed entry) is silently dropped rather than
            // carried forward -- a single bad entry shouldn't poison the rest.
        }
        return migrated;
    }
    /**
     * Score d'une entrée : fréquence pondérée par la fraîcheur d'utilisation
     * (voir HALF_LIFE_MS). Utilisé pour trier/trimmer l'historique.
     */
    computeScore(entry, now) {
        const ageMs = Math.max(0, now - entry.lastUsed);
        const decay = Math.pow(0.5, ageMs / HALF_LIFE_MS);
        return entry.count * decay;
    }
    /**
     * Charge l'historique depuis le stockage
     */
    async loadHistory() {
        if (this.historyLoaded) {
            return;
        }
        try {
            const configDir = this.plugin.app.vault.configDir;
            const path = require$$0.normalizePath(`${configDir}/${HISTORY_FILE}`);
            const exists = await this.plugin.app.vault.adapter.exists(path);
            if (exists) {
                const data = await this.plugin.app.vault.adapter.read(path);
                if (data) {
                    const parsed = JSON.parse(data);
                    if (parsed && typeof parsed === "object") {
                        this.history = this.migrateHistory(parsed);
                    }
                }
            }
        }
        catch (error) {
            // The exists()/read() calls above already handle the "file doesn't
            // exist yet" case explicitly (the `if (exists)` guard) -- reaching
            // this catch means an actual anomaly (corrupted JSON from an
            // interrupted write, a sync conflict, etc.), so log it instead of
            // silently discarding the user's history with no diagnostic trail.
            logger.error("Error loading history:", { error });
            this.history = {};
        }
        this.historyLoaded = true;
    }
    /**
     * Enregistre l'historique dans le stockage
     */
    async saveHistory() {
        try {
            const configDir = this.plugin.app.vault.configDir;
            const path = require$$0.normalizePath(`${configDir}/${HISTORY_FILE}`);
            const dir = path.substring(0, path.lastIndexOf("/"));
            // Créer le dossier si nécessaire
            const dirExists = await this.plugin.app.vault.adapter.exists(dir);
            if (!dirExists) {
                await this.plugin.app.vault.adapter.mkdir(dir);
            }
            await this.plugin.app.vault.adapter.write(path, JSON.stringify(this.history, null, 2));
        }
        catch (error) {
            logger.error("Error saving history:", { error });
        }
    }
    /**
     * Normalise une suggestion en capitalisant la première lettre
     * Exemple: "demain" -> "Demain", "lundi prochain" -> "Lundi prochain"
     */
    normalizeSuggestion(suggestion) {
        if (!suggestion || suggestion.length === 0) {
            return suggestion;
        }
        const trimmed = suggestion.trim();
        if (trimmed.length === 0) {
            return trimmed;
        }
        // Capitalize each word individually, not just the first character of
        // the whole string: history keys are stored fully lowercase (see
        // recordSelection()), so a multi-word suggestion like "next friday"
        // would otherwise display as "Next friday" -- only the very first
        // letter capitalized -- inconsistent with the "Next Friday" that other
        // suggestion sources (e.g. date-suggest.ts's getImmediateSuggestions)
        // show for the exact same phrase in the same dropdown.
        return trimmed
            .split(/\s+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
    /**
     * Enregistre une sélection dans l'historique
     */
    async recordSelection(suggestion) {
        await this.loadHistory();
        // Normaliser la suggestion (en minuscules pour la clé, évite les doublons)
        const normalized = suggestion.toLowerCase().trim();
        if (!normalized) {
            return;
        }
        // Incrémenter le compteur et rafraîchir la date d'utilisation (utiliser la clé en minuscules)
        const existing = this.history[normalized];
        this.history[normalized] = {
            count: (existing?.count || 0) + 1,
            lastUsed: Date.now(),
        };
        // Limiter la taille de l'historique si nécessaire
        if (Object.keys(this.history).length > MAX_HISTORY_SIZE) {
            this.trimHistory();
        }
        // Mettre à jour le cache
        this.updateCache();
        // Save (asynchronously, don't block)
        this.saveHistory().catch((err) => {
            logger.error("Error saving history:", { error: err });
        });
    }
    /**
     * Réduit la taille de l'historique en gardant les entrées les plus pertinentes
     * (fréquence pondérée par la fraîcheur, voir computeScore())
     */
    trimHistory() {
        const now = Date.now();
        const entries = Object.entries(this.history);
        // Trier par score (décroissant)
        entries.sort((a, b) => this.computeScore(b[1], now) - this.computeScore(a[1], now));
        // Garder uniquement les MAX_HISTORY_SIZE entrées les plus pertinentes
        const trimmed = entries.slice(0, MAX_HISTORY_SIZE);
        this.history = Object.fromEntries(trimmed);
    }
    /**
     * Charge l'historique et met à jour le cache (à appeler au démarrage)
     */
    async initialize() {
        await this.loadHistory();
        this.updateCache();
    }
    /**
     * Met à jour le cache des suggestions les plus pertinentes
     * (fréquence pondérée par la fraîcheur, voir computeScore())
     */
    updateCache() {
        const now = Date.now();
        const entries = Object.entries(this.history);
        // Trier par score (décroissant)
        entries.sort((a, b) => this.computeScore(b[1], now) - this.computeScore(a[1], now));
        // Mettre en cache les top suggestions avec la première lettre capitalisée
        this.cachedTopSuggestions = entries.slice(0, 50).map(([suggestion]) => this.normalizeSuggestion(suggestion));
        this.cacheValid = true;
    }
    /**
     * Récupère les suggestions les plus fréquentes de manière synchrone (utilise le cache)
     * @param limit Nombre maximum de suggestions à retourner
     */
    getTopSuggestionsSync(limit = 10) {
        if (!this.cacheValid) {
            // Si le cache n'est pas valide, retourner un tableau vide
            // Le cache sera mis à jour lors de l'initialisation
            return [];
        }
        return this.cachedTopSuggestions.slice(0, limit);
    }
    /**
     * Récupère les suggestions les plus fréquentes, triées par fréquence (async, met à jour le cache)
     * @param limit Nombre maximum de suggestions à retourner
     */
    async getTopSuggestions(limit = 10) {
        await this.loadHistory();
        this.updateCache();
        return this.cachedTopSuggestions.slice(0, limit);
    }
    /**
     * Réinitialise l'historique
     */
    async clearHistory() {
        this.history = {};
        this.cachedTopSuggestions = [];
        this.cacheValid = true;
        await this.saveHistory();
    }
    /**
     * Supprime une seule entrée de l'historique (gestion fine, par opposition
     * à clearHistory() qui vide tout). `suggestion` peut être la forme normalisée
     * affichée à l'utilisateur (ex: "Next Friday") ou la clé brute stockée en
     * interne (ex: "next friday") -- les deux sont acceptées puisque
     * l'utilisateur ne voit jamais la clé brute, seulement la version affichée.
     */
    async removeEntry(suggestion) {
        await this.loadHistory();
        const normalized = suggestion.toLowerCase().trim();
        if (!(normalized in this.history)) {
            return;
        }
        delete this.history[normalized];
        this.updateCache();
        await this.saveHistory();
    }
    /**
     * Récupère toutes les entrées de l'historique, triées par pertinence
     * (voir computeScore()), avec leurs métadonnées -- utilisé par l'interface
     * de gestion fine de l'historique (affichage + suppression individuelle).
     * Contrairement à getTopSuggestionsSync()/getTopSuggestions(), qui ne
     * renvoient que le texte affiché, ceci renvoie aussi la clé brute (pour
     * removeEntry()) et les métadonnées count/lastUsed (pour l'affichage).
     */
    async getEntriesForManagement() {
        await this.loadHistory();
        const now = Date.now();
        return Object.entries(this.history)
            .sort((a, b) => this.computeScore(b[1], now) - this.computeScore(a[1], now))
            .map(([key, entry]) => ({
            key,
            display: this.normalizeSuggestion(key),
            count: entry.count,
            lastUsed: entry.lastUsed,
        }));
    }
    /**
     * Nettoie les ressources lors de la destruction de l'instance
     */
    destroy() {
        this.stopPeriodicCleanup();
    }
    /**
     * Récupère l'historique complet (pour debug)
     */
    async getHistory() {
        await this.loadHistory();
        return { ...this.history };
    }
}

// Cheap, non-cryptographic string hash (djb2 variant) used to fingerprint
// the scanned context window for cache keys -- fast enough to run on every
// keystroke while still distinguishing different content reliably.
function simpleHash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
    }
    return hash;
}
const CONTEXT_LINES = 10; // Nombre de lignes à analyser avant et après le curseur
const MAX_DATES_TO_EXTRACT = 10; // Nombre maximum de dates à extraire du contexte
const MAX_CACHE_SIZE = 200; // Limite de taille du cache de contexte
const CACHE_TIMEOUT = 5000; // 5 secondes de cache
const CLEANUP_INTERVAL = 30000; // Nettoyage périodique toutes les 30 secondes
class ContextAnalyzer {
    constructor(app, plugin) {
        this.cleanupInterval = null; // ID de l'intervalle de nettoyage
        // Patterns regex pour la détection de dates (générés dynamiquement)
        this.datePatterns = [];
        this.app = app;
        this.plugin = plugin;
        this.cache = new LRUCache(MAX_CACHE_SIZE);
        this.initializeDatePatterns();
        this.startPeriodicCleanup();
    }
    /**
     * Démarre le nettoyage périodique du cache
     */
    startPeriodicCleanup() {
        // Nettoyer toutes les 30 secondes
        this.cleanupInterval = window.setInterval(() => {
            this.cleanupExpiredEntries();
        }, CLEANUP_INTERVAL);
    }
    /**
     * Arrête le nettoyage périodique (à appeler lors de la destruction)
     */
    stopPeriodicCleanup() {
        if (this.cleanupInterval !== null) {
            window.clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }
    /**
     * Nettoie les entrées expirées du cache
     */
    cleanupExpiredEntries() {
        const now = Date.now();
        const keysToDelete = [];
        // Parcourir toutes les entrées du cache
        for (const [key, value] of this.cache.entries()) {
            if (value.timestamp && (now - value.timestamp) > CACHE_TIMEOUT) {
                keysToDelete.push(key);
            }
        }
        // Supprimer les entrées expirées
        for (const key of keysToDelete) {
            this.cache.delete(key);
        }
        if (keysToDelete.length > 0) {
            logger.debug(`Nettoyage du cache de contexte: ${keysToDelete.length} entrées supprimées`);
        }
    }
    /**
     * Initialise les patterns regex pour la détection de dates dans toutes les langues activées
     */
    initializeDatePatterns() {
        const tc = new TranslationCollector(this.plugin.settings.languages);
        const weekdayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const weekdayPattern = tc.buildAlternation(weekdayKeys.flatMap(key => tc.collectWords(key)));
        const timeWordPattern = tc.buildAlternation(['today', 'tomorrow', 'yesterday'].flatMap(key => tc.collectWords(key)));
        const timeUnitKeys = ['minute', 'hour', 'day', 'week', 'month', 'year'];
        const timeUnitPattern = tc.buildAlternation(timeUnitKeys.flatMap(key => tc.collectWords(key)));
        const inPattern = tc.buildAlternationFor('in');
        const prefixPattern = tc.buildAlternation([...tc.collectWords('next'), ...tc.collectWords('last')]);
        this.datePatterns = [];
        // \b is defined in terms of \w, which is ASCII-only: it never matches
        // around CJK characters (no boundary exists between two Chinese
        // characters as far as \b is concerned), so it silently drops every CJK
        // match. Using explicit lookaround against Latin alphanumerics instead
        // still blocks partial-word matches for Latin scripts (e.g. "Monday"
        // inside "Mondayish") while imposing no boundary at all next to CJK
        // characters, which don't have word separators to check against anyway.
        //
        // The leading boundary can't be a lookbehind ("(?<!...)"): that syntax
        // isn't supported on iOS/Safari before 16.4 and throws at RegExp
        // construction time, breaking every one of these patterns on older
        // devices. Using a consuming alternation ("start-of-string or a single
        // non-word character") instead works the same way but actually consumes
        // that leading character, so the content to extract is wrapped in its
        // own capturing group below rather than read off the whole match.
        // Lookahead ("(?!...)") has no such compatibility issue and can stay.
        const wordBoundaryBefore = '(?:^|[^a-zA-Z0-9_])';
        const wordBoundaryAfter = '(?![a-zA-Z0-9_])';
        // Pattern 1: Jours de la semaine
        if (weekdayPattern) {
            this.datePatterns.push(new RegExp(`${wordBoundaryBefore}(${weekdayPattern})${wordBoundaryAfter}`, 'gi'));
        }
        // Pattern 2: Mots temporels courants (today, tomorrow, yesterday)
        if (timeWordPattern) {
            this.datePatterns.push(new RegExp(`${wordBoundaryBefore}(${timeWordPattern})${wordBoundaryAfter}`, 'gi'));
        }
        // Pattern 3: Expressions relatives "dans X jours/semaines/mois"
        if (inPattern && timeUnitPattern) {
            this.datePatterns.push(new RegExp(`${wordBoundaryBefore}((?:${inPattern})\\s*\\d+\\s*(?:${timeUnitPattern}))${wordBoundaryAfter}`, 'gi'));
        }
        // Pattern 4: Expressions "next/last weekday/week/month/year"
        // Every one of the 11 supported languages defines weekdays and time
        // units together with next/last, so the nested checks below can't
        // actually be false while prefixPattern is true -- kept as a guard in
        // case a future language module is authored incompletely.
        if (prefixPattern) {
            if (weekdayPattern) {
                this.datePatterns.push(new RegExp(`${wordBoundaryBefore}((?:${prefixPattern})\\s*(?:${weekdayPattern}))${wordBoundaryAfter}`, 'gi'));
            }
            if (timeUnitPattern) {
                this.datePatterns.push(new RegExp(`${wordBoundaryBefore}((?:${prefixPattern})\\s*(?:${timeUnitPattern}))${wordBoundaryAfter}`, 'gi'));
            }
        }
    }
    /**
     * Réinitialise les patterns (à appeler quand les langues changent)
     */
    resetPatterns() {
        this.initializeDatePatterns();
        this.clearCache(); // Vider le cache car les patterns ont changé
    }
    /**
     * Nettoie le cache lors de la destruction de l'instance
     */
    destroy() {
        this.stopPeriodicCleanup();
        this.clearCache();
    }
    /**
     * Analyse le contexte autour du curseur de manière synchrone (utilise le cache)
     */
    analyzeContextSync(editor, cursorLine) {
        const activeView = this.app.workspace.getActiveViewOfType(require$$0.MarkdownView);
        if (!activeView) {
            return { datesInContext: [], tags: [], timestamp: Date.now() };
        }
        const file = activeView.file;
        if (!file) {
            return { datesInContext: [], tags: [], timestamp: Date.now() };
        }
        const context = {
            datesInContext: [],
            tags: [],
            timestamp: Date.now(),
        };
        try {
            // Analyser le contexte autour du curseur
            const content = editor.getValue();
            const lines = content.split("\n");
            const startLine = Math.max(0, cursorLine - CONTEXT_LINES);
            const endLine = Math.min(lines.length - 1, cursorLine + CONTEXT_LINES);
            const contextLines = lines.slice(startLine, endLine + 1);
            const contextText = contextLines.join("\n");
            // Vérifier le cache (avec timeout). The key includes a cheap hash of
            // the actual scanned window, not just file+line: without it, editing
            // content within the ±CONTEXT_LINES window (without moving the cursor
            // to a different line) would keep serving a stale cached result until
            // CACHE_TIMEOUT expires, since file+line alone doesn't change when
            // nearby content does.
            const cacheKey = `${file.path}-${cursorLine}-${simpleHash(contextText)}`;
            const cached = this.cache.get(cacheKey);
            if (cached) {
                // Vérifier si l'entrée n'est pas expirée
                const now = Date.now();
                if (cached.timestamp && (now - cached.timestamp) <= CACHE_TIMEOUT) {
                    return cached;
                }
                else {
                    // Entrée expirée, la supprimer
                    this.cache.delete(cacheKey);
                }
            }
            // Extraire les tags depuis les métadonnées
            const metadata = this.app.metadataCache.getFileCache(file);
            if (metadata) {
                if (metadata.tags) {
                    context.tags = metadata.tags.map(tag => tag.tag);
                }
                // Extraire le titre depuis les frontmatter ou le premier titre
                // Frontmatter values are user-authored YAML, so "title" isn't
                // guaranteed to actually be a string (e.g. `title: 42`).
                if (typeof metadata.frontmatter?.title === "string") {
                    context.title = metadata.frontmatter.title;
                }
                else if (metadata.headings && metadata.headings.length > 0) {
                    context.title = metadata.headings[0].heading;
                }
            }
            // Extraire les dates du contexte
            context.datesInContext = this.extractDatesFromContext(contextText);
            // Mettre en cache (le LRU cache gère automatiquement la limite de taille)
            this.cache.set(cacheKey, context);
        }
        catch (error) {
            logger.error("Error analyzing context:", { error });
        }
        return context;
    }
    /**
     * Analyse le contexte autour du curseur dans le document actuel (async, pour compatibilité)
     */
    analyzeContext(editor, cursorLine) {
        return Promise.resolve(this.analyzeContextSync(editor, cursorLine));
    }
    /**
     * Normalise une date extraite en capitalisant la première lettre
     * Exemple: "demain" -> "Demain", "lundi prochain" -> "Lundi prochain"
     */
    normalizeDate(dateStr) {
        if (!dateStr || dateStr.length === 0) {
            return dateStr;
        }
        const trimmed = dateStr.trim();
        if (trimmed.length === 0) {
            return trimmed;
        }
        // Capitalize each word individually, not just the first character of
        // the whole string: multi-word matches from the prefix+weekday/prefix+
        // unit patterns (e.g. "next Friday") would otherwise have their second
        // word forced to lowercase ("Next friday"), incorrectly mangling
        // capitalized weekday/month names the user actually typed.
        return trimmed
            .split(/\s+/)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
    /**
     * Extrait les expressions de dates potentielles du texte
     * Utilise des patterns dynamiques multi-langue pour détecter les dates naturelles
     */
    extractDatesFromContext(text) {
        const dates = [];
        const seen = new Set();
        // Utiliser les patterns dynamiques générés pour toutes les langues activées
        for (const pattern of this.datePatterns) {
            // The leading boundary consumes a character instead of using a
            // zero-width lookbehind (see initializeDatePatterns), so the text to
            // extract is read from capture group 1, not the whole match.
            for (const match of text.matchAll(pattern)) {
                const content = match[1];
                if (content) {
                    // Pour les langues sans casse (comme le japonais), toLowerCase() ne change rien
                    const normalized = content.toLowerCase().trim();
                    if (!seen.has(normalized) && dates.length < MAX_DATES_TO_EXTRACT) {
                        seen.add(normalized);
                        // Normaliser avec la première lettre en majuscule (ou laisser tel quel pour le japonais)
                        dates.push(this.normalizeDate(content.trim()));
                    }
                }
            }
        }
        return dates;
    }
    /**
     * Nettoie le cache (peut être appelé périodiquement)
     */
    clearCache() {
        this.cache.clear();
    }
    /**
     * Retourne les statistiques du cache de contexte
     */
    getCacheStats() {
        return {
            size: this.cache.size,
            maxSize: this.cache.maxSizeLimit,
        };
    }
}

/**
 * Classe d'erreur personnalisée pour Natural Language Dates
 */
class NLDParseError extends Error {
    constructor(message, code, severity = 'error', context) {
        super(message);
        this.name = 'NLDParseError';
        this.code = code;
        this.severity = severity;
        this.context = context;
        // Maintient la stack trace pour le débogage (V8 only)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, NLDParseError);
        }
    }
}
/**
 * Codes d'erreur constants
 */
const ErrorCodes = {
    // Initialisation
    PARSER_INIT_FAILED: 'PARSER_INIT_FAILED',
    CHRONO_INIT_FAILED: 'CHRONO_INIT_FAILED',
    // Parsing
    PARSE_FAILED: 'PARSE_FAILED',
    CHRONO_PARSE_ERROR: 'CHRONO_PARSE_ERROR',
    // Configuration
    SETTINGS_LOAD_FAILED: 'SETTINGS_LOAD_FAILED',
    INVALID_LANGUAGE: 'INVALID_LANGUAGE',
};

class NaturalLanguageDates extends require$$0.Plugin {
    constructor() {
        super(...arguments);
        this.memoryMonitoringInterval = null;
        this.MEMORY_MONITORING_INTERVAL = 600000; // Toutes les 10 minutes
    }
    async onload() {
        await this.loadSettings();
        // Initialize parser immediately (no need to wait for onLayoutReady)
        this.resetParser();
        // Initialize smart suggestion managers
        this.historyManager = new HistoryManager(this);
        this.contextAnalyzer = new ContextAnalyzer(this.app, this);
        // Initialize history asynchronously
        this.historyManager.initialize().catch((err) => {
            logger.error("Error initializing history", { error: err });
        });
        this.addCommand({
            id: "nlp-dates",
            name: "Parse natural language date",
            callback: () => getParseCommand(this, "replace"),
        });
        this.addCommand({
            id: "nlp-dates-link",
            name: "Parse natural language date (as link)",
            callback: () => getParseCommand(this, "link"),
        });
        this.addCommand({
            id: "nlp-date-clean",
            name: "Parse natural language date (as plain text)",
            callback: () => getParseCommand(this, "clean"),
        });
        this.addCommand({
            id: "nlp-parse-time",
            name: "Parse natural language time",
            callback: () => getParseCommand(this, "time"),
        });
        this.addCommand({
            id: "nlp-now",
            name: "Insert the current date and time",
            callback: () => getNowCommand(this),
        });
        this.addCommand({
            id: "nlp-today",
            name: "Insert the current date",
            callback: () => getCurrentDateCommand(this),
        });
        this.addCommand({
            id: "nlp-time",
            name: "Insert the current time",
            callback: () => getCurrentTimeCommand(this),
        });
        this.addCommand({
            id: "nlp-picker",
            name: "Date picker",
            checkCallback: (checking) => {
                if (checking) {
                    return !!getActiveEditor(this.app.workspace);
                }
                new DatePickerModal(this.app, this).open();
            },
        });
        this.addSettingTab(new NLDSettingsTab(this.app, this));
        this.registerObsidianProtocolHandler("nldates", params => this.actionHandler(params));
        this.registerEditorSuggest(new DateSuggest(this.app, this));
        // Démarrer le monitoring de la mémoire
        this.startMemoryMonitoring();
    }
    resetParser() {
        try {
            this.parser = new NLDParser(this.settings.languages);
            logger.debug("Parser initialized successfully", { languages: this.settings.languages });
        }
        catch (error) {
            const parseError = error instanceof NLDParseError
                ? error
                : new NLDParseError('Failed to initialize parser', ErrorCodes.PARSER_INIT_FAILED, 'error', { originalError: error, languages: this.settings.languages });
            logger.error('Failed to initialize parser', {
                code: parseError.code,
                error: parseError.message,
                context: parseError.context,
            });
            // Create parser with English as default in case of error to prevent plugin from crashing completely
            try {
                this.parser = new NLDParser(['en']);
                logger.info('Parser initialized with English fallback');
                // Notifier l'utilisateur uniquement pour les erreurs critiques
                new require$$0.Notice('Natural Language Dates: Failed to initialize with selected languages. Using English as fallback.', 5000);
            }
            catch (fallbackError) {
                logger.error('Failed to initialize parser even with English fallback', { error: fallbackError });
                new require$$0.Notice('Natural Language Dates: Critical error - parser initialization failed. Please restart Obsidian.', 10000);
            }
        }
        // Reset context patterns when languages change
        if (this.contextAnalyzer) {
            this.contextAnalyzer.resetPatterns();
        }
    }
    onunload() {
        // Arrêter le monitoring de la mémoire
        this.stopMemoryMonitoring();
        // Nettoyer les ressources
        if (this.contextAnalyzer) {
            this.contextAnalyzer.destroy();
        }
        if (this.historyManager) {
            this.historyManager.destroy();
        }
    }
    /**
     * Démarre le monitoring périodique de l'utilisation mémoire
     */
    startMemoryMonitoring() {
        // Logger les statistiques toutes les 10 minutes
        this.memoryMonitoringInterval = window.setInterval(() => {
            this.logMemoryUsage();
        }, this.MEMORY_MONITORING_INTERVAL);
        // Logger immédiatement au démarrage
        this.logMemoryUsage();
    }
    /**
     * Arrête le monitoring de la mémoire
     */
    stopMemoryMonitoring() {
        if (this.memoryMonitoringInterval !== null) {
            window.clearInterval(this.memoryMonitoringInterval);
            this.memoryMonitoringInterval = null;
        }
    }
    /**
     * Log les statistiques d'utilisation mémoire des caches
     */
    logMemoryUsage() {
        try {
            const stats = {};
            // Statistiques du cache de parsing
            if (this.parser) {
                stats.parsingCache = this.parser.getCacheStats();
            }
            // Statistiques du cache de contexte
            if (this.contextAnalyzer) {
                stats.contextCache = this.contextAnalyzer.getCacheStats();
            }
            // Statistiques de l'historique
            if (this.historyManager) {
                this.historyManager.getHistory().then(history => {
                    stats.history = {
                        size: Object.keys(history).length,
                        maxSize: 100, // MAX_HISTORY_SIZE
                    };
                    logger.debug("Utilisation mémoire des caches", stats);
                }).catch((err) => {
                    logger.warn("Impossible de récupérer les statistiques de l'historique", { error: err });
                    // Logger quand même les autres statistiques
                    if (Object.keys(stats).length > 0) {
                        logger.debug("Utilisation mémoire des caches", stats);
                    }
                });
            }
            else {
                if (Object.keys(stats).length > 0) {
                    logger.debug("Utilisation mémoire des caches", stats);
                }
            }
        }
        catch (error) {
            logger.warn("Erreur lors du monitoring de la mémoire", { error });
        }
    }
    async loadSettings() {
        const loadedData = await this.loadData();
        this.settings = Object.assign({}, DEFAULT_SETTINGS, loadedData);
        // Ensure languages is not empty (use default values if necessary)
        if (!this.settings.languages || this.settings.languages.length === 0) {
            this.settings.languages = [...DEFAULT_SETTINGS.languages];
        }
        // Synchronize flags with languages array if necessary
        this.syncLanguageFlags();
    }
    // Synchronizes language flags (english, french, etc.) with languages array
    syncLanguageFlags() {
        const languageMap = {
            'en': 'english',
            'ja': 'japanese',
            'fr': 'french',
            'de': 'german',
            'pt': 'portuguese',
            'nl': 'dutch',
            'es': 'spanish',
            'it': 'italian',
            'ru': 'russian',
            'uk': 'ukrainian',
            'zh.hant': 'chinese',
        };
        // Reset all flags
        this.settings.english = false;
        this.settings.japanese = false;
        this.settings.french = false;
        this.settings.german = false;
        this.settings.portuguese = false;
        this.settings.dutch = false;
        this.settings.spanish = false;
        this.settings.italian = false;
        this.settings.russian = false;
        this.settings.ukrainian = false;
        this.settings.chinese = false;
        // Enable flags corresponding to languages in array
        for (const lang of this.settings.languages) {
            const flagKey = languageMap[lang];
            if (flagKey) {
                this.settings[flagKey] = true;
            }
        }
    }
    async saveSettings() {
        await this.saveData(this.settings);
    }
    /**
     * Parses a natural language date string and formats it according to the specified format.
     *
     * This is the core parsing method that accepts a custom format string.
     * The input is validated and sanitized before parsing.
     *
     * @param dateString - Natural language date string (e.g., "today", "tomorrow", "in 2 days", "next Monday")
     * @param format - Moment.js format string (e.g., "YYYY-MM-DD", "DD/MM/YYYY", "MMMM Do, YYYY")
     * @returns NLDResult object containing the formatted string, Date object, and Moment object
     *
     * @example
     * ```typescript
     * const result = plugin.parse("tomorrow", "YYYY-MM-DD");
     * console.log(result.formattedString); // "2025-01-06"
     *
     * const result2 = plugin.parse("next Monday", "dddd, MMMM Do");
     * console.log(result2.formattedString); // "Monday, January 6th"
     * ```
     */
    parse(dateString, format) {
        if (!this.parser) {
            // Parser not yet initialized, initialize it now
            this.resetParser();
        }
        // Valider le format avant utilisation
        const formatValidation = validateMomentFormat(format);
        if (!formatValidation.valid) {
            logger.warn("Invalid format in parse()", { format, error: formatValidation.error });
            // Utiliser le format par défaut en cas d'erreur
            format = DEFAULT_SETTINGS.format;
        }
        // Valider et sanitizer l'entrée utilisateur
        const sanitizedInput = validateUriParam(dateString, 200);
        if (!sanitizedInput) {
            logger.warn("Invalid input in parse()", { dateString });
            // Retourner une date invalide plutôt que de planter
            const invalidDate = new Date(NaN);
            return {
                formattedString: "Invalid date",
                date: invalidDate,
                moment: moment(invalidDate),
            };
        }
        const date = this.parser.getParsedDate(sanitizedInput, this.settings.weekStart);
        const formattedString = DateFormatter.format(date, format);
        if (formattedString === "Invalid date") {
            logger.debug("Input date can't be parsed by nldates", { dateString: sanitizedInput });
        }
        return {
            formattedString,
            date,
            moment: moment(date),
        };
    }
    /**
     * Parses a natural language date string using the plugin's configured date format.
     *
     * Automatically detects if the input contains a time component and includes it in the output.
     * Uses the format from plugin settings (default: "YYYY-MM-DD").
     *
     * @param dateString - Natural language date string (e.g., "today", "tomorrow", "next Monday at 3pm")
     * @returns NLDResult object with formatted string using configured format
     *
     * @example
     * ```typescript
     * // If settings.format is "YYYY-MM-DD" and settings.timeFormat is "HH:mm"
     * const result = plugin.parseDate("tomorrow");
     * console.log(result.formattedString); // "2025-01-06"
     *
     * const result2 = plugin.parseDate("next Monday at 3pm");
     * console.log(result2.formattedString); // "2025-01-06 15:00"
     * ```
     */
    parseDate(dateString) {
        // Valider et sanitizer l'entrée utilisateur
        const sanitizedInput = validateUriParam(dateString, 200);
        if (!sanitizedInput) {
            logger.warn("Invalid input in parseDate()", { dateString });
            const invalidDate = new Date(NaN);
            return {
                formattedString: "Invalid date",
                date: invalidDate,
                moment: moment(invalidDate),
            };
        }
        // Valider le format de date
        const dateFormatValidation = validateMomentFormat(this.settings.format);
        if (!dateFormatValidation.valid) {
            logger.warn("Invalid date format in settings", { format: this.settings.format, error: dateFormatValidation.error });
            // Utiliser le format par défaut
            this.settings.format = DEFAULT_SETTINGS.format;
        }
        // 1. Ask the parser if time is detected
        const hasTime = this.parser.hasTimeComponent(sanitizedInput);
        let formatToUse = this.settings.format;
        // 2. If time is detected...
        if (hasTime) {
            const timeFormat = this.settings.timeFormat || "HH:mm";
            // Valider le format de temps
            const timeFormatValidation = validateMomentFormat(timeFormat);
            if (!timeFormatValidation.valid) {
                logger.warn("Invalid time format in settings", { format: timeFormat, error: timeFormatValidation.error });
                // Utiliser le format par défaut
                formatToUse = `${this.settings.format} ${DEFAULT_SETTINGS.timeFormat}`;
            }
            else {
                // TIP: Here we format "Date TIME."
                // But BEWARE: it is the "date-suggest.ts" file that will add the [[ ]].
                // If we don't touch date-suggest, it will make [[Date Time]].
                // To make [[Date]] Time, we have to be clever.
                formatToUse = `${formatToUse} ${timeFormat}`;
            }
        }
        const result = this.parse(sanitizedInput, formatToUse);
        return result;
    }
    /**
     * Parses a natural language date range string.
     *
     * Supports various range expressions:
     * - Weekday ranges: "from Monday to Friday" / "de lundi à vendredi"
     * - Week ranges: "next week" / "semaine prochaine" (returns all days of the week)
     *
     * The result includes a list of all dates in the range for easy iteration.
     *
     * @param dateString - Natural language date range string
     * @returns NLDRangeResult object with start/end dates and date list, or null if not a range
     *
     * @example
     * ```typescript
     * const range = plugin.parseDateRange("from Monday to Friday");
     * if (range) {
     *   console.log(range.startDate); // Date for Monday
     *   console.log(range.endDate); // Date for Friday
     *   console.log(range.dateList?.length); // 5
     *
     *   // Iterate over all dates in range
     *   range.dateList?.forEach(date => {
     *     console.log(date.format("YYYY-MM-DD"));
     *   });
     * }
     * ```
     */
    parseDateRange(dateString) {
        if (!this.parser) {
            this.resetParser();
        }
        // Valider et sanitizer l'entrée utilisateur
        const sanitizedInput = validateUriParam(dateString, 200);
        if (!sanitizedInput) {
            logger.warn("Invalid input in parseDateRange()", { dateString });
            return null;
        }
        return this.parser.getParsedDateRange(sanitizedInput, this.settings.weekStart);
    }
    /**
     * Parses a natural language time string using the plugin's configured time format.
     *
     * Extracts only the time component from the input and formats it according to settings.
     * Uses the time format from plugin settings (default: "HH:mm").
     *
     * @param dateString - Natural language time string (e.g., "now", "in 2 hours", "at 3pm")
     * @returns NLDResult object with formatted time string
     *
     * @example
     * ```typescript
     * // If settings.timeFormat is "HH:mm"
     * const result = plugin.parseTime("in 2 hours");
     * console.log(result.formattedString); // "17:30" (if current time is 15:30)
     *
     * const result2 = plugin.parseTime("at 3pm");
     * console.log(result2.formattedString); // "15:00"
     * ```
     */
    parseTime(dateString) {
        // Valider et sanitizer l'entrée utilisateur
        const sanitizedInput = validateUriParam(dateString, 200);
        if (!sanitizedInput) {
            logger.warn("Invalid input in parseTime()", { dateString });
            const invalidDate = new Date(NaN);
            return {
                formattedString: "Invalid date",
                date: invalidDate,
                moment: moment(invalidDate),
            };
        }
        // Valider le format de temps
        const timeFormatValidation = validateMomentFormat(this.settings.timeFormat);
        if (!timeFormatValidation.valid) {
            logger.warn("Invalid time format in settings", { format: this.settings.timeFormat, error: timeFormatValidation.error });
            // Utiliser le format par défaut
            return this.parse(sanitizedInput, DEFAULT_SETTINGS.timeFormat);
        }
        return this.parse(sanitizedInput, this.settings.timeFormat);
    }
    /**
     * Checks if a text string contains a time component.
     *
     * Useful for determining whether to include time formatting in the output.
     * Detects various time expressions in all enabled languages.
     *
     * @param text - Text string to check for time component
     * @returns true if a time component is detected, false otherwise
     *
     * @example
     * ```typescript
     * plugin.hasTimeComponent("next Monday at 3pm"); // true
     * plugin.hasTimeComponent("tomorrow"); // false
     * plugin.hasTimeComponent("in 2 hours"); // true
     * plugin.hasTimeComponent("dans 2 heures"); // true (French)
     * ```
     */
    hasTimeComponent(text) {
        if (!this.parser) {
            this.resetParser();
        }
        return this.parser.hasTimeComponent(text);
    }
    async actionHandler(params) {
        const { workspace } = this.app;
        // Valider et sanitizer les paramètres URI pour éviter les injections
        const day = validateUriParam(params.day, 100);
        if (!day) {
            logger.warn("Invalid day parameter in URI", { day: params.day });
            return;
        }
        const date = this.parseDate(day);
        const newPane = parseTruthy(params.newPane || "yes");
        if (date.moment.isValid()) {
            const dailyNote = await getOrCreateDailyNote(date.moment);
            await workspace.getLeaf(newPane).openFile(dailyNote);
        }
    }
}

module.exports = NaturalLanguageDates;


/* nosourcemap */