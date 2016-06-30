var git = require('nodegit');
var fs = require('fs');

//
var commitCounts = {};
var firstDay;
var lastDay;

//
git.Repository.open('C:\\wamp\\www\\pajamasql')
    .then(function(repo) {
        return repo.getMasterCommit();
    })
    .then(function(firstCommitOnMaster) {
        var history = firstCommitOnMaster.history();
        var count = 0;

        //
        history.on('commit', function(commit) {
            ++count;
            var d = new Date(commit.date());
            var iy = getYyyyMmDd(d);

            if(commitCounts[iy]) {
                commitCounts[iy]++;
            }
            else {
                commitCounts[iy] = 1;
            }

            //
            if(!firstDay || (d < firstDay)) {
                firstDay = d;
            }

            if(!lastDay || (d > lastDay)) {
                lastDay = d;
            }
        });

        //
        history.on('end', function(commits) {
            var currentDayToDraw = firstDay;
            currentDayToDraw.setDate(currentDayToDraw.getDate() - 3);

            var lastDayToDraw = lastDay;
            lastDayToDraw.setDate(lastDayToDraw.getDate() + 3);

            var sqHtml = '<div class="sqs">';
            var divOpen = false;

            //
            while(currentDayToDraw <= lastDayToDraw) {
                if(!divOpen) {
                    sqHtml += '<div>';
                    divOpen = true;
                }

                var iy = getYyyyMmDd(currentDayToDraw);
                var numCommits = commitCounts[iy] ? commitCounts[iy] : 0;

                sqHtml += '<div>' + numCommits + '</div>';

                if(currentDayToDraw.getUTCDay() == 6) {
                    sqHtml += '</div>';
                    divOpen = false;
                }

                //
                currentDayToDraw.setDate(currentDayToDraw.getDate() + 1);
            }

            //
            if(divOpen) {
                sqHtml += '</div>';
            }

            sqHtml += '</div>';

            //
            var css = `<style>
                .sqs {
                    position: relative;
                }

                .sqs > div {
                    display: inline-block;
                }

                .sqs > div:last-child {
                    position: absolute;
                    top: 0;
                }

                .sqs > div > div {
                    width: 20px;
                    height: 20px;
                    margin: 0 0 3px 3px;
                    background: #cccccc;
                }
                </style>`;

            //
            fs.writeFile(
                'index.html',
                `<!doctype html>
                    <html>
                        <head>${css}</head>
                        <body># commits: ${count} ${sqHtml}</body>
                    </html>`);
        });

        //
        history.start();
    });

//
function getYyyyMmDd(theDate) {
    return theDate.getUTCFullYear() + '-' +
        ('0' + (theDate.getUTCMonth() + 1)).slice(-2) + '-'  +
        ('0' + theDate.getUTCDate()).slice(-2);
}
