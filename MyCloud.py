# Application Name : Cloud Forensics Beta version
# Author: Prasad Purnaye, Vrushali Kulkarni
# Read the readme.txt for understanding of the application
# the application is intended for identifying attack in a private type-1 Cloud scenario that uses KVM and libvirt
# the web application is intended only for CSP, investigator
from __future__ import print_function
import csv
import sys, time
import libvirt
import mysql.connector
from xml.etree import ElementTree
import pickle
import numpy

def isLive(vmid):
	"""check if Virtual Machine of the given VMID in parameter is alive"""
	conn = libvirt.open('qemu:///system')
	try:
		dom=conn.lookupByID(int(vmid))
		return True
	except:
		return False

def getRunningVMs():
	"""Returns list of live Virtual Machines"""
	conn = libvirt.open('qemu:///system')
	if conn == None:
		err=""#"Failed to open connection to qemu:///system"
		return (err)
	else:
		domainIDs = conn.listDomainsID()
	if len(domainIDs) == 0:
		err= ""#"No VM is found to be Deployed"
		return ("")
	if domainIDs == None:
		err=""#"Failed to get a list of domain IDs"
		return ("")
	else:
		MyCloud=[]
		for domainID in domainIDs:
			dom = conn.lookupByID(domainID)
			CloudVM=[]
			CloudVM.append(str(dom.ID()))
			CloudVM.append(str(dom.name()))
			CloudVM.append(str(dom.UUIDString()))
			MyCloud.append(CloudVM)
		conn.close()
		return (MyCloud)
		
def getDeltaActivity(vmid):
	"""calculate the difference between the activities dt(i)-dt(i-1)"""
	conn = libvirt.open('qemu:///system')
	dom = conn.lookupByID(vmid)
	tree = ElementTree.fromstring(dom.XMLDesc())
	iface = tree.find('devices/interface/target').get('dev')
	stats = dom.interfaceStats(iface)
	timestamp = round(time.time())
	tuple_String=[]
	tuple_String.append((stats[0]))	#rxbytes
	tuple_String.append((stats[1]))	#rxpackets
	tuple_String.append((stats[4]))	#txbytes
	tuple_String.append((stats[5]))	#txpackets
	stats = dom.getCPUStats(True)
	tuple_String.append((stats[0]['cpu_time']))		#cputime
	tuple_String.append((stats[0]['system_time']))	#systime
	tuple_String.append((stats[0]['user_time']))	#usertime
	state, maxmem, mem, cpus, cput = dom.info()
	stats  = dom.memoryStats()
	tuple_String.append((stats['last_update']))	#memlastUpdate
	rd_req, rd_bytes, wr_req, wr_bytes, err = \
	dom.blockStats('vda')
	tuple_String.append((rd_req))	#vda_read_requests
	tuple_String.append((rd_bytes))	#vda_read_bytes
	tuple_String.append((wr_req))	#vda_write_requests
	tuple_String.append((wr_bytes))	#vda_write_bytes
	conn.close()
	return (tuple_String)

def getSlope(vmid,t):
	"""input: VMID and TIME INTERVAL t"""
	"""process: the angle of the delta change"""
	"""output: the rate of the activities and features"""
	old_data=getDeltaActivity(vmid)
	time.sleep(int(t))
	new_data=getDeltaActivity(vmid)
	dydt=[]
	dydt.append(numpy.arctan(   (new_data[0]-old_data[0]) / int(t) )*180/numpy.pi)#rxbytes
	dydt.append(numpy.arctan(   (new_data[1]-old_data[1]) / int(t) )*180/numpy.pi)#rxpackets
	dydt.append(numpy.arctan(   (new_data[2]-old_data[2]) / int(t) )*180/numpy.pi)#txbytes
	dydt.append(numpy.arctan(   (new_data[3]-old_data[3]) / int(t) )*180/numpy.pi)#txpackets
	newCPU=(new_data[4]-(new_data[5]+new_data[6]))
	oldCPU=(old_data[4]-(old_data[5]+old_data[6]))
	print(numpy.arctan(((newCPU-oldCPU))/int(t))*180/numpy.pi)
	dydt.append(   (new_data[4]-old_data[4]) / 1000000000)#cputime
	dydt.append(   (new_data[5]-old_data[5]) / 1000000000)#systime
	dydt.append(   (new_data[6]-old_data[6]) / 1000000000)#usertime
	dydt.append(numpy.arctan(   (new_data[4]-old_data[4]) / int(t) )*180/numpy.pi)#cputime
	dydt.append(numpy.arctan(   (new_data[5]-old_data[5]) / int(t) )*180/numpy.pi)#systime
	dydt.append(numpy.arctan(   (new_data[6]-old_data[6]) / int(t) )*180/numpy.pi)#usertime
	dydt.append(numpy.arctan(   (new_data[7]-old_data[7]) / int(t) )*180/numpy.pi)#vda_read_requests
	dydt.append(numpy.arctan(   (new_data[8]-old_data[8]) / int(t) )*180/numpy.pi)#vda_read_bytes
	dydt.append(numpy.arctan(   (new_data[9]-old_data[9]) / int(t) )*180/numpy.pi)#vda_write_requests
	dydt.append(numpy.arctan(   (new_data[10]-old_data[10]) / int(t) )*180/numpy.pi)#vda_write_bytes
	tagss=['rxbytes', 'rxpackets', 'txbytes', 'txpackets', 'timecpu', 'timesys', 'timeusr','vdard_reqs', 'vdard_bytes', 'vdawr_reqs', 'vdawr_bytes']
	return (dydt,tagss)
