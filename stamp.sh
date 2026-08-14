#!/bin/sh
# Stamp style.css and script.js with a hash of their contents, so a browser
# holding an old copy is forced to fetch the new one. Run after editing either
# file (or let the pre-commit hook run it for you — see README).
set -e
cd "$(dirname "$0")"

for f in style.css script.js; do
  if command -v md5 >/dev/null 2>&1; then
    h=$(md5 -q "$f")
  else
    h=$(md5sum "$f" | cut -d' ' -f1)
  fi
  h=$(printf %s "$h" | cut -c1-8)
  perl -pi -e "s/\Q$f\E\?v=[0-9a-f]*/$f?v=$h/g" index.html
  echo "$f?v=$h"
done
