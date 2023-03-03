import GetDatabases
import pandas as pd
import numpy
import mysql.connector
from sqlalchemy import create_engine

def write_to_SQL(data):
	engine = create_engine("mysql+pymysql://cloud:1234@localhost/proj"
                       .format(user="cloud",
                               pw="1234",
                               db="proj"))
	# Insert whole DataFrame into MySQL
	#data.columns=field_names
	data.reset_index(drop=True)
	data.to_sql('myTrainingDB', con = engine, if_exists = 'replace', chunksize = 1000)

def CreateTrainingDBfrom(table):
	result,tagss=GetDatabases.AllFrom(table)
	df=pd.DataFrame(result,columns=tagss)
	df=df.sort_values(["VMID","LAST_POLL"], ascending=[False, False])
	#########################dy#&#dx###############################
	#network
	df["rxbytes"]=df["rxbytes"]-df["rxbytes"].shift(-1)
	df["txbytes"]=df["txbytes"]-df["txbytes"].shift(-1)
	df["rxpackets"]=df["rxpackets"]-df["rxpackets"].shift(-1)
	df["txpackets"]=df["txpackets"]-df["txpackets"].shift(-1)
	#disk
	df["vdawr_reqs"]=df["vdawr_reqs"]-df["vdawr_reqs"].shift(-1)
	df["vdawr_bytes"]=df["vdawr_bytes"]-df["vdawr_bytes"].shift(-1)
	df["vdard_bytes"]=df["vdard_bytes"]-df["vdard_bytes"].shift(-1)
	df["vdard_req"]=df["vdard_req"]-df["vdard_req"].shift(-1)
	#cpu
	df["timesys"]=df["timesys"]-df["timesys"].shift(-1)
	df["timeusr"]=df["timeusr"]-df["timeusr"].shift(-1)
	df["timecpu"]=df["timecpu"]-df["timecpu"].shift(-1)
	df["delta_time"]=df["LAST_POLL"]-df["LAST_POLL"].shift(-1)
	#########################dy/dx#################################
	#network
	df["rxbytes"]=df["rxbytes"]/df["delta_time"]
	df["txbytes"]=df["txbytes"]/df["delta_time"]
	df["rxpackets"]=df["rxpackets"]/df["delta_time"]
	df["txpackets"]=df["txpackets"]/df["delta_time"]
	#disk
	df["vdawr_reqs"]=df["vdawr_reqs"]/df["delta_time"]
	df["vdawr_bytes"]=df["vdawr_bytes"]/df["delta_time"]
	df["vdard_bytes"]=df["vdard_bytes"]/df["delta_time"]
	df["vdard_req"]=df["vdard_req"]/df["delta_time"]
	#cpu
	df["timesys"]=df["timesys"]/1000000000
	df["timeusr"]=df["timeusr"]/1000000000
	df["timecpu"]=df["timecpu"]/1000000000
	##########################atan(dy/dx)x180/pi###############################
	#network
	df["rxbytes"]=numpy.arctan(df["rxbytes"])*180/numpy.pi
	df["txbytes"]=numpy.arctan(df["txbytes"])*180/numpy.pi
	df["rxpackets"]=numpy.arctan(df["rxpackets"])*180/numpy.pi
	df["txpackets"]=numpy.arctan(df["txpackets"])*180/numpy.pi
	#disk
	df["vdawr_reqs"]=numpy.arctan(df["vdawr_reqs"])*180/numpy.pi
	df["vdawr_bytes"]=numpy.arctan(df["vdawr_bytes"])*180/numpy.pi
	df["vdard_bytes"]=numpy.arctan(df["vdard_bytes"])*180/numpy.pi
	df["vdard_req"]=numpy.arctan(df["vdard_req"])*180/numpy.pi
	##########################select features###############################
	traindf=df[['LAST_POLL', 'VMID','rxbytes', 'rxpackets',  'txbytes', 'txpackets', 'timecpu', 'timesys', 'timeusr','vdard_req', 'vdard_bytes', 'vdawr_reqs', 'vdawr_bytes','Status']]
	##########################remove negatives###############################
	traindf.dropna
	traindf=traindf[traindf.select_dtypes(include=[numpy.number]).ge(0).all(1)]
	write_to_SQL(traindf)
