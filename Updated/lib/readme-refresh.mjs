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
     return console.log( decodeURIComponent(Buffer.from(decodebase64, 'base64')))
}