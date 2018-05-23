# Setup with docker-compose

Instructions for local development

#### Requirements:

* Docker
* Docker-Compose
* Docker-Machine with VirtualBox, if you're using Windows 8/10 Home edition, without _Hyper-V_.

#### Get repositories:

```
$ mkdir common-group
$ cd common-group
$ git clone https://github.com/common-group/services-core-db.git
$ git clone https://github.com/common-group/payment-service-api.git
$ git clone https://github.com/common-group/hook-service-api.git
$ git clone https://github.com/common-group/notification-service-api.git
$ git clone https://github.com/catarse/catarse.git
$ git clone https://github.com/catarse/catarse.js.git
```

#### Setup env files:

For every service described on **services-core-db/docker-compose.yml** we have multiple env\_files on **services-core-db/compose\_env/.\*.env.sample** just make a copy off all on the same directory without **.sample**

#### Start services:

on **common-group/services-core-db:**

start databases:

```
$ docker-compose up -d service_core_db
$ docker-compose up -d catarse_db
```

they can be accesed via localhost on:
```
- localhost:5444/service_core - common services database
- localhost:5445/catarse_db - catarse platform database
```

###### _notes: default password and user for service core postgres \(postgres/example\)_

Run the migrations for services core and seed database with sample data

```bash
$ docker-compose up migrations
// database service mapping the 5444 to postgres container
$ psql -h localhost -p 5444 -U postgres service_core < sample.seed.sql
```

###### _notes: default password and user for catarse postgres \(catase/example\)_

Run the migrations for catarse:

```bash
$ docker-compose run --rm catarse bundle exec rake db:migrate
// database service mapping the 5445 to postgres container
```


start services:

```
$ docker-compose up -d
```

check for apis and services runnings on:

```
payment_service_api - http://localhost:3001
project_service_api - http://localhost:3002
community_service_api - http://localhost:3003
platform_service_api - http://localhost:3004
analytics_service_api - http://localhost:3005
hook_service_api - http://localhost:3006
notification_service_api - http://localhost:3007
catarse_api - http://localhost:3008
catarse - http://localhost:3000
```

**Note**: if you're using _docker-machine_ with V_irtualBox_, create port-forwards:

```
VBoxManage.exe controlvm "default" natpf1 "common__database,tcp,127.0.0.1,5444,,5444"
VBoxManage.exe controlvm "default" natpf1 "common__payment_service_api,tcp,127.0.0.1,3001,,3001"
VBoxManage.exe controlvm "default" natpf1 "common__project_service_api,tcp,127.0.0.1,3002,,3002"
VBoxManage.exe controlvm "default" natpf1 "common__community_service_api,tcp,127.0.0.1,3003,,3003"
VBoxManage.exe controlvm "default" natpf1 "common__platform_service_api,tcp,127.0.0.1,3004,,3004"
VBoxManage.exe controlvm "default" natpf1 "common__analytics_service_api,tcp,127.0.0.1,3005,,3005"
VBoxManage.exe controlvm "default" natpf1 "common__hook_service_api,tcp,127.0.0.1,3006,,3006"
VBoxManage.exe controlvm "default" natpf1 "common__notification_service_api,tcp,127.0.0.1,3007,,3007"
VBoxManage.exe controlvm "default" natpf1 "common__catase_api,tcp,127.0.0.1,3008,,3008"
VBoxManage.exe controlvm "default" natpf1 "common__catarse,tcp,127.0.0.1,3000,,3000"
```

On windows, is recommend use this \_git \_configuration to force working with LF lineending:

```
git config --global core.autocrlf false
git config --global core.eol lf
```




