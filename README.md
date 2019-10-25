# nuxt-shop

> Tienda demo implementada en Nuxt.js

## Build Setup

``` bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start

# generate static project
$ npm run generate
```

## Dev environment (Docker)
First install docker image with:

``` bash
make install CLIENT_ID=[changeme] CLIENT_SECRET=[changeme]
```

Then to run:

``` bash
make run
```

#### Considerations

* App is in: `http://localhost:3000`
* To stop just `CTRL+c` in the command line
* Code changes are take it automatically (no need to restart).
* `make install ...` is only need to be executed once.

---

For detailed explanation on how things work, checkout [Nuxt.js docs](https://nuxtjs.org).