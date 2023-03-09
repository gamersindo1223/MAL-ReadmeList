import dotenv from 'dotenv'
dotenv.config()
import fetch from 'node-fetch';
const readmeutil = require("./lib/readme-util.mjs")
const git = require("korefile")

async function init() {
    let username = process.env.username
    let gh_token = process.env.gh_token
    let readme_path = process.env.readme_path
    let branch = process.env.branch
    let limit = process.env.limit
    let MalKey = process.env.malkey
    let list;

    console.log("username: " + username);
    console.log("readme_path: " + readme_path);
    console.log("branch: " + branch);
    console.log("limit: " + limit);

    if (!MalKey) throw new Error("Please Provide a valid MyanimeList api key!")
    let malstatus;
    let fetched = await (await fetch(`https://api.myanimelist.net/v2/users/${username}/animelist`, {headers: { 'X-MAL-CLIENT-ID': MalKey}}))
    malstatus = fetched.status
    fetched = fetched.json()
    if(malstatus == 400 && fetched?.message == "Invalid client id") throw new Error("Invalid Myanimelist Client ID\nDo you misplled it?")
    if(malstatus == 404 && fetched?.error === "not_found") throw new Error("Username not found")
    let history = fetched.data;
    console.log("History Founded, Parsing...")
    list = readmeutil.parseList(history, limit)
    console.log("History Parsed Success \n", list)
    let readme = await readmeutil.readme(readme_path, gh_token)
    console.log("\nGetting current README.md")
    let newreadme = readmeutil.append(readme, list)
    console.log("Updated to the new readme")
    if (!gh_token) {
        throw new Error("Enter a token");
    }

    console.log("Pushing to Github")
    let file = git.createKoreFile({
        adaptor: git.createGitHubAdaptor({
            owner: readme_path.split("/")[0],
            repo: readme_path.split("/")[1],
            ref: `heads/${branch}`,
            token: gh_token
        })
    });

    if (readme === newreadme) {
        console.log("README.md is not changed")
        console.log("Canceling github push")
        return
    }

    file.writeFile("README.md", newreadme);

    console.log("README.md Updated, Ending Process...")
}

init()