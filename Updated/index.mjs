import dotenv from 'dotenv'
dotenv.config()
import fetch from 'node-fetch';
import {createKoreFile, createGitHubAdaptor} from "korefile";
import { upreadme,  append } from './lib/readme-refresh.mjs';
let username = process.env.username
let gh_token = process.env.gh_token
let readme_path = process.env.readme_path
let branch = process.env.branch
let limit = process.env.limit
let MalKey = process.env.malkey


async function init() {
    console.log("username: " + username);
    console.log("readme_path: " + readme_path);
    console.log("branch: " + branch);
    console.log("limit: " + limit);
    if(!gh_token) throw new Error("Inavalid github token")
    await fetch(`https://api.myanimelist.net/v2/users/${username}/animelist`, {headers: { 'X-MAL-CLIENT-ID': MalKey}}).then(x =>{
        if(x.status == 400 && x.json().message == "Invalid client id") throw new Error("Invalid Myanimelist Client ID\nDo you provide a wrong client ID?")
        if(x.status == 404 && x.json().error === "not_found") throw new Error("Invalid Username Was Inputted")
    })
    console.log(`Fetching MAL History`)
    const fetchAnimeList = async (status) => {
        const url = `https://api.myanimelist.net/v2/users/${username}/animelist?sort=list_updated_at&status=${status}&limit=${limit}`;
        const response = await fetch(url, { headers: { 'X-MAL-CLIENT-ID': MalKey } });
        const animeList = await response.json();
        return animeList.data.map(data => `${data.node.title}__${data.node.main_picture.large || data.node.main_picture.medium}`);
      };
      
      const anime_completed = await fetchAnimeList('completed');
      const anime_watching = await fetchAnimeList('watching');
      const anime_onhold = await fetchAnimeList('on_hold');
      const list = [anime_completed, anime_watching, anime_onhold]
    console.log('Getting current readme');
    let readme = await upreadme(readme_path, gh_token)
    let newreadme = append(readme, list)

    /*
    console.log("Pushing to Github")
    let file = createKoreFile({
        adaptor: createGitHubAdaptor({
            owner: readme_path.split("/")[0],
            repo: readme_path.split("/")[1],
            ref: `heads/${branch}`,
            token: gh_token
        })
    });
*/
}
init()