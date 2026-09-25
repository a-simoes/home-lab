/*
  Power up recovery

  Runs once per boot. When the clock is valid it puts the door where the
  solar schedule says it should be now, then stops. If the clock is still
  missing at a check, it opens the door so the birds are never locked in,
  keeps checking, and recovers as above once the clock arrives.

  Install it with start on boot enabled. Boot is the only moment it matters.

  The sunrise and sunset jobs in Schedule.List are the single source of
  truth. Which one was due last is calculated by the scheduler itself
  through Schedule.Eval, and its calls are replayed as they are, so this script
  holds no door timings and no output numbers of its own.

  RPC calls are asynchronous. Any step that makes several calls goes
  through callAll, which continues once all have answered. A function is
  extracted only when more than one caller uses it, or when folding it
  would nest one callback inside another, which the interpreter crashes on
  at two or three levels.

  Stages, in order:
    checkClock   read the clock
    recover      clock valid: restore schedules, replay last event, stop
    survive      clock missing: disable schedules, open the door, once
*/

let CHECK_INTERVAL_MS = 5 * 60 * 1000;
let CLOCK_VALID_AFTER = 1577836800; // 2020-01-01 UTC. Earlier means the clock was never set.

let state = {
  timer: null,
  survived: false,
  sunrise: null,
  sunset: null,
  results: [],
  pending: 0,
  afterAll: null
};

// ---------------------------------------------------------------- clock

// Timer tick. Reads the clock and picks the stage. A failed or empty read waits for the next tick.
function checkClock() {
  Shelly.call("Sys.GetStatus", {}, function (status, errorCode) {
    if (errorCode || !status) return;

    let clockValid = typeof status.unixtime === "number" && status.unixtime > CLOCK_VALID_AFTER;
    if (clockValid) {
      recover();
    } else if (!state.survived) {
      survive();
    }
  });
}

// ---------------------------------------------------------------- recover

// Clock is valid. Enables both solar jobs, then runs the one due most recently.
function recover() {
  print("Clock valid. Recovering.");
  Shelly.call("Schedule.List", {}, function (list, errorCode) {
    if (errorCode || !readSolarJobs(list)) return;
    setSchedules(true, runLatestJob);
  });
}

// Asks the scheduler when each solar job was last due, whether or not it fired,
// runs the one due most recently, then stops the script.
function runLatestJob() {
  callAll([
    { method: "Schedule.Eval", params: { timespec: state.sunrise.timespec } },
    { method: "Schedule.Eval", params: { timespec: state.sunset.timespec } }
  ], function (results) {
    let sunriseDue = results[0].prev || 0;
    let sunsetDue = results[1].prev || 0;
    let latest = sunriseDue > sunsetDue ? state.sunrise : state.sunset;
    print("Running " + latest.timespec);
    callAll(latest.calls, stopScript);
  });
}

// Ends the recovery. Nothing runs again until the next boot.
function stopScript() {
  print("Recovery complete. Stopping.");
  Timer.clear(state.timer);
  Shelly.call("Script.Stop", { id: Shelly.getCurrentScriptId() });
}

// ---------------------------------------------------------------- survive

// No clock. Disables both solar jobs so they cannot fire on a wrong clock, then opens the door.
function survive() {
  print("No clock. Starting survival.");
  Shelly.call("Schedule.List", {}, function (list, errorCode) {
    if (errorCode || !readSolarJobs(list)) return;
    setSchedules(false, openDoor);
  });
}

// Runs the sunrise job, the open action, and records that survival ran.
function openDoor() {
  callAll(state.sunrise.calls, function () {
    state.survived = true;
    print("Door opened. Waiting for the clock.");
  });
}

// ---------------------------------------------------------------- schedules

// Finds the sunrise and sunset jobs. False when either is missing or the reply is empty.
function readSolarJobs(list) {
  state.sunrise = null;
  state.sunset = null;
  if (!list || !list.jobs) return false;
  for (let i = 0; i < list.jobs.length; i++) {
    let job = list.jobs[i];
    if (state.sunrise === null && job.timespec.indexOf("@sunrise") === 0) state.sunrise = job;
    if (state.sunset === null && job.timespec.indexOf("@sunset") === 0) state.sunset = job;
  }
  return state.sunrise !== null && state.sunset !== null;
}

// Sets both solar jobs to enable, updating only those that differ, then calls then.
// Full job fields are sent because partial updates are undocumented.
function setSchedules(enable, then) {
  let jobs = [state.sunrise, state.sunset];
  let updates = [];
  for (let i = 0; i < jobs.length; i++) {
    if (jobs[i].enable !== enable) {
      updates.push({
        method: "Schedule.Update",
        params: { id: jobs[i].id, enable: enable, timespec: jobs[i].timespec, calls: jobs[i].calls }
      });
    }
  }
  callAll(updates, then);
}

// ---------------------------------------------------------------- calls

// Makes every call at once and, when all have answered, calls then with their
// results in order. On any error or empty reply then is never called, so the next
// tick starts over.
function callAll(calls, then) {
  state.results = [];
  state.pending = calls.length;
  state.afterAll = then;
  if (calls.length === 0) {
    then(state.results);
    return;
  }
  for (let i = 0; i < calls.length; i++) {
    Shelly.call(calls[i].method, calls[i].params, function (result, errorCode, errorMessage, index) {
      if (errorCode || !result) return;
      state.results[index] = result;
      state.pending--;
      if (state.pending === 0) state.afterAll(state.results);
    }, i);
  }
}

// ---------------------------------------------------------------- main

// Entry point. Starts the periodic clock check.
function main() {
  print("Power up recovery started. Checking the clock every " + (CHECK_INTERVAL_MS / 60000) + " minutes.");
  state.timer = Timer.set(CHECK_INTERVAL_MS, true, checkClock);
}

main();
