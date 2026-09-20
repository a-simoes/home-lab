# Chicken Coop Automation

An automatic coop door and watering system that runs itself.

## Goal

Leave for a few days without arranging for anyone to visit the coop. The door opens and
closes with the sun. The birds always have water. Nothing depends on me being home, on
the internet, or on remembering anything.

## Principles

- **Autonomous.** Correct behaviour is the default, not the result of intervention.
- **Offline first.** Wi-Fi is an accessory. Losing it changes nothing essential.
- **Fail safe.** Every failure mode resolves toward shut, dry and harmless.
- **Self-recovering.** A power cut is a normal event, not an incident. Power returns and
  the system carries on by itself.

## Door

| # | Requirement |
|---|-------------|
| D1 | Opens at sunrise and closes at sunset, following the solar clock all year |
| D2 | Open and close offsets are configurable and independent |
| D3 | Closes a set number of minutes after sunset, because the birds like to watch it |
| D4 | Always reaches fully closed, because a door left ajar is a way in |
| D5 | Can be opened and closed by hand, without power |
| D6 | Stays locked when closed, so a fox cannot force it open |
| D7 | Travel stops at both ends of the stroke without software, using the limit switches built into the actuator |

## Watering

| # | Requirement |
|---|-------------|
| W1 | Keeps the drinker supplied without attention |
| W2 | Cannot flood the coop, even if a single part fails |
| W3 | Cannot destroy itself by running dry |
| W4 | Holds for at least the length of an absence |
| W5 | Self-cleaning where possible, so standing water and algae do not build up |
| W6 | Meets summer demand, which is far higher than in winter |
| W7 | Keeps the water cool enough to drink through the hottest part of the day |

## System

| # | Requirement |
|---|-------------|
| S1 | The schedule runs with no network and no cloud |
| S2 | Returns to a safe, known state when power returns |
| S3 | Wi-Fi, when present, is for observation and adjustment only |
| S4 | Manual override commands open and close, overriding the schedule |
| S5 | Electrical faults are contained by protection, isolation and earthing |
| S6 | Electronics survive rain, condensation and humidity |
