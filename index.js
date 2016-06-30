var git = require('nodegit');
var fs = require('fs');

//
var commitCounts = {};+

git.Repository.open('C:\\wamp\\www\\pajamasql')
    .then(function(repo) {
        return repo.getMasterCommit();
    })
    .then(function(firstCommitOnMaster) {
        var history = firstCommitOnMaster.history();
        var count = 0;

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

            //console.log(commit.date());
            //console.log(d.getDay());
            //console.log(d.toUTCString());
            //console.log(iy);
            //console.log();
        });

        history.on('end', function(commits) {
            console.log(commitCounts);
            fs.writeFile(
                'index.html',
                `<!doctype html>
                    <html>
                        <head></head>
                        <body># commits: ${count}</body>
                    </html>`);
        });

        history.start();
    });
