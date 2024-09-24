# Mrs. Green Squares

Mrs. Green Squares visualizes the commits in local Git repositories.
The layout is almost identical to the GitHub commits visualization, but this tool also shows commit messages and you can group repos into different colors.
The output format is an HTML file.

## Install & Run

- `git clone https://github.com/ferg1e/mrs-green-squares.git git-vis`
- `cd git-vis`
- `npm install`
- edit the `repos` value in `src/config.json` to point to a directory that has a Git repo
- `node src/index.js`
- your commits visualization will now be in `git-vis/index.html`

## Config

For visualization, there are projects and groups.

Projects contain one or more Git repositories. Commit messages show in the sidebar under their project title heading. For example, if you have a front-end repo and a separate back-end repo and you want commit messages from both to appear under the same project title heading, they you would put these two repos into the same project.

Groups contain one or more projects. You can set a different commit visualization square color for each group. For example, you can group Python projects into blue squares and C++ projects into red squares.

Projects and groups are configured in `src/config.json`. The config file is initialized to the simplest configuration which is a single project:

```json
{
    "projects": [
        {
            "title": "My Project",
            "repos": "C:/path/to/my/repo"
        }
    ]
}
```

If you don't supply a `group` value for a project then the project will automatically be assigned a `group` value of `default`. If you don't use any groups then a default group is created. The above config is the same as:

```json
{
    "projects": [
        {
            "title": "My Project",
            "repos": "C:/path/to/my/repo",
            "group": "default"
        }
    ],

    "groups": [
        {
            "title": "Default",
            "id": "default",
            "colors": ["00aa00"]
        }
    ]
}
```

If you want to use multiple repos in a project put them in an array:

```json
{
    "projects": [
        {
            "title": "My Project",
            "repos": [
                "C:/path/to/my/repo1",
                "C:/path/to/my/repo2"
            ]
        }
    ]
}
```

Repos can also use `branch` and `date_ranges`:

```json
{
    "projects": [
        {
            "title": "My Project",
            "repos": [
                "C:/path/to/my/repo1",
                {
                    "dir": "C:/path/to/my/repo2",
                    "branch": "dev",
                    "date_ranges": [
                        {
                            "min": "2020-01-01",
                            "max": "2020-12-31"
                        }
                    ]
                }
            ]
        }
    ]
}
```

You can filter commits by author by using a root `authors` array:

```json
{
    "projects": [
        {
            "title": "My Project",
            "repos": "C:/path/to/my/repo"
        }
    ],

    "authors": ["alice@foo.net", "bob@foo.net"]
}
```
