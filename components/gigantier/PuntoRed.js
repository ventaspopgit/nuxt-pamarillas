import Repository from './Repository';

const resource = '/PuntoRed';

export default {
  pay(data) {
    return Repository.post(`${resource}/pay`, data);
  }
};
