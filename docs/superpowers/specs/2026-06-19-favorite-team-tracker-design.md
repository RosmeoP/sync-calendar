# Favorite Team Tracker Design Specification

## Overview
This feature replaces the redundant "Next Match" / "Live Now" card in the top-right desktop panel with an interactive **Favorite Team Tracker**. Users can select their favorite team, which is persisted locally, and view their team's standing, last match results, next match details, and download a custom calendar containing only their favorite team's matches.

---

## 1. Architecture & State Management
We will introduce a new global state variable in [app.js](file:///Users/mauricioparada/desktop/sync-calendar/app.js) to manage the favorite team:
* `favoriteTeamId`: Stores the ID of the selected favorite team (retrieved from/saved to `localStorage` key `fav_team_id`).

### Key Functions
* `initFavoriteTeam()`: Initialized during bootstrap. Loads from `localStorage`, compiles a list of unique teams from `allMatches`, and renders the widget.
* `renderFavoriteTeamWidget()`: Displays either the team selector dropdown (if no favorite team is set) or the team's dashboard.
* `selectFavoriteTeam(teamId)`: Sets the favorite team, saves it to `localStorage`, and triggers a re-render of the widget.
* `clearFavoriteTeam()`: Clears the selected team, removes it from `localStorage`, and returns to the selector state.
* `downloadFavoriteTeamCalendar()`: Generates and downloads an `.ics` file containing only matches involving the favorite team.

---

## 2. Components & User Interface (UI)

### DOM Structure
We will modify the HTML inside `#hero-desktop` in [index.html](file:///Users/mauricioparada/desktop/sync-calendar/index.html) to render this dynamic widget.

### Widget States
1. **Selector State (No Team Picked)**:
   * A clean container with a title: "Favorite Team Tracker".
   * A dropdown `<select id="fav-team-select">` listing all unique teams sorted alphabetically.
   * A placeholder text: "Select a team to track their standings, matches, and get custom calendar downloads."

2. **Dashboard State (Team Picked)**:
   * **Header**: Pinned team name and crest, alongside a small "change" icon/button to switch teams.
   * **Standings Summary**:
     * A grid containing Group Name, Rank (e.g. `#1`), Points, and Record (W-D-L).
   * **Previous Match Card**:
     * Opponent name, crest, and full-time score (if played).
   * **Next Match Card**:
     * Opponent name, crest, scheduled date, time, and venue.
   * **Calendar Subscription Action**:
     * A premium styled button: `📅 Sync Team Calendar` to download the team-specific `.ics` file.

---

## 3. Data Flow
1. **Bootstrap**:
   * API returns `allMatches` and `allStandings`.
   * `initFavoriteTeam()` extracts all unique team IDs and names from `allMatches` and sorts them alphabetically to populate the dropdown.
   * If `localStorage.getItem('fav_team_id')` is found, sets `favoriteTeamId` and renders the Dashboard State. Otherwise, renders the Selector State.
2. **Team Selection**:
   * User picks a team from the dropdown.
   * `selectFavoriteTeam(teamId)` sets state, saves to local storage, and renders the Dashboard State.
3. **Standings Lookup**:
   * Look up the team's ID in `allStandings`.
   * Find the standing record containing the team and extract `position`, `points`, `won`, `draw`, `lost`, and the group name.
4. **Matches Lookup**:
   * Filter `allMatches` for matches where `homeTeam.id === favoriteTeamId` or `awayTeam.id === favoriteTeamId`.
   * Sort by `utcDate`.
   * Find the **Next Match**: The first match in the sorted list where status is upcoming/live.
   * Find the **Previous Match**: The last match in the sorted list where status is finished.

---

## 4. Error Handling
* **Missing Crests/Standings**: If a team has no crest, render a standard initials-based crest placeholder. If standings data is not loaded yet (e.g., API rate-limited), display a graceful "Standings unavailable" badge.
* **No Matches Scheduled**: If a team has no next match scheduled (e.g. eliminated), display a friendly "No upcoming matches scheduled".
* **Rate Limits/API Failure**: If the matches list is empty due to a bootstrap error, hide the widget container or show a retry placeholder.

---

## 5. Testing Strategy
* **Manual UI Test**:
  * Verify the select dropdown populates alphabetically.
  * Select a team and verify standings (Rank, Points, Group) match the main "Group Standings" table.
  * Verify the "Previous Match" and "Next Match" card detail rendering.
  * Click `📅 Sync Team Calendar` and inspect the `.ics` content to ensure it contains only the selected team's matches.
  * Click the edit icon, verify it returns to the selection dropdown, and check that `localStorage` is cleared.
