import dotenv from 'dotenv'
dotenv.config()
import fetch from 'node-fetch';
const git = import("korefile")
let username = process.env.username
let gh_token = process.env.gh_token
let readme_path = process.env.readme_path
let branch = process.env.branch
let limit = process.env.limit
let MalKey = process.env.malkey
let list;

async function init() {
    console.log("username: " + username);
    console.log("readme_path: " + readme_path);
    console.log("branch: " + branch);
    console.log("limit: " + limit);
    await (await fetch(`https://api.myanimelist.net/v2/users/${username}/animelist`, {headers: { 'X-MAL-CLIENT-ID': MalKey}})).then(x =>{
        if(x.status == 400 && x.json().message == "Invalid client id") throw new Error("Invalid Myanimelist Client ID\nDo you provide a wrong client ID?") ; if(x.status == 404 && x.json().error === "not_found") throw new Error("Invalid Username Was Inputted")
    })
    const anime_completed = (await fetch(`https://api.myanimelist.net/v2/users/${username}/animelist?sort=list_updated_at&status=completed&limit=${limit}`,  {headers: { 'X-MAL-CLIENT-ID': MalKey}}))
    const anime_watching = (await fetch(`https://api.myanimelist.net/v2/users/${username}/animelist?sort=list_updated_at&status=watching&limit=${limit}`,  {headers: { 'X-MAL-CLIENT-ID': MalKey}}))
    const anime_onhold = (await fetch(`https://api.myanimelist.net/v2/users/${username}/animelist?sort=list_updated_at&status=on_hold&limit=${limit}`,  {headers: { 'X-MAL-CLIENT-ID': MalKey}}))
}
init()