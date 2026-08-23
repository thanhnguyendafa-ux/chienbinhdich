#!/usr/bin/env python3
import os
from pathlib import Path

def find_font(candidates):
    for p in candidates:
        if os.path.exists(p):
            return p
    return None

source=Path(__file__).with_name('renderWorkbookPdfs.py')
ns={'__name__':'__main__','__file__':str(source),'find_font':find_font}
exec(compile(source.read_text(encoding='utf-8'),str(source),'exec'),ns)
