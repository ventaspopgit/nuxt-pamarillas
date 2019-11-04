<template>
  <div>
    <div class="sub_header_in">
      <div class="container">
        <h1>Tu cuenta</h1>
      </div>
    </div>
    <div class="container margin_60">
      <div class="row justify-content-center">
        <div class="col-xl-6 col-lg-6 col-md-8">
          <form method="post" @submit.prevent="doLogin()">
            <div class="box_account">
              <h3 class="client">¿Ya sos cliente?</h3>
              <div class="form_container">
                <div class="form-group">
                  <input v-model="login.email" type="email" class="form-control" name="email" placeholder="Email*" required>
                </div>
                <div class="form-group">
                  <input v-model="login.password" type="password" class="form-control" name="password" placeholder="Password*" required>
                </div>
                <div class="text-center">
                  <input type="submit" value="Entrar" class="btn_1 full-width">
                </div>
              </div>
              <!-- /form_container -->
            </div>
            <!-- /box_account -->
            <div class="row hidden_tablet">
              <div class="col-md-6">
                <ul class="list_ok">
                  <li>Find Locations</li>
                  <li>Quality Location check</li>
                  <li>Data Protection</li>
                </ul>
              </div>
              <div class="col-md-6">
                <ul class="list_ok">
                  <li>Secure Payments</li>
                  <li>H24 Support</li>
                </ul>
              </div>
            </div>
            <!-- /row -->
          </form>
        </div>
        <div class="col-xl-6 col-lg-6 col-md-8">
          <form method="post" @submit.prevent="newUser()">
            <div class="box_account">
              <h3 class="new_client">Nuevo cliente</h3>
              <small class="float-right pt-2">* Campos obligatorios</small>
              <div class="form_container">
                <div class="form-group">
                  <input v-model="register.email" type="email" class="form-control" name="email" placeholder="Email*" required>
                </div>
                <div class="form-group">
                  <input v-model="register.password" type="password" class="form-control" name="password" placeholder="Password*" required>
                </div>
                <hr>
                <div class="row no-gutters">
                  <div class="col-6 pr-1">
                    <div class="form-group">
                      <input v-model="register.name" type="text" class="form-control" placeholder="Nombre*" name="nombre" required>
                    </div>
                  </div>
                  <div class="col-6 pl-1">
                    <div class="form-group">
                      <input v-model="register.surname" type="text" class="form-control" placeholder="Apellido*" name="apellido" required>
                    </div>
                  </div>
                </div>
                <!-- /row -->
                <hr>
                <div class="text-center">
                  <input type="submit" value="Enviar" class="btn_1 full-width">
                </div>
              </div>
              <!-- /form_container -->
            </div>
            <!-- /box_account -->
          </form>
        </div>
      </div>
      <!-- /row -->
    </div>
    <!-- /container -->
  </div>
</template>

<script>
import User from '~/components/gigantier/User';
  
export default {
  name: 'Login',
  data: () => ({
    login: {
      email: null,
      password: null
    },
    register: {
      email: null,
      password: null,
      name: null,
      surname: null
    }
  }),
  methods: {
    doLogin() {
      this.$nuxt.$loading.start();
      
      User.login(this.login.email, this.login.password).then(() => {
        this.$router.push('/');
      }).catch((e) => {
        this.$nuxt.$emit('error', 'Datos inválidos.');
      }).then(() => {
        this.$nuxt.$loading.finish();
      });
    },
    newUser() {
      this.$nuxt.$loading.start();
      
      User.register({
        name: this.register.name,
        surname: this.register.surname,
        email: this.register.email,
        pwd: this.register.password
      }).then((res) => {
        if (res.response && res.response.data && res.response.data.error) {
          this.$nuxt.$emit('error', res.response.data.error);          
        } else {
          return User.login(this.register.email, this.register.password).then((data) => {
            this.$router.push('/');
          });
        }
      }).catch((e) => {
        this.$nuxt.$emit('error', e.response.data.error);
      }).then(() => {
        this.$nuxt.$loading.finish();
      });
    }    
  }
};
</script>
