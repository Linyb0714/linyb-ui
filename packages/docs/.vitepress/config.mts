import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "YouI",
  description: "林优斌个人组件库｜ElemntPlus",
  base: "/YouI",
  head: [
    /**
     * 这里用到了公用目录 public ： 资源路径可以直接用绝对路径 /xxx
     * 渲染效果 ：<link rel="icon" href="/abc.png">
     */
    ['link',{ rel: 'icon', href: '/YouI/favicon.ico' }],
    /**
     * 在head中插入了一个 script 标签，
     * 渲染效果如下：
     * <script id="abcscript">
     *  console.log(1001)
     * </script>
     */
    // ['script',{id:'abcscript'},`console.log(1001)`] 
  ],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/crown.svg',
    nav: [
      { text: '首页', link: '/' },
      // { text: '素材', link: '/do' },
      // { text: '案例', link: '/案例分析' }
    ],

    sidebar: [
      {
        text: '素材',
        items: [
          { text: '案例分析', link: '/markdown-examples' },
          // { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      },
      {
        text: '案例',
        items: [
          { text: '案例分析', link: '/markdown-examples' },
          // { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Linyb0714/linyb-blog' }
    ],
    footer: {
      copyright: "linyb0714@foxmail.com ® 17720810639",
    },
  }
})
