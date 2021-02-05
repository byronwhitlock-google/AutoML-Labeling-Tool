#!/bin/bash
# quick script to convert pdf to text
# install pdftotext with
#
# sudo apt-get install poppler-utils
#    OR
# yum install poppler-utils
#    OR
# https://www.xpdfreader.com/download.html

PDFDIR=/Users/byronwhitlock/test/
OUTDIR=./out
BUCKET=byrons-bucket

mkdir -p $OUTDIR
for file in $PDFDIR/*.pdf
do
  pdftotext $file $OUTDIR/$file.txt
done

gsutil cp $OUTDIR/*.txt gs://$BUCKET