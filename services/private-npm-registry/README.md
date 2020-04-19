Used to create a private NPM registry to enable skaffold local dev flows that mimicks production build

## Installing

Install htpasswd, if needed:

```
sudo apt install apache2-utils
```

Install:

```
yarn
```

Create a local `.htpasswd` file with a random password:

```
PASSWORD="$(apg -d -n 1)" && echo "Run" && echo "    npm adduser --registry http://localhost:4873" && echo "after starting registry and login with username: user and password: $PASSWORD" && htpasswd -bc htpasswd user "$PASSWORD"
```

## Running

```
yarn start
```

## Build token
You will need an auth token to inject into build process. Login to local registry:

```
npm adduser --registry http://localhost:4873
```

Copy the auth token from ~/.npmrc to env var:

```
export NPM_AUTH=$(cat $HOME/.npmrc)
``