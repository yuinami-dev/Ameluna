#!/usr/bin/env sh
# Cut the 15 s teaser clip from the full song "ポラリスドロップ".
#   sh audio/make-chorus.sh /path/to/polaris-drop.mp3
#
# The first chorus hits at 45.32 s (106 BPM). The clip starts 5.0 s earlier so that
# hit lands exactly when the falling star touches down in the animation (t = 5.0 s),
# with the pre-chorus build and its one-beat break leading into it.
# Fades line up with the visual loop: in over 0.8 s, out from 13.0 s to 15.0 s (the navy dip).
set -eu
SRC="${1:?usage: sh audio/make-chorus.sh <song.mp3>}"
HIT=45.32
LEAD=5.0
FFMPEG="${FFMPEG:-$(node -p "require('ffmpeg-static')" 2>/dev/null || echo ffmpeg)}"
START=$(python3 -c "print(round($HIT - $LEAD, 3))")
cd "$(dirname "$0")"
"$FFMPEG" -hide_banner -loglevel error -y -ss "$START" -t 15 -i "$SRC" \
  -af "afade=t=in:st=0:d=0.8,afade=t=out:st=13.0:d=2.0,volume=-1dB" \
  -ar 48000 -ac 2 -c:a libmp3lame -b:a 192k chorus.mp3
echo "wrote audio/chorus.mp3 (from ${START}s)"
