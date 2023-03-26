import dotenv from 'dotenv'
dotenv.config()
import * as fetcher from './lib/Fetcher.mjs'
import { createKoreFile, createGitHubAdaptor} from "korefile";
async function init() {
    let gh_token = process.env.gh_token
    let username = process.env.mal_username
    let readme_path = process.env.repo_path
    let branch = process.env.branch
    let filename = process.env.filename || "README.md"
    let data = await fetcher.fetchAnime(username)
    let currentreadme = await fetcher.getreadme(readme_path, gh_token, branch, filename)
    let newreadme = await fetcher.appendAnime(currentreadme, data)
    if(newreadme === currentreadme){
        console.log("No new entries")
        return process.exit(1)
    }
    
    console.log("New Changes Detected!")
    console.log("Pushing to Github")
    let file = createKoreFile({
        adaptor: createGitHubAdaptor({
            owner: readme_path.split("/")[0],
            repo: readme_path.split("/")[1],
            ref: `heads/${branch}`,
            token: gh_token
        })
    });
    file.writeFile(filename, newreadme);
    console.log(`${filename} Updated, Ending Process...`)
}
init()