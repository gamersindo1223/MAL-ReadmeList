# MAL readme workflow (REVAMP)

> This is a simple workflow that will add your latest MAL History into your readme! This is a Revamp of [MoonLGH/MAL_Autolist](github.com/MoonLGH/MAL_Autolist/)

## How to Use

Simply add this to your Markdown File

```html
 <!-- MAL_ANIME<STATUS>:<TYPE> -->
 <!-- MAL_ANIME<STATUS>:<TYPE>_END -->
```
Replace `<Status>` and  `<TYPE>` with the options on the table below
> Note Always Use capital Letter for the type!

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
  update-readme-with-blog:
    name: Update this repo's README with latest MAL history
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: MyAnimeList readme workflow
        uses: gamersindo1223/MAL-ReadmeList@main
        with:
          gh_token: ${{ github.token }}
          mal_username: "gamersindo1223"
          repo_branch: "main"
          repo_filename: "README.md"
          repo_path: "gamersindo1223/gamersindo1223"
```
## Demo
You can find it on my [Repo Readme](https://github.com/gamersindo1223/MAL-ReadmeList/tree/Testing-Purpose-(Do-not-Use))!

## Contributing

Contributing is very helpfull and it will help me maintaining and fixing bugs on this readme
