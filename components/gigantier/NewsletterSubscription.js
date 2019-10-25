import Repository from './Repository';

const resource = '/NewsletterListUser';

export default {
  create(data) {
    return Repository.post(`${resource}`, data);
  }
};
