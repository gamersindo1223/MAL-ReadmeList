import fetch from 'node-fetch'

export async function fetchAnime(Username, Limit){
    let reqtype;
    if(!Type) throw new Error("No type?")
    switch(Type.toString().toLowerCase()){case"watching":reqtype =1;break;case"finished":reqtype=2;break;case"ptw":reqtype=3;break;case"dropped":reqtype=4;break;default:throw new Error("Invalid choice!")}
    const url = `https://myanimelist.net/animelist/${Username}/load.json?status=${Type}`
    const response = await fetch(url).catch(err => {throw new Error(`An ERROR OCCURED!, ` + err)})
    const animeList = await response.json();
    return animeList
}