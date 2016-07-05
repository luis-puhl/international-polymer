<link rel="stylesheet" href="header-markdown-fixer.css" media="screen" title="no title" charset="utf-8">

# HOME

## Components

### Teams List
Static content containing Team-Small-Logo, Team-Name and Team-Link.

# TEAMS

## Components

### Team Logo
Static. Team-Big-Logo, Team-Name.

### Desc. Time
Static. ??

### Win Rate by Patch
Dynamic. Graph or number indicator.

- Start on `http://www.dotabuff.com/esports/teams/<team-id>/matches?page=<page-number>`;
- Go to Matches `http://www.dotabuff.com/matches/<match-id>`;
- Identify Patch, filter out patch, count victories and losses;
- Identify dates, list of match-ids, number of matches analyzed;

Data-source Structure:
```
<match id="">
	<timestamp>timestamp</timestamp>
	<patch id="" />
	<teams>
		<team id="" />
		<team id="" />
	</teams>
	<winner team-id="" />
</match>
```

Data-result Structure:
```
<win-rate team-id="">
	<team id="" />
	<last-match-timestamp>timestamp</last-match-timestamp>
	<patch id="" />
	<matches quantity="">
		<match id="" />
		<match id="" />
		...
	</matches>
	<wins>quantity</wins>
	<losses>quantity</losses>
</win-rate>
```


### Match Length Avg.
Dynamic. Clock pie chart with minutes display.

### Pick Frequency
Dynamic. The 3 most picked heroes.

### Rival
Static. Team-Small-Logo, Team-Name and win-rate.

### Matches
Dynamic. List of links to external sources (dotabuff).

### Championship Highlights
Static.

### Side
Dynamic. Percentage horizontal bar, left-to-right, solid color. Between *Dire* and *Radiant*.

### Players

#### GPM
Dynamic. Number with a coin indicator

#### KDA
Dynamic. Three slash-separated numbers representing Kills, Deaths and Assists.

# PLAYERS

# HEROES
