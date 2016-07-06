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


# About Web Scraping

When you do web mining in html or across many sites it's called
[Web scraping](https://en.wikipedia.org/wiki/Web_scraping).

For nodeJs what I've found is this nice explanation
http://stackoverflow.com/questions/7977945/html-parser-on-node-js#answer-7978072

The code would be like
```
/**
 * JsDOM solution would use
 * 	var jQuery = require('jquery');
 * 	var jsdom = require('jsdom');
**/

/**
 * cheerio is a lean jQuery, somewhat faster
 * 	var cheerio = require('cheerio');
**/
```

I've tried the YQL solution (Yahoo! Query Language), it's a web service that
does *exacly* web scrapping across many sites at once. For YQL a example will
be:

```
select * from html where
url="http://finance.yahoo.com/q?s=yhoo" and
xpath='//div[@id="yfi_headlines"]/div[2]/ul/li/a'
```
And for YQL on node we would have:
```
var YQL = require("yql");
new YQL.exec('select * from data.html.cssselect where url="http://net.tutsplus.com/" and css=".post_title a"', function(response) {

    //response consists of JSON that you can parse

});
```
Examples Source: http://code.tutsplus.com/tutorials/web-scraping-with-node-js--net-25560

At the time my code looks like this:

```
var YQL = require('yql');

/**
 * Go to http://www.dotabuff.com/esports/teams/<team-id>/matches?page=<page-number>
 * find the following xPath
 * /html/body/div[1]/div[7]/div[3]/section[2]/article/table
 */
function httpGetTeamsMatches(teamId, pageNumber) {
	let url = `http://www.dotabuff.com/esports/teams/${teamId}/matches?page=${pageNumber}`;
	let query =
	`select *
	from data.html.cssselect
	where
		url="${url}" and
		css=".post_title a"
	`

	new YQL.exec(query, function(response) {
	    //response consists of JSON that you can parse
	});
}
```

BUT, testing at the [YQL console](https://developer.yahoo.com/yql/console/) and
found that  dotabuff will redirect to a robots.txt meaning it's forbidden for
web scarpers.

```
QUERY : select * from html where url="http://www.dotabuff.com/esports/teams/1838315/matches?page=2"

RESULT (partial) :
<diagnostics>
	   <publiclyCallable>true</publiclyCallable>
	   <url execution-start-time="16" execution-stop-time="29"
		   execution-time="13" id=""><![CDATA[http://www.dotabuff.com/robots.txt]]></url>
	   <url
		   error="Redirected to a robots.txt restricted URL: http://www.dotabuff.com/esports/teams/1838315/matches?page=2"
		   execution-start-time="1" execution-stop-time="30"
		   execution-time="29" http-status-code="403" http-status-message="Forbidden"><![CDATA[http://www.dotabuff.com/esports/teams/1838315/matches?page=2]]></url>
	   <user-time>30</user-time>
	   <service-time>42</service-time>
	   <build-version>0.2.998</build-version>
   </diagnostics>
```
