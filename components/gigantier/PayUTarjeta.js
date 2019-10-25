import Repository from './Repository';
import User from './User';

const resource = '/PayUTarjeta';

export default {
  pay(data) {
    return Repository.post(`${resource}/pay`, data);
  },
  getTypes() {
    return Repository.get(`${resource}/types`);
  },
  getDniTypes() {
    return Repository.get(`${resource}/dniTypes`);
  },
  getCards(data) {
    return Repository.post(`${resource}/cards`, data);
  },
  createCard(data) {
    data.access_token = User.accessToken();
    return Repository.post(`${resource}`, data);
  },
  deleteCard(id, data) {
    data.access_token = User.accessToken();
    return Repository.delete(`${resource}/cards/${id}`, data);
  }
};
