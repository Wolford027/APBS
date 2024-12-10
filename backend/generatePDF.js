import puppeteer from "puppeteer";

async function generatePDF(url, outputfile) {
    try {
        const browser = await puppeteer.launch({headless: true});
        const page = await browser.newPage();

        await page.goto(url);

        await page.pdf({path:outputfile, format: 'A4'});

        await browser.close();

    } catch(err) {
        console.log(err)
    }
}

const url = 'http://localhost:3000/PayslipFormat';
const outputfile = 'payslip.pdf';

generatePDF(url, outputfile);