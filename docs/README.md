# Time Calculator ⏱

![test image size](img/timecalculator.png)

## Examples

```shell
08:00 > 17:30         # 9 hours 30 minutes
```

```shell
08:00 + 8h30m1s       # 16:30:01
```

```shell
9h - (12:00 > 13:00)  # 8 hours
```

## Syntax

### Definitions:

`time stroke` The time of day **HH:MM:SS** or just **HH:MM** (24-hour clock).

`time duration` The elapsed time between two time strokes in hours **h**, minutes **m**, and (optionally) seconds **s**.

### Operators:

`>` is used for determining the duration between two time strokes. It's used like `XX:XX:XX > YY:YY:YY` and the second argument needs to be later (but still within the same 24-hours) than the first.

`+` and `-` is used for addition and subtraction of time durations but can also be used to add/subtract durations to time strokes.

`(` and `)` is used just, like in math, for prioritization.
