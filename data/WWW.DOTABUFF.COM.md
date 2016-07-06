<link rel="stylesheet" href="header-markdown-fixer.css" media="screen" title="no title" charset="utf-8">
# Teams

ROOT: `http://www.dotabuff.com/esports/teams`

## POPULAR TEAMS

- Team
	- Time since last match (Last Match 23 hours ago)
- Popularity
- Matches
- Win %
- KDA
- GPM
- XPM
- Duration (last match duration)

## MOST MATCHES (LAST 90 DAYS)

- Team
- Matches
- Win %

## HIGHEST WIN RATE (ALL TIME)

- Team
- Matches
- Win %

# Team

ROOT: `http://www.dotabuff.com/esports/teams/<team_id>`


# League

ROOT: `http://www.dotabuff.com/esports/leagues/<league-id>`

The International 2016 Premium League: http://www.dotabuff.com/esports/leagues/4664

## EVENT SPLITS

- Event Split
- Dates
- Regions
- Matches
- Length

## TEAM STANDINGS

- Team
- Record
- KDA
- GPM
- XPM

## RECENT MATCHES

- Won
- Lost
- Duration

## SUCCESSFUL PLAYERS

- Player
- Record
- KDA

## POPULAR HEROES

- Hero
- Pick %
- Win %

# Players

ROOT: `http://www.dotabuff.com/esports/players/<playerID>/`

Example [OG.N0tail OG Dota2](http://www.dotabuff.com/esports/players/19672354/)

## Query Strings

`?key=valule&key2=value2`:

- date or patch
	- `date=all`
	- `date=week`
	- `date=month`
	- `date=3month`
	- `date=6month`
	- `date=year`
	- `date=patch_6.87`
	- `date=patch_6.87c`
	- `date=patch_6.88`
- Hero
	- `hero=<hero-name>`
- Region
	- `region=us_west`
		- us_west
		- us_east
		- europe_west
		- south_korea
		- se_asia
		- chile
		- australia
		- russia
		- europe_east
		- south_america
		- south_africa
		- china
		- dubai
		- peru
		- india
- Duration
	- `duration=12-`
		- 12-
		- 20-
		- 30-
		- 40-
		- 50-
		- 60-
		- 0-20
		- 20-30
		- 30-40
		- 40-50
		- 50-60
- Faction
	- `faction=radiant`
	- `faction=dire`
- Player *vs* Team (Matches for team A with player A1 against team B)
	- `team_id=1838315`
- League
	- `league_id=4554`

## Data

## Panel "MOST PLAYED HEROES"

- Hero
- Matches
- Win %
- KDA
- LH
- DN
- GPM
- XPM

More link `http://www.dotabuff.com/esports/players/<player-id>/heroes`

## Panel "SUMMARY"

- Time Period
- Matches
- Win %
- KDA

## Panel "RECENT MATCHES"

- Result
- Team
- Duration
- KDA
- Items

More Link `http://www.dotabuff.com/esports/players/<player-id>/matches`

### Matches

http://www.dotabuff.com/esports/teams/1838315/matches?page=200

If page is too big, the list returns, but empty.

## Panel "RECENT LEAGUES"

- League
- Record
	- X (wins, green) - Y (losses, red)

Does URL query.
