import fetch from 'node-fetch'
export async function getreadme(path,gh_token, branch) {
    let fetchrepo = await (await fetch(`https://api.github.com/repos/${path}/git/trees/${branch}`,{headers:{"Authorization":`token ${gh_token}`}})).json()
    if(fetchrepo.toString().toLowerCase() === "bad credentials") throw new Error("Invalid Github Token")
    if(!fetchrepo.tree.find(x => x.path === 'README.md')){
        throw new Error("No README.md found on this repo!.")
    }
    let readme = await (await fetch(fetchrepo.tree.find(x => x.path === 'README.md').url,{headers:{"Authorization":`token ${gh_token}`}})).json()
    let input = readme.content
    input = input.replace(/\s/g, '');
    return decodeURIComponent(Buffer.from(input, 'base64'))
}
export async function fetchAnime(Username){
    let returnedata = {}
    returnedata.watching = await fetch(`https://myanimelist.net/animelist/${Username}/load.json?status=1`).catch(err=>{throw new Error(err)}).then(x=>{if(x.status!==200) throw new Error('Server Error Occured');else return x.json()})
    returnedata.completed = await fetch(`https://myanimelist.net/animelist/${Username}/load.json?status=2`).catch(err=>{throw new Error(err)}).then(x=>{if(x.status!==200) throw new Error('Server Error Occured');else return x.json()})
    returnedata.ptw = await fetch(`https://myanimelist.net/animelist/${Username}/load.json?status=3`).catch(err=>{throw new Error(err)}).then(x=>{if(x.status!==200) throw new Error('Server Error Occured');else return x.json()})
    return returnedata
}
export async function appendAnimeWatching(readme,data){
    let patternstart = "<!-- MAL_ANIME_WATCHING:start -->"
    let patternend = "<!-- MAL_ANIME_WATCHING:end -->"
    let start = readme.indexOf(patternstart)
    let end = readme.indexOf(patternend)

    let datarray = []
data.forEach(x => {
        datarray.push(`<img height="200px" width="150px" title="${x.anime_title_eng} (${x.anime_title})" src="${x.anime_image_path.replace("/r/192x272", '').match(/.+(?=\?)/)[0]}">`)
    })
    let newreadme = readme.substring(0,start+patternstart.length) + "\n\n" + datarray.toString().replaceAll(',', '') + "\n\n" + readme.substring(end,readme.length)
    return newreadme
}
