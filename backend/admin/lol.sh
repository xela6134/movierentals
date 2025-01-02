#!/bin/dash

i=1
while [ "$i" -le 98 ]
do
    echo "$i," >> posters.csv
    i="$((i + 1))"
done
