if (require == null){
	var require = function require(parameter):any  {
		return new Object();
	};
}

const http = require('http');
const child_process = require('child_process');
const fs = require("fs");
// const $ = require('jQuery');
const cheerio = require('cheerio');

const debug = true;

class URI {
	uri : string;
	constructor(uri :string){
		this.uri = uri;
	}
}

class Match {
	league : URI;
	match : URI;
	timestamp : Date;
	constructor (league:URI, match:URI, timestamp:Date) {
		this.league  = league;
		this.match  = match;
		this.timestamp  = timestamp;
	}
}

function matchesPerTeamPage(teamMatchesHtmlString : string) :Array<Match> {
	let matches = new Array<Match>();
	let $ = cheerio.load(teamMatchesHtmlString);

	let $matchTRs = $('table.table.table-striped.recent-esports-matches tbody tr');
	$matchTRs.each( (index, element) => {
		let league = $(element).find("a[href*='esports/leagues']").attr("href");
		let match = $(element).find("a[href*='matches']").attr("href");
		let timestamp = $(element).find("time").attr("datetime");
		matches.push(new Match(league, match, timestamp));
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
		let curlPage :string = `curl "http://www.dotabuff.com/esports/teams/${teamId}/matches?page=${page}" `;
		let curlBody =
			'-H "Host: www.dotabuff.com" ' +
			'-H "User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64; rv:49.0) Gecko/20100101 Firefox/49.0" ' +
			'-H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" ' +
			'-H "Accept-Language: en-US,en;q=0.5" ' +
			'--compressed ' +
			'-H "Cookie: _tz=America"%"2FSao_Paulo; _ga=GA1.2.1101389915.1468258865; _gat=1; __qca=P0-1237342249-1468258865314" ' +
			'-H "Connection: keep-alive" ' +
			'-H "Upgrade-Insecure-Requests: 1" ' +
			'-H "Cache-Control: max-age=0"';
		let cache :string = ` > ${cacheFile} && cat ${cacheFile}`;
		cmd = curlPage + curlBody + cache;
		if (debug){
			console.log(`using wget, watch network usage for ${curlPage}`);
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
			matches = matches.concat(matchesPerTeamPage(result));
			pagesDone++;

			// extracts data from the 2-nd page until the N-th page
			let pages = getNumberOfPages(result);
			for (page = 2; page <= pages; page++) {
				let innerCmdExecutor :Promise<string>;
				innerCmdExecutor = executeCurlMatchesPerTeamCMD(teamId, page);
				innerCmdExecutor.then( (result) => {
					// extracts data from the page K
					matches = matches.concat(matchesPerTeamPage(result));
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
	if (debug){
		console.log(`got ${matches.length +1} matches. They look as foolows`);
		console.log(matches[0]);
	}
}


matchesPerTeam(1838315);
