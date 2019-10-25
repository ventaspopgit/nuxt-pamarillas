<template>
  <footer class="plus_border">
    <div class="container margin_60_35">
      <div class="row">
        <div class="col-lg-3 col-md-6 col-sm-6">
          <h3 data-target="#collapse_ft_1">Información</h3>
          <div id="collapse_ft_1" class="collapse dont-collapse-sm">
            <ul class="links">
              <li v-for="(page, index) in pages" :key="index"><router-link :to="page.url">{{ page.title }}</router-link></li>
            </ul>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 col-sm-6">
          <h3 data-target="#collapse_ft_3">Seguinos</h3>
          <div id="collapse_ft_3" class="collapse dont-collapse-sm">
            <ul class="contacts">
              <li><i class="ti-home" />97845 Baker st. 567<br>Los Angeles - US</li>
              <li><i class="ti-headphone-alt" />+39 06 97240120</li>
              <li><i class="ti-email" /><a href="#0">info@sparker.com</a></li>
            </ul>
          </div>
        </div>
        <div class="col-lg-3 col-md-6 col-sm-6">
          <h3 data-target="#collapse_ft_4">Suscribite a nuestras novedades</h3>
          <div id="collapse_ft_4" class="collapse dont-collapse-sm">
            <div id="newsletter">
              <div id="message-newsletter" />
              <form id="newsletter_form" method="post" action="<?=HOST?>assets/newsletter.php" name="newsletter_form">
                <div class="form-group">
                  <input id="email_newsletter" type="email" name="email_newsletter" class="form-control" placeholder="Tu email" required>
                  <input id="submit-newsletter" type="submit" value="Enviar">
                </div>
              </form>
              <p><small>Al suscribirte aceptas nuestra <router-link to="/paginas/5-politica-de-tratamiento-de-datos">política de tratamiento de datos</router-link>.</small></p>
            </div>
            <div class="follow_us">
              <h5>Follow Us</h5>
              <ul>
                <li><a href="#0"><i class="ti-facebook" /></a></li>
                <li><a href="#0"><i class="ti-twitter-alt" /></a></li>
                <li><a href="#0"><i class="ti-google" /></a></li>
                <li><a href="#0"><i class="ti-pinterest" /></a></li>
                <li><a href="#0"><i class="ti-instagram" /></a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <!-- /row-->
      <hr>
      <div class="row">
        <div class="col-lg-12">
          <ul id="additional_links">
            <li><router-link to="/paginas/4-terminos-y-condiciones">Términos y condiciones</router-link></li>
            <li><router-link to="/paginas/5-politica-de-tratamiento-de-datos">Política de tratamiento de datos</router-link></li>
            <li><span>© 2018 Sparker</span></li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  props: {
    shop: {
      type: Object,
      required: true
    },
    pages: {
      type: Array,
      required: true
    }
  }
};
</script>
