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

            //get YYYY-MM-DD
            var iy = d.getUTCFullYear() + '-' +
                ('0' + (d.getUTCMonth() + 1)).slice(-2) + '-'  +
                ('0' + d.getUTCDate()).slice(-2);

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

            //console.log(d.getDay());
            //console.log(d.toUTCString());
        });

        //
        history.on('end', function(commits) {
            console.log(commitCounts);
            console.log(firstDay);
            console.log(lastDay);

            fs.writeFile(
                'index.html',
                `<!doctype html>
                    <html>
                        <head></head>
                        <body># commits: ${count}</body>
                    </html>`);
        });

        //
        history.start();
    });
