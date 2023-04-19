import fetch from 'node-fetch'
import chalk from 'chalk'
//Github checker
export async function getreadme(path, gh_token, branch, filename) {
    let fetchrepo = await (await fetch(`https://api.github.com/repos/${path}/git/trees/${branch}`, {
        headers: {
            "Authorization": `token ${gh_token}`
        }
    })).json()
    if (fetchrepo.toString().toLowerCase() === "bad credentials") throw new Error("Invalid Github Token")
    if (!fetchrepo.tree.find(x => x.path === filename)) {
        throw new Error(chalk.red('[ERROR] ') + `No file with the file name ${filename} found on this repo!.`)
    }
    let readme = await (await fetch(fetchrepo.tree.find(x => x.path === filename).url, {
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
        if (x.status !== 200) throw new Error(chalk.red('[ERROR] ') + 'Server Error Occured, Error:', x.text());
        else return x.json()
    })
    returnedata.completed = await fetch(`https://myanimelist.net/animelist/${Username}/load.json?status=2`).catch(err => {
        throw new Error(err)
    }).then(x => {
        if (x.status !== 200) throw new Error(chalk.red('[ERROR] ') + 'Server Error Occured, Error:', x.text());
        else return x.json()
    })
    returnedata.ptw = await fetch(`https://myanimelist.net/animelist/${Username}/load.json?status=6`).catch(err => {
        throw new Error(err)
    }).then(x => {
        if (x.status !== 200) throw new Error(chalk.red('[ERROR] ') + 'Server Error Occured, Error:', x.text());
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
        returnedlist.push(`\n${activity} [${list[i].anime_title_eng}](https://myanimelist.net${list[i].video_url}) Episode ${list[i].num_watched_episodes} on (${formatDate(new Date(list[i].updated_at * 1000))})`)
    }
    return returnedlist.join("\n")
}function replaceBetweenStrings(originalString, startString, endString, replaceString) {
    const startIndex = originalString.indexOf(startString);
    if (startIndex === -1) {
      return originalString;
    }
    const endIndex = originalString.indexOf(endString, startIndex + startString.length);
    if (endIndex === -1) {
      return originalString;
    }
    return originalString.slice(0, startIndex + startString.length) + `\n ${replaceString} \n`+ originalString.slice(endIndex);
  }
export async function appendAnime(newreadme, data) {
    const typelist = [{type: "Watching", data: data.watching},{type:"Completed", data: data.completed}, {type: "Ptw", data: data.ptw}]
    typelist.forEach(({type, data}) =>{
        let patternstartgrid = `<!-- MAL_ANIME${type.toUpperCase()}:GRID -->`,
            patternendgrid = `<!-- MAL_ANIME${type.toUpperCase()}:GRID_END -->`,
            patternstartlist = `<!-- MAL_ANIME${type.toUpperCase()}:LIST -->`,
            patternendlist = `<!-- MAL_ANIME${type.toUpperCase()}:LIST_END -->`,
            patternstartdefault = `<!-- MAL_ANIME${type.toUpperCase()}:DEFAULT -->`,
            patternendefault = `<!-- MAL_ANIME${type.toUpperCase()}:DEFAULT_END -->`
        let gridata = []
        data.forEach(x => {
            gridata.push(`<img height="200px" width="150px" title="${x.anime_title_eng} (${x.anime_title})" src="${x.anime_image_path.replace("/r/192x272", '').match(/.+(?=\?)/)[0]}">`)
        })
        //replace new readme
        const replacements = [
            {start: patternstartgrid, end: patternendgrid, replacement:  `<details>\n<summary align="left">MyAnimeList ${type.toString().replace("Ptw", "Plan To Watch")}</summary>`+ gridata.toString().replaceAll(',', '') + `</details>`},
            {start: patternstartlist, end: patternendlist, replacement: parseList(data, type.replace("Ptw", "Plan To Watch")).toString().replaceAll(',', '')},
            {start: patternstartdefault, end: patternendefault, replacement: `<p float="left">\n${gridata.toString().replaceAll(',', '')}\n</p>`},
        ];
        replacements.forEach(({start, end, replacement}) => {
            newreadme = replaceBetweenStrings(newreadme, start, end, replacement)
        })
        return newreadme
    })
   return newreadme
}
