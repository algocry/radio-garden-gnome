const Util = imports.misc.util;

function runCommand(command){
	Util.spawnCommandLine(command);
}

const exports = {
	runCommand: runCommand
};
