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
var allColors = [];

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
        var repoPath = config.repos[repoI].dir
            ? config.repos[repoI].dir
            : config.repos[repoI];

        var colors = config.repos[repoI].colors
            ? config.repos[repoI].colors
            : ['eeeeee', 'D6E685', '8CC665', '44A340', '1E6823'];

        colors = colors.join();

        //
        var colorI = allColors.indexOf(colors);

        if(colorI == -1) {
            allColors.push(colors);
            colorI = allColors.indexOf(colors);
        }

        //
        var colorIndexStr = colorI.toString();

        //
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

                        if(!commitCounts[iy]) {
                            commitCounts[iy] = {};
                            commitCounts[iy]['total'] = 1;
                        }
                        else {
                            ++commitCounts[iy]['total'];
                        }

                        if(!commitCounts[iy][colorIndexStr]) {
                            commitCounts[iy][colorIndexStr] = 1;
                        }
                        else {
                            ++commitCounts[iy][colorIndexStr];
                        }

                        //
                        if(commitCounts[iy]['total'] > max) {
                            max = commitCounts[iy]['total'];
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
            var numCommits = commitCounts[iy]
                ? commitCounts[iy]['total']
                : 0;

            var percent = numCommits/max;
            var colorMax = 0;
            var colorI = 0;

            if(commitCounts[iy]) {

                //get the biggest color count
                for(var i in commitCounts[iy]) {
                    if(i != 'total') {
                        if(commitCounts[iy][i] > colorMax) {
                            colorMax = commitCounts[iy][i];
                        }
                    }
                }

                //select the color with the max count
                //that has the lowest id
                colorI = 999999;

                for(var i in commitCounts[iy]) {
                    if(i != 'total') {
                        var intI = parseInt(i);

                        if(commitCounts[iy][i] == colorMax && intI < colorI) {
                            colorI = intI;
                        }
                    }
                }
            }

            //
            var cssClass = 'c' + colorI.toString();

            //
            if(percent <= 0) {
                cssClass += '-0';
            }
            if(percent > 0 && percent <= .25) {
                cssClass += '-1';
            }
            else if(percent > .25 && percent <= .5) {
                cssClass += '-2';
            }
            else if(percent > .5 && percent <= .75) {
                cssClass += '-3';
            }
            else if(percent > .75) {
                cssClass += '-4';
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
            } `;

        //
        for(var i in allColors) {
            var jColors = allColors[i];
            var sColors = jColors.split(',');

            for(var j in sColors) {
                css += '.c' + i + '-' + j +
                    ' { background: #' +
                    sColors[j] +
                    ';} ';
            }
        }

        //
        css += '</style>';

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
