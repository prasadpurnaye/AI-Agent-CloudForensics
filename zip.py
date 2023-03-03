from ast import dump
from importlib.resources import path
import zipfile
import os
import shutil
import gzip
def unzipmem():
    path1="/home/revan/dump/"
    files=os.listdir(path1)
    os.chdir(path1)
    print(files)
    for file in files:
        if file.endswith('.gz'):
            with gzip.open(file, 'rb') as f_in:
                with open(file[:-3], 'wb') as f_out:
                    shutil.copyfileobj(f_in, f_out)

            
