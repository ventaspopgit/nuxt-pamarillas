import Repository from './Repository';

const resource = '/PaymentMethod';

export default {
  async get() {
    const pm = await Repository.get(`${resource}`);
    pm.data.paymentMethods = pm.data.paymentMethods.map((pm) => {
      pm.minimumAmount = (pm.minimumAmount ? parseInt(pm.minimumAmount) : null);
      pm.maximumAmount = (pm.maximumAmount ? parseInt(pm.maximumAmount) : null);
      return pm;
    });
    return pm;
  }
};
