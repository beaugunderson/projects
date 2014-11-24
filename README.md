## Projects

You're a prolific developer (or you want to be). Manage, keep track of, and
show off your projects with ease.

### Installation

```sh
$ npm install -g projects
```

### Commands

| Command        | Description                                                |
|----------------|------------------------------------------------------------|
| `alias`        | output shell aliases                                       |
| `clone`        | `git clone` a project                                      |
| `each`         | run a command in each project directory                    |
| `edit`         | edit projects files                                        |
| `gc`           | compact the projects database                              |
| `get`          | get an attribute for a project                             |
| `git-status`   | `git status` across all repositories                       |
| `git-unpushed` | display repositories with unpushed commits                 |
| `github`       | fill your projects database with your GitHub repositories  |
| `glob`         | glob across all project directories                        |
| `info`         | show the JSON for a given project                          |
| `json-in`      | import your projects from plain JSON                       |
| `json-out`     | export your projects to plain JSON                         |
| `open`         | open a project's homepage                                  |
| `query`        | query your projects                                        |
| `remind`       | get a reminder of what you were last working on            |
| `set`          | set an attribute to a given value for a project            |

### Writing your own commands

Projects is primarily a framework for making it easy to execute actions on one
or more of your projects. For example, you could write a command to check the
clean/dirty status of all of your checked out git repositories and list the
dirty ones.

If you have an executable file in your PATH that starts with `projects-` then
you can execute it underneath projects (and you're encouraged to share them
with others!)

### Examples

```sh
$ alias p=projects
$ cat ~/.config/projects
[github]
username = beaugunderson

[projects]
directory = ~/p

$ p info vim-scss-instead
{
  "name": "vim-scss-instead",
  "repository": "https://github.com/beaugunderson/vim-scss-instead.git",
  "language": "VimL",
  "role": "creator",
  "released": true,
  "status": "inactive"
}

$ p set vim-scss-instead homepage https://github.com/beaugunderson/vim-scss-instead
Set vim-scss-instead:homepage to "https://github.com/beaugunderson/vim-scss-instead"
$ p open vim-scss-instead # opens a web browser to the homepage URL
$ p clone vim-scss-instead
Cloning into '/Users/beau/p/vim-scss-instead'...
remote: Counting objects: 5, done.
remote: Compressing objects: 100% (4/4), done.
remote: Total 5 (delta 0), reused 5 (delta 0)
Receiving objects: 100% (5/5), done.

$ p github
<snip>
Adding vim-scss-instead
Adding vim-human-dates
<snip>
Finished

$ p git-unpushed
node-helmsman: 6 commits ahead of origin
projects: 3 commits ahead of origin
```

You can also use something like [fzf](https://github.com/junegunn/fzf) to make
selecting a project via the CLI very easy:

```sh
# cd to a project via fzf
pd() {
  cd $(projects ls -1 | fzf | xargs -I {} projects get --porcelain {} directory)
}

# open a project's URL via fzf
po() {
  open $(projects ls -1 | fzf | xargs -I {} projects get --porcelain {} homepage)
}

# edit a project file with $EDITOR via fzf
pe() {
  if PROJECT_DIRECTORY=`projects resolve --relative .`; then
    FILE=$( find $PROJECT_DIRECTORY -type f \
      \( ! -path "*/.git/*" \) -and \
      \( ! -path "*/node_modules/*" \) 2> /dev/null | fzf)
  else
    FILE=$(projects glob | \
      xargs -I {} find {} -type f \
        \( ! -path "*/.git/*" \) -and \
        \( ! -path "*/node_modules/*" \) 2> /dev/null | fzf)
  fi

  [ ! -z "$FILE" ] && $EDITOR $FILE
}
```
