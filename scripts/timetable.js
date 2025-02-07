// import { saveCookies, loadCookies, COOKIE_FILE } from "./auth.js";
import { test, expect, chromium } from '@playwright/test';
import { existsSync } from 'fs';

async function submitAttendance() {
    const browser = await chromium.launch({ headless: false }); // Set to false for first login
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        await page.goto('https://classtimetable.atugalwaymayo.ie/');
        //check for title
        await expect(page).toHaveTitle(/Timetables/);
        console.log("loaded the page properly");

        //select course for the uni in gmit: as an example software development y2
        await page.getByLabel('select entity').selectOption('241e4d36-93f2-4938-9e15-d4536fe3b2eb');
        await page.getByRole('textbox', { name: 'text search' }).click();
        //the search and enter are technically unnecessary but they are there to show how to use the search bar
        await page.getByRole('textbox', { name: 'text search' }).fill('software development');
        await page.getByRole('textbox', { name: 'text search' }).press('Enter');

        await page.getByRole('checkbox', { name: 'GA_KSOAG_H08 - BSc in Computing in Software Development Yr 2' }).check();
        await page.getByRole('button', { name: 'List' }).click();
        console.log("selected the course");

        // Wait for the timetable table body to load
        await page.waitForSelector('tbody.c-table__body');

        // Extract timetable data
        const timetableData = await page.$$eval('tr.c-table__tr-body.js-table-row', rows =>
            rows.map(row => {
                const module = row.querySelector('td:nth-child(2) span')?.textContent?.trim() || 'N/A';
                const description = row.querySelector('td:nth-child(3) span')?.textContent?.trim() || 'N/A';
                const day = row.querySelector('td:nth-child(5) span')?.textContent?.trim() || 'N/A';
                const time = row.querySelector('td:nth-child(6) span')?.textContent?.trim() || 'N/A';
                // Extract classType from description
                const classTypeMatch = description.match(/\/(T|P|L)$/);
                const classType = classTypeMatch ? (classTypeMatch[1] === 'T' ? 'Tutorial' : classTypeMatch[1] === 'P' ? 'Practical' : 'Lecture') : 'N/A';

                // Extract group from description
                const groupMatch = description.match(/\b(KSOFG\d|KCDMG\d) ([A-Z])\b/);
                const group = classType === 'Lecture' ? null : groupMatch ? groupMatch[2] : 'N/A';

                // Separate start and end time
                const [startTime, endTime] = time.split('-');

                return { module, description, day, classType, group, startTime, endTime };
            })
        );

        console.log('Extracted Timetable Data:', timetableData);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}
submitAttendance();
