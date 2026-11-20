"""Build the party deck from a local checkout of Sparkies01/Splash (requires Pillow)."""
import argparse
import hashlib
import json
import subprocess
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("source", type=Path)
args = parser.parse_args()
tree = subprocess.check_output(["git", "-C", args.source, "ls-tree", "-rz", "HEAD"])
records = []
for item in tree.decode().rstrip("\0").split("\0"):
    meta, path = item.split("\t", 1)
    if path.lower().endswith(".png"):
        hero, filename = path.split("/")
        records.append((hero, Path(filename).stem, path, meta.split()[-1]))

dest = ROOT / "public/assets/party/splash"
dest.mkdir(parents=True, exist_ok=True)
frequency = Counter(blob for _, _, _, blob in records)


def convert(record):
    hero, label, path, blob = record
    data = (args.source / path).read_bytes()
    header = f"blob {len(data)}\0".encode()
    if hashlib.sha1(header + data).hexdigest() != blob:
        raise ValueError(f"Source differs from Git: {path}")
    with Image.open(BytesIO(data)) as image:
        image = ImageOps.exif_transpose(image)
        image.thumbnail((640, 640), Image.Resampling.LANCZOS)
        image.save(dest / (blob + ".webp"), quality=79, method=4)
    return hero, label, blob


# Shared splashes only need to be encoded once.
unique = {record[3]: record for record in records}
with ThreadPoolExecutor(max_workers=4) as workers:
    list(workers.map(convert, unique.values()))

deck = {}
for hero, label, _, blob in records:
    deck.setdefault(hero, []).append([label, blob])
for cards in deck.values():
    reference = next((card[1] for card in cards if frequency[card[1]] == 1), None)
    for card in cards:
        if frequency[card[1]] > 1 and reference:
            card.append(reference)
(ROOT / "server/party-skins.json").write_text(json.dumps(deck, ensure_ascii=False, indent=2) + "\n")
print(f"{len(deck)} heroes, {len(records)} entries, {len(unique)} images")
