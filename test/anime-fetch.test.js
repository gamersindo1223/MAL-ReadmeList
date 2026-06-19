import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { fetchWithRetry, parseList, parseMangaList, appendAnime, appendManga, formatDate } from '../lib/anime-fetch.js'

const anime = (o = {}) => ({
    video_url:            '/anime/123/test',
    anime_title_eng:      'Test Anime',
    anime_title:          'テストアニメ',
    num_watched_episodes: 5,
    anime_num_episodes:   12,
    anime_image_path:     'https://cdn.myanimelist.net/r/192x272/images/anime/1/123.jpg?s=abc',
    updated_at:           1700000000,
    score:                8,
    ...o
})

const manga = (o = {}) => ({
    manga_url:          '/manga/456/test',
    manga_title:        'Test Manga',
    num_read_chapters:  10,
    manga_num_chapters: 50,
    manga_image_path:   'https://cdn.myanimelist.net/r/192x272/images/manga/1/456.jpg?s=abc',
    score:              9,
    ...o
})

describe('formatDate', () => {
    test('returns a string with year', () => {
        assert.match(formatDate(new Date('2024-01-15T14:30:00Z')), /\d{4}/)
    })
})

describe('fetchWithRetry', () => {
    test('retries 502 responses with a 5-15 second backoff', async () => {
        const originalFetch = global.fetch
        const originalSetTimeout = global.setTimeout
        let attempts = 0
        const delays = []

        global.fetch = async () => {
            attempts += 1
            if (attempts < 3) {
                return {
                    ok: false,
                    status: 502,
                    text: async () => 'Bad Gateway'
                }
            }
            return {
                ok: true,
                status: 200,
                text: async () => 'ok'
            }
        }

        global.setTimeout = ((callback, delay) => {
            delays.push(delay)
            callback()
            return 0
        })

        try {
            const response = await fetchWithRetry('https://example.com')
            assert.strictEqual(response.status, 200)
            assert.strictEqual(attempts, 3)
            assert.ok(delays.length >= 2)
            assert.ok(delays.every(delay => delay >= 5000 && delay <= 15000))
        } finally {
            global.fetch = originalFetch
            global.setTimeout = originalSetTimeout
        }
    })
})

describe('parseList', () => {
    test('basic entry', () => {
        const r = parseList([anime()], 'Watching')
        assert.ok(r.includes('Test Anime'))
        assert.ok(r.includes('Episode 5'))
        assert.ok(r.includes('📺 Watching'))
    })

    test('skips non-anime without killing the loop', () => {
        const list = [
            anime({ video_url: '/manga/99/something' }),
            anime({ anime_title_eng: 'Should Appear' })
        ]
        const r = parseList(list, 'Watching')
        assert.ok(!r.includes('Test Anime'))
        assert.ok(r.includes('Should Appear'))
    })

    test('maxEntries', () => {
        const list = Array.from({ length: 10 }, (_, i) => anime({ anime_title_eng: `A${i}` }))
        const r    = parseList(list, 'Watching', { maxEntries: 3 })
        assert.strictEqual((r.match(/📺/g) || []).length, 3)
    })

    test('shows score', () => {
        assert.ok(parseList([anime({ score: 9 })], 'Watching', { showScore: true }).includes('⭐ 9'))
    })

    test('no score when showScore is false', () => {
        assert.ok(!parseList([anime({ score: 9 })], 'Watching').includes('⭐'))
    })

    test('no score when score is 0', () => {
        assert.ok(!parseList([anime({ score: 0 })], 'Watching', { showScore: true }).includes('⭐'))
    })

    test('empty list', () => {
        assert.strictEqual(parseList([], 'Watching'), '')
    })
})

describe('parseMangaList', () => {
    test('basic entry', () => {
        const r = parseMangaList([manga()], 'Reading')
        assert.ok(r.includes('Test Manga'))
        assert.ok(r.includes('Chapter 10'))
        assert.ok(r.includes('📖 Reading'))
    })

    test('maxEntries', () => {
        const list = Array.from({ length: 8 }, (_, i) => manga({ manga_title: `M${i}` }))
        assert.strictEqual((parseMangaList(list, 'Reading', { maxEntries: 2 }).match(/📖/g) || []).length, 2)
    })

    test('shows score', () => {
        assert.ok(parseMangaList([manga({ score: 9 })], 'Reading', { showScore: true }).includes('⭐ 9'))
    })
})

const mockAnime = {
    watching:  [anime()],
    completed: [anime({ anime_title_eng: 'Done' })],
    ptw:       [anime({ anime_title_eng: 'Later' })]
}

describe('appendAnime', () => {
    test('GRID', async () => {
        const r = await appendAnime('<!-- MAL_ANIMEWATCHING:GRID -->\n<!-- MAL_ANIMEWATCHING:GRID_END -->', mockAnime)
        assert.ok(r.includes('<details>') && r.includes('Test Anime'))
    })

    test('LIST', async () => {
        const r = await appendAnime('<!-- MAL_ANIMEWATCHING:LIST -->\n<!-- MAL_ANIMEWATCHING:LIST_END -->', mockAnime)
        assert.ok(r.includes('📺') && r.includes('Test Anime'))
    })

    test('DEFAULT', async () => {
        const r = await appendAnime('<!-- MAL_ANIMEWATCHING:DEFAULT -->\n<!-- MAL_ANIMEWATCHING:DEFAULT_END -->', mockAnime)
        assert.ok(r.includes('<p float="left">') && r.includes('<img'))
    })

    test('no markers = no change', async () => {
        const readme = '# My Profile'
        assert.strictEqual(await appendAnime(readme, mockAnime), readme)
    })

    test('maxEntries', async () => {
        const many = Array.from({ length: 10 }, (_, i) => anime({ anime_title_eng: `A${i}` }))
        const r    = await appendAnime('<!-- MAL_ANIMEWATCHING:LIST -->\n<!-- MAL_ANIMEWATCHING:LIST_END -->', { ...mockAnime, watching: many }, { maxEntries: 3 })
        assert.strictEqual((r.match(/📺/g) || []).length, 3)
    })
})

const mockManga = {
    reading:   [manga()],
    completed: [manga({ manga_title: 'Done' })],
    ptr:       [manga({ manga_title: 'Later' })]
}

describe('appendManga', () => {
    test('GRID', async () => {
        const r = await appendManga('<!-- MAL_MANGAREADING:GRID -->\n<!-- MAL_MANGAREADING:GRID_END -->', mockManga)
        assert.ok(r.includes('<details>') && r.includes('Test Manga'))
    })

    test('LIST', async () => {
        const r = await appendManga('<!-- MAL_MANGAREADING:LIST -->\n<!-- MAL_MANGAREADING:LIST_END -->', mockManga)
        assert.ok(r.includes('📖') && r.includes('Test Manga'))
    })

    test('updates the current README marker format for both anime and manga blocks', async () => {
        const readme = [
            '# Demo Profile',
            '',
            '<!-- MAL_ANIMEWATCHING:LIST -->',
            '<!-- MAL_ANIMEWATCHING:LIST_END -->',
            '',
            '<!-- MAL_ANIMECOMPLETED:DEFAULT -->',
            '<!-- MAL_ANIMECOMPLETED:DEFAULT_END -->',
            '',
            '<!-- MAL_MANGAREADING:GRID -->',
            '<!-- MAL_MANGAREADING:GRID_END -->'
        ].join('\n')

        const updated = await appendAnime(readme, mockAnime)
        const finalReadme = await appendManga(updated, mockManga)

        assert.ok(finalReadme.includes('📺'))
        assert.ok(finalReadme.includes('<details>') && finalReadme.includes('<p float="left">'))
        assert.ok(finalReadme.includes('Test Anime') && finalReadme.includes('Test Manga'))
    })
})
