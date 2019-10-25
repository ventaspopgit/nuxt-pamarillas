import Repository from './Repository';

const resource = '/Email';

export default {
  invite(data) {
    return Repository.post(`${resource}/invite`, data);
  }
};
