import Repository from './Repository';

const resource = '/Banner';

export default {
  async get(position, blogPostId = null) {
    const banners = await Repository.get(`${resource}?position=${position}&blogPostId=${blogPostId}`);
    return banners;
  }
};
