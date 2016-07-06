var http = require('http');

/** trying YQL web query */

/**
 * find the following xPath
 * /html/body/div[1]/div[7]/div[3]/section[2]/article/table
 */
function mapHtmlMatches(html) {
	parseString(html, function (err, result) {

	});
	return new Promise(function(resolve, reject) {

	});
}

function agregateTeamsMatches(res) {

}

/**
 * http://www.dotabuff.com/esports/teams/<team-id>/matches?page=<page-number>
 */
function httpGetTeamsMatches(teamId, pageNumber) {
	http.get(
		'http://www.dotabuff.com/esports/teams/' + teamId + '/matches?page=' + pageNumber,
		(res) => {
			agregateTeamsMatches(res);
		}
	).on('error', (e) => {
		console.log(`Got error: ${e.message}`);
	});
}
