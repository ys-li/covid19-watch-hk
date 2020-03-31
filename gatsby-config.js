module.exports = {
  siteMetadata: {
    title: `Wars Watch HK`,
    description: `Simple dashboard for nCoV-2019 in Hong Kong`,
    author: `@warswatch`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `HK WARS Watch`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#172b4d`,
        theme_color: `#172b4d`,
        display: `minimal-ui`,
        icon: `src/images/android-chrome-512x512.png`, // This path is relative to the root of the site.
      },
    },
    `gatsby-plugin-typescript`,
    'gatsby-plugin-sass',
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    {
      resolve: '@martinreiche/gatsby-firestore',
      options: {
        credential: require('./firestore_admin.json'),
        types: [
          {
            type: 'Case',
            collection: 'cases',
            map: c => ({
              age: parseInt(c.age + 0),
              history: c.history,
              sex: c.sex,
              confirm_timestamp: c.confirm_timestamp.toDate(),
              patient_id: c.patient_id,
              exposures: c.exposures.map((e) => ({
                patient_id: e.patient_id,
                timestamp: e.timestamp.toDate(),
                district: e.district,
                address: e.address,
                remarks: e.remarks,
              })),
              updated_at: c.updated_at.toDate(),
            }),
          },
        ],
      },
    },
  ],
}
