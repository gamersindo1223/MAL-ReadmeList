import dotenv from 'dotenv'
dotenv.config()
import fetch from 'node-fetch';
const git = import("korefile")
import { upreadme } from './lib/readme-refresh.mjs';
let username = process.env.username
let gh_token = process.env.gh_token
let readme_path = process.env.readme_path
let branch = process.env.branch
let limit = process.env.limit
let MalKey = process.env.malkey
let completed_list = []
let watching_list = []
let onhold_list = []


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
    let anime_completed = await (await fetch(`https://api.myanimelist.net/v2/users/${username}/animelist?sort=list_updated_at&status=completed&limit=${limit}`,  {headers: { 'X-MAL-CLIENT-ID': MalKey}})).json()
    let anime_watching = await (await fetch(`https://api.myanimelist.net/v2/users/${username}/animelist?sort=list_updated_at&status=watching&limit=${limit}`,  {headers: { 'X-MAL-CLIENT-ID': MalKey}})).json()
    let anime_onhold = await (await fetch(`https://api.myanimelist.net/v2/users/${username}/animelist?sort=list_updated_at&status=on_hold&limit=${limit}`,  {headers: { 'X-MAL-CLIENT-ID': MalKey}})).json()
    anime_completed.data.forEach(data=>{completed_list.push(`${data.node.title}__${data.node.main_picture.large|| data.node.main_picture.medium}`)});
    anime_watching.data.forEach(data=>{watching_list.push(`${data.node.title}__${data.node.main_picture.large || data.node.main_picture.medium}`)})
    anime_onhold.data.forEach(data=>{onhold_list.push(`${data.node.title}__${data.node.main_picture.large || data.node.main_picture.medium}`)})
    console.log('Getting current readme')
    let readme = await upreadme(readme_path, gh_token)
}
init()