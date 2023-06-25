const Main = imports.ui.main;
const ExtensionUtils = imports.misc.extensionUtils;
const Extension = ExtensionUtils.getCurrentExtension();
const { RadioExtension } = Extension.imports.components.RGGExtension;

function init() {
  // do nothing
}

function enable() {
  let radioExtension = new RadioExtension();
  Main.panel.addToStatusArea("radio-extension", radioExtension);
}

function disable() {
  Main.panel.statusArea["radio-extension"].destroy();
  radioExtension._destroyMenuItems();
  radioExtension._destroyControllerItems();
  radioExtension._stop();
  radioExtension._finish();
}
