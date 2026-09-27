#!/usr/bin/env sh
# Cut the 30 s clip for the Milky Melky motion piece from the full song.
#   sh audio/make-clip.sh /path/to/milky-melky.mp3
#
# 128 BPM (one bar = 1.875 s). The first chorus hits at 50.606 s. The clip starts 8 bars
# (15.0 s) earlier on the downbeat of the pre-chorus 「ひとりの時も」, so the chorus lands at
# exactly t = 15.0 s in the animation, when the falling drop hits.
# Fades: in over 0.12 s, out from 28.0 s to 30.0 s (the end card fades back to milk white).
set -eu
SRC="${1:?usage: sh audio/make-clip.sh <song.mp3>}"
HIT=50.606
LEAD=15.0
FFMPEG="${FFMPEG:-$(node -p "require('ffmpeg-static')" 2>/dev/null || echo ffmpeg)}"
START=$(python3 -c "print(round($HIT - $LEAD, 3))")
cd "$(dirname "$0")"
"$FFMPEG" -hide_banner -loglevel error -y -ss "$START" -t 30 -i "$SRC" \
  -af "afade=t=in:st=0:d=0.12,afade=t=out:st=28.0:d=2.0,volume=-1dB" \
  -ar 48000 -ac 2 -c:a libmp3lame -b:a 192k clip.mp3
echo "wrote audio/clip.mp3 (from ${START}s)"
