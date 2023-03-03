# Application Name : Cloud Forensics Beta version
# Author: Prasad Purnaye, Vrushali Kulkarni
# Read the readme.txt for understanding of the application
# the application is intended for identifying attack in a private type-1 Cloud scenario that uses KVM and libvirt
# the web application is intended only for CSP, investigator
import datetime
import time
import pandas as pd
import numpy as np
import mysql.connector
import pickle
from sklearn.metrics import accuracy_score,confusion_matrix,classification_report
from sklearn.model_selection import KFold
from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

def getModelDetails(name):
	"""getModelDetails takes argument as filename.sav"""
	"""the method reads the filename.sav pickle and returns following information"""
	"""Accuracy, ConfusionMatrix, report and number_of_parameters"""
	try:
		with open(name, 'rb') as f:
		    y_pred = pickle.load(f)
		    y_test = pickle.load(f)
		    features = pickle.load(f)
		    clf = pickle.load(f)
		    Accuracy=accuracy_score(y_test,y_pred)
		    confusionMtx=confusion_matrix(y_test,y_pred).tolist()
		    report=classification_report(y_test,y_pred,output_dict=True)
		return Accuracy,confusionMtx,report,features
	except EnvironmentError	:
		return ("file exception","file exception","file exception","file exception")

def RetrainWith(features,splitPercentage):
	"""Train new model with features and splitPercentage of train-testing"""
	"""uses myTrainingDB"""
	import GetDatabases
	result,field_names=GetDatabases.SelectedFrom("myTrainingDB",features)
	df=pd.DataFrame(result,columns=field_names)
	X=df.drop(columns=['Status'],axis=1)  #features Attribute
	y=df.Status				#target Attribute
	X_train,X_test,y_train,y_test=train_test_split(X,y,train_size=splitPercentage)
	from sklearn.ensemble import RandomForestClassifier
	clf=RandomForestClassifier(max_depth=8,min_samples_split=4)
	clf.fit(X_train,y_train)
	y_pred=clf.predict(X_test)
	timestamp=datetime.datetime.now()
	filename = str(timestamp)+ '_RandomForest.sav'
	with open(filename, 'wb') as f:
		pickle.dump(y_pred, f)
		pickle.dump(y_test, f)
		pickle.dump(features,f)
		pickle.dump(clf, f)
	return ( (confusion_matrix(y_test,y_pred)),(accuracy_score(y_test,y_pred)),(classification_report(y_test,y_pred,output_dict=True)),filename )

def trainMyForest(splitPercentage):
	"""uses proposed Features on the TrainingDataset"""
	"""Train RandomForest with rxbytes, rxpackets, txbytes, txpackets, timecpu, timesys, timeusr, memlast_update, vdawr_reqs, vdawr_bytes, Status"""
	"""uses myTrainingDB"""
	mydb = mysql.connector.connect(  host="localhost", user="cloud", password="Shavak@@123", database="CloudForensic",auth_plugin="mysql_native_password")
	mycursor = mydb.cursor()
	sql= 'SELECT rxbytes, rxpackets, txbytes, txpackets, timecpu, timesys, timeusr, memlast_update, vdawr_reqs, vdawr_bytes, Status FROM myTrainingDB'
	features="rxbytes, rxpackets, txbytes, txpackets, timecpu, timesys, timeusr, memlast_update, vdawr_reqs, vdawr_bytes, Status"
	print(sql)
	mycursor.execute(sql)
	result = mycursor.fetchall();
	field_names = [i[0] for i in mycursor.description]
	df=pd.DataFrame(result,columns=field_names)
	print(df)
	X=df.drop(columns=['Status'],axis=1)  #features Attribute
	y=df.Status				#target Attribute
	X_train,X_test,y_train,y_test=train_test_split(X,y,train_size=splitPercentage)
	from sklearn.ensemble import RandomForestClassifier
	clf=RandomForestClassifier(max_depth=8,min_samples_split=4)
	clf.fit(X_train,y_train)
	y_pred=clf.predict(X_test)
	timestamp=datetime.datetime.now()
	filename = 'RandomForest.sav'
	with open(filename, 'wb') as f:
		pickle.dump(y_pred, f)
		pickle.dump(y_test, f)
		pickle.dump(features,f)
		pickle.dump(clf, f)
	return ( (confusion_matrix(y_test,y_pred)),(accuracy_score(y_test,y_pred)),(classification_report(y_test,y_pred,output_dict=True)) )

def EvidenceDetection(params):
	"""Test for Attack using classifier in ActiveModel"""
	ActModfile= open('ActiveModel','r')
	Model=ActModfile.read()
	Model=Model.replace("\n","")
	ActModfile.close()
	with open(Model, 'rb') as f:
		y_pred = pickle.load(f)
		y_test = pickle.load(f)
		features = pickle.load(f)
		clf = pickle.load(f)
	curState=[]
	stat=[]
	features=features.replace("`","")
	features=features.replace("'","")
	features=features.replace(" ","")
	featuresArray=features.split(",")
	featuresArray.pop()
	for i in featuresArray:			#only read features from the model for prediction
		stat.append(params[i])
	curState.append(stat)
	print(clf.predict(curState).all())
	print(int(time.time()))
	return clf.predict(curState).all()
