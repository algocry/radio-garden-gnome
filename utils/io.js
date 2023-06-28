const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Extension = imports.misc.extensionUtils.getCurrentExtension();
const { showNotification } = Extension.imports.utils.sysUtils;

function readJsonFromFile(filePath) {
  try {
    const file = Gio.File.new_for_path(filePath);
    const [, contents] = file.load_contents(null);
    const content = contents.toString();
    const jsonData = JSON.parse(content);
    return jsonData;
  } catch (error) {
    log(error.message);
    return null;
  }
}

function writeJsonToFile(data, filePath) {
  try {
    const jsonContent = JSON.stringify(data, null, "\t");
    GLib.file_set_contents(filePath, jsonContent);
  } catch (error) {
    showNotification(`Failed to write JSON file: ${error.message}`);
  }
}

var exports = {
	readJsonFromFile: readJsonFromFile,
	writeJsonToFile: writeJsonToFile
};
