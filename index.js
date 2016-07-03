var git = require('nodegit');
var fs = require('fs');
var config = require('./my-settings');

//const
var monthLabels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

//
var commitCounts = {};
var firstDay;
var lastDay;
var repoI = -1;
var count = 0;
var max = 0;
var weeksDays;
var weeksHtml;

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
                    if(commitCounts[iy] > max) {
                        max = commitCounts[iy];
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

                //
                weeksDays = [];
                weeksHtml = '';
            }

            //
            weeksDays.push(currentDayToDraw.getDate());

            var iy = getYyyyMmDd(currentDayToDraw);
            var numCommits = commitCounts[iy] ? commitCounts[iy] : 0;
            var percent = numCommits/max;
            var cssClass = 'c0';

            //
            if(percent > 0 && percent <= .25) {
                cssClass = 'c1';
            }
            else if(percent > .25 && percent <= .5) {
                cssClass = 'c2';
            }
            else if(percent > .5 && percent <= .75) {
                cssClass = 'c3';
            }
            else if(percent > .75 && percent <= 1) {
                cssClass = 'c4';
            }

            //
            weeksHtml += '<div class="' + cssClass + '"></div>';

            if(currentDayToDraw.getUTCDay() == 6) {

                //
                if(weeksDays.indexOf(1) != -1) {
                    var monthLabel = '<label class="month">' +
                        monthLabels[currentDayToDraw.getUTCMonth()] +
                        '</label>';

                    //
                    var yearLabel = (currentDayToDraw.getUTCMonth() == 6)
                        ? '<label class="year">' + currentDayToDraw.getFullYear() + '</label>'
                        : '';

                    weeksHtml = yearLabel + monthLabel + weeksHtml;
                }

                sqHtml += weeksHtml + '</div>';
                divOpen = false;
            }

            //
            currentDayToDraw.setDate(currentDayToDraw.getDate() + 1);
        }

        //
        if(divOpen) {
            sqHtml += weeksHtml + '</div>';
        }

        sqHtml += '<div id="bookend"></div>';
        sqHtml += '</div>';

        //
        var css = `<style>
            body {
                margin-left: 120px;
                margin-top: 120px;
            }

            .sqs {
                position: relative;
                white-space: nowrap;
                margin-top: 52px;
            }

            .sqs > div {
                display: inline-block;
                position: relative;
            }

            .sqs > div:last-child {
                position: absolute;
                top: 0;
            }

            .sqs > div > label.month {
                font-size: 12px;
                color: #acacac;
                position: absolute;
                top: -15px;
                margin-left: 1px;
            }

            .sqs > div > label.year {
                font-size: 16px;
                color: #777777;
                position: absolute;
                top: -42px;
                left: -50%;
            }

            .sqs > div > div {
                width: 10px;
                height: 10px;
                margin: 0 0 1px 1px;
            }

            #bookend {
                width: 120px;
                height: 10px;
            }

            .c0 {
                background: #EEEEEE;
            }

            .c1 {
                background: #D6E685;
            }

            .c2 {
                background: #8CC665;
            }

            .c3 {
                background: #44A340;
            }

            .c4 {
                background: #1E6823;
            }
            </style>`;

        //
        fs.writeFile(
            'index.html',
            `<!doctype html>
            <html>
                <head>${css}</head>
                <body>
                    # commits: ${count}<br>
                    max: ${max}
                    ${sqHtml}
                </body>
            </html>`);
    }
}
