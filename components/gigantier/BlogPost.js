import Repository from './Repository';
const querystring = require('querystring');

const resource = '/BlogPost';

export default {
  async get(params) {
    const getParams = querystring.stringify(params);
    const posts = await Repository.get(`${resource}?${getParams}`);
    posts.data.posts = posts.data.posts.map((post) => {
      const newPost = post;
      newPost.url = this.url(post);
      return newPost;
    });
    return posts;
  },
  getBlogPost(id) {
    return Repository.get(`${resource}/${id}`);
  },
  url(post) {
    const path = post.title.toLowerCase().trim().replace(/[ //]/g, '-');
    return encodeURI(`/blog/${post.id}-${path}`);
  }
};
