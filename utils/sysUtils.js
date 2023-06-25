const Util = imports.misc.util;
const Main = imports.ui.main;

function runCommand(command){
	Util.spawnCommandLine(command);
}

function showNotification(message) {
  const sourceName = 'Your Extension Name'; // Replace with your extension's name
  Main.notify(sourceName, JSON.stringify(message));
}

const exports = {
	runCommand: runCommand,
	showNotification: showNotification
};
