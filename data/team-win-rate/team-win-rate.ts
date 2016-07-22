if (require == null){
	var require = function require(parameter):any  {
		return new Object();
	};
}

const http = require('http');
const child_process = require('child_process');
const fs = require("fs");
const xml2js = require('xml2js');
const cheerio = require('cheerio');

const debug = true;

interface URI {
	id :string;
	uri :string;
	url :string;
}

class RealURI implements URI {
	id :string;
	uri :string;
	url :string;
	constructor (source :string){
		let sourceSplit :string[] = source.split('/');
		if (sourceSplit.length > 1){
			this.id = sourceSplit[sourceSplit.length-1];
			delete sourceSplit[sourceSplit.length-1];
			this.url = sourceSplit.join("/");
		}
		this.uri = source;
	}
	toJSON() :Object {
		return {"id": this.id, "uri": this.uri, "url": this.url};
	}
}

interface Match {
	league :URI;
	match :URI;
	timestamp :Date;
	teamIds :number[];
}

class RealMatch implements Match{
	league :URI;
	match :URI;
	timestamp :Date;
	teamIds :number[];
	constructor (league :URI, match :URI, timestamp :Date, teamIds :number[]) {
		this.league  = league;
		this.match  = match;
		this.timestamp  = timestamp;
		if (teamIds.length > 2){
			throw new Error("Too many teams in a match");
		}
		this.teamIds = [];
		this.teamIds = this.teamIds.concat(teamIds);
	};

	toJSON() :Object {
		return {
			"league": this.league.id,
			"match": this.match.id,
			"timestamp": this.timestamp,
			"teamIds": this.teamIds
		};
	}
}

function matchesPerTeamPage(teamMatchesHtmlString :string, teamId :number) :Match[] {
	let matches = new Array<Match>();
	let $ = cheerio.load(teamMatchesHtmlString);

	/*
	body > div.container-outer > div.container-inner > div.content-inner > section:nth-child(2) > article > table > tbody > tr
	*/
	let $matchTRs = $('table.table.table-striped.recent-esports-matches tbody tr');
	$matchTRs.each( (index, matchTR) => {
		let url = `http://www.dotabuff.com/esports/teams/${teamId}/matches/`;
		let league :URI = new RealURI($(matchTR).find("a[href*='esports/leagues']").attr("href"));
		let match = $(matchTR).find("a[href*='matches']");
		let matchURI :URI = new RealURI(match.attr("href"));
		let teamAresult = match.attr("class"); // class 'lost' and 'won'
		let teamB =  $(matchTR).find("td:nth-child(5) > a.esports-link").attr("href");
		let timestamp = $(matchTR).find("time").attr("datetime");
		let teamA = teamId;
		matches.push(new RealMatch(league, match, timestamp, [teamA, teamB]));
	});
	return matches;
}

function getNumberOfPages(teamMatchesHtmlString :string) :number {
	let $ = cheerio.load(teamMatchesHtmlString);
	let lastLink = $('body > div.container-outer > div.container-inner > div.content-inner > section:nth-child(2) > article > nav > span.last > a');
	let regex = /\/esports\/teams\/[0-9]+\/matches\?page=([0-9]+)/ig;
	let lastPage :number = Number.parseInt(regex.exec(lastLink.attr("href"))[1]);
	return lastPage;
}

function buildCurlMatchesPerTeamCMD(teamId :number, page :number) :string {
	let cacheFile :string = `tmp/team.${teamId}.d--matches.page_${page}.html`;
	let cmd :string = "";
	let hasCahce :boolean = false;
	try {
		hasCahce = fs.statSync(cacheFile).isFile();
		if (hasCahce == true) {
			cmd = `cat ${cacheFile}`;
			if (debug){
				console.log(`skiping wget, using file cache ${cacheFile}`);
			}
		}
	} catch (e) {
		cmd = `./get-team-match-list.sh ${teamId} ${page} ${cacheFile}`;
		if (debug){
			console.log(`using wget, watch network usage for ${cacheFile}`);
		}
	}

	return cmd;
}

function executeCurlMatchesPerTeamCMD(teamId :number, page :number) :Promise<string> {
	return new Promise<string>( (resolve, reject) => {
		let cmd = buildCurlMatchesPerTeamCMD(teamId, page);
		child_process.exec(cmd, (error, stdout, stderr) => {
			if (error) {
				if (debug){
					console.error(`exec error: ${error}`);
				}
				reject(error);
			}
			let result :string = stdout.toString();
			resolve(result);
		});
	});
}

function matchesPerTeam(teamId : number) :Promise<Array<Match>>{
	return new Promise<Array<Match>>( (resolveMatchesPerTeam, rejectMatchesPerTeam) => {
		let matches :Array<Match> = new Array<Match>();
		let page :number = 1;
		let pagesDone = 0;

		let cmdExecutor :Promise<string>;
		cmdExecutor = executeCurlMatchesPerTeamCMD(teamId, page);
		cmdExecutor.then( (result) => {
			// extracts data from the 1-st page
			matches = matches.concat(matchesPerTeamPage(result, teamId));
			pagesDone++;

			// extracts data from the 2-nd page until the N-th page
			let pages = getNumberOfPages(result);
			for (page = 2; page <= pages; page++) {
				let innerCmdExecutor :Promise<string>;
				innerCmdExecutor = executeCurlMatchesPerTeamCMD(teamId, page);
				innerCmdExecutor.then( (result) => {
					// extracts data from the page K
					matches = matches.concat(matchesPerTeamPage(result, teamId));
					pagesDone++;
					if (pagesDone == pages){
						rendevous(matches);
						resolveMatchesPerTeam(matches);
					}
				});
				innerCmdExecutor.catch( (error) => {
					if (debug){
						console.error("Didn't resolve innerCmdExecutor");
					}
					rejectMatchesPerTeam(error);
				});
			}
		});
		cmdExecutor.catch( (error) => {
			if (debug){
				console.error("Didn't resolve cmdExecutor");
			}
			rejectMatchesPerTeam(error);
		});
	});
}

function rendevous(matches :Array<Match>) {
	console.log("rendevous");
	if (debug){
		let matchString :string = JSON.stringify(matches[0], null, '\t');
		console.log(`got ${matches.length +1} matches. They look as foolows\n${matchString}`);
	}
	console.log("rendevous");
}

let matches1838315 = matchesPerTeam(1838315);
