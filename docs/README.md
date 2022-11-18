# Time Calculator ⏱

![test image size](img/timecalculator.png)

## Examples

```shell
08:00 > 17:30         # 9 hours 30 minutes
```

```shell
08:00 + 30m10s        # 08:30:10
```

```shell
9h - 12:00 > 13:00    # 8 hours
```

## Syntax

### Definitions

`time stroke` - The time of day **HH:MM:SS** or just **HH:MM** (24-hour clock). `E.g. 17:30`

`time duration` - The amount of time in hours **h**, minutes **m**, and seconds **s**. `E.g. 1h30m`

`time interval` - The amount of time between two time strokes, which when evaluated, will result in a time duration. `E.g. 12:00 > 13:30`

### Operators

`+` and `-` is used for addition and subtraction of time durations but can also be used to add/subtract time durations to time strokes.

`(` and `)` is used just, like in math, for prioritization.

`>` is used for defining time intervals. It's used like `HH:MM(:SS) > HH:MM(:SS)`.

## Deployment

Run the following to build and deploy the site to github pages

```shell
npm run deploy
```
