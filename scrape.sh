#!/bin/sh
if [ -z $PHPSESSID ]; then
    echo "PHPSESSID Not Set"
    exit 1;
fi
if [ -z $ROSTER_DOMAIN ]; then
    echo "ROSTER_DOMAIN Not Set"
    exit 1;
fi

mkdir data;
echo "Fetching Day IDs"
node src/fetch-woids.js 2019-11-01 2024-05-11
echo "Scraping Data";
node src/scrape-day.js
echo "Outputting CSV";
node src/csv.js