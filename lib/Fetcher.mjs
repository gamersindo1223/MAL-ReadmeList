import fetch from 'node-fetch'

export async function fetchAnime(Username, limit){
    let rawdataWatching = await fetch(`https://myanimelist.net/animelist/${Username}/load.json?status=1`).catch(err=>{throw new Error(err)}).then(x=>{if(x.status!==200) throw new Error('Server Error Occured');else return x.json()})
    let rawdataCompleted = await fetch(`https://myanimelist.net/animelist/${Username}/load.json?status=2`).catch(err=>{throw new Error(err)}).then(x=>{if(x.status!==200) throw new Error('Server Error Occured');else return x.json()})
    let rawdataPTW = await fetch(`https://myanimelist.net/animelist/${Username}/load.json?status=3`).catch(err=>{throw new Error(err)}).then(x=>{if(x.status!==200) throw new Error('Server Error Occured');else return x.json()})
    let returnedata = {}
    returnedata.watching = rawdataWatching
    returnedata.completed = rawdataCompleted
    returnedata.ptw = rawdataPTW
    return returnedata
}
