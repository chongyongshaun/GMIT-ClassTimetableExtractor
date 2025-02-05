import { writeFileSync, existsSync, readFileSync } from 'fs';

export const COOKIE_FILE = 'cookies.json';

export async function saveCookies(page) {
    const cookies = await page.context().cookies();
    writeFileSync(COOKIE_FILE, JSON.stringify(cookies));
    console.log('Cookies saved.');
}

export async function loadCookies(page) {
    if (existsSync(COOKIE_FILE)) {
        const cookies = JSON.parse(readFileSync(COOKIE_FILE));
        await page.context().addCookies(cookies);
        console.log('Cookies loaded.');
    }
}
