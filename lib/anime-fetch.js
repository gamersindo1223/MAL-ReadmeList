import chalk from 'chalk'

export async function fetchWithRetry(url, options = {}, retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const res = await fetch(url, options)
            if (!res.ok) {
                const body = await res.text()
                if (res.status === 502 && attempt < retries) {
                    const delay = 5000 + Math.floor(Math.random() * 10001)
                    console.warn(
                        chalk.yellow('[WARN]') +
                        ` attempt ${attempt} got 502, retrying in ${delay}ms`
                    )
                    await new Promise(resolve => setTimeout(resolve, delay))
                    continue
                }
                throw new Error(`HTTP ${res.status}: ${body}`)
            }
            return res
        } catch (err) {
            if (attempt === retries) throw err
            if (err.message?.startsWith('HTTP 502')) {
                const delay = 5000 + Math.floor(Math.random() * 10001)
                console.warn(
                    chalk.yellow('[WARN]') +
                    ` attempt ${attempt} failed with 502, retrying in ${delay}ms`
                )
                await new Promise(resolve => setTimeout(resolve, delay))
                continue
            }
            const delay = 1000 * Math.pow(2, attempt - 1)
            console.warn(chalk.yellow('[WARN]') + ` attempt ${attempt} failed, retrying in ${delay}ms`)
            await new Promise(resolve => setTimeout(resolve, delay))
        }
    }
}

export async function getReadme(path, gh_token, branch, filename) {
    const tree = await (await fetchWithRetry(
        `https://api.github.com/repos/${path}/git/trees/${branch}`,
        { headers: { Authorization: `token ${gh_token}` } }
    )).json()

    if (tree.message?.toLowerCase().includes('bad credentials'))
        throw new Error('Invalid GitHub token')

    const entry = tree.tree.find(x => x.path === filename)
    if (!entry) throw new Error(`"${filename}" not found in ${path}@${branch}`)

    const blob = await (await fetchWithRetry(entry.url, {
        headers: { Authorization: `token ${gh_token}` }
    })).json()

    const raw   = atob(blob.content)
    const bytes = new Uint8Array(raw.length)
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i)
    return new TextDecoder().decode(bytes)
}

// keep old name working
export const getreadme = getReadme

export function formatDate(date) {
    const MMM  = date.toLocaleString('en-US', { month: 'short' })
    const D    = date.getDate()
    const hh   = date.toLocaleString('en-US', { hour12: true, hour: '2-digit' }).slice(0, -3)
    const mm   = date.getMinutes().toString().padStart(2, '0')
    const A    = date.getHours() < 12 ? 'AM' : 'PM'
    return `${MMM} ${D}, ${hh}:${mm} ${A}, ${date.getFullYear()}`
}

async function fetchList(listType, username, status) {
    return (await fetchWithRetry(
        `https://myanimelist.net/${listType}/${username}/load.json?status=${status}`
    )).json()
}

export async function fetchAnime(username) {
    const [watching, completed, ptw] = await Promise.all([
        fetchList('animelist', username, 1),
        fetchList('animelist', username, 2),
        fetchList('animelist', username, 6)
    ])
    return { watching, completed, ptw }
}

export async function fetchManga(username) {
    const [reading, completed, ptr] = await Promise.all([
        fetchList('mangalist', username, 1),
        fetchList('mangalist', username, 2),
        fetchList('mangalist', username, 6)
    ])
    return { reading, completed, ptr }
}

export function parseList(list, type, options = {}) {
    const { maxEntries = 0, showScore = false } = options
    const rows = []
    for (const item of list) {
        if (maxEntries > 0 && rows.length >= maxEntries) break
        if (!item.video_url.includes('anime')) continue
        const score = showScore && item.score ? ` ⭐ ${item.score}` : ''
        rows.push(
            `\n- 📺 ${type || '?'} [${item.anime_title_eng}]` +
            `(https://myanimelist.net${item.video_url})` +
            ` Episode ${item.num_watched_episodes} on (${formatDate(new Date(item.updated_at * 1000))})${score}`
        )
    }
    return rows.join('\n')
}

export function parseMangaList(list, type, options = {}) {
    const { maxEntries = 0, showScore = false } = options
    const rows = []
    for (const item of list) {
        if (maxEntries > 0 && rows.length >= maxEntries) break
        const score = showScore && item.score ? ` ⭐ ${item.score}` : ''
        rows.push(
            `\n- 📖 ${type || '?'} [${item.manga_title}]` +
            `(https://myanimelist.net${item.manga_url})` +
            ` Chapter ${item.num_read_chapters || 0}${score}`
        )
    }
    return rows.join('\n')
}

function replaceBetween(str, start, end, content) {
    const si = str.indexOf(start)
    if (si === -1) return str
    const ei = str.indexOf(end, si + start.length)
    if (ei === -1) return str
    return str.slice(0, si + start.length) + `\n ${content} \n` + str.slice(ei)
}

function imgTags(entries, maxEntries, showScore, titleFn) {
    const limited = maxEntries > 0 ? entries.slice(0, maxEntries) : entries
    return limited.map(x => {
        const score = showScore && x.score ? ` • ⭐ ${x.score}` : ''
        const src   = (x.anime_image_path || x.manga_image_path || '')
            .replace('/r/192x272', '').match(/.+(?=\?)/)?.[0] ?? ''
        return `<img height="200px" width="150px" title="${titleFn(x)}${score}" src="${src}">`
    }).join('')
}

export async function appendAnime(readme, data, options = {}) {
    const { maxEntries = 0, showScore = false } = options
    const sections = [
        { key: 'WATCHING',  entries: data.watching,  label: 'Watching' },
        { key: 'COMPLETED', entries: data.completed, label: 'Completed' },
        { key: 'PTW',       entries: data.ptw,       label: 'Plan To Watch' }
    ]
    for (const { key, entries, label } of sections) {
        const imgs = imgTags(entries, maxEntries, showScore, x =>
            `${x.anime_title_eng} (${x.anime_title}) • Eps (${x.num_watched_episodes || 0}/${x.anime_num_episodes || 0})`
        )
        readme = replaceBetween(readme, `<!-- MAL_ANIME${key}:GRID -->`,    `<!-- MAL_ANIME${key}:GRID_END -->`,    `<details>\n<summary align="left">MyAnimeList ${label}</summary>${imgs}</details>`)
        readme = replaceBetween(readme, `<!-- MAL_ANIME${key}:LIST -->`,    `<!-- MAL_ANIME${key}:LIST_END -->`,    parseList(entries, label, { maxEntries, showScore }))
        readme = replaceBetween(readme, `<!-- MAL_ANIME${key}:DEFAULT -->`, `<!-- MAL_ANIME${key}:DEFAULT_END -->`, `<p float="left">\n${imgs}\n</p>`)
    }
    return readme
}

export async function appendManga(readme, data, options = {}) {
    const { maxEntries = 0, showScore = false } = options
    const sections = [
        { key: 'READING',   entries: data.reading,   label: 'Reading' },
        { key: 'COMPLETED', entries: data.completed, label: 'Completed' },
        { key: 'PTR',       entries: data.ptr,       label: 'Plan To Read' }
    ]
    for (const { key, entries, label } of sections) {
        const imgs = imgTags(entries, maxEntries, showScore, x =>
            `${x.manga_title} • Ch (${x.num_read_chapters || 0}/${x.manga_num_chapters || 0})`
        )
        readme = replaceBetween(readme, `<!-- MAL_MANGA${key}:GRID -->`,    `<!-- MAL_MANGA${key}:GRID_END -->`,    `<details>\n<summary align="left">MyMangaList ${label}</summary>${imgs}</details>`)
        readme = replaceBetween(readme, `<!-- MAL_MANGA${key}:LIST -->`,    `<!-- MAL_MANGA${key}:LIST_END -->`,    parseMangaList(entries, label, { maxEntries, showScore }))
        readme = replaceBetween(readme, `<!-- MAL_MANGA${key}:DEFAULT -->`, `<!-- MAL_MANGA${key}:DEFAULT_END -->`, `<p float="left">\n${imgs}\n</p>`)
    }
    return readme
}
