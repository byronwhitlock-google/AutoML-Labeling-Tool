#!/bin/bash

for i in {0..25000}
do
    echo $i
    echo "hello" > "junk_file_$(printf "%03d" "$i").txt"
done