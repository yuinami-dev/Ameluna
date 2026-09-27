"""Inline the jacket art into the teaser template -> polaris-drop.html (single-file artifact)."""
import base64, pathlib

here = pathlib.Path(__file__).parent
art = base64.b64encode((here / "assets/jacket.webp").read_bytes()).decode()
tpl = (here / "polaris-drop.template.html").read_text(encoding="utf-8")
(here / "polaris-drop.html").write_text(tpl.replace("__JACKET__", "data:image/webp;base64," + art), encoding="utf-8")
print("wrote polaris-drop.html")
