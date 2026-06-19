import dotenv from 'dotenv'
dotenv.config()
import * as fetcher from './lib/anime-fetch.js'
import { createKoreFile, createGitHubAdaptor } from 'korefile'
import chalk from 'chalk'

async function main() {
    const gh_token   = process.env.gh_token
    const username   = process.env.mal_username
    const repo_path  = process.env.repo_path
    const branch     = process.env.repo_branch  || 'main'
    const filename   = process.env.repo_filename || 'README.md'
    const maxEntries = parseInt(process.env.max_entries) || 0
    const manga      = process.env.enable_manga === 'true'
    const showScore  = process.env.show_score   === 'true'

    if (!gh_token)  throw new Error('missing gh_token')
    if (!username)  throw new Error('missing mal_username')
    if (!repo_path) throw new Error('missing repo_path')

    console.log(chalk.cyan('[DEBUG]') + ` config: repo_path=${repo_path} branch=${branch} filename=${filename}`)
    console.log(chalk.cyan('[DEBUG]') + ` options: max_entries=${maxEntries} enable_manga=${manga} show_score=${showScore}`)
    console.log(chalk.cyan('[DEBUG]') + ` fetching anime data for MAL user ${username}`)
    const animeData = await fetcher.fetchAnime(username)
    if (manga) {
        console.log(chalk.cyan('[DEBUG]') + ` fetching manga data for MAL user ${username}`)
    }
    const mangaData = manga ? await fetcher.fetchManga(username) : null
    console.log(chalk.cyan('[DEBUG]') + ` reading ${filename} from ${repo_path}@${branch}`)
    const current   = await fetcher.getReadme(repo_path, gh_token, branch, filename)

    let updated = await fetcher.appendAnime(current, animeData, { maxEntries, showScore })
    if (mangaData) updated = await fetcher.appendManga(updated, mangaData, { maxEntries, showScore })

    if (updated === current) {
        console.log(chalk.yellow('[INFO]') + ' nothing changed')
        return
    }

    console.log(chalk.cyan('[DEBUG]') + ` updating ${filename} in ${repo_path}@${branch}`)
    const file = createKoreFile({
        adaptor: createGitHubAdaptor({
            owner: repo_path.split('/')[0],
            repo:  repo_path.split('/')[1],
            ref:   `heads/${branch}`,
            token: gh_token
        })
    })
    file.writeFile(filename, updated)
    console.log(chalk.green('[INFO]') + ` pushed to ${filename}`)
}

main().catch(err => {
    console.error(chalk.red('[ERROR]') + ' ' + err.message)
    process.exit(1)
})
