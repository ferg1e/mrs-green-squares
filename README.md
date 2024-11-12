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

Configure the Git repositories you want to visualize using `src/config.json`. And then generate the visualization by running `node src/index.js`. The generated visualization will output to `index.html` unless you specify a different `output_path`.

### Single Repository

For visualizing a single Git repository, you will probably want to use this for your `src/config.json`:

```json
{
    "projects": [
        {
            "repos": "C:/path/to/my/repo"
        }
    ],
    "page_title": "Project Title",
    "is_project_titles": false
}
```

We used the `page_title` for a project title and we turned off project titles by setting `is_project_titles` to `false`.

### Change Square Color

You can change the square colors by using a group with an `id` equal to `default`:

```json
{
    "projects": [
        {
            "repos": "C:/path/to/my/repo"
        }
    ],
    "groups": [
        {
            "title": "Default",
            "id": "default",
            "colors": ["aa0000"]
        }
    ],
    "page_title": "Project Title",
    "is_project_titles": false
}
```

The default square color is `00aa00` and here we changed it to a reddish `aa0000`.

### Multiple Repositories

If you want to visualize multiple projects at once, then you should use `title`s for projects, remove `is_project_titles` (the default is `true`) and use a more general `page_title`:

```json
{
    "projects": [
        {
            "title": "Todo App",
            "repos": "C:/path/to/my/repo"
        },
        {
            "title": "E-commerce Site",
            "repos": "C:/path/to/my/other/repo"
        }
    ],
    "page_title": "My Python Projects"
}
```

### Multiple Square Colors

You can use different square colors for different projects by using multiple groups:

```json
{
    "projects": [
        {
            "title": "Todo App",
            "repos": "C:/path/to/my/repo",
            "group": "todo_app"
        },
        {
            "title": "E-commerce Site",
            "repos": "C:/path/to/my/other/repo",
            "group": "ecomm"
        }
    ],
    "groups": [
        {
            "title": "Todo App",
            "id": "todo_app",
            "colors": ["00aa00"]
        },
        {
            "title": "E-commerce Site",
            "id": "ecomm",
            "colors": ["aa0000"]
        }
    ],
    "page_title": "My Python Projects"
}
```

If there is more than one group then a group key will show on the visualization. In this example there is only one project per group but you can assign multiple projects to a group.

### Branches

By default, only commits from the currently checked out branch will be visualized. But you can select one or more branches to include in the visualization by using `branch` for repos:

```json
{
    "projects": [
        {
            "repos": {
                "dir": "C:/path/to/my/repo",
                "branch": "master"
            }
        }
    ],
    "page_title": "Project Title",
    "is_project_titles": false
}
```

`branch` can be a single branch as a string, an array of strings for one or more branches, or you can use `"*"` to indicate all branches.

### Date Ranges

You can filter commits by date ranges for repos:

```json
{
    "projects": [
        {
            "repos": {
                "dir": "C:/path/to/my/repo",
                "date_ranges": [
                    {
                        "min": "2011-12-25",
                        "max": "2012-02-10"
                    }
                ]
            }
        }
    ],
    "page_title": "Project Title",
    "is_project_titles": false
}
```

You can use one or more date ranges (notice how they are in an array), and each date range can use only the `min` or only the `max` (ie. you don't have to use both).

### Filter by Authors

You can filter commits by author email addresses. This is available on repos, projects, groups and at the root level:

```json
{
    "projects": [
        {
            "repos": {
                "dir": "C:/path/to/my/repo",
                "authors": ["mary@site.net"]
            },
            "authors": ["mary@site.net"]
        }
    ],
    "groups": [
        {
            "title": "Default",
            "id": "default",
            "colors": ["aa0000"],
            "authors": ["mary@site.net"]
        }
    ],
    "page_title": "Project Title",
    "is_project_titles": false,
    "authors": ["mary@site.net"]
}
```

The precedence is repo, project, group, root level. For example, if you have an `authors` array on both a repo and the group that repo uses then only the `authors` on the repo will be used.

### Multiple Repos Per Project

A project's `repos` can be an array of repositories. For example, if you have a separate front-end repo and a separate back-end repo for an app, then you would probably want to put both of these repos under the same project like this:

```json
{
    "projects": [
        {
            "repos": [
                "C:/path/to/my/front-end-repo",
                "C:/path/to/my/back-end-repo"
            ]
        }
    ],
    "page_title": "Project Title",
    "is_project_titles": false
}
```

Each repo element can be a directory string (like above) or an object with `dir`, `branch`, `date_ranges` and/or `authors` as demonstrated in previous examples.

### Output Path

By default your visualization will output to `index.html` but you can change that via `output_path`:

```json
{
    "projects": [
        {
            "repos": "C:/path/to/my/repo"
        }
    ],
    "page_title": "Project Title",
    "is_project_titles": false,
    "output_path": "my-viz.html"
}
```

### Multiple Visualizations

You can output multiple visualization files with one run of the tool by using a top level array:

```json
[
    {
        "projects": [
            {
                "repos": "C:/path/to/my/repo"
            }
        ],
        "page_title": "Project 1",
        "is_project_titles": false,
        "output_path": "viz1.html"
    },
    {
        "projects": [
            {
                "repos": "C:/path/to/my/other/repo"
            }
        ],
        "page_title": "Project 2",
        "is_project_titles": false,
        "output_path": "viz2.html"
    }
]
```

Be sure to use a different `output_path` for each.

### Different Colors for Different Authors

You can use different square colors for different authors by rendering the same repo more than once:

```json
{
    "projects": [
        {
            "title": "Fred",
            "repos": "C:/path/to/my/repo",
            "authors": ["fred@blah.net"],
            "group": "fred"
        },
        {
            "title": "Joanne",
            "repos": "C:/path/to/my/repo",
            "authors": ["joanne@meh.com"],
            "group": "joanne"
        }
    ],
    "groups": [
        {
            "id": "fred",
            "title": "Fred",
            "colors": ["00aa00"]
        },
        {
            "id": "joanne",
            "title": "Joanne",
            "colors": ["aa0000"]
        }
    ],
    "page_title": "Fred and Joanne's Commits"
}
```

### Five-Color Combinations

A group's `colors` array can be one color (all previous examples) or five colors. Here is a five-color example that is GitHub's colors:

```json
{
    "projects": [
        {
            "repos": "C:/path/to/my/repo"
        }
    ],
    "groups": [
        {
            "title": "Default",
            "id": "default",
            "colors": ["ebedf0", "9be9a8", "40c463", "30a14e", "216e39"]
        }
    ],
    "page_title": "Project Title",
    "is_project_titles": false
}
```