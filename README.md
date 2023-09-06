# MAL readme workflow (REVAMP)

> [!NOTE]  
> Highlights information that users should take into account, even when skimming.

> [!IMPORTANT]  
> Crucial information necessary for users to succeed.

> [!WARNING]  
> Critical content demanding immediate user attention due to potential risks.
## How to Use

Simply add this to your Markdown File

```html
 <!-- MAL_ANIME<STATUS>:<TYPE> -->
 <!-- MAL_ANIME<STATUS>:<TYPE>_END -->
```
Replace `<Status` and  `<TYPE>` with the options on the table below
> Note Always Use capital letter when typing the status / type!


| **Status** | **TYPE** |
|------------|----------|
| FINISHED   | DEFAULT  |
| WATCHING   | LIST     |
| PTW        | GRID     |



## Github Workflow!
>After That Make a new Github Actions with the value like this
[Change all the value with your credentials, except github tokens]

```yaml
on:
  schedule:
    # Runs every hour or use crontab.guru for custom cron
    - cron: '0 * * * *'
  workflow_dispatch:

jobs:
  update-readme-with-anime-history:
    name: Update this repo's README with latest MAL history
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: MyAnimeList readme workflow
        uses: gamersindo1223/MAL-ReadmeList@main
        with:
          gh_token: ${{ github.token }}
          mal_username: "MYANIMELIST_USERNAME"
          repo_branch: "BRANCHNAME"
          repo_filename: "MARKDOWNFILENAME.md"
          repo_path: "GITHUBNAME/GITHUBREPO"
```
## Demo
You can find it on my [Github Reasme](https://github.com/gamersindo1223/gamersindo1223)

## Contributing

Contributing is very helpful and it will help me to solve any bugs on this project
