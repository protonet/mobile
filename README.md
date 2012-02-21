                  .---. .---.                                     __                   __ 
                 :     : o   :    I approve of: ____  _________  / /_____  ____  ___  / /_
             _..-:   o :     :-.._    /        / __ \/ ___/ __ \/ __/ __ \/ __ \/ _ \/ __/
         .-''  '  `---' `---' "   ``-.        / /_/ / /  / /_/ / /_/ /_/ / / / /  __/ /_  
       .'   "   '  "  .    "  . '  "  `.     / .___/_/   \____/\__/\____/_/ /_/\___/\__/  
      :   '.---.,,.,...,.,.,.,..---.  ' ;   /_/
      `. " `.                     .' " .'  
       `.  '`.                   .' ' .'   
        `.    `-._           _.-' "  .'  .----.
          `. "    '"--...--"'  . ' .'  .'  o   `.
          .'`-._'    " .     " _.-'`. :       o  :
    jgs .'      ```--.....--'''    ' `:_ o       :
      .'    "     '         "     "   ; `.;";";";'
     ;         '       "       '     . ; .' ; ; ;
    ;     '         '       '   "    .'      .-'
    '  "     "   '      "           "    _.-' 

PROTONET
========

Core Contributors: christopher (tiff), dudemeister (dudemeister), reza (fishman), philly-mac (philly-mac)
Past Contributors: actionJackson (dreewill), alto(alto), comes (ppeszko), danopia (danopia), m0rk (m0rk)

DESCRIPTION:
------------

First of all: all of the code and documentation is work in progress, and it's redistribution or redistribution of a modified version is currently not allowed without explicit permission of the project owner (dudemeister on github), the code and documentation *will* become open source at one point (basically when it works to some degree). I have still some work to do figuring out a good license for this thing.

I hope that you will contribute to this project and have fun using and writing it as I believe this to be our chance to (each one of us) truly revolutionize the way we communicate, interact and so much more!

Protonet aims to create a new internet (let's call it internet 2.0 ;)), basically it will become a giant (actually lots and lots of connected or not connected small) mesh network(s). Most of it's nodes will run an rails frontend, this is it - and it's called 'Dashboard'. This is also it's first awesome app.

It goes hand in hand with it's low-level part (also on github, called protonet-node-setup).
 
TECHNOLOGIES:
-------------

Protonet-Dashboard runs on rails, mysql, rabbitmq, eventmachine (+amqp), node.js and uses jQuery as its JS framework.


INSTALL
=======

GENERAL
-------
    git clone git@github.com:protonet/dashboard.git
    cd dashboard
    mkdir -p public/externals/image_proxy
    mkdir -p public/externals/screenshots
    mkdir -p public/externals/snapshots
    git submodule init
    git submodule update
    

Ff you don't have bundler install it first:

    (sudo) gem install bundler -v 1.0.11

We'll be using homebrew (>= 0.8) to manage dependencies (this is what you should use on OS X anyways)

    ruby -e "$(curl -fsSL https://gist.github.com/raw/323731/install_homebrew.rb)"

If you don't have imagemagick or graphicsmagick, install it first:

    brew install graphicsmagick

Get your uuid stuff:

    brew install ossp-uuid (or apt-get install libossp-uuid-dev on ubuntu)
    
Install MySQL:

On osx:

    brew install mysql

On linux use your package manager...

Setup MySQL root user account and if on osx the startup according to brews instructions

Install the needed gems:

    bundle install
    
if you get an error installing sunspot solar just downgrade your rubygems version to 1.6.1 for now:

    rvm install rubygems 1.6.1

MESSAGING
---------

Install our messaging broker (We use rabbitmq):

    brew install rabbitmq
    
Start it

    sudo rabbitmq-server

Setup the db

    rake db:setup
    
This will create a user "admin" with password "admin" who has admin permissions.

NODE.JS
-------

Install node.js (0.6.5):

    download the 0.6.5 version of node at
    http://nodejs.org/dist/v0.6.5/node-v0.6.5.tar.gz
    ./configure
    make
    sudo make install

Install node-modules with npm
  
    cd node/
    npm install

START THE SYSTEM
----------------

After installing all dependencies you can get the system running by doing these steps:
start the messaging broker

    rabbitmq-server

and start the rails server (it will start and shutdown the js dispatcher and node.js automatically)

    rails s

goto http://localhost:3000 and enjoy the ride!


ALTERNATIVELY YOU CAN USE FOREMAN
---------------------------------

    foreman start
    
foreman uses port 5000 as a standard. if you need an onther port specify it

    foreman start -p3000

goto http://localhost:5000 (or specified port) and enjoy the ride!


DEPLOYING ON TARGET SYSTEMS
---------------------------

To deploy on a given node:

if this is the first time you deploy to that node you need to do this first (use the vm target for VMs that don't have wireless capabilities)

    cap node deploy:first_run NODE=yournodesaddress
    
and

    cap node deploy:migrations NODE=yournodesaddress

or any of our other targets

    cap live deploy:migrations # -> deploys to team.protonet.info
    cap xing deploy:migrations # -> deploys to protonet.xing.com
    cap vm   deploy:migrations NODE=vm.address.com
    cap node deploy:migrations NODE=backup.protonet.info # -> deploys to backup.protonet.info

DEPLOYING ON UBUNTU
-------------------

It's super simple!

    bash -c "`wget -O - http://releases.protonet.info/bootstrap`"

And you're done. Go to http://admin.protonet.info and create a license key.

(If you want to bootstrap to a specific release the url should look like:
http://releases.protonet.info/bootstrap/RELEASE_NUMBER_HERE)

OTHER STUFF
-----------
These things are not needed if you just want to do some basic development:

RUNNNING TESTS
==============

If you want to run our whole testsuite you'll need to add a vhost:

    rabbitmqctl add_vhost /test
    rabbitmqctl set_permissions -p /test guest ".*" ".*" ".*"

COMPILING THE FLASH SOCKET:
=====================

TextMate -> Bundles -> ActionScript -> MTASC -> Build with MTASC

SPEEDING UP YOUR TEXTMATE SEARCH
==================================
Add these patterns to your textmate project settings to exclude unrelevant files from being searched

Folder Pattern:
!.*/(\.[^/]*|CVS|log|stub_data|gems|vendor|tmp|node_modules|_darcs|_MTN|selenium\-on\-rails|\{arch\}|blib|.*~\.nib|.*\.(framework|app|pbproj|pbxproj|xcode(proj)?|bundle))$

File:
!(/\.(?!htaccess)[^/]*|\.(tmproj|o|pyc)|/Icon\r|/svn-commit(\.[2-9])?\.tmp|\.log|\.sql|\.cfs|xing_resources_cache|\.cvs|\.sql)$

(NOT NEEDED YET) LDAP (ON LEOPARD)
==================================

OpenLDAP is installed by default on Leopard (and earlier versions of OS X). In order to get it into a useful state, however, you will need to make a few changes:

Locate the OpenLDAP configuration files in /etc/openldap/

    cp slapd.conf.default slapd.conf

Then edit your slapd.conf and change this entry:

rootpw          secret

to

rootpw          {SSHA}KT2sBUCwRfLNE6cEMfAVR3TRXxs/SDhQ

Make sure that /private/var/db/openldap/openldap-data/ exists, creating it if it does not.

Run slapd:

    sudo /usr/libexec/slapd

HowTo mount your local code to a protonet node (Works in OSX Leopard and OSX Snow Leopard, does not work in OSX Lion)
==================================

1. In OSX go to "System Preferences" -> "Accounts" and create a new user with user name "protonet-node" and enter a password

2. Go to "System Preferences" -> "Sharing" -> "File Sharing"
   and share the folder that contains the code you'd like to synchronize with your node.
   In this case we wanna share the folder "app/".
   Click "Options" and make sure that "Share files and folders using SMB" is enabled.
   Choose the user "protonet-node" from the list below and enter his password.

3. At your protonet node install the Samba Filesystem Support:

        sudo apt-get install smbfs

4. Finally, use the mount command to mount the OSX folder to an existing directory on your node
   (change the IP address, paths and password in the example below as needed):

        sudo mount -t smbfs //192.168.2.1/app ~/dashboard/current/app -o username=protonet-node,password=secret

5. In order to make sure that your changes in the rails code are immediately visible set config.cache_classes to false in your *production.rb*

6. Now you just need to restart your rails app

        touch ~/dashboard/current/tmp/restart.txt

HowTo mount local code to a protonet-node using nfs (Lion)
================================================

1. In Lion edit or create /etc/exports and the path like this:
  
        <absolute path to your code> -ro <ip of your protonet-node>
        
   Note: -ro = read only

2. if your node misses mount.nfs install nfs-common

        sudo apt-get install nfs-common

3. Mount the remote code
    
        sudo mount.nfs <ip of your lion>:<absolute path to your code> /home/protonet/dashboard/current/app/


4. In order to make sure that your changes in the rails code are immediately visible set config.cache_classes to false in your *production.rb*

        
5. Now you just need to restart your rails app on the node

        touch ~/dashboard/current/tmp/restart.txt

6. To unmount the Code

        sudo umount /home/protonet/dashboard/current/app/
      
    
  