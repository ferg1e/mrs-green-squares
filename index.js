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
    return theDate.getFullYear() + '-' +
        ('0' + (theDate.getMonth() + 1)).slice(-2) + '-'  +
        ('0' + theDate.getDate()).slice(-2);
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
                    var author = commit.author();
                    var isCountCommit = !config.authors ||
                        config.authors.indexOf(author.email()) != -1;

                    if(isCountCommit) {
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

            if(currentDayToDraw.getDay() == 6) {

                //
                if(weeksDays.indexOf(8) != -1) {
                    var monthLabel = (weeksDays.length == 7)
                        ? '<label class="month">' +
                            monthLabels[currentDayToDraw.getMonth()] +
                            '</label>'

                        : '';

                    //
                    var yearLabel = (currentDayToDraw.getMonth() == 6)
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

        sqHtml += '<span id="bookend"></span>';
        sqHtml += '</div>';

        //
        var css = `<style>
            body {
                margin-left: 120px;
                margin-top: 240px;
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

            .sqs > div:last-of-type {
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
                display: inline-block;
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
                    ${sqHtml}
                </body>
            </html>`);
    }
}
