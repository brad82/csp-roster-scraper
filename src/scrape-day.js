import { load } from 'cheerio';
import { readFileSync, writeFileSync } from 'node:fs';
import withAuthHeader from './hooks/withAuthHeader.js';

function calculateSeason(timestamp) {
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = date.getMonth()

    return [
        month > 6 ? year : year - 1,
        month < 6 ? year : year + 1
    ].join('/')
}
function parseSummaryTable($, row) {
    const metrics = {}
    const $row = $(row)

    // Summary Details
    $row.find('td:first-child tr').each((i, el) => {
        const [label, value] = [
            $(el).find('td:first-child').text(),
            $(el).find('td:last-child').text()
        ];
        metrics[label] = value;
    })


    // Roster Counts
    $row.find('#rosteredlist > div:not(.tooltipable) strong').each((i, el) => {
        const [label, value] = $(el).text().split(' - ');
        metrics[label] = parseInt(value);
    })

    for (const [key, value] of Object.entries(metrics)) {
        const cast = parseInt(value);
        if (isNaN(cast)) {
            continue;
        }
        metrics[key] = cast
    }

    return metrics
}

async function run(woid) {
    var request = await fetch(`https://${process.env.ROSTER_DOMAIN}/patroldaydetail.php?woid=${woid}`, withAuthHeader())

    const body = await request.text();
    const $ = load(body)

    const date = $('#patrolday > .detail .detail_row:first-of-type .details_display').text();
    const summaryTables = $('#patrolday > .detail > tbody > tr:not(.detail_row)');

    const parts = []
    summaryTables.each((i, el) => {
        const table = parseSummaryTable($, el);
        table['Date'] = date;
        parts.push(table);
    })

    return parts
}


const input = readFileSync('./data/woids.json');
const woids = JSON.parse(input.toString())
const summary = [];

for (var i = 0; i < woids.length; i++) {
    const [timestamp, woid] = woids[i];
    const results = await run(woid)

    if (results.length === 0) {
        continue;
    }

    console.log(timestamp, results.length, "Schedules Found");
    summary.push(
        ...results.map(result => ({
            Timestamp: timestamp,
            Season: calculateSeason(timestamp),
            ...result
        }))
    )

}

writeFileSync('./data/summary.json', JSON.stringify(summary))