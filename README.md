## Projects

You're a prolific developer (or you want to be). Manage, keep track of, and show
off your projects with ease.

### Installation

```sh
$ npm install -g projects
$ projects help
```

### Commands

- clone: `git clone` a project
- github: fill your ~/.config/projects.db with your GitHub repositories
- info: show the JSON for a given project
- json-in: import your projects from plain JSON
- json-out: export your projects to plain JSON
- open: open a project's homepage
- query: query your projects
- set: set an attribute to a given value for a project

### Writing your own commands

Projects is primarily a framework for making it easy to execute actions on one
or more of your projects. For example, you could write a command to check the
clean/dirty status of all of your checked out git repositories and list the
dirty ones.

If you have an executable file in your PATH that starts with `projects-` then
you can execute it underneath projects (and you're encouraged to share them with
others!)

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
```

### TODO

- Modify node-helmsman so that it doesn't require all files (and add ability to
  specify description, etc. from the helmsman object); this will be a large
  speed increase
- Be as `git`-like as possible when the concepts are similar/the same to prevent
  having to learn a new way of doing things
- Shell functions (pcd <project>, for example, will change the directory to a
  project's directory)
- Flesh out the query API (by number of issues, by last update, by dirty status,
  by number of collaborators, number of npm stars, number of packages used,
  etc.)
- Open a browser on Windows, Linux (just uses OS X `open` right now)
- A web API and examples of what you'd do with it
- Add GET/POST/DELETE/PUT to the web API and add the concept of a master
  repository?
- More well-defined attributes
- Think more about efficiency
- Get more people to write commands
- Talk to people about their workflows
- Workflows for Alfred
