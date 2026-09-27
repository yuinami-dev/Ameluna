"""Inline the illustration (and the song clip, if cut) into the template -> milky-melky.html.

milky-melky.html is gitignored: it can contain the unreleased song clip, and this repo is public.
"""
import base64, pathlib

here = pathlib.Path(__file__).parent
art = base64.b64encode((here / "assets/illust.webp").read_bytes()).decode()
clip = here / "audio/clip.mp3"
audio = base64.b64encode(clip.read_bytes()).decode() if clip.exists() else ""
tpl = (here / "milky-melky.template.html").read_text(encoding="utf-8")
html = tpl.replace("__ILLUST__", "data:image/webp;base64," + art).replace("__CLIP__", audio)
(here / "milky-melky.html").write_text(html, encoding="utf-8")
print("wrote milky-melky.html" + (" (with audio clip)" if audio else " (no audio: run audio/make-clip.sh first)"))
