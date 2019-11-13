const pkg = require('./package')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  mode: 'universal',

  router: {
    base: process.env.URI_PREFIX || '/'
  },

  /*
  ** Headers of the page
  */
  head: {
    title: 'Páginas Amarillas',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: pkg.description },
      { hid: 'og-site_name', name: 'og:site_name', content: 'Geelbe' },
      { hid: 'sm-title', name: 'smartbanner:title', content: 'Geelbe' },
      { hid: 'sm-price', name: 'smartbanner:price', content: ' ' },
      { hid: 'sm-price-suffix-apple', name: 'smartbanner:price-suffix-apple', content: 'En el App Store' },
      { hid: 'sm-price-suffix-google', name: 'smartbanner:price-suffix-google', content: 'En Google Play' },
      { hid: 'sm-icon-apple', name: 'smartbanner:icon-apple', content: '/images/app-ios.svg' },
      { hid: 'sm-icon-google', name: 'smartbanner:icon-google', content: '/images/app-android.svg' },
      { hid: 'sm-button', name: 'smartbanner:button', content: 'Descargar' },
      { hid: 'sm-button-url-apple', name: 'smartbanner:button-url-apple', content: 'https://apps.apple.com/co/app/geelbe-tu-outlet-privado/id972144162' },
      { hid: 'sm-button-url-google', name: 'smartbanner:button-url-google', content: 'https://play.google.com/store/apps/details?id=com.geelbe.co&hl=en' },
      { hid: 'sm-close-label', name: 'smartbanner:close-label', content: 'Cerrar' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap' }
    ],
    script: [
      { src: '//cdn.segmentify.com/ad152cd3-31d4-4e09-b219-eb32d8dcf627/segmentify.js' },
      { src: '/js/smartbanner/smartbanner.min.js' },
      { src: 'https://cdn.jsdelivr.net/gh/cferdinandi/smooth-scroll@15/dist/smooth-scroll.polyfills.min.js' }
    ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: { color: 'black' },

  /*
  ** Global CSS
  */
  css: [
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '~/plugins/gigantier.js',
    '~/plugins/bus.js'
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    'nuxt-healthcheck',
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    ['@nuxtjs/google-tag-manager', {
      id: ''
    }]
  ],
  /*
  ** Axios module configuration
  */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
  },

  /*
  ** Healthcheck module configuration
  */
  healthcheck: {
    path: '/health',
    contentType: 'text/plain',
    healthy: () => {
      return 'ok'
    }
  },

  serverMiddleware: [
    // Will register file from project api directory to handle /api/* requires
    '~/backend/index.js'
  ],

  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
      
      if (ctx.isServer) {
        config.externals = [
          nodeExternals({
            whitelist: [/^vue-slick/]
          })
        ]
      }
      
    },
    publicPath: process.env.PUBLIC_PATH || '/_nuxt/'
  }
}
