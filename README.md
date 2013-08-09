## Projects

You're a prolific developer (or you want to be). Manage, keep track of, and show
off your projects with ease.

### Commands

- clone: `git clone` a project
- github: fill your ~/.config/projects.db with your GitHub repositories
- info: show the JSON for a given project
- json-in: import your projects from plain JSON
- json-out: export your projects to plain JSON
- open: open a project's homepage
- query: query your projects
- set set an attribute to a given value for a project

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

$ p open vim-scss-instead # opens a web browser to the `homepage` URL

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

- A web API and examples of what you'd do with it
- More well-defined attributes
- Think more about efficiency
- Get more people to write commands
- Talk to people about their workflows
- Workflows for Alfred
