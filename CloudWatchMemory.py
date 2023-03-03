from __future__ import print_function
import sys, time
import libvirt
from xml.etree import ElementTree
import csv
import shutil
import gzip
import os
import hashlib
import mysql.connector
def dumpFileCreator(data):
    print(data)
    conn = libvirt.open('qemu:///system')
    # mydb = mysql.connector.connect(  host="localhost", user="cloud", password="Shavak@@123", database="cloud", auth_plugin='mysql_native_password')
    # mycursor = mydb.cursor()
    if conn == None:
        print('Failed to open connection to qemu:///system', file=sys.stderr)
        exit(1)
    for key in data:
        print(key)
        print("Started")
        dom=conn.lookupByID(int(key[-1]))
        flags = libvirt.VIR_DUMP_MEMORY_ONLY
        dumpformat = libvirt.VIR_DOMAIN_CORE_DUMP_FORMAT_RAW
        res=[]
        res.append(dom.name())
        fileCtime=time.time()
        path = "/home/revan/dump/"+str(int(key[-1]))+'_'+str(round(fileCtime))+'.mem'
        res.append(str(fileCtime))
        start_time = time.time()
        dom.coreDumpWithFormat(path, dumpformat, flags)	
       
        os.chmod(path,0o600)
        fileopen=open(path,'rb')
        hashValue=hashlib.sha256(fileopen.read()).hexdigest()
        res.append(hashValue)
        fileopen.close()
        print(hashValue)
        with open(path, 'rb') as f_in:
            with gzip.open(str(path)+'.gz', 'wb') as f_out:
                shutil.copyfileobj(f_in, f_out)
        os.remove(path)
        res.append(str(os.path.getctime(str(path)+'.gz')))
        res.append(str(os.path.getmtime(str(path)+'.gz')))
        res.append(str(os.path.getatime(str(path)+'.gz')))
        execution_time=(time.time() - start_time)
        res.append(str(execution_time))
        res.append(str(path)+'.gz')
        print("Execution Complete!"+path)
        sql = "INSERT INTO memrepo( dom, LAST_POLL, securehash,ctime,mtime,atime,creationtime,dumppath)  VALUES ( %s,%s,%s,%s,%s,%s,%s,%s)"
        # mycursor.execute(sql,res)
        # mydb.commit()
    conn.close()
    exit(0)


def dumpFile(vmid):
    conn = libvirt.open('qemu:///system')
  
    if conn == None:
        print('Failed to open connection to qemu:///system', file=sys.stderr)
        exit(1)
    print(key)
    print("Started")
    dom=conn.lookupByID(vmid)
    flags = libvirt.VIR_DUMP_MEMORY_ONLY
    dumpformat = libvirt.VIR_DOMAIN_CORE_DUMP_FORMAT_RAW
    res=[]
    res.append(dom.name())
    fileCtime=time.time()
    path = "/home/revan/dump/"+str(int(key[-1]))+'_'+str(round(fileCtime))+'.mem'
    res.append(str(fileCtime))
    start_time = time.time()
    dom.coreDumpWithFormat(path, dumpformat, flags)	
    conn.close()
    exit(0)
