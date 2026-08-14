#!/usr/bin/env bash
# Rebuild the mark assets from the watermark video. Requires ffmpeg, imagemagick, potrace.
#
#   public/mark.svg        traced outline, fill=currentColor  (static uses)
#   public/mark-frames.png 21-frame alpha sprite, 200px cells (draw-on animation)
#   lib/mark-svg.ts        the SVG's inner <g>, for inlining
#   lib/mark-grid.ts       binary grid sampled from the glyph
#
# The mark is a filled outline, not a uniform stroke: tracing the centreline
# would throw away the calligraphic weight variation. The draw-on animation
# therefore comes from the video's own frames rather than a stroke-dash.
set -euo pipefail
SRC="${1:-$HOME/messier-subtitle-tool/public/watermark/m-watermark.mp4}"
T=$(mktemp -d)

# outline trace from the final frame
ffmpeg -y -v error -i "$SRC" -vf "select=eq(n\,20),format=gray" -frames:v 1 "$T/last.png"
magick "$T/last.png" -threshold 22% -morphology Close Disk:1.5 -negate "$T/last.pbm"
potrace -s --flat -a 1.0 -O 0.35 -t 2 -o "$T/mark.svg" "$T/last.pbm"

# 21-frame alpha sprite for the draw-on animation
ffmpeg -y -v error -i "$SRC" -vf "format=gray,scale=200:200,tile=21x1" -frames:v 1 "$T/tile.png"
magick "$T/tile.png" -colorspace gray -alpha copy -channel RGB -fill white -colorize 100 \
  +channel -strip public/mark-frames.png

echo "traced -> $T/mark.svg ; sprite -> public/mark-frames.png"
echo "now re-run the python steps in git history to regenerate lib/mark-svg.ts and lib/mark-grid.ts"
