# AI-Agent-CloudForensics
The digital forensics process in a cloud environment poses challenges in all stages of a typical forensics investigation. 
Most cyber-attacks in a cloud environment leave their traces on cloud resources such as networks, memory, or disk. 
The data generated during such an incident can be potential evidence if it provides information to prove or disprove an incident in question. 
However, not all data generated in a cloud environment may be considered evidence. 
Therefore, it is essential to collect only relevant data related to the incident to save time and effort for the forensics analyst.

To address this issue, we propose this tool that monitors the virtual resource activities smartly. 
The tool quantifies the activity at each resource and predicts whether the data generated at a specific time instance is potential evidence. 
The tool uses the libvirt API to gather monitoring data and an AI agent to trigger the evidence collection based on the rate of activities at the virtual resource.

Moreover, the tool includes a new feature set for evidence classification, and it has an inbuilt Random Forest classifier programmed with extensive experimentation. While the end-user can always modify the parameters and train their own model with a retrain module.

Researchers and academicians will find this tool useful for studying cloud forensics in depth. It can also be useful to generate synthetic datasets, study the correlation of attacks on the resource activities, live memory forensics, and smart monitoring applications in a Private Cloud Platform supported by libvirt.


![Screenshot](https://github.com/prasadpurnaye/AI-Agent-CloudForensics/blob/main/Screenshots/Screenshot%20(10).png)?raw=true "Optional Title")
