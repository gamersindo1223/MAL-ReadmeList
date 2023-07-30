import dotenv from 'dotenv'
dotenv.config()
import * as fetcher from './lib/Fetcher.mjs'
import { createKoreFile, createGitHubAdaptor} from "korefile";
import chalk from 'chalk'
async function init() {
    let gh_token = process.env.gh_token
    let username = process.env.mal_username
    let readme_path = process.env.repo_path
    let branch = process.env.repo_branch
    let filename = process.env.repo_filename || "README.md"
    let data = await fetcher.fetchAnime(username)
    let currentreadme = await fetcher.getreadme(readme_path, gh_token, branch, filename)
    let newreadme = await fetcher.appendAnime(currentreadme, data)
    if(newreadme === currentreadme){
        console.log(chalk.yellow('[INFO]') + " No new entries")
        return;
    }
    
    console.log(chalk.green('[INFO]') + " New Changes Detected!")
    console.log(chalk.green('[INFO]') + " Pushing to Github")
    let file = createKoreFile({
        adaptor: createGitHubAdaptor({
            owner: readme_path.split("/")[0],
            repo: readme_path.split("/")[1],
            ref: `heads/${branch}`,
            token: gh_token
        })
    });
    file.writeFile(filename, newreadme);
    console.log(chalk.green('[INFO]') + ` ${filename} Updated, Ending Process...`)
}
init()
