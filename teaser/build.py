"""Inline the jacket art (and the chorus clip, if cut) into the teaser template -> polaris-drop.html.

polaris-drop.html is gitignored: it can contain the unreleased song clip, and this repo is public.
"""
import base64, pathlib

here = pathlib.Path(__file__).parent
art = base64.b64encode((here / "assets/jacket.webp").read_bytes()).decode()
clip = here / "audio/chorus.mp3"
audio = base64.b64encode(clip.read_bytes()).decode() if clip.exists() else ""
tpl = (here / "polaris-drop.template.html").read_text(encoding="utf-8")
html = tpl.replace("__JACKET__", "data:image/webp;base64," + art).replace("__CHORUS__", audio)
(here / "polaris-drop.html").write_text(html, encoding="utf-8")
print("wrote polaris-drop.html" + (" (with chorus audio)" if audio else " (no audio: run audio/make-chorus.sh first)"))
