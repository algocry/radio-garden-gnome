const Main = imports.ui.main;
const currentExtension = imports.misc.extensionUtils.getCurrentExtension();
const { httpRequest, getChannels, getListenUrl, searchRG } = currentExtension.imports.lib.librgarden;
const { runCommand  } = currentExtension.imports.utils.sysUtils;

function showNotification(message) {
  const sourceName = 'Your Extension Name'; // Replace with your extension's name
  Main.notify(sourceName, JSON.stringify(message));
}

function showResults(results) {
  //const formattedResults = results.map(result => result.join(' - '));
  //const message = `Results:\n${formattedResults.join('\n')}`;
  showNotification(results);

}

function init() {
  // Initialize the extension
}

function enable() {
  getChannels()
    .then(json => {
      showResults(getListenUrl(json[1][1]));
    })
    .catch(error => {
      const errorMessage = `Error occurred: ${error}`;
      showNotification(errorMessage);
    });

  searchRG("mirchi")
    .then(json => {
      runCommand(`ffplay "${getListenUrl(json[1][1])}"`);
    })
    .catch(error => {
      const errorMessage = `Error occurred: ${error}`;
      showNotification(errorMessage);
    });
}

function disable() {
  // Cleanup and disable the extension
}
