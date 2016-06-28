var Git = require('nodegit');

Git.Repository.open("C:\\wamp\\www\\pajamasql")
    .then(function(repo) {
        return repo.getMasterCommit();
    })
    .then(function(firstCommitOnMaster) {
        var history = firstCommitOnMaster.history();
        var count = 0;

        history.on("commit", function(commit) {
            if (++count > 5) {
                return;
            }

            var author = commit.author();

            console.log("commit " + commit.sha());
            console.log("Author:\t" + author.name() + " <" + author.email() + ">");
            console.log("Date:\t" + commit.date());
            console.log("\n    " + commit.message());
        });

        history.start();
    });
