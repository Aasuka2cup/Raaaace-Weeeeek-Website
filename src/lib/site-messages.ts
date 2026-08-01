import type { Locale } from "@/lib/messages";

export interface SiteMessages {
  siteName: string;
  navHome: string;
  navF1Fantasy: string;
  navPodcast: string;
  navBlog: string;
  themeDark: string;
  themeLight: string;
  langEnglish: string;
  langChinese: string;
  footerTagline: string;
  footerRights: string;

  homeEyebrow: string;
  homeTitle: string;
  homeSubtitle: string;
  homeF1Title: string;
  homeF1Description: string;
  homeF1Cta: string;
  homePodcastTitle: string;
  homePodcastDescription: string;
  homePodcastCta: string;
  homeBlogTitle: string;
  homeBlogDescription: string;
  homeBlogCta: string;

  podcastEyebrow: string;
  podcastName: string;
  podcastIntro: string;
  podcastEmptyState: string;
  podcastListenOn: string;
  podcastLatestLabel: string;
  podcastSeriesLabel: string;
  podcastViewAll: string;
  podcastNoEpisodesInCategory: string;
  podcastBackToPodcast: string;
  podcastBackToCategory: string;
  podcastEpisodeCount: (count: number) => string;

  blogEyebrow: string;
  blogTitle: string;
  blogDescription: string;
  blogEmptyState: string;
  blogReadMore: string;
  blogBackToList: string;
}

export const SITE_MESSAGES: Record<Locale, SiteMessages> = {
  en: {
    siteName: "Aasuka",
    navHome: "Home",
    navF1Fantasy: "F1 Fantasy",
    navPodcast: "Podcast",
    navBlog: "Blog",
    themeDark: "Dark",
    themeLight: "Light",
    langEnglish: "English",
    langChinese: "中文",
    footerTagline: "Built and maintained by Aasuka.",
    footerRights: "All rights reserved.",

    homeEyebrow: "aasuka.com",
    homeTitle: "Hi, I'm Aasuka.",
    homeSubtitle:
      "This is where I keep my F1 Fantasy league analysis, podcast episodes, and occasional writing.",
    homeF1Title: "F1 Fantasy",
    homeF1Description:
      "League standings, pick ownership, chip usage, and prediction insights for my F1 Fantasy league.",
    homeF1Cta: "View dashboard",
    homePodcastTitle: "Podcast",
    homePodcastDescription: "F1, other sports, life abroad, ideas, and stories — sorted into series.",
    homePodcastCta: "Listen now",
    homeBlogTitle: "Blog",
    homeBlogDescription: "Notes, write-ups, and whatever else I feel like putting down.",
    homeBlogCta: "Read posts",

    podcastEyebrow: "Podcast",
    podcastName: "Aasuka Cosmos",
    podcastIntro:
      "A place for a chronic talker abroad to get some words out. Whatever I'm into — F1, other sports, life abroad, ideas, and stories — sorted into series.",
    podcastEmptyState: "No episodes published yet — check back soon.",
    podcastListenOn: "Listen on",
    podcastLatestLabel: "Latest episode",
    podcastSeriesLabel: "Series",
    podcastViewAll: "View all",
    podcastNoEpisodesInCategory: "No episodes in this series yet — check back soon.",
    podcastBackToPodcast: "Back to podcast",
    podcastBackToCategory: "Back to",
    podcastEpisodeCount: (count) => `${count} episode${count === 1 ? "" : "s"}`,

    blogEyebrow: "Blog",
    blogTitle: "Writing",
    blogDescription: "Posts, notes, and occasional long-form thinking.",
    blogEmptyState: "No posts published yet — check back soon.",
    blogReadMore: "Read post",
    blogBackToList: "Back to all posts",
  },
  zh: {
    siteName: "Aasuka",
    navHome: "首页",
    navF1Fantasy: "F1 Fantasy",
    navPodcast: "播客",
    navBlog: "博客",
    themeDark: "深色",
    themeLight: "浅色",
    langEnglish: "English",
    langChinese: "中文",
    footerTagline: "由 Aasuka 构建与维护。",
    footerRights: "保留所有权利。",

    homeEyebrow: "aasuka.com",
    homeTitle: "你好，我是 Aasuka。",
    homeSubtitle: "这里收录了我的 F1 Fantasy 联盟分析、播客节目，以及偶尔的写作。",
    homeF1Title: "F1 Fantasy",
    homeF1Description: "我的 F1 Fantasy 联盟排名、选人分布、芯片使用与预测洞察。",
    homeF1Cta: "查看仪表盘",
    homePodcastTitle: "播客",
    homePodcastDescription: "F1、其他体育、异乡生活、想法与故事——按系列分类。",
    homePodcastCta: "立即收听",
    homeBlogTitle: "博客",
    homeBlogDescription: "笔记、文章，以及一些随想。",
    homeBlogCta: "阅读文章",

    podcastEyebrow: "播客",
    podcastName: "鳥舍雜俎",
    podcastIntro:
      "这是一个话痨独在异乡缓解表达欲的地方。感兴趣的话题都会聊聊——F1、其他体育、异乡生活、想法与故事，按系列分类。",
    podcastEmptyState: "暂无发布的节目，敬请期待。",
    podcastListenOn: "收听平台",
    podcastLatestLabel: "最新一期",
    podcastSeriesLabel: "系列",
    podcastViewAll: "查看全部",
    podcastNoEpisodesInCategory: "该系列暂无节目，敬请期待。",
    podcastBackToPodcast: "返回播客首页",
    podcastBackToCategory: "返回",
    podcastEpisodeCount: (count) => `${count} 期节目`,

    blogEyebrow: "博客",
    blogTitle: "文章",
    blogDescription: "笔记、随笔，偶尔的长文。",
    blogEmptyState: "暂无发布的文章，敬请期待。",
    blogReadMore: "阅读全文",
    blogBackToList: "返回文章列表",
  },
};
