# MAL-ReadmeList

Puts your MyAnimeList activity into your GitHub readme automatically. Revamp of [MoonLGH/MAL_Autolist](https://github.com/MoonLGH/MAL_Autolist/).

## Usage

Drop these comment tags wherever you want the list to appear in your markdown file:

```html
<!-- MAL_ANIME<STATUS>:<TYPE> -->
<!-- MAL_ANIME<STATUS>:<TYPE>_END -->
```

**STATUS** — `WATCHING`, `COMPLETED`, `PTW`  
**TYPE** — `GRID` (poster images in a collapsible), `LIST` (bullet list), `DEFAULT` (inline images)

Always use uppercase.

### Manga

Same thing but with `MAL_MANGA` and statuses `READING`, `COMPLETED`, `PTR`. Needs `enable_manga: true` in your workflow.

## Workflow setup

<details>
<summary>Show example workflow</summary>

See [action.yml](action.yml) for the full list of inputs.

```yaml
on:
  schedule:
    - cron: '0 * * * *'
  workflow_dispatch:

jobs:
  mal:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: gamersindo1223/MAL-ReadmeList@main
        with:
          gh_token: ${{ github.token }}
          mal_username: "your_mal_username"
          repo_path: "yourname/yourrepo"
          # optional
          repo_branch: "main"
          repo_filename: "README.md"
          max_entries: "5"       # 0 = show all
          enable_manga: "false"
          show_score: "false"
```

</details>

## Demo

[My GitHub profile](https://github.com/gamersindo1223/gamersindo1223)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)
