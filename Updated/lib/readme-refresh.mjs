import fetch from 'node-fetch';
const patternstart = "<!-- MAL_ACTIVITY:start -->"
const patternend = "<!-- MAL_ACTIVITY:end -->"
export async function upreadme(path,gh_token) {
    let fetchrepo = await (await fetch(`https://api.github.com/repos/${path}/git/trees/main`,{headers:{"Authorization":`token ${gh_token}`}})).json()
    if(!fetchrepo.tree.find(x => x.path === 'README.md')){
        throw new Error("No README.md found on this repo!.")
    }
    let readmes = await (await fetch(fetchrepo.tree.find(x => x.path === 'README.md').url,{headers:{"Authorization":`token ${gh_token}`}})).json()
    let decodebase64 = readmes.content
    decodebase64 = decodebase64.replace(/\s/g, '');
     return decodeURIComponent(Buffer.from(decodebase64, 'base64'))
}
export function append(readme,data){
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