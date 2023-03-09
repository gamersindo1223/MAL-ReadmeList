module.exports = {
    readme,
    append
} 
import fetch from 'node-fetch';
const patternstart = "<!-- MAL_ACTIVITY:start -->"
const patternend = "<!-- MAL_ACTIVITY:end -->"

async function readme(path,gh_token) {
    let fetchrepo = await (await fetch(`https://api.github.com/repos/${path}/git/trees/main`,{headers:{"Authorization":`token ${gh_token}`}})).json()
    if(!fetchrepo.tree.find(x => x.path === 'README.md')){
        throw new Error("No README.md found on this repo!.")
    }
    let readme = await (await fetch(fetchrepo.tree.find(x => x.path === 'README.md').url,{headers:{"Authorization":`token ${gh_token}`}})).json()
    let decodebase64 = readme.content
    decodebase64 = decodebase64.replace(/\s/g, '');
    return decodeURIComponent(Buffer.from(decodebase64, 'base64'))
}

function append(readme,data){
    if(!readme.includes(patternstart)){
        throw new Error("No pattern start found")
    }
    if(!readme.includes(patternend)){
        throw new Error("No pattern end found")
    }
    let start = readme.indexOf(patternstart)
    let end = readme.indexOf(patternend)
    let newreadme = readme.substring(0,start+patternstart.length) + "\n\n" + data + "\n\n" + readme.substring(end,readme.length)
    return newreadme
}
function parseList(list,limit) {
    limit = parseInt(limit)
    list = list.slice(0, limit);

    let returnedlist = []

    for (let i = 0; i < list.length; i++) {
        let activity
        if(list[i].meta.type === "manga"){
            activity = "- 📖 Read"
        }else if (list[i].meta.type === "anime"){
            activity = "- 📺 Watched"
        }
        let parsedate = new Date(list[i].date)
        console.log(parsedate)
        let date = parsedate.getDate()
        let month = parsedate.getMonth() + 1
        let year = parsedate.getFullYear()
    
        returnedlist.push(`${activity} [${list[i].meta.name}](${list[i].meta.url}) ${list[i].meta.type === "manga" ? "Chapter" : "Episode"} ${list[i].increment} on (${date}/${month}/${year})`)
    }

    return returnedlist.join("\n")
}