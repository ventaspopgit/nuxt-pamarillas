<template>
  <div v-if="visible" id="bg" @click="hide()">
    <div class="popup basic" onclick="event.stopPropagation()">
      <div class="cerrar" @click="hide()" />
      
      <div v-if="login">
        <h1 class="tit-3">Tengo cuenta en Geelbe</h1>
        <h2 class="tit-5">Inicia sesión para usar tus datos</h2>
        
        <form class="form" @submit.prevent="doLogin()">
          <label>
            Email*
            <input v-model="email" type="email" placeholder="tucorreo@correo.com" required="required">
          </label>
          
          <label>
            Contraseña*
            <input v-model="pwd" type="password" placeholder="Tu contraseña" required="required">
          </label>
          
          <div class="row justify-content-between">
            <!--<div class="col">
              <label class="check">
                <input type="checkbox" />
                Dejar abierta la sesión
              </label>
            </div>-->
            
            <div class="col text-right">
              <a href="#" @click.prevent="register = false;recover = true;login = false;">Olvidé mi contraseña</a>
            </div>
          </div>
          
          <button v-if="!loading" type="submit" class="btn">Entrar a mi cuenta</button>
          <button v-if="loading" type="button" class="btn">Espera por favor...</button>
          
          <hr>
          
          <a :href="facebookLoginURL" class="btn facebook"><span>Entrar con Facebook</span></a>
          
          <footer class="row justify-content-between">
            <div class="col">
              <p>¿No tienes cuenta en Geelbe?</p>
            </div>
            <div class="col text-right">
              <a href="#" class="btn small" @click.prevent="register = true;recover = false;login = false;">Crear cuenta</a>
            </div>
          </footer>
        </form>
      </div>
      
      <div v-if="recover">
        <h1 class="tit-3">Tengo cuenta en Geelbe</h1>
        <h2 class="tit-5">Recuperar contraseña</h2>
        
        <form class="form" @submit.prevent="doRecover()">
          <label>
            Email*
            <input v-model="email" type="email" placeholder="tucorreo@correo.com" required="required">
          </label>
          
          <button v-if="!loading" type="submit" class="btn">Recuperar</button>
          <button v-if="loading" type="button" class="btn">Espera por favor...</button>
        </form>
      </div>
      
      <div v-if="register">
        <h1 class="tit-3">Regístrate en Geelbe</h1>
        <h2 class="tit-5">Completa tus datos para crear tu cuenta</h2>
        
        <form class="form" @submit.prevent="newUser()">
          <label>
            Nombre*
            <input v-model="name" type="text" required="required">
          </label>
          
          <label>
            Apellido*
            <input v-model="surname" type="text" required="required">
          </label>
          
          <label>
            Email*
            <input v-model="email" type="email" placeholder="tucorreo@correo.com" required="required">
          </label>
          
          <label>
            Contraseña*
            <input v-model="pwd" type="password" placeholder="Tu contraseña" required="required">
          </label>
          
          <div class="row justify-content-between">
            <div class="col">
              <label class="check">
                <input type="checkbox" required="required">
                Acepto los <a href="/paginas/13-términos-y%20condiciones" target="_blank">términos y condiciones</a>
              </label>
            </div>
          </div>

          <button v-if="!loading" type="submit" class="btn">Registrarme</button>
          <button v-if="loading" type="button" class="btn">Espera por favor...</button>
          
          <hr>
          
          <a :href="facebookLoginURL" class="btn facebook"><span>Entrar con Facebook</span></a>
          
          <footer class="row justify-content-between">
            <div class="col">
              <p>¿Ya tienes cuenta en Geelbe?</p>
            </div>
            <div class="col text-right">
              <a href="#" class="btn small" @click.prevent="register = false;recover = false;login = true;">Entrar</a>
            </div>
          </footer>
        </form>
      </div>      
      
    </div>
  </div>
</template>

<script>
import User from '~/components/gigantier/User';

export default {
  name: 'Login',
  props: {
    visible: {
      type: Boolean,
      value: false
    }
  },
  data: () => ({
    name: '',
    surname: '',
    email: '',
    pwd: '',
    user: null,
    loading: false,
    register: false,
    login: true,
    recover: false,
    invitationCode: null,
    redirect: null,
    facebookLoginURL: null,
    loaded: false
  }),
  watch: {
    visible() {
      if (!this.loaded && this.visible) {
        this.loaded = true;
        this.init();
      }
    }
  },
  created() {
    this.user = User;
    this.user.init();
  },
  mounted() {
    this.$bus.$on('login:setRedirect', (url) => {
      this.redirect = url;
    });

    this.$bus.$on('login:showRecover', () => {
      this.recover = true;
      this.login = false;
      this.register = false;
    });

    this.$bus.$on('login:showRegistro', (code) => {
      this.recover = false;
      this.login = false;
      this.register = true;
      this.invitationCode = code;
    });
  },
  methods: {
    init() {    
      User.getFacebookLoginURL(location.origin + '/login/facebook').then((data) => {
        this.facebookLoginURL = data.data.url
      });
    },
    doLogin() {
      this.loading = true;
      this.$nuxt.$loading.start();
      
      User.login(this.email, this.pwd).then(() => {
        this.nextPage();
      }).catch((e) => {
        this.$nuxt.$emit('error', 'Datos inválidos.');
      }).then(() => {
        this.$nuxt.$loading.finish();
        this.loading = false;
      });
    },
    doRecover() {
      this.loading = true;
      this.$nuxt.$loading.start();
      
      User.recover(this.email).then(() => {
        this.$nuxt.$emit('error', 'Recibirás las instrucciones para restablecer tu contraseña por correo.');
      }).catch((e) => {
        this.$nuxt.$emit('error', 'Datos inválidos.');
      }).then(() => {
        this.$nuxt.$loading.finish();
        this.loading = false;
      });
    },
    newUser() {
      this.loading = true;
      this.$nuxt.$loading.start();
      
      User.register({
        name: this.name,
        surname: this.surname,
        email: this.email,
        pwd: this.pwd,
        invitationCode: this.invitationCode
      }).then((res) => {
        if (res.response && res.response.data && res.response.data.error) {
          this.$nuxt.$emit('error', res.response.data.error);          
        } else {
          return User.login(this.email, this.pwd).then((data) => {
            this.nextPage();
            if (typeof fbq !== 'undefined') {
              fbq('track', 'CompleteRegistration');
            }
          });
        }
      }).catch((e) => {
        this.$nuxt.$emit('error', e.response.data.error);
      }).then(() => {
        this.$nuxt.$loading.finish();
        this.loading = false;
      });
    },
    hide() {
      this.login = true;
      this.register = false;
      this.recover = false;
      this.$nuxt.$emit('hideLogin');
    },
    nextPage() {
      if (this.redirect && this.redirect !== location.pathname) {
        this.$router.push(this.redirect);
        this.redirect = null;
      } else if (location.hash) {
        this.$router.push(location.hash.substr(1));
      } else {
        location.reload();
      }
      this.hide();
    }
  }
};
</script>
