import { readFileSync, writeFileSync } from "fs";

const input = readFileSync('./data/summary.json');
const inputObject = JSON.parse(input.toString())

const headers = [...inputObject.reduce((collector, current) => {
    const row = Object.keys(current)
    if(row.length === 0) {
        return collector
    }

    return new Set([
        ...collector.values(),
        ...row
    ])
}, new Set())].filter(header => [
    'Everyone is available',
    'Rostered',
    'Min Required'
].indexOf(header) === -1)

console.log(headers);

const csv = [[...headers].join(',')]
const exclude = [
    'Everyone is available',
    'Rostered',
    'Min Required'
]
for(var i = 0; i < inputObject.length; i++) {
    const day = inputObject[i];
    const row = [];

    for(var j = 0; j < headers.length; j++) {
        row.push((headers[j] in day) ? `"${day[headers[j]]}"` : '')
    }

    csv.push(row)
}

writeFileSync('data/summary.csv', csv.join('\n'))
