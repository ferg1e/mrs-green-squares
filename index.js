var git = require('nodegit');
var fs = require('fs');
var config = require('./my-settings');

//
var commitCounts = {};
var firstDay;
var lastDay;
var repoI = -1;
var count = 0;

//
openNextRepo();

//
function getYyyyMmDd(theDate) {
    return theDate.getUTCFullYear() + '-' +
        ('0' + (theDate.getUTCMonth() + 1)).slice(-2) + '-'  +
        ('0' + theDate.getUTCDate()).slice(-2);
}

//
function openNextRepo() {
    ++repoI;

    if(repoI < config.repos.length) {
        var repoPath = config.repos[repoI];

        git.Repository.open(repoPath)
            .then(function(repo) {
                return repo.getMasterCommit();
            })
            .then(function(firstCommitOnMaster) {
                var history = firstCommitOnMaster.history();

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
                    openNextRepo();
                });

                //
                history.start();
            });
    }

    //all repos done
    else {
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
                white-space: nowrap;
            }

            .sqs > div {
                display: inline-block;
            }

            .sqs > div:last-child {
                position: absolute;
                top: 0;
            }

            .sqs > div > div {
                width: 18px;
                height: 18px;
                margin: 0 0 2px 2px;
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
    }
}
