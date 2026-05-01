import os
import re

def fix_file(filepath):
    with open(filepath, "r") as f:
        content = f.read()

    if "relationship" in content and "from sqlalchemy.orm import" not in content:
        lines = content.splitlines()
        pos = 0
        for i, line in enumerate(lines):
            if "from sqlalchemy import" in line:
                pos = i + 1
                break
        lines.insert(pos, "from sqlalchemy.orm import relationship")
        with open(filepath, "w") as f:
            f.write("\n".join(lines) + "\n")
        return True
    return False

fix_file("weezy_cbs/payments_integration_layer/models.py")
