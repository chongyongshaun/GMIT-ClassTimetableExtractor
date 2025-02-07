import { existsSync } from "fs";
import { chromium } from "playwright";
import { test, expect } from '@playwright/test';
import { COOKIE_FILE, saveCookies, loadCookies } from '../scripts/auth.js';

async function submitAttendance() {
    const browser = await chromium.launch({ headless: false }); // Set to false for first login
    const context = await browser.newContext();
    const page = await context.newPage();

    if (existsSync(COOKIE_FILE)) {
        await loadCookies(page);
    }

    try {
        await page.goto('https://vlegalwaymayo.atu.ie/');

        if (!existsSync(COOKIE_FILE)) {
            console.log('Please log in manually and wait for 60 seconds');
            await page.waitForTimeout(60000); // Allow time to log in manually
            await saveCookies(page);
        }
        // Check if logged in by verifying the title
        await expect(page).toHaveTitle(/Home/);
        await page.getByRole('link', { name: '24-25: 8896 -- DATABASE DEVELOPMENT' }).click();
        await page.getByRole('link', { name: 'Attendance Lectures and Labs' }).click();
        console.log("Arrived at the attendance page");

        // Check if the 'Submit attendance' link is available
        const submitIsVisible = await page.getByRole('link', { name: 'Submit attendance' }).isVisible();
        if (submitIsVisible) {
            // Logging the attendance
            await page.getByRole('link', { name: 'Submit attendance' }).click();
            await page.getByRole('radio', { name: 'Present' }).check();
            await page.getByRole('button', { name: 'Save changes' }).click();
            console.log("Attendance logged");
        } else {
            console.log("Submit attendance link is not available at this time.");
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await browser.close();
    }
}

submitAttendance();