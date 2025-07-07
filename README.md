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

#### Setting up continous boot

Open Terminal on your Pi.

Navigate to your project folder:

```diff
cd /home/pi/my-node-project
```

Make sure your script runs:

```diff
node index.js 
```

Create a service file:

```diff
sudo nano /etc/systemd/system/nodeserver.service
```

Paste this into the file (edit paths as needed):


```diff
[Unit]
Description=Node.js Server
After=network.target

[Service]
ExecStart=/usr/bin/node /home/pi/silversatRequest/index.js
WorkingDirectory=/home/pi/silversatRequest
Restart=always
User=pi
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
Save and exit (Ctrl+O, Enter, Ctrl+X)
```

Enable and start the service:

```diff
sudo systemctl enable nodeserver
sudo systemctl start nodeserver
```

✅ Done!
Your Node server will now start automatically on boot. You can check status with:

```diff
sudo systemctl status nodeserver
```

#### Dont forget routing through cloudflare to subdomain