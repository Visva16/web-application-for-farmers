import os
import sys
from typing import List, Set, Optional
import fnmatch

def parse_exclusion_file(file_path: str) -> Set[str]:
    patterns = set()
    if file_path and os.path.exists(file_path):
        with open(file_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    patterns.add(line)
    return patterns

def is_excluded(path: str, exclusion_patterns: Set[str]) -> bool:
    # Check if any part of the path is a directory named 'node_modules'
    parts = path.split(os.sep)
    if 'node_modules' in parts:
        return True
    # Check against other exclusion patterns
    for pattern in exclusion_patterns:
        if fnmatch.fnmatch(path, pattern):
            return True
    return False

def print_directory_structure(start_path: str, exclusion_patterns: Set[str]) -> str:
    def _generate_tree(dir_path: str, prefix: str = '') -> List[str]:
        entries = os.listdir(dir_path)
        entries = sorted(entries, key=lambda x: (not os.path.isdir(os.path.join(dir_path, x)), x.lower()))
        tree = []
        for i, entry in enumerate(entries):
            full_path = os.path.join(dir_path, entry)
            rel_path = os.path.relpath(full_path, start_path)
            if is_excluded(rel_path, exclusion_patterns):
                continue
            connector = '└── ' if i == len(entries) - 1 else '├── '
            tree.append(f"{prefix}{connector}{entry}")
            if os.path.isdir(full_path):
                tree.extend(_generate_tree(full_path, prefix + ('    ' if i == len(entries) - 1 else '│   ')))
        return tree

    tree = ['/ '] + _generate_tree(start_path)
    return '\n'.join(tree)

def scan_folder(start_path: str, file_types: Optional[List[str]], output_file: str, exclusion_patterns: Set[str]) -> None:
    with open(output_file, 'w', encoding='utf-8') as out_file:
        out_file.write("Directory Structure:\n")
        out_file.write("-------------------\n")
        out_file.write(print_directory_structure(start_path, exclusion_patterns))
        out_file.write("\n\nFile Contents:\n--------------\n")

        for root, dirs, files in os.walk(start_path):
            # Modify dirs in-place to prevent walking into excluded directories
            dirs[:] = [d for d in dirs if not is_excluded(os.path.relpath(os.path.join(root, d), start_path), exclusion_patterns)]
            rel_path = os.path.relpath(root, start_path)
            if is_excluded(rel_path, exclusion_patterns):
                continue
            for file in files:
                file_rel_path = os.path.join(rel_path, file)
                if is_excluded(file_rel_path, exclusion_patterns):
                    continue
                if file_types is None or any(file.endswith(ext) for ext in file_types):
                    file_path = os.path.join(root, file)
                    out_file.write(f"File: {file_rel_path}\n{'-' * 50}\n")
                    try:
                        with open(file_path, 'r', encoding='utf-8') as in_file:
                            out_file.write(in_file.read())
                    except Exception as e:
                        out_file.write(f"Error reading file: {e}\n")
                    out_file.write("\n\n")

if __name__ == "__main__":
    start_path = "/Users/kartheekreddy/Downloads/pythagora-core-backup-1-3-3-b76198b2 /pythagora-core/workspace/major-project-2"
    output_file = "/Users/kartheekreddy/Downloads/pythagora-core-backup-1-3-3-b76198b2 /pythagora-core/workspace/major-project-2/OUTPUT.txt"
    exclusion_file = ".gitignore"
    file_types = ['.py', '.js', '.tsx']
    exclusion_patterns = parse_exclusion_file(exclusion_file)
    scan_folder(start_path, file_types, output_file, exclusion_patterns)
    print(f"Content dumped to {output_file}")