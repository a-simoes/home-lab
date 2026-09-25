# Configuration

What is set on the Shelly Plus Uni beyond its defaults, and why. Values that identify the
network or the house are shown as `***`.

## Solar clock

The door runs on a solar clock. The device computes sunrise and sunset itself, so the
schedule tracks the seasons with nobody editing it.

That calculation takes two inputs, and both have to be configured for any of this to work.

The first is a valid date and time. Solar times are derived from the date, so a device
that does not know the day cannot know when the sun sets. It learns the time over the
network and has no battery backed clock, which is what the last section is about.

The second is the location. `sys.location` holds the latitude, longitude and timezone of
the coop, set through `Sys.SetConfig`. These must be the real coordinates rather than a
nearby town, because an error here moves sunset by minutes and the door closes on the
wrong light.

With either missing there is no sunrise to act on, and the schedule does nothing.

The schedules then use solar timespecs instead of times:

| Job | Timespec | Action |
|-----|----------|--------|
| 1 | `@sunrise` | switch 0 on, opens the door |
| 2 | `@sunset+0h30m` | switch 1 on, closes the door |
| 3 | `0 0 0 * * 0,1,2,3,4,5,6` | firmware update check |

The half hour offset on job 2 is D3, the birds watching the light go. Offsets accept up to
twelve hours in either direction, so the closing time is tuned by editing that one string.

Both outputs are momentary. `auto_off` is on with a delay of 35 seconds, which is the time
the actuator needs to travel the door's height. The schedule turns an output on, the
device turns it off, and the relays return to the state where the motor is stopped.

`initial_state` is `off` on both outputs, so power returning never drives the motor.

## Wi-Fi fallback to access point

The device joins the house network as a station. If that network is gone, the device is
unreachable, and with it any way to command the door by hand.

`scripts/wifi-ap-fallback.js` watches for that. Every minute it compares the station
status against whether the access point is up, and switches the access point on when the
station is not connected, off again when it returns. With the access point up, the device
is reachable from a phone directly, with no router involved.

The access point is disabled in stored configuration. It exists only while the script has
raised it.

## Power up without a clock

Solar schedules need the date, and the device has no battery backed clock. It learns the
time over the network, which after a power cut takes minutes while the router and the mesh
come back, and never arrives if the network is down.

`scripts/power-up-recovery.js` handles this. It runs once per boot and checks the clock
every five minutes.

- **Clock valid.** It enables the solar schedules if they are off, replays whichever event
  should have happened last, and stops. A power cut across sunrise or sunset does not leave
  the door wrong for the rest of the day.
- **No clock.** It disables the solar schedules so they cannot fire against a clock
  counting from 1970, opens the door once, and keeps checking.

Opening without a clock is a deliberate trade. A door shut through a summer day kills the
birds, and a door open at night only risks a fox, so the heat risk wins.

The script is not on the device yet. Until it is, a power cut has no handling.
