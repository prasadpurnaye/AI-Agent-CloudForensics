from __future__ import print_function
from multiprocessing import AuthenticationError
from flask import session
import sys, time
import libvirt
from xml.etree import ElementTree
import csv
import mysql.connector
import app


def DomainInformation(vmid, conn, mydb, mycursor, text):
    tuple_String = ""
    # 	tuple_String="\n"

    if conn == None:
        print("Failed to open connection to qemu:///system", file=sys.stderr)
        exit(1)

    dom = conn.lookupByID(vmid)
    if dom == None:
        print("Failed to find the domain " + dom.name(), file=sys.stderr)
        exit(1)
    tree = ElementTree.fromstring(dom.XMLDesc())
    iface = tree.find("devices/interface/target").get("dev")
    stats = dom.interfaceStats(iface)
    timestamp = round(time.time())
    tuple_String += str(timestamp) + ","  # LASTPOLL
    tuple_String += str(dom.ID()) + ","  # VMID
    tuple_String += dom.UUIDString() + ","  # UUID
    tuple_String += str(dom.name()) + ","  # dom
    tuple_String += str(stats[0]) + ","  # rxbytes
    tuple_String += str(stats[1]) + ","  # rxpackets
    # 	tuple_String +=str(stats[2])+','	#rxerrors
    # 	tuple_String +=str(stats[3])+','	#rxdrops
    tuple_String += str(stats[4]) + ","  # txbytes
    tuple_String += str(stats[5]) + ","  # txpackets
    # 	tuple_String +=str(stats[6])+','	#txerrors
    # 	tuple_String +=str(stats[7])+','	#txdrops
    stats = dom.getCPUStats(True)
    tuple_String += str(stats[0]["cpu_time"]) + ","  # cputime
    tuple_String += str(stats[0]["system_time"]) + ","  # systime
    tuple_String += str(stats[0]["user_time"]) + ","  # usertime
    state, maxmem, mem, cpus, cput = dom.info()
    # 	tuple_String +=str(state)+','			#cpustate
    # 	tuple_String +=str(maxmem)+',' 		#maxmem
    # 	tuple_String += str(mem)+','			#mem
    # 	tuple_String += str(cpus)+','			#cpus
    # 	tuple_String += str(cput)+','			#cputime

    stats = dom.memoryStats()
    # 	tuple_String +=str(stats['actual'])+','	#memActual
    # 	tuple_String +=str(stats['swap_in'])+','	#swap-in
    # 	tuple_String +=str(stats['swap_out'])+','	#swap-out
    tuple_String += str(stats["major_fault"]) + ","  # majorFault
    tuple_String += str(stats["minor_fault"]) + ","  # minorFault
    # 	tuple_String +=str(stats['unused'])+','	#memUnused
    # 	tuple_String +=str(stats['available'])+','	#memAvailable
    tuple_String += str(stats["usable"]) + ","  # memUsable
    tuple_String += str(stats["last_update"]) + ","  # memlastUpdate
    # 	tuple_String +=str(stats['rss'])+','		#memRss
    rd_req, rd_bytes, wr_req, wr_bytes, err = dom.blockStats("vda")
    tuple_String += str(rd_req) + ","  # vda_read_requests
    tuple_String += str(rd_bytes) + ","  # vda_read_bytes
    tuple_String += str(wr_req) + ","  # vda_write_requests
    tuple_String += str(wr_bytes) + ","  # vda_write_bytes
    # 	tuple_String +=str(err)+','		#vda_errors
    rd_req, rd_bytes, wr_req, wr_bytes, err = dom.blockStats("hda")
    tuple_String += str(rd_req) + ","  # vda_read_requests
    tuple_String += str(rd_bytes) + ","  # vda_read_bytes
    tuple_String += str(wr_req) + ","  # vda_write_requests
    tuple_String += str(wr_bytes) + ","  # vda_write_bytes
    # 	tuple_String +=str(err)		#vda_errors
    tuple_String += text
    sql = "INSERT INTO mems (LASTPOLL,VMID,UUID,dom,rxbytes,rxpackets,txbytes,txpackets,cputime,systime,usertime,majorFault,minorFault,memUsable,memlastUpdate,	vda_read_requests,vda_read_bytes,vda_write_requests,vda_write_bytes,hda_read_requests,hda_read_bytes,hda_write_requests,hda_write_bytes,status) VALUES(%s, %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,)"
    res = tuple(tuple_String.split(","))
    print(res)
    return res


# 	print(tuple_String)
# 	with open('databases1.csv', mode='a+',newline='') as csv_file:
# 		csv_file.write(tuple_String)
# 		csv_file.close()


def connect(data):
    conn = libvirt.open("qemu:///system")
    if conn == None:
        print("Failed to open connection to qemu:///system", file=sys.stderr)
        exit(1)
    domainIDs = conn.listDomainsID()
    if domainIDs == None:
        print("Failed to get a list of domain IDs", file=sys.stderr)
    if len(domainIDs) == 0:
        print("None")

    else:
        mydb = mysql.connector.connect(
            host="localhost",
            user="cloud",
            password="1234",
            database="proj",
            auth_plugin="mysql_native_password",
        )
        mycursor = mydb.cursor()

        for key in data:
            domainID = int(key[-1])
            text = data[key]
            res = DomainInformation(domainID, conn, mydb, mycursor, text)
            sql = "INSERT INTO mem (LASTPOLL,VMID,UUID,dom,rxbytes,rxpackets,txbytes,txpackets,cputime,systime,usertime,majorFault,minorFault,memUsable,memlastUpdate,	vda_read_requests,vda_read_bytes,vda_write_requests,vda_write_bytes,hda_read_requests,hda_read_bytes,hda_write_requests,hda_write_bytes,status) VALUES(%s, %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
            mycursor.execute(sql, res)
            time.sleep(3)

        mydb.commit()
        mycursor.close()
        mydb.close()

    conn.close()
    return "ok"

