import fetch from 'node-fetch'
import axios from 'axios'
import * as cheerio from 'cheerio';
//Github checker
export async function getreadme(path, gh_token, branch) {
    let fetchrepo = await (await fetch(`https://api.github.com/repos/${path}/git/trees/${branch}`, {
        headers: {
            "Authorization": `token ${gh_token}`
        }
    })).json()
    if (fetchrepo.toString().toLowerCase() === "bad credentials") throw new Error("Invalid Github Token")
    if (!fetchrepo.tree.find(x => x.path === 'README.md')) {
        throw new Error("No README.md found on this repo!.")
    }
    let readme = await (await fetch(fetchrepo.tree.find(x => x.path === 'README.md').url, {
        headers: {
            "Authorization": `token ${gh_token}`
        }
    })).json()
    let input = readme.content
    input = input.replace(/\s/g, '');
    return decodeURIComponent(Buffer.from(input, 'base64'))
}
//Date Formatter
const formatDate = date => {
    const MMM = date.toLocaleString("en-US", { month: "short" });
    const D = date.getDate();
    const hh = date.toLocaleString("en-US", { hour12: true, hour: "2-digit" }).slice(0, -3);
    const mm = date.getMinutes().toString().padStart(2, "0");
    const A = date.getHours() < 12 ? "AM" : "PM";
    const YYYY = date.toLocaleString("en-US", { year: "numeric" }).padStart(4, "0");
    return `${MMM} ${D}, ${hh}:${mm} ${A}, ${YYYY}`;
};
//Get all the anime data from the username
export async function fetchAnime(Username) {
    let returnedata = {}
    returnedata.watching = await fetch(`https://myanimelist.net/animelist/${Username}/load.json?status=1`).catch(err => {
        throw new Error(err)
    }).then(x => {
        if (x.status !== 200) throw new Error('Server Error Occured');
        else return x.json()
    })
    returnedata.completed = await fetch(`https://myanimelist.net/animelist/${Username}/load.json?status=2`).catch(err => {
        throw new Error(err)
    }).then(x => {
        if (x.status !== 200) throw new Error('Server Error Occured');
        else return x.json()
    })
    returnedata.ptw = await fetch(`https://myanimelist.net/animelist/${Username}/load.json?status=3`).catch(err => {
        throw new Error(err)
    }).then(x => {
        if (x.status !== 200) throw new Error('Server Error Occured');
        else return x.json()
    })
    return returnedata
}
//Parse the data, List type
export function parseList(list, type){
    let returnedlist = []
    for (let i = 0; i < list.length; i++) {
        let activity
    if (list[i].video_url.includes('anime')){
            activity = `- 📺 ${type || "?"}`
        }else{
            return;
        }
        returnedlist.push(`${activity} [${list[i].anime_title_eng}](https://myanimelist.net${list[i].video_url}) Episode${list[i].num_watched_episodes} on (${formatDate(new Date(list[i].updated_at * 1000))})`)
    }
    return returnedlist.join("\n")
}
//Readme Data for Watching section
export async function appendAnimeCompleted(readme, data) {
    let newreadme = readme
    let patternstartgrid = "<!-- MAL_ANIMECOMPLETED:GRID -->",
        patternendgrid = "<!-- MAL_ANIMECOMPLETED:GRID_END -->",
        patternstartlist = "<!-- MAL_ANIMECOMPLETED:LIST -->",
        patternendlist = "<!-- MAL_ANIMECOMPLETED:LIST_END -->",
        patternstartdefault = "<!--MAL_ANIMECOMPLETED:DEFAULT -->",
        patternendefault = "<!--MAL_ANIMECOMPLETED:DEFAULT_END -->"
    let datarray = []
    data.forEach(x => {
        datarray.push(`<img height="200px" width="150px" title="${x.anime_title_eng} (${x.anime_title})" src="${x.anime_image_path.replace("/r/192x272", '').match(/.+(?=\?)/)[0]}"> \n`)
    })
    
    const replaceBetween = (source, start, end, replacement) => {
        const regex = new RegExp(`${start} .+ ${end}`);
      return source.replace(regex, `${start} ${replacement} ${end}`)
    }
    const replacements = [
        {start: patternstartgrid, end: patternendgrid, replacement:  `\n\n` + `<details>\n<summary align="left">AnimeList Watching</summary>`+ datarray.toString().replaceAll(',', '') + `</details>`},
        {start: patternstartlist, end: patternendlist, replacement: parseList(data, "Completed").toString().replaceAll(',', '')},
        {start: patternstartdefault, end: patternendefault, replacement: datarray.toString().replaceAll(',', '')},
    ];
    replacements.forEach(({start, end, replacement}) => {
        //if((newreadme.includes(start) && !newreadme.includes(end)) || (!newreadme.includes(start) && newreadme.includes(end))) return;
        newreadme = replaceBetween(newreadme, start, end, replacement)
    })
   /* //Some Dumb crap
    const replacements = [
        {start: patternstartgrid, end: patternendgrid, replacement:  `\n\n` + `<details>\n<summary align="left">AnimeList Watching</summary>`+ datarray.toString().replaceAll(',', '') + `</details>`},
        {start: patternstartlist, end: patternendlist, replacement: parseList(data, "Completed").toString().replaceAll(',', '')},
        {start: patternstartdefault, end: patternendefault, replacement: datarray.toString().replaceAll(',', '')},
    ];
    let arrayreadme;
    arrayreadme = newreadme.trimEnd().split('\n')
    replacements.forEach(({start, end, replacement}) => {
        console.log(arrayreadme.indexOf(start) + arrayreadme.indexOf(end))
    })
    */
   return newreadme
}

export async function appendAnimeWatching(readme, data) {
    let newreadme = readme
    let patternstartgrid = "<!-- MAL_ANIMEWATCHING:GRID -->",
        patternendgrid = "<!-- MAL_ANIMEWATCHING:GRID_END -->",
        patternstartlist = "<!-- MAL_ANIMEWATCHING:LIST -->",
        patternendlist = "<!-- MAL_ANIMEWATCHING:LIST_END -->",
        patternstartdefault = "<!--MAL_ANIMEWATCHING:DEFAULT -->",
        patternendefault = "<!--MAL_ANIMEWATCHING:DEFAULT_END -->"
    let datarray = []
    data.forEach(x => {
        datarray.push(`<img height="200px" width="150px" title="${x.anime_title_eng} (${x.anime_title})" src="${x.anime_image_path.replace("/r/192x272", '').match(/.+(?=\?)/)[0]}"> \n`)
    })
    
    const replaceBetween = (source, start, end, replacement) => {
        const regex = new RegExp(`${start} .+ ${end}`);
      return source.replace(regex, `${start} ${replacement} ${end}`)
    }
    const replacements = [
        {start: patternstartgrid, end: patternendgrid, replacement:  `\n\n` + `<details>\n<summary align="left">AnimeList Watching</summary>`+ datarray.toString().replaceAll(',', '') + `</details>`},
        {start: patternstartlist, end: patternendlist, replacement: parseList(data, "Completed").toString().replaceAll(',', '')},
        {start: patternstartdefault, end: patternendefault, replacement: datarray.toString().replaceAll(',', '')},
    ];
    replacements.forEach(({start, end, replacement}) => {
        //if((newreadme.includes(start) && !newreadme.includes(end)) || (!newreadme.includes(start) && newreadme.includes(end))) return;
        newreadme = replaceBetween(newreadme, start, end, replacement)
    })
   /* //Some Dumb crap
    const replacements = [
        {start: patternstartgrid, end: patternendgrid, replacement:  `\n\n` + `<details>\n<summary align="left">AnimeList Watching</summary>`+ datarray.toString().replaceAll(',', '') + `</details>`},
        {start: patternstartlist, end: patternendlist, replacement: parseList(data, "Completed").toString().replaceAll(',', '')},
        {start: patternstartdefault, end: patternendefault, replacement: datarray.toString().replaceAll(',', '')},
    ];
    let arrayreadme;
    arrayreadme = newreadme.trimEnd().split('\n')
    replacements.forEach(({start, end, replacement}) => {
        console.log(arrayreadme.indexOf(start) + arrayreadme.indexOf(end))
    })
    */
   return newreadme
}
export async function appendAnimePtw(readme, data) {
    let newreadme = readme
    let patternstartgrid = "<!-- MAL_ANIMEPTW:GRID -->",
        patternendgrid = "<!-- MAL_ANIMEPTW:GRID_END -->",
        patternstartlist = "<!-- MAL_ANIMEPTW:LIST -->",
        patternendlist = "<!-- MAL_ANIMEPTW:LIST_END -->",
        patternstartdefault = "<!--MAL_ANIMEPTW:DEFAULT -->",
        patternendefault = "<!--MAL_ANIMEPTW:DEFAULT_END -->"
    let datarray = []
    data.forEach(x => {
        datarray.push(`<img height="200px" width="150px" title="${x.anime_title_eng} (${x.anime_title})" src="${x.anime_image_path.replace("/r/192x272", '').match(/.+(?=\?)/)[0]}"> \n`)
    })
    
    const replaceBetween = (source, start, end, replacement) => {
        const regex = new RegExp(`${start} .+ ${end}`);
      return source.replace(regex, `${start} ${replacement} ${end}`)
    }
    const replacements = [
        {start: patternstartgrid, end: patternendgrid, replacement:  `\n\n` + `<details>\n<summary align="left">AnimeList Watching</summary>`+ datarray.toString().replaceAll(',', '') + `</details>`},
        {start: patternstartlist, end: patternendlist, replacement: parseList(data, "Completed").toString().replaceAll(',', '')},
        {start: patternstartdefault, end: patternendefault, replacement: datarray.toString().replaceAll(',', '')},
    ];
    replacements.forEach(({start, end, replacement}) => {
        //if((newreadme.includes(start) && !newreadme.includes(end)) || (!newreadme.includes(start) && newreadme.includes(end))) return;
        newreadme = replaceBetween(newreadme, start, end, replacement)
    })
   /* //Some Dumb crap
    const replacements = [
        {start: patternstartgrid, end: patternendgrid, replacement:  `\n\n` + `<details>\n<summary align="left">AnimeList Watching</summary>`+ datarray.toString().replaceAll(',', '') + `</details>`},
        {start: patternstartlist, end: patternendlist, replacement: parseList(data, "Completed").toString().replaceAll(',', '')},
        {start: patternstartdefault, end: patternendefault, replacement: datarray.toString().replaceAll(',', '')},
    ];
    let arrayreadme;
    arrayreadme = newreadme.trimEnd().split('\n')
    replacements.forEach(({start, end, replacement}) => {
        console.log(arrayreadme.indexOf(start) + arrayreadme.indexOf(end))
    })
    */
   return newreadme
}