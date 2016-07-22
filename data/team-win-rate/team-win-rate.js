if (require == null) {
    var require = function require(parameter) {
        return new Object();
    };
}
const http = require('http');
const child_process = require('child_process');
const fs = require("fs");
const xml2js = require('xml2js');
const cheerio = require('cheerio');
const debug = true;
class RealURI {
    constructor(source) {
        let sourceSplit = source.split('/');
        if (sourceSplit.length > 1) {
            this.id = sourceSplit[sourceSplit.length - 1];
            delete sourceSplit[sourceSplit.length - 1];
            this.url = sourceSplit.join("/");
        }
        this.uri = source;
    }
    toJSON() {
        return { "id": this.id, "uri": this.uri, "url": this.url };
    }
}
class RealMatch {
    constructor(league, match, timestamp, teamIds) {
        this.league = league;
        this.match = match;
        this.timestamp = timestamp;
        if (teamIds.length > 2) {
            throw new Error("Too many teams in a match");
        }
        this.teamIds = [];
        this.teamIds = this.teamIds.concat(teamIds);
    }
    ;
    toJSON() {
        return {
            "league": this.league.id,
            "match": this.match.id,
            "timestamp": this.timestamp,
            "teamIds": this.teamIds
        };
    }
}
function matchesPerTeamPage(teamMatchesHtmlString, teamId) {
    let matches = new Array();
    let $ = cheerio.load(teamMatchesHtmlString);
    let $matchTRs = $('table.table.table-striped.recent-esports-matches tbody tr');
    $matchTRs.each((index, matchTR) => {
        let url = `http://www.dotabuff.com/esports/teams/${teamId}/matches/`;
        let league = new RealURI($(matchTR).find("a[href*='esports/leagues']").attr("href"));
        let match = $(matchTR).find("a[href*='matches']");
        let matchURI = new RealURI(match.attr("href"));
        let teamAresult = match.attr("class");
        let teamB = $(matchTR).find("td:nth-child(5) > a.esports-link").attr("href");
        let timestamp = $(matchTR).find("time").attr("datetime");
        let teamA = teamId;
        matches.push(new RealMatch(league, match, timestamp, [teamA, teamB]));
    });
    return matches;
}
function getNumberOfPages(teamMatchesHtmlString) {
    let $ = cheerio.load(teamMatchesHtmlString);
    let lastLink = $('body > div.container-outer > div.container-inner > div.content-inner > section:nth-child(2) > article > nav > span.last > a');
    let regex = /\/esports\/teams\/[0-9]+\/matches\?page=([0-9]+)/ig;
    let lastPage = Number.parseInt(regex.exec(lastLink.attr("href"))[1]);
    return lastPage;
}
function buildCurlMatchesPerTeamCMD(teamId, page) {
    let cacheFile = `tmp/team.${teamId}.d--matches.page_${page}.html`;
    let cmd = "";
    let hasCahce = false;
    try {
        hasCahce = fs.statSync(cacheFile).isFile();
        if (hasCahce == true) {
            cmd = `cat ${cacheFile}`;
            if (debug) {
                console.log(`skiping wget, using file cache ${cacheFile}`);
            }
        }
    }
    catch (e) {
        cmd = `./get-team-match-list.sh ${teamId} ${page} ${cacheFile}`;
        if (debug) {
            console.log(`using wget, watch network usage for ${cacheFile}`);
        }
    }
    return cmd;
}
function executeCurlMatchesPerTeamCMD(teamId, page) {
    return new Promise((resolve, reject) => {
        let cmd = buildCurlMatchesPerTeamCMD(teamId, page);
        child_process.exec(cmd, (error, stdout, stderr) => {
            if (error) {
                if (debug) {
                    console.error(`exec error: ${error}`);
                }
                reject(error);
            }
            let result = stdout.toString();
            resolve(result);
        });
    });
}
function matchesPerTeam(teamId) {
    return new Promise((resolveMatchesPerTeam, rejectMatchesPerTeam) => {
        let matches = new Array();
        let page = 1;
        let pagesDone = 0;
        let cmdExecutor;
        cmdExecutor = executeCurlMatchesPerTeamCMD(teamId, page);
        cmdExecutor.then((result) => {
            matches = matches.concat(matchesPerTeamPage(result, teamId));
            pagesDone++;
            let pages = getNumberOfPages(result);
            for (page = 2; page <= pages; page++) {
                let innerCmdExecutor;
                innerCmdExecutor = executeCurlMatchesPerTeamCMD(teamId, page);
                innerCmdExecutor.then((result) => {
                    matches = matches.concat(matchesPerTeamPage(result, teamId));
                    pagesDone++;
                    if (pagesDone == pages) {
                        rendevous(matches);
                        resolveMatchesPerTeam(matches);
                    }
                });
                innerCmdExecutor.catch((error) => {
                    if (debug) {
                        console.error("Didn't resolve innerCmdExecutor");
                    }
                    rejectMatchesPerTeam(error);
                });
            }
        });
        cmdExecutor.catch((error) => {
            if (debug) {
                console.error("Didn't resolve cmdExecutor");
            }
            rejectMatchesPerTeam(error);
        });
    });
}
function rendevous(matches) {
    console.log("rendevous");
    if (debug) {
        let matchString = JSON.stringify(matches[0], null, '\t');
        console.log(`got ${matches.length + 1} matches. They look as foolows\n${matchString}`);
    }
    console.log("rendevous");
}
let matches1838315 = matchesPerTeam(1838315);
