# SilverSat Request

---

### Raspberry PI


#### Flash Raspberry PI
Install Raspberry PI Headless
Set up on network

#### Connect (edit, deploy, etc)
Connect computer to same network as RPI 
- username may jsut be defualt "pi"
- if you dont have access to router then try to figure out which ip the RPI is through "arp -a" in cmd

```diff

ssh username@ip

```

#### Transfer Folder
Move folder from computer to RPI user root directory

```diff

scp -r "FolderName" username@ip:~/

```


#### Run
"cd" to the directory and run the following

```diff

node index.js

```

You may need to install all node modules prior using "npm install" 