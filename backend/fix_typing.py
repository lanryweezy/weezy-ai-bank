import os
import re

typing_names = ["Optional", "List", "Dict", "Any", "Union", "Tuple", "Type", "Sequence", "Iterable", "Mapping", "Callable"]

def fix_file(filepath):
    with open(filepath, "r") as f:
        content = f.read()

    # We want to find usages that are NOT in comments and NOT inside if __name__ == "__main__"
    # To simplify, we will just look at everything before "if __name__ == \"__main__\":"
    main_block_match = re.search(r"^if __name__ == .__main__.:", content, re.MULTILINE)
    if main_block_match:
        top_content = content[:main_block_match.start()]
    else:
        top_content = content

    clean_top_content = re.sub(r"#.*", "", top_content)

    missing = []
    for name in typing_names:
        if re.search(r"\b" + name + r"\b", clean_top_content):
            if not re.search(r"from typing import .*\b" + name + r"\b", top_content) and                not re.search(r"import typing", top_content) and                not re.search(r"\b" + name + r"\s*=", clean_top_content):
                missing.append(name)

    if not missing:
        return False

    lines = content.splitlines()
    import_line = f"from typing import {', '.join(sorted(missing))}"

    # Check if there is already a typing import at the top
    inserted = False
    for i, line in enumerate(lines):
        if main_block_match and i >= content[:main_block_match.start()].count("\n"):
            break
        if line.startswith("from typing import"):
            existing = re.search(r"from typing import (.*)", line).group(1)
            new_types = set(re.findall(r"\b\w+\b", existing)) | set(missing)
            lines[i] = f"from typing import {', '.join(sorted(list(new_types)))}"
            inserted = True
            break

    if not inserted:
        pos = 0
        for i, line in enumerate(lines):
            if line.strip() and not line.strip().startswith("#") and not line.strip().startswith("\"\"\""):
                pos = i
                break
        lines.insert(pos, import_line)

    with open(filepath, "w") as f:
        f.write("\n".join(lines) + "\n")
    return True

for root, dirs, files in os.walk("weezy_cbs"):
    for file in files:
        if file.endswith(".py"):
            filepath = os.path.join(root, file)
            if fix_file(filepath):
                print(f"Fixed {filepath}")
