import fs from "node:fs";
import path from "node:path";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import rssPlugin from "@11ty/eleventy-plugin-rss";

const SITE_URL = "https://www.bensampica.com";
const POSTS_PER_PAGE = 10;

function slugify(value = "") {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function postSlug(item) {
  const match = item.inputPath.match(/content\/blog\/([^/]+)\/index\.md$/);
  return slugify(match?.[1] ?? item.fileSlug);
}

function sortPosts(items) {
  return [...items].sort(
    (left, right) => new Date(right.data.date) - new Date(left.data.date),
  );
}

function publishedPosts(collectionApi) {
  return sortPosts(
    collectionApi
      .getFilteredByGlob("./content/blog/*/index.md")
      .filter((item) => !item.data.draft),
  );
}

function tagGroups(posts) {
  const tags = new Map();

  for (const post of posts) {
    for (const tag of post.data.tags ?? []) {
      const key = slugify(tag);
      const current = tags.get(key) ?? { name: tag, slug: key, posts: [] };
      current.posts.push(post);
      tags.set(key, current);
    }
  }

  return [...tags.values()].sort((left, right) =>
    left.name.localeCompare(right.name, "en", { sensitivity: "base" }),
  );
}

function installCallouts(markdown) {
  markdown.core.ruler.after("inline", "github-callouts", (state) => {
    const types = new Set(["note", "tip", "important", "warning", "caution", "info"]);

    for (let index = 0; index < state.tokens.length; index += 1) {
      const opening = state.tokens[index];
      if (opening.type !== "blockquote_open") continue;

      const inlineIndex = state.tokens.findIndex(
        (token, tokenIndex) => tokenIndex > index && token.type === "inline",
      );
      if (inlineIndex < 0) continue;

      const inline = state.tokens[inlineIndex];
      const nativeMatch = inline.content.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION|INFO)\]\s*/i);
      const legacyMatch = inline.content.match(/^\*\*(Note|Tip|Important|Warning|Caution|Info):\*\*\s*/i);
      const match = nativeMatch ?? legacyMatch;
      if (!match) continue;

      const type = match[1].toLowerCase();
      if (!types.has(type)) continue;

      const closeIndex = state.tokens.findIndex(
        (token, tokenIndex) => tokenIndex > inlineIndex && token.type === "blockquote_close",
      );
      if (closeIndex < 0) continue;

      opening.meta = { ...(opening.meta ?? {}), callout: type };
      state.tokens[closeIndex].meta = {
        ...(state.tokens[closeIndex].meta ?? {}),
        callout: type,
      };

      inline.content = inline.content.slice(match[0].length);
      inline.children = [];
      state.md.inline.parse(inline.content, state.md, state.env, inline.children);
    }
  });

  const defaultOpen = markdown.renderer.rules.blockquote_open;
  const defaultClose = markdown.renderer.rules.blockquote_close;

  markdown.renderer.rules.blockquote_open = (tokens, index, options, env, self) => {
    const type = tokens[index].meta?.callout;
    if (!type) {
      return defaultOpen
        ? defaultOpen(tokens, index, options, env, self)
        : self.renderToken(tokens, index, options);
    }

    const label = type.charAt(0).toUpperCase() + type.slice(1);
    return `<aside class="callout callout--${type}" role="note"><p class="callout__title">${label}</p>`;
  };

  markdown.renderer.rules.blockquote_close = (tokens, index, options, env, self) => {
    if (tokens[index].meta?.callout) return "</aside>";
    return defaultClose
      ? defaultClose(tokens, index, options, env, self)
      : self.renderToken(tokens, index, options);
  };
}

function addPostAssets(eleventyConfig) {
  const blogRoot = path.resolve("content/blog");
  if (!fs.existsSync(blogRoot)) return;

  for (const entry of fs.readdirSync(blogRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const slug = slugify(entry.name);
    const directory = path.join(blogRoot, entry.name);

    for (const assetDirectory of ["images", "videos"]) {
      const source = path.join(directory, assetDirectory);
      if (fs.existsSync(source)) {
        eleventyConfig.addPassthroughCopy({
          [source]: `blog/${slug}/${assetDirectory}`,
        });
      }
    }

    for (const file of fs.readdirSync(directory, { withFileTypes: true })) {
      if (!file.isFile() || !/\.(avif|gif|jpe?g|png|svg|webp)$/i.test(file.name)) continue;
      eleventyConfig.addPassthroughCopy({
        [path.join(directory, file.name)]: `blog/${slug}/${file.name}`,
      });
    }
  }
}

export default function eleventyConfiguration(eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(rssPlugin);

  const markdown = markdownIt({
    html: true,
    linkify: true,
    typographer: false,
  }).use(markdownItAnchor, {
    level: [2, 3, 4],
    permalink: markdownItAnchor.permalink.ariaHidden({
      placement: "after",
      symbol: "#",
      class: "heading-anchor",
    }),
    slugify,
  });
  installCallouts(markdown);
  eleventyConfig.setLibrary("md", markdown);

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/static": "." });
  eleventyConfig.addPassthroughCopy({ "static/uploads": "uploads" });
  eleventyConfig.addPassthroughCopy({ "assets/media": "media" });
  eleventyConfig.addPassthroughCopy({ "assets/media/albums": "albums" });
  addPostAssets(eleventyConfig);

  eleventyConfig.addWatchTarget("src/assets");
  eleventyConfig.addWatchTarget("assets/media");

  eleventyConfig.addCollection("posts", publishedPosts);
  eleventyConfig.addCollection("tagList", (collectionApi) =>
    tagGroups(publishedPosts(collectionApi)),
  );
  eleventyConfig.addCollection("tagPages", (collectionApi) => {
    return tagGroups(publishedPosts(collectionApi)).flatMap((tag) => {
      const pageCount = Math.ceil(tag.posts.length / POSTS_PER_PAGE);
      return Array.from({ length: pageCount }, (_, pageIndex) => ({
        ...tag,
        posts: tag.posts.slice(
          pageIndex * POSTS_PER_PAGE,
          (pageIndex + 1) * POSTS_PER_PAGE,
        ),
        pageIndex,
        pageCount,
        url:
          pageIndex === 0
            ? `/tags/${tag.slug}/`
            : `/tags/${tag.slug}/page/${pageIndex + 1}/`,
      }));
    });
  });

  eleventyConfig.addFilter("slugify", slugify);
  eleventyConfig.addFilter("take", (items = [], count = 0) => items.slice(0, count));
  eleventyConfig.addFilter("postSlug", postSlug);
  eleventyConfig.addFilter("siteUrl", (url) => new URL(url, SITE_URL).href);
  eleventyConfig.addFilter("dateIso", (date) => new Date(date).toISOString());
  eleventyConfig.addFilter("dateRfc822", (date) => new Date(date).toUTCString());
  eleventyConfig.addFilter("dateReadable", (date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(date)),
  );
  eleventyConfig.addFilter("monthYear", (date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(date)),
  );
  eleventyConfig.addFilter("readingTime", (html = "") => {
    const words = String(html)
      .replace(/<[^>]*>/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 220));
  });
  eleventyConfig.addFilter("markdown", (value = "") => markdown.render(String(value)));
  eleventyConfig.addFilter("toc", (html = "") => {
    const headings = [...String(html).matchAll(/<h([23]) id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g)];
    if (headings.length < 2) return "";
    const items = headings
      .map(([, level, id, text]) => {
        const label = text.replace(/<[^>]*>/g, "").replace(/#$/, "").trim();
        return `<li class="toc__item toc__item--${level}"><a href="#${id}">${label}</a></li>`;
      })
      .join("");
    return `<nav class="toc" aria-label="Table of contents"><p class="toc__title">On this page</p><ol>${items}</ol></nav>`;
  });
  eleventyConfig.addFilter("postImage", (post) => {
    const slug = postSlug(post);
    const directory = path.resolve("content/blog", post.inputPath.match(/content\/blog\/([^/]+)/)?.[1] ?? slug);
    const candidates = [
      "featured.png",
      "featured.jpg",
      "featured.jpeg",
      "cover.png",
      "cover.jpg",
      "cover.jpeg",
      "skills.png",
      "sqldatabase.png",
    ];
    const match = candidates.find((file) => fs.existsSync(path.join(directory, file)));
    return match ? `/blog/${slug}/${match}` : "/media/sharing.png";
  });
  eleventyConfig.addFilter("codeLink", (links = []) =>
    links.find((link) => link.type === "code")?.url ?? "",
  );
  eleventyConfig.addFilter("jsonLd", (value) =>
    JSON.stringify(value).replace(/</g, "\\u003c"),
  );
  eleventyConfig.addNunjucksGlobal("seoJsonLd", (data = {}) => {
    const canonical = new URL(data.url || "/", SITE_URL).href;
    const image = new URL(data.image || "/media/sharing.png", SITE_URL).href;

    if (data.isArticle) {
      return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
        headline: data.title,
        description: data.description,
        image: [image],
        datePublished: new Date(data.date).toISOString(),
        dateModified: new Date(data.lastmod || data.date).toISOString(),
        author: { "@type": "Person", name: "Ben Sampica", url: SITE_URL },
        publisher: {
          "@type": "Organization",
          name: "Blueprint Software",
          url: "https://www.blueprint.software",
        },
      };
    }

    return {
      "@context": "https://schema.org",
      "@type": data.isHome ? "ProfilePage" : "WebPage",
      "@id": canonical,
      url: canonical,
      name: data.title || "Ben Sampica",
      description: data.description,
      inLanguage: "en-US",
      isPartOf: {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Ben Sampica",
      },
      primaryImageOfPage: { "@type": "ImageObject", url: image },
    };
  });

  return {
    dir: {
      input: ".",
      includes: "src/_includes",
      data: "src/_data",
      output: "_site",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk"],
  };
}
