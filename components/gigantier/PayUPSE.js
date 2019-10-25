import Repository from './Repository';

const resource = '/PayUPSE';

export default {
  pay(data) {
    return Repository.post(`${resource}/pay`, data);
  },
  getBanks() {
    return Repository.get(`${resource}/banks`);
  },
  getDniTypes() {
    return Repository.get(`${resource}/dniTypes`);
  },
  getPersonTypes() {
    return Repository.get(`${resource}/personTypes`);
  }
};
