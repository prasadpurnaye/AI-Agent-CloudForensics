from crontab import CronTab
import os

username = input("Enter username : (press enter to keep default value as"+" "+ os.getlogin()+")\n")
if not username:
	username=os.getlogin()
else:
	username=username

pwd = str(input("Enter path of Application :( press enter to keep default value as  "+ os.getcwd()+")\n" ))
if not pwd:
	pwd=str(os.getcwd())
else:
	pwd=pwd

print(str(username))
print(str(pwd))
stringCommand="python3 "+pwd+"/MonitorKVM.py >/dev/null 2>&1"
my_cron = CronTab(user=username)
my_cron.remove(my_cron.find_comment('hypervisorCron'))
job = my_cron.new(command=stringCommand ,comment='hypervisorCron')
job.minute.every(1)
my_cron.write()

stringCommand="python3 "+pwd+"/CloudWatchMemory.py >/dev/null 2>&1"
my_cron = CronTab(user=username)
my_cron.remove(my_cron.find_comment('memoryCron'))
job = my_cron.new(command=stringCommand ,comment='memoryCron')
job.minute.every(30)
my_cron.write()

