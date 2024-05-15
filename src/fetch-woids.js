import { writeFileSync } from 'node:fs';
import withAuthHeader from './hooks/withAuthHeader.js';

async function run(date) {
    var dateString = date.toISOString().split('T')[0]
    var request = await fetch(`https://${process.env.ROSTER_DOMAIN}/calendaraction.php?uoid=1848&inm=b80fb95f27f206e34de3223e431582b5451e61e&dte=${dateString}&pge=roster.php&wht=6&tag=&val=`, withAuthHeader())

    const body = await request.text();

    const matches = /woid=([0-9]*)/g.exec(body)
    return matches && matches.length > 1 ? parseInt(matches[1].trim()) : -1
}

const [
    start,
    end
] = process.argv.splice(2)

var currentDate = new Date(start);
var endOfSeason = new Date(end);


const summary = []
do {
    const month = currentDate.getMonth();
    if ( month > 5 && month < 10) {
        console.warn(currentDate, 'Outside of Operating Season');
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
    }

    const woid = await run(currentDate)
    const result = [currentDate.toISOString(), woid]

    
    if (woid > -1) {
        console.log(currentDate, woid);
        summary.push(result);
    } else {
        console.warn(currentDate, 'No Schedule');
    }

    currentDate.setDate(currentDate.getDate() + 1);
} while(currentDate < endOfSeason)

writeFileSync('./data/woids.json', JSON.stringify(summary))
