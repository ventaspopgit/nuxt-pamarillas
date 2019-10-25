import Cart from './../Cart';
import Repository from './Repository';

const resource = '/User';

export default {
  
  logged: false, 

  init() {
    this.logged = (this.accessToken() != null && this.expires() >= new Date().getTime());
  },
  
  storage() {
    if (process.server) {
      return {};
    } else {
      return localStorage;
    }
  },
  
  accessToken() {
    return this.storage().accessToken;
  },
  
  expires() {
    return this.storage().expires * 1000;
  },
  
  name() {
    return this.storage().name;
  },
  
  id() {
    return this.storage().id;
  },
  
  credits() {
    return this.storage().credits;
  },
  
  setAccessToken(token) {
    this.storage().accessToken = token;
  },

  setExpires(expires) {
    this.storage().expires = expires;
  },

  setName(name) {
    this.storage().name = name;
  },

  setId(id) {
    this.storage().id = id;
  },
  
  setCredits(credits) {
    this.storage().credits = credits;
  },

  login(email, pwd) {
    return new Promise((resolve, reject) => {
      Repository.post(`${resource}/login`, { email, pwd }).then((data) => {
        if (data.data && data.data.ok) {
          this.setAccessToken(data.data.accessToken);
          this.setExpires(data.data.expires);
          this.setId(parseInt(data.data.id));
          this.setName(data.data.name);
          this.setCredits(data.data.credits);
          Cart.commit('setAddress', data.data);
          this.init();
          resolve(data);
        } else {
          reject(data);
        }
      }, reject);
    });
  },
  
  recover(email) {
    return Repository.post(`${resource}/recover`, { email });
  },
  
  resetPassword(data) {
    return Repository.post(`${resource}/resetPassword`, data);
  },
  
  me() {
    return Repository.post(`${resource}/me`, { access_token: this.accessToken() });
  },
  
  getCredits() {
    return Repository.post(`${resource}/credits`, { access_token: this.accessToken() });
  },
  
  getDiscounts() {
    return Repository.post(`${resource}/discounts`, { access_token: this.accessToken(), refererOnly: 1 });
  },
  
  getRefererDiscounts() {
    return Repository.post(`${resource}/discounts/referer`, { access_token: this.accessToken() });
  },
  
  getReferees() {
    return Repository.post(`${resource}/referees`, { access_token: this.accessToken() });
  },
  
  addressTypes() {
    return ['Calle', 'Carrera', 'Avenida', 'Avenida Carrera', 'Avenida Calle', 'Circular', 'Circunvalar', 'Diagonal', 'Manzana', 'Transversal', 'Vía'];
  },
  
  getAddresses() {
    return Repository.get(`${resource}/addresses?access_token=${this.accessToken()}`);
  },
  
  createAddress(data) {
    data.access_token = this.accessToken();
    return Repository.post(`${resource}/addresses`, data);
  },
  
  deleteAddress(id) {
    return Repository.delete(`${resource}/addresses/${id}`, { access_token: this.accessToken() });
  },
  
  getFields() {
    return Repository.get(`${resource}/fields?access_token=${this.accessToken()}`);
  },
  
  createField(data) {
    data.access_token = this.accessToken();
    return Repository.post(`${resource}/fields`, data);
  },
  
  deleteFields() {
    return Repository.post(`${resource}/fields/delete`, { access_token: this.accessToken() });
  },
  
  exists(data) {
    data.access_token = this.accessToken();
    return Repository.post(`${resource}/exists`, data);
  },
  
  update(data) {
    data.access_token = this.accessToken();
    return Repository.post(`${resource}/update`, data);
  },
  
  logout() {
    this.setAccessToken(null);
    this.setExpires(0);
    this.setCredits(0);
    this.setId(null);
    this.setName(null);
    this.init();
  },

  register(user) {
    return Repository.post(`${resource}`, user);
  },

  getFacebookLoginURL(redirect) {
    return Repository.get(`${resource}/facebook?redirect=${redirect}`);
  },
  
  getFacebookAccessToken(params) {
    return Repository.get(`${resource}/facebook/token?code=${params.code}&redirect=${params.redirect}`);
  }
  
};
