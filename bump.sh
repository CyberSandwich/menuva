#!/bin/sh
# Bump all ?v=N cache-busting versions across the site.
# Usage: ./bump.sh        (auto-increment)
#        ./bump.sh 12     (set to specific version)

old=$(grep -o '?v=[0-9]*' index.html | head -1 | sed 's/?v=//')
if [ -z "$old" ]; then echo "Could not detect current version"; exit 1; fi

if [ -n "$1" ]; then new=$1; else new=$((old + 1)); fi
if [ "$new" = "$old" ]; then echo "Already at v=$old"; exit 0; fi

# HTML files: ?v=N in href/src attributes
find . -name '*.html' -not -path './.git/*' -exec sed -i '' "s/?v=$old/?v=$new/g" {} +

# JS files: ?v=N in import paths, CV=N constant
sed -i '' "s/?v=$old/?v=$new/g" js/content.js
sed -i '' "s/var CV=$old;/var CV=$new;/" js/content.js

echo "Bumped v=$old -> v=$new"
