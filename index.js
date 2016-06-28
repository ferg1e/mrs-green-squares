var git = require('nodegit');
var fs = require('fs');

git.Repository.open('C:\\wamp\\www\\pajamasql')
    .then(function(repo) {
        return repo.getMasterCommit();
    })
    .then(function(firstCommitOnMaster) {
        var history = firstCommitOnMaster.history();
        var count = 0;

        history.on('commit', function(commit) {
            ++count;
            console.log(count);
        });

        history.on('end', function(commits) {
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
