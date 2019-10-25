import Repository from './Repository';

const resource = '/MercadoPagoCreditCard';

export default {
  pay(data) {
    return Repository.post(`${resource}/pay`, data);
  },
  getPaymentMethods() {
    return Repository.get(`${resource}/paymentMethods`);
  }
};
