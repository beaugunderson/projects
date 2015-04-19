## Projects

Project management for power users.

### Installation

```sh
$ npm install -g projects
```

### Quickstart

If the majority of your projects are subdirectories of one folder then the
easiest way to get started is this (in my case my projects live underneath
`~/p/`):

```sh
$ npm install -g projects
$ echo "alias p=projects" >> ~/.bashrc
$ source ~/.bashrc
$ vim ~/.config/projects

# edit like so (note: this file will probably become JSON soon!)
[github]
username = beaugunderson

[projects]
directory = ~/p

$ p import ~/p/*
$ p github  # if you want to import metadata about your GitHub projects too
```

Try `p remind`, `p git-status`, `p git-unpushed`, and `p not-git` for examples
of the time savings and management functionality I'm trying to enable.

Note that the color scheme currently assumes a dark background; if you find it
hard to read try `DISABLE_COLOR=true` in your environment (a revamp of all
colors is coming in the next version).

### Shell completion

For autocompletion you can redirect `projects --completion` to a file in
`~/.bash_completion` (zsh is also supported) or use `projects-modified.sh`
which also contains a fallback to `_filedir` so that you can still complete
files and directories (I've opened [an
issue](https://github.com/f/omelette/issues/4) to get that improvement back
into omelette, the completion library we use).

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
| `import`       | import a directory into projects                           |
| `info`         | show the JSON for a given project                          |
| `json-in`      | import your projects from plain JSON                       |
| `json-out`     | export your projects to plain JSON                         |
| `ls`           | list your porojects                                        |
| `open`         | open a project's homepage                                  |
| `not-git`      | list projects not in git                                   |
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
contract-home() {
  sed "s|^$HOME|~|"
}

# cd to a project via fzf
pd() {
  cd $(projects ls -1 | \
    fzf --query="$1" | \
    xargs -I {} projects get --porcelain "{}" directory)
}

# open a project's URL via fzf
po() {
  open $(projects ls -1 | \
    fzf --query="$1" | \
    xargs -I {} projects get --porcelain "{}" homepage)
}

# edit a project file with $EDITOR via fzf
# note: requires gnu findutils
# on OS X you'll want to:
# `npm install -g ignore-pipe`
# `brew install findutils --with-default-names`
pe() {
  FILTERS='-type f '

  # filter out .git and node_modules with -prune to make the find much faster
  FILTERS+='-not -path \*/.git/\* -prune '
  FILTERS+='-not -path \*/node_modules/\* -prune '

  ADDITIONAL_FILTERS=$1

  if PROJECT_DIRECTORY=`projects resolve --relative .`; then
    FILE=$(bash -c "find $PROJECT_DIRECTORY \
      $FILTERS $ADDITIONAL_FILTERS 2> /dev/null" | \
        ignore-pipe | contract-home | fzf)
  else
    FILE=$(projects glob --expand | \
      xargs -I {} bash -c "find "{}" \
        $FILTERS $ADDITIONAL_FILTERS 2> /dev/null" | \
         ignore-pipe | contract-home | fzf)
  fi

  # bash -c needed to handle tilde expansion
  [ ! -z "$FILE" ] && bash -c "${EDITOR:-vim} "$FILE""
}

# edit a project file modified within in the last 7 days
per() {
  pe "-mtime -7"
}
```
