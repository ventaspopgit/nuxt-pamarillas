import Repository from './Repository';

const resource = '/PayUEfecty';

export default {
  pay(data) {
    return Repository.post(`${resource}/pay`, data);
  }
};
