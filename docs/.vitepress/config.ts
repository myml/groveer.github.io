import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

export default withMermaid(
defineConfig({
  lang: "zh-CN",
  title: "易上止正",
  description: "付出不亚于任何人的努力",

  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: true,
  bash: "/",

  head: [["meta", { name: "theme-color", content: "#3c8772" }]],

  markdown: {
    headers: {
      level: [0, 0],
    },
  },

  themeConfig: {
    nav: nav(),

    sidebar: {
      "/blog/": sidebarBlog(),
    },

    editLink: {
      pattern:
        "https://github.com/groveer/groveer.github.io/edit/main/docs/:path",
      text: "在 GitHub 上编辑此页",
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/groveer/groveer.github.io" },
    ],

    footer: {
      message: "博客内容遵循 CC BY-NC-SA 4.0 协议。",
      copyright: "Copyright © 2022-至今 易上止正",
    },

    algolia: {
      appId: "8J64VVRP8K",
      apiKey: "a18e2f4cc5665f6602c5631fd868adfd",
      indexName: "vitepress",
    },

    carbonAds: {
      code: "CEBDT27Y",
      placement: "vuejsorg",
    },
  },
})
)

function nav() {
  return [
    { text: "博客", link: "/blog/toc", activeMatch: "/blog/" },
    { text: "关于", link: "/about", activeMatch: "/" },
    {
      text: "友链",
      items: [
        {
          text: "竹子",
          link: "https://blog.justforlxz.com/",
        },
      ],
    },
  ];
}

function sidebarBlog() {
  return [
    {
      text: "Linux",
      collapsed: false,
      items: [
        {
          text: "ArchLinux",
          collapsed: false,
          items: [
            { text: "系统安装", link: "/blog/archlinux-install" },
            { text: "系统配置", link: "/blog/archlinux-config" },
            { text: "安装 Nvidia 闭源驱动", link: "/blog/archlinux-install-nvidia" },
          ],
        },
        {
          text: "Deepin",
          collapsed: false,
          items: [
            { text: "系统修复", link: "/blog/deepin-repair-system" },
            { text: "服务框架使用指南", link: "/blog/deepin-service-use-guide" },
          ],
        },
        { text: "自动登陆", link: "/blog/linux-auto-login" },
        { text: "挂载小技巧", link: "/blog/linux-mount" },
        { text: "网络管理", link: "/blog/linux-networkmanager" },
        { text: "分区 & 格式化", link: "/blog/linux-partition-format" },
        { text: "zram & swap", link: "/blog/linux-zram" },
      ],
    },
    {
      text: "Develop",
      collapsed: false,
      items: [
        { text: "CMake 基础用法", link: "/blog/cmake-basic" },
        { text: "CMake 进阶用法", link: "/blog/cmake-advanced" },
        { text: "Qt 开发小技巧", link: "/blog/qt-tips" },
      ],
    },
    {
      text: "Tools",
      collapsed: false,
      items: [
        { text: "Git 小技巧", link: "/blog/git" },
        { text: "Latex 搭建", link: "/blog/latex" },
        { text: "Qemu 工具", link: "/blog/qemu" },
      ],
    },
    {
      text: "IDE",
      collapsed: false,
      items: [
        { text: "Vim 配置", link: "/blog/vim" },
        { text: "VsCode 配置", link: "/blog/vscode" },
        { text: "Windows Neovim 配置", link: "/blog/windows-neovim-c" },
      ],
    },
  ];
}
