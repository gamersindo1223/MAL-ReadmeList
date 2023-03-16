import dotenv from 'dotenv'
dotenv.config()
import * as fetcher from './lib/Fetcher.mjs'
import axios from 'axios'
const git = import("korefile")

async function init() {
    let username = process.env.username
    let gh_token = process.env.gh_token
    let readme_path = process.env.readme_path
    let branch = process.env.branch
    let limit = process.env.limit
    let list;
    console.log(await fetcher.fetchAnime("gamersindo1223", 10))
    /*
    const fetchAnimeList = async (status) => {
        const url = `https://myanimelist.net/animelist/${username}/load.json?status=${status}`;
        const response = await fetch(url).catch(err => {throw new Error(err)})
        const animeList = await response.json();
        return animeList
      };
      const anime_watching = await fetchAnimeList('1')
      for(let i = 0; i < anime_watching.length; i++) {
        
      }
      */
}
init()