# Application Name : Cloud Forensics Beta version
# Author: Prasad Purnaye, Vrushali Kulkarni
# Read the readme.txt for understanding of the application
# the application is intended for identifying attack in a private type-1 Cloud scenario that uses KVM and libvirt
# the web application is intended only for CSP,
from flask import jsonify,Flask,render_template,url_for,request,redirect, make_response,session, escape, request
import random
import json
import time
import MyCloud
import Asklearn
import MyRandomForest
import datetime
import GetDatabases
import ureka
import numpy as np
import GetDatabases
import os
import hashlib
import pandas as pd

app = Flask(__name__)
app.secret_key = "PrasadPurnaye"

####################LOGIN####################
@app.route('/login', methods = ['GET', 'POST'])
def login():
    error = None
    if request.method == 'POST':
        username=str(request.form['username'])
        databaseHash=GetDatabases.getPassword(username)
        generatedHash=hashlib.md5(str(request.form['password']).encode('utf-8')).hexdigest()
        if databaseHash==generatedHash:
            session['username']=username
            return redirect(url_for('main'))
        else:
            return redirect(url_for('login'))
    return render_template("login.html",error=error)

@app.route('/profile', methods =['GET','POST'])
def myProfile():
    result=GetDatabases.getInvestigatorInfo(session['username'])
    Libvirt=["localhost","null","null"]
    import MySQLconf as cfg
    MYSQL=[]
    MYSQL.append(cfg.mysql["host"])
    MYSQL.append(cfg.mysql["user"])
    MYSQL.append(cfg.mysql["password"])

    ActModfile= open("ActiveModel")
    ActMod = ActModfile.read().splitlines()
    ActModfile.close()

    ActDBfile= open("ActiveDB")
    ActiveDB = ActDBfile.read().splitlines()
    ActDBfile.close()
    return render_template("profile.html",Investigator=session['username'],data=result,MySQL=MYSQL,Libvirt=Libvirt,ACTIVE=ActMod[0],DATASET=ActiveDB[0])

@app.route('/logout')
def logout():
   session.pop('username', None)
   return redirect(url_for('login'))
####################ENDLOGIN####################
####################JSONIFY####################
@app.route('/_model<name>', methods= ['GET'])
def modelInfo(name):
    """jsonifyModelDetails"""
    """return Accuracy, ConfusionMatrix, report and number of parameters"""
    Accuracy,confusionMtx,report,params=MyRandomForest.getModelDetails(name)
    return jsonify(Accuracy=Accuracy, confusionMtx=confusionMtx, report=report,params=params)

@app.route('/_SmartMonitor<vmid>', methods= ['GET'])
def SmartMonitorInfo(vmid):
    """jsonifyMonitoring"""
    """input: vmid"""
    """Output: jsonify(parameter being monitored,Values,Status,CPU DISK NETWORK Activities)"""
    if MyCloud.isLive(vmid):
        Values,tagss=MyCloud.getSlope(int(vmid),4)
        params={}
        for i,j in zip(Values,tagss):
            params[j]=i
        status=MyRandomForest.EvidenceDetection(params)
        NET=(Values[0]+Values[1]+Values[2]+Values[3])/360
        CPU=(Values[4]+Values[5]+Values[6])/400
        DISK=(Values[7]+Values[8]+Values[9]+Values[10])/360
        data=MyCloud.getRunningVMs()
        tagss=tagss
        Values=Values
        status=status
        ACTIVE=vmid
        CPU=round(CPU/2,2)
        NET=round(NET/2,2)
        DISK=round(DISK/2,2)
        return jsonify(tagss=tagss, Values=Values, status=status,ACTIVE=ACTIVE,CPU=CPU,NET=NET,DISK=DISK)
    else:
        return jsonify(tagss=[""], Values=[""], status="",ACTIVE="",CPU=0,NET=0,DISK=0)
####################ENDJSONIFY####################
####################Dashboard####################
@app.route('/', methods=["GET", "POST"])
def main():
    if "username" in session:
        username= session["username"]
        """Dashboard Home: Loads Live Virtual Machines Running"""
        CPU=0
        NET=0
        DISK=0
        vmid="null"
        return render_template('Dash.html',Investigator=username,data=MyCloud.getRunningVMs(),ACTIVE=vmid,CPU=round(CPU/2,2),NET=round(NET/2,2),DISK=round(DISK/2,2))
    else:
        return render_template("login.html",error="error")

@app.route('/retrieve', methods=["GET", "POST"])
def retrieveInfo():
    if "username" in session:
        username= session["username"]
        """Dashboard retrieve: fetch and visualize activities at the virtual sources"""
        CPU=0
        NET=0
        DISK=0
        vmid=0
        vmid = int(request.form.get('vm_select'))
        Values,tagss=MyCloud.getSlope(vmid,4)
        params={}#generating Key value pair to pass to classifier
        for i,j in zip(Values,tagss):
        	params[j]=i
        status=MyRandomForest.EvidenceDetection(params)
        NET=(Values[0]+Values[1]+Values[2]+Values[3])/360
        CPU=(Values[4]+Values[5]+Values[6])/400
        DISK=(Values[7]+Values[8]+Values[9]+Values[10])/360
        return render_template('Dash.html',Investigator=username,data=MyCloud.getRunningVMs(),tagss=tagss,Values=Values,status=status,ACTIVE=vmid,CPU=round(CPU/2,2),NET=round(NET/2,2),DISK=round(DISK/2,2))
    else:
        return render_template("login.html",error="error")
####################ENDDashboard####################
####################Datasets####################
@app.route('/preloadedDataset', methods=("POST", "GET"))
def preloadedDatasetInfo():
    if "username" in session:
        username= session["username"]
        """MonitoringDatabase: fetchall from PreloadedTrainingDB"""
        """PreloadedTrainingDB is dataset provided by author on which the AI Agent Works"""
        data,field_values=GetDatabases.AllFrom("PreloadedTrainingDB")
        PageTitle="Preloaded Dataset"
        return render_template('MonitoringDatabase.html',Investigator=username,PageTitle=PageTitle,data=data, tableHeader=field_values)
    else:
        return render_template("login.html",error="error")

@app.route('/MonitoringDatabase', methods=("POST", "GET"))
def KVMInfo():
    if "username" in session:
        username= session["username"]
        """MonitoringDatabase: fetchall from HypervisorMonitoringDB"""
        """A Cronjob stores all the monitoring data in HypervisorMonitoringDB"""
        result,cols=GetDatabases.AllFrom("HypervisorMonitoringDB")
        PageTitle="Monitoring Dataset"
        return render_template('MonitoringDatabase.html',Investigator=username,PageTitle=PageTitle, data=result,tableHeader=cols, length=len(cols),length1=len(result) )
    else:
        return render_template("login.html",error="error")

@app.route('/TrainingDataset', methods=("POST", "GET"))
def TrainingDatasetInfo():
    if "username" in session:
        username= session["username"]
        """MonitoringDatabase: fetchall from myTrainingDB"""
        """myTrainingDB can be created from HypervisorMonitoringDB to customize for specific needs"""
        data,field_values=GetDatabases.AllFrom("myTrainingDB")
        PageTitle="Training Dataset"
        return render_template('MonitoringDatabase.html',Investigator=username,PageTitle=PageTitle,data=data, tableHeader=field_values )
    else:
        return render_template("login.html",error="error")
####################END Datasets####################
####################Evidence Classifier####################
@app.route('/ActiveClassifier',methods=("POST", "GET"))
def ActiveClassifierInfo():
    if "username" in session:
        username= session["username"]
        """Reads Active Classifer from file ActiveModel"""
        """Model stored in Active Classifier is used for realtime classification"""
        """Also facilitates to change the active model and retrain model with selctive parameters"""
        results,field_names=GetDatabases.AllFrom("myTrainingDB")
        df=pd.DataFrame(results,columns=field_names)
        ActModfile= open("ActiveModel")
        ActMod = ActModfile.read().splitlines()
        ActModfile.close()
        if ActMod=="":
            ActMod="NONE"
        SavModels=[]
        for file in os.listdir(os.getcwd()):
            if file.endswith(".sav") and file!=ActMod[0]:
                SavModels.append(file)
        a,b,c,d=MyRandomForest.getModelDetails(str(ActMod[0]))
        return render_template('ActiveClassifier.html',Investigator=username,SavModels=SavModels,ActiveModel=ActMod,data=df.drop(columns=['LAST_POLL','VMID','Status','index']),ActiveAccuracy=a,ActiveParams=d.split(","))
    else:
        return render_template("login.html",error="error")

@app.route('/SetClassifier',methods=("POST", "GET"))
def SetClassifierInfo():
    if "username" in session:
        username= session["username"]
        """Change the Active Classifer in the file ActiveModel and redirects to active classifier"""
        SavModels=[]
        for file in os.listdir(os.getcwd()):
        	if file.endswith(".sav"):
        		SavModels.append(file)
        NewSelectedModel=request.form['SelectedModel']
        ActModfile= open('ActiveModel','w+')
        ActModfile.write(NewSelectedModel)
        ActModfile.close()
        return redirect("/ActiveClassifier")
    else:
        return render_template("login.html",error="error")

@app.route('/ModifyClassifier',methods=("POST", "GET"))
def ModifyClassifierinfo():
    if "username" in session:
        username= session["username"]
        """Fetch features from myTrainingDB"""
        results,field_names=GetDatabases.AllFrom("myTrainingDB")
        df=pd.DataFrame(results,columns=field_names)
        return render_template('ModifyClassifier.html',Investigator=username,data=df.drop(columns=['Status','index']))
    else:
        return render_template("login.html",error="error")
@app.route('/Retrain',methods=("POST", "GET"))
def RetrainInfo():
    if "username" in session:
        username= session["username"]
        """Train Classifier with selected models and sav model"""
        """This model can be used to set as an active classifier"""
        ureka.CreateTrainingDBfrom("PreloadedTrainingDB")
        params=request.form.getlist("Array")
        params.append("Status")
        features=','.join("`{0}`".format(x) for x in params)
        splitPercentage=(request.form['accessValue'])
        sp=int(splitPercentage)/100
        import MyRandomForest
        confMatrix,AccuScore,Repo,filename= MyRandomForest.RetrainWith(features,sp)
        RepoParam=['Attack','Normal','macro avg','weighted avg']
        return render_template('Retrain.html',Investigator=username,AccuScore=AccuScore,confMatrix=confMatrix,Repo=Repo,RepoParam=RepoParam,filename=filename	)
    else:
        return render_template("login.html",error="error")

@app.route('/AutoSkLearn',methods=("POST", "GET"))
def AsklearnHomeInfo():
    if "username" in session:
        username= session["username"]
        """AutoSkLearn Library is used to suggest models with the given dataset"""
        """Reads from ShowModels file"""
        AutoSKLearnShowModels= open('ShowModels')
        Models=AutoSKLearnShowModels.read()
        AutoSKLearnShowModels.close()
        Models=Models.replace('[','')
        Models.replace(']','')
        Models.replace(',','\n')
        ModelLists=[]
        ModelLists=Models.split('(0')
        x=len(ModelLists)
        for i in range(0,x):
        	ModelLists[i]=ModelLists[i].split(',')
        return render_template('AsklearnHome.html',Investigator=username,SuggestedModels=ModelLists)
    else:
        return render_template("login.html",error="error")
@app.route('/RunSuggestions',methods=("POST", "GET"))
def RunSuggestionsInfo():
    if "username" in session:
        username= session["username"]
        """AutoSkLearn Library is used to run suggestion for given time"""
        """Save result to ShowModels file"""
        TrainTime=int(request.form['TrainTime'])
        AccuScore,Models=Asklearn.suggestModels(TrainTime)
        AutoSKLearnShowModels= open('ShowModels','w+')
        AutoSKLearnShowModels.write(Models)
        AutoSKLearnShowModels.close()
        Models=Models.replace('[','')
        Models.replace(']','')
        Models.replace(',','\n')
        ModelLists=[]
        ModelLists=Models.split('(0')
        x=len(ModelLists)
        for i in range(0,x):
        	ModelLists[i]=ModelLists[i].split(',')
        return render_template('AsklearnHome.html',Investigator=username, SuggestedModels=ModelLists)
    else:
        return render_template("login.html",error="error")
####################EndEvidence Classifier####################

####################MemoryEvidence####################
@app.route('/acquire',methods=("POST","GET"))
def acuqireInfo():
    if "username" in session:
        username= session["username"]
        """fetch Memory repository with links to the actual evidence files"""
        data,field_values=GetDatabases.SelectedFrom("memrepo","dom,LAST_POLL,dumppath")
        PageTitle="Memory Datasets"
        return render_template('Memory.html',Investigator=username,PageTitle=PageTitle,data=data, tableHeader=field_values )
    else:
        return render_template("login.html",error="error")
#	return render_template('Memory.html',data=data, tableHeader=field_values,PageTitle="Volatile Memory Repository")

@app.route('/volatile',methods=("POST","GET"))
def memdumpInfo():
    if "username" in session:
        username= session["username"]
        """fetch metadata details with blockchain"""
        dataValues,field_names=GetDatabases.AllFrom("mems")
        PageTitle="Memory Datasets"
        return render_template('MonitoringDatabase.html',Investigator=username,PageTitle=PageTitle,data=dataValues, tableHeader=field_names )
    else:
        return render_template("login.html",error="error")
@app.route('/MemoryAnalysis',methods=("POST","GET"))
def MemoryAnalysisInfo():
    if "username" in session:
        username= session["username"]
        """Dump Memory of specific VM and Anyalyze"""
        return render_template('MemoryAnalysis.html',Investigator=username,)
    else:
        return render_template("login.html",error="error")
####################ENDMemoryEvidence####################
####################Main Application Run####################
if __name__ == "__main__":
    app.run(debug=True,host="0.0.0.0")
    session.clear()
