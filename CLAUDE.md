# Jack-it-UP! — CLAUDE.md Project Briefing

## What This Is
**Jack-it-UP!** is a gamified student-success platform for Stephen F. Austin State University (SFA).
It is a React 18 single-page app living in `jack-it-up/` inside this repo.

## Stack
- React 18 (Create React App)
- Pure inline CSS — no Tailwind, no styled-components, no CSS modules
- Google Apps Script (GAS) backend for parent notifications and data persistence
- WebAuthn (biometric) + PIN fallback authentication — no third-party auth library

## File Structure
```
jack-it-up/
├── public/
└── src/
    ├── App.jsx              ← Main app (constants, all tabs, root component)
    ├── ShaniquaChat.jsx     ← AI mentor chat tab (copy separately)
    ├── index.js
    └── assets/
        ├── shaniqua.png     ← Copy from IMG_5591.png
        └── hero.png         ← Copy from IMG_5589.png
```

## Key Constants (App.jsx)
| Name | Purpose |
|------|---------|
| `GAS_URL` | Deployed Google Apps Script Web App URL — replace before production |
| `C` | SFA brand color palette (purple, gold, ink, etc.) |
| `PP` | Purple Promise scholarship rules (minGPA, minCredits, etc.) |
| `XP_TABLE` | XP values per activity |
| `ALL_BADGES` | Badge definitions with `notifyParent` flag |

## SFA Brand Colors
- Purple: `#4B1869` / Dark: `#2D0E40` / Gold: `#C8A951`

## Features by Tab
| Tab | Key Feature |
|-----|-------------|
| Dashboard | Hero banner, XP system, badge wall, dorm hacks, study science |
| Shaniqua | AI mentor chat (ShaniquaChat.jsx) |
| Scholarship | Purple Promise GPA simulator, pre-reg professor picker |
| Fitness | 5-day Grit & Grace workout protocol |
| Social | Club finder with buffer-first scheduling logic |

## Auth Flow
1. WebAuthn biometric (FaceID/TouchID) — preferred
2. 4-digit PIN fallback
3. Demo mode (no account required)

All credentials stored in `localStorage` only. Biometric data never leaves the device.

## GAS Backend Actions
- `upsertStudent` — called on login
- `notifyParent` — called when badge with `notifyParent: true` is earned
- `logSafeRide` — called when Safe Ride is activated

## Development Notes
- Fonts loaded from Google Fonts: `Playfair Display` (headings) + `DM Sans` (body)
- The `…` spread operator in the original source must be `...` (three ASCII dots) in JSX
- 3-hour ping interval (`setInterval` 10,800,000 ms) is proactive in production; shorten to test
- `athlete` mode toggles NCAA compliance overlays across all tabs
- Safe Ride banner calls UPD: **(936) 468-2608**

## Branch
Develop on: `claude/create-react-app-ZXpZj`

## Setup Steps
1. `cd jack-it-up && npm install`
2. Copy `IMG_5591.png` → `src/assets/shaniqua.png`
3. Copy `IMG_5589.png` → `src/assets/hero.png`
4. Deploy `GoogleAppsScript_Backend.gs` and paste URL into `GAS_URL` constant
5. `npm start`
