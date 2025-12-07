import sys
import pathlib

tasks_path = pathlib.Path(sys.argv[1])
keys_path = pathlib.Path("story_keys.txt")

pairs = {}
for line in keys_path.read_text().splitlines():
    if "|||" in line:
        task, key = line.split("|||")
        pairs[task] = key

lines = tasks_path.read_text().splitlines()
out = []

for line in lines:
    if line.startswith("- "):
        task = line[2:].strip()
        if task in pairs and pairs[task] not in line:
            out.append(f"- {task} ({pairs[task]})")
        else:
            out.append(line)
    else:
        out.append(line)

tasks_path.write_text("\n".join(out) + "\n")
