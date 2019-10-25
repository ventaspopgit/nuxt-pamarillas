import Repository from './Repository';

const resource = '/PayUBaloto';

export default {
  pay(data) {
    return Repository.post(`${resource}/pay`, data);
  }
};
