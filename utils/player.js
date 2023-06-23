const GLib = imports.gi.GLib;

let ffplayProcess;

function playStream(streamUrl) {
  const [result, pid, stdin] = GLib.spawn_async(
    null,
    ["ffplay", "-nodisp", streamUrl],
    null,
    GLib.SpawnFlags.SEARCH_PATH,
    null
  );

  // Store the process information for later use
  ffplayProcess = { pid, stdin };
}

function stopStream() {
  if (ffplayProcess) {
    GLib.spawn_close_pid(ffplayProcess.pid);
    GLib.spawn_command_line_async(`kill -9 ${ffplayProcess.pid}`);
    ffplayProcess = null;
  }
}

var exports = {
  playStream: playStream,
  stopStream: stopStream
};
