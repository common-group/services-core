# Receiving postbacks on local

**install ngrok** - [https://ngrok.com/](https://ngrok.com/)

after install ngrok and docker-compose up and running execute:

```
$ ngrok http 3006
```

copy the ngrok generated url URL **https://SOME\_HASH.ngrok.io** and use on **POSTBACK\_URL** environment on payment dispatcher 

