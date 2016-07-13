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
class RealMatch {
    constructor(league, match, timestamp, teams) {
        this.league = league;
        this.match = match;
        this.timestamp = timestamp;
        if (teams.length > 2) {
            throw new Error("Too many teams in a match");
        }
        this.teams = teams;
    }
}
function matchesPerTeamPage(teamMatchesHtmlString) {
    let matches = new Array();
    let $ = cheerio.load(teamMatchesHtmlString);
    let $matchTRs = $('table.table.table-striped.recent-esports-matches tbody tr');
    $matchTRs.each((index, matchTR) => {
        let league = $(matchTR).find("a[href*='esports/leagues']").attr("href");
        let match = $(matchTR).find("a[href*='matches']");
        let matchURI = match.attr("href");
        let teamAresult = match.attr("class");
        let teamB = $(matchTR).find("td:nth-child(5) > a.esports-link").attr("href");
        let timestamp = $(matchTR).find("time").attr("datetime");
        let teamA = matches.push(new RealMatch(league, match, timestamp));
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
            console.log(`using wget, watch network usage for ${curlPage}`);
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
            matches = matches.concat(matchesPerTeamPage(result));
            pagesDone++;
            let pages = getNumberOfPages(result);
            for (page = 2; page <= pages; page++) {
                let innerCmdExecutor;
                innerCmdExecutor = executeCurlMatchesPerTeamCMD(teamId, page);
                innerCmdExecutor.then((result) => {
                    matches = matches.concat(matchesPerTeamPage(result));
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
    if (debug) {
        console.log(`got ${matches.length + 1} matches. They look as foolows`);
        console.log(matches[0]);
    }
}
let matches1838315 = matchesPerTeam(1838315);
let builder = new xml2js.Builder();
let xml = builder.buildObject(obj);
