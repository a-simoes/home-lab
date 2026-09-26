/*
  Wi-Fi fallback to access point

  Keeps the device reachable from a phone when the house network is gone.
  The access point should be on exactly when the station has no address, so
  every check compares the two and changes the access point when they
  disagree.

  Resilience:
  - Every call checks its error and the shape of its answer, so a bad reply
    is skipped instead of killing the script.
  - The two must disagree for several checks in a row before anything
    changes. The link at the coop is weak, and a short drop should not
    rewrite flash or drop a phone that is connected to the access point.
  - A write that fails is retried on the next check, because the setting is
    read back each time rather than assumed.
  - If the device reports that the change needs a restart, the script says
    so, because the fallback would then not really be there.

  RPC calls are asynchronous, so each step is a named function with its
  callback inline, one level deep.
*/

let CHECK_INTERVAL_MS = 60 * 1000;
let SETTLE_CHECKS = 3; // Consecutive checks that must disagree before the access point changes.
let LOG_PREFIX = "[wifi-ap-fallback] ";

let state = {
  connected: false,
  disagreements: 0
};

// Timer tick. Reads whether the station has an address, then checks the access point.
function checkWifi() {
  Shelly.call("WiFi.GetStatus", {}, function (status, errorCode) {
    if (errorCode || !status) return;
    state.connected = status.status === "got ip";
    checkAccessPoint();
  });
}

// Compares the access point with the station and counts consecutive disagreements.
// Changes the access point once they have disagreed for SETTLE_CHECKS checks.
function checkAccessPoint() {
  Shelly.call("WiFi.GetConfig", {}, function (config, errorCode) {
    if (errorCode || !config || !config.ap) return;
    let wanted = !state.connected;
    if (config.ap.enable === wanted) {
      state.disagreements = 0;
      return;
    }
    state.disagreements++;
    if (state.disagreements >= SETTLE_CHECKS) setAccessPoint(wanted);
  });
}

// Writes the access point setting, which is stored in flash, and warns if it
// only applies after a restart. A successful write starts the count again, so
// a change in the other direction also waits SETTLE_CHECKS checks. A failed
// write keeps its count, so the next check retries at once.
function setAccessPoint(enable) {
  log(enable ? "Wi-Fi lost. Turning the access point on." : "Wi-Fi back. Turning the access point off.");
  Shelly.call("WiFi.SetConfig", { config: { ap: { enable: enable } } }, function (result, errorCode) {
    if (errorCode) return;
    state.disagreements = 0;
    if (result && result.restart_required) log("The access point change needs a restart to apply.");
  });
}

// Writes one log line, prefixed with the script name so both scripts can be told
// apart in the device log.
function log(message) {
  print(LOG_PREFIX + message);
}

// Entry point. Starts the periodic check.
function main() {
  log("Started. Checking Wi-Fi every " + (CHECK_INTERVAL_MS / 1000) + " seconds.");
  Timer.set(CHECK_INTERVAL_MS, true, checkWifi);
}

main();
