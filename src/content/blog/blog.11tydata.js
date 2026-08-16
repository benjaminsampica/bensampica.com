export default {
  layout: "layouts/post.njk",
  isArticle: true,
  eleventyComputed: {
    permalink(data) {
      if (data.draft) return false;
      const sourceSlug = data.page.filePathStem.match(/content\/blog\/([^/]+)\/index$/)?.[1];
      const slug = String(sourceSlug ?? data.page.fileSlug).toLowerCase();
      return `/blog/${slug}/`;
    },
  },
};
