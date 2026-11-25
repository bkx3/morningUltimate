# Morning Ultimate

Static site for the Palo Alto morning Ultimate pickup game.

The site is designed to be hosted from GitHub Pages at `morningultimate.com`.

## Apple Maps

The map area is Apple Maps-only. A live embedded Apple map requires a MapKit JS token from Apple Developer; once available, set `window.MORNING_ULTIMATE_MAPKIT_TOKEN` before the closing page script in `index.html`.

## Temporary Weather-Line Message

The large headline line that normally says `rain or shine` can be temporarily replaced through `weather-message.json`. `index.html` checks that file before fetching live weather. If `text` is non-empty and `expiresAt` is still in the future, the site shows `text`; once `expiresAt` passes, the site automatically goes back to the normal weather text.

Current inactive state:

```json
{
  "text": "",
  "expiresAt": ""
}
```

Active state:

```json
{
  "text": "Field closed today",
  "expiresAt": "2026-07-17T08:30:00-07:00"
}
```

### Updating It

Use the helper script whenever possible:

```sh
node scripts/set-weather-message.mjs "Field closed today" "2026-07-17"
```

With a plain `YYYY-MM-DD` date, the message stays active through the end of that date in Pacific time. Use an ISO date-time with a timezone offset when you want an exact expiration time:

```sh
node scripts/set-weather-message.mjs "Field closed today" "2026-07-17T08:30:00-07:00"
```

The helper writes `expiresAt` as UTC ISO in `weather-message.json`; that is expected.

### Notes For Codex

When asked to update this message:

1. Clarify relative dates against the current Pacific date if needed. For example, "until Wednesday's game" means use the Wednesday game start time, `07:00` Pacific, unless the user says to keep it up through the end of the game.
2. Run `node scripts/set-weather-message.mjs "<message>" "<expiration>"`.
3. Confirm `weather-message.json` contains the requested text and a future `expiresAt`.
4. Run `node --check scripts/set-weather-message.mjs`.
5. If the user asks for it to be live, commit and push the change to the branch that GitHub Pages deploys from, currently `main`.
6. Do not change `index.html` for normal message updates.

## Holiday and Special Games

Add one-off games to `specialGames` in `index.html`, mapping the Pacific date (`YYYY-MM-DD`) to the holiday or occasion name. These dates join the regular schedule at the usual time and field. When a special game is next, the weather line reads `special Thanksgiving game!` (using that game's name), including during play. Use an empty name for `special game!`. Normal weather messaging resumes for the next regular game.
