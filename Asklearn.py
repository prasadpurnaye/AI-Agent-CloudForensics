#AutoSK Learn model
from __future__ import print_function
import sys,tempfile,urllib,os
os.environ['OPENBLAS_NUM_THREADS'] = '1'
import pandas as pd
import numpy as np
import sklearn
import autosklearn.classification
import autosklearn.classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import mysql.connector
def suggestModels(DURATION):
	mydb = mysql.connector.connect(  host="localhost", user="cloud", password="Shavak@@123", database="cloud",auth_plugin="mysql_native_password")
	mycursor = mydb.cursor()
	features="`rxbytes`, `rxpackets`, `txbytes`, `txpackets`, `timecpu`, `timesys`, `timeusr`, `memlast_update`, `vdawr_reqs`, `vdawr_bytes`, `hdard_req`, `hdard_bytes`,'Status'"
	sql= 'SELECT '+features+' FROM preprocessed WHERE rxbytes>=0'
	mycursor.execute(sql)
	result = mycursor.fetchall();
	field_names = [i[0] for i in mycursor.description]
	df=pd.DataFrame(result,columns=field_names)
	df = df.dropna(axis=0)
	df=df[df.select_dtypes(include=[np.number]).ge(0).all(1)]  # remove negative values
	X=df.drop(columns=['Status'],axis=1)  #features Attribute
	y=df.Status				#target Attribute
	X_train,X_test,y_train,y_test=train_test_split(X,y,random_state=0)
	automl=autosklearn.classification.AutoSklearnClassifier(time_left_for_this_task=DURATION,per_run_time_limit=40)
	automl.fit(X_train,y_train)
	y_pred=automl.predict(X_test)
	score=accuracy_score(y_test,y_pred)
	print(score)
	return (score,	automl.show_models())

#os.environ['OPENBLAS_NUM_THREADS'] = '1'
#suggestModels()
