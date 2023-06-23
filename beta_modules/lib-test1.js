/*
  This code is still in library testing phase, please do not take it as absoulte extension.
*/

const Main = imports.ui.main;

const { httpRequest, getChannels, getListenUrl, searchRG } = imports.misc.extensionUtils.getCurrentExtension().imports.lib.librgarden;


function showNotification(message) {
  const sourceName = 'Your Extension Name'; // Replace with your extension's name
  Main.notify(sourceName, JSON.stringify(message));
}

function showResults(results) {
  const formattedResults = results.map(result => result.join(' - '));
  const message = `Results:\n${formattedResults.join('\n')}`;
  showNotification(message);

}

function init() {
  // Initialize the extension
}

function enable() {
  getChannels()
    .then(json => {
      showResults(json[0]);
    })
    .catch(error => {
      const errorMessage = `Error occurred: ${error}`;
      showNotification(errorMessage);
    });

  searchRG("mirchi")
    .then(json => {
      showResults(json[0]);
    })
    .catch(error => {
      const errorMessage = `Error occurred: ${error}`;
      showNotification(errorMessage);
    });
}

function disable() {
  // Cleanup and disable the extension
}
