# Application Name : Cloud Forensics Beta version
# Author: Prasad Purnaye, Vrushali Kulkarni
# Read the readme.txt for understanding of the application
# the application is intended for identifying attack in a private type-1 Cloud scenario that uses KVM and libvirt
# the web application is intended only for CSP, investigator
import mysql.connector
from sqlalchemy import create_engine
import pandas as pd
import numpy as np
import MySQLconf as cfg

def getInvestigatorInfo(username):
    mydb = mysql.connector.connect(  host=cfg.mysql["host"], user=cfg.mysql["user"], password=cfg.mysql["password"], database=cfg.mysql["database"],auth_plugin=cfg.mysql["auth_plugin"])
    mycursor = mydb.cursor()
    print(username)
    sql= "SELECT investigatorID,Name,email FROM `investigators` WHERE email='"+username+"'"
    try:
        mycursor.execute(sql)
        result = mycursor.fetchone();
        mycursor.close()
        return result
    except:
        return "-1"

def getPassword(username):
    mydb = mysql.connector.connect(  host=cfg.mysql["host"], user=cfg.mysql["user"], password=cfg.mysql["password"], database=cfg.mysql["database"],auth_plugin=cfg.mysql["auth_plugin"])
    mycursor = mydb.cursor()
    print(username)
    sql= "SELECT password FROM `investigators` WHERE email='"+username+"'"
    try:
        mycursor.execute(sql)
        result = mycursor.fetchone();
        mycursor.close()
        return result[0]
    except:
        return "-1"

def AllFrom(table):
    """fetch all results from parameter table"""
    # mydb = mysql.connector.connect(  host=cfg.mysql["host"], user=cfg.mysql["user"], password=cfg.mysql["password"], database=cfg.mysql["database"],auth_plugin=cfg.mysql["auth_plugin"])
    mydb = mysql.connector.connect(  host="localhost", user="cloud", password=cfg.mysql["password"], database="proj",auth_plugin=cfg.mysql["auth_plugin"],port="3306")
    mycursor = mydb.cursor()
    sql= 'SELECT * FROM '+table
    mycursor.execute(sql)
    result = mycursor.fetchall();
    field_names = [i[0] for i in mycursor.description]
    return (result,field_names)

def SelectedFrom(table,params):
    """fetch all results for specified params from table"""
    mydb = mysql.connector.connect(  host="localhost", user="cloud", password="1234", database="proj",auth_plugin="mysql_native_password")
    mycursor = mydb.cursor()
    sql= 'SELECT '+str(params)+' FROM '+str(table)
    mycursor.execute(sql)
    result = mycursor.fetchall();
    field_names = [i[0] for i in mycursor.description]
    return (result,field_names)

def TagTrainingDataset(vmid,Start,End,Status,database):
    """Tag HypervisorMonitoringDB with attack sample"""
    """Tag records with LAST_POLL between Start and End with Status for vmid in database"""
    mydb = mysql.connector.connect(  host="localhost", user="cloud", password="Shavak@@123", database="CloudForensic",auth_plugin="mysql_native_password")
    mycursor = mydb.cursor()
    sql= 'UPDATE HypervisorMonitoring SET Status="' +Status+'" WHERE (LAST_POLL BETWEEN ' +str(Start)+' AND '+str(End)+') AND VMID=' + str(vmid)
    print(sql)
    mycursor.execute(sql)
    mydb.commit()
    res=str(mycursor.rowcount) +" record(s) affected"
    if(mycursor.rowcount==0):
    	return (0,["0","0"],["0","0"])
    sql= 'SELECT * FROM HypervisorMonitoring WHERE (LAST_POLL BETWEEN ' +str(Start)+' AND '+str(End)+') AND VMID=' + str(vmid)
    mycursor.execute(sql)
    result = mycursor.fetchall();
    field_names = [i[0] for i in mycursor.description]
    return (res,result,field_names)
