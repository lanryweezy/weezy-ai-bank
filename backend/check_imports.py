import os
import sys
import importlib.util

def check_file(filepath):
    module_name = filepath.replace("/", ".").replace(".py", "")
    if module_name.startswith("."):
        module_name = module_name[1:]

    try:
        spec = importlib.util.spec_from_file_location(module_name, filepath)
        if spec is None:
            return f"Could not load spec for {filepath}"
        module = importlib.util.module_from_spec(spec)
        # Add the parent directory of weezy_cbs to sys.path so absolute imports work
        sys.path.insert(0, os.path.abspath("."))
        spec.loader.exec_module(module)
        return None
    except Exception as e:
        return str(e)

for root, dirs, files in os.walk("weezy_cbs"):
    for file in files:
        if file.endswith(".py") and file != "__init__.py":
            filepath = os.path.join(root, file)
            err = check_file(filepath)
            if err:
                print(f"{filepath}: {err}")
