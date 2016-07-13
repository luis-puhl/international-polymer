teamId=$1
page=$2
cacheFile=$3

curl "http://www.dotabuff.com/esports/teams/${teamId}/matches?page=${page}" \
-H "Host: www.dotabuff.com" \
-H "User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64; rv:49.0) Gecko/20100101 Firefox/49.0" \
-H "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" \
-H "Accept-Language: en-US,en;q=0.5" \
--compressed \
-H "Cookie: _tz=America"%"2FSao_Paulo; _ga=GA1.2.1101389915.1468258865; _gat=1; __qca=P0-1237342249-1468258865314" \
-H "Connection: keep-alive" \
-H "Upgrade-Insecure-Requests: 1" \
-H "Cache-Control: max-age=0" \
 > ${cacheFile} && cat ${cacheFile}`
