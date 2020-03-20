module.exports = {
  siteMetadata: {
    title: "Joseph Crawford",
    titleFirst: "Joseph",
    titleLast: "Crawford",
    author: "Joseph Crawford",
    menuLinks: [
      {
        name: "Home",
        link: "/",
      },
      {
        name: "Reviews",
        link: "/reviews/",
      },
      {
        name: "Articles",
        children: [],
      },
      {
        name: "Resume",
        children: [
          {
            name: "Word",
            link: "/resumes/resume.docx",
          },
          {
            name: "PDF",
            link: "/resumes/resume.pdf",
          },
        ],
      },
      {
        name: "About",
        link: "/about/",
      },
      {
        name: "Contact",
        link: "/contact/",
      },
    ],
  },
  plugins: [
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-sass",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        name: "src",
        path: `${__dirname}/src/`,
      },
    },
    "gatsby-plugin-sharp",
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: [
          "gatsby-remark-relative-images",
          {
            resolve: "gatsby-remark-images",
            options: {
              maxWidth: 750,
              linkImagesToOriginal: false,
            },
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-prefetch-google-fonts`,
      options: {
        fonts: [
          {
            family: `PT+Sans`,
            variants: [`400`, `700`, `400i`, `700i`],
            subsets: [`latin`, `cyrillic`],
          },
          {
            family: `Roboto`,
            subsets: [`latin`],
          },
        ],
      },
    },
  ],
}
