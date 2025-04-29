module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production'
      ? {
          '@fullhuman/postcss-purgecss': {
            content: [
              './app/**/*.{js,ts,jsx,tsx,mdx}',
              './pages/**/*.{js,ts,jsx,tsx,mdx}',
              './components/**/*.{js,ts,jsx,tsx,mdx}',
            ],
            defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
            safelist: {
              standard: [
                /^data-/,
                /^aria-/,
                /^fade-/,
                /^animation-/,
                /^transition-/,
                /^transform-/,
                /^overlay/,
                /^modal/,
                /^visible/,
                /^selected/,
                /^current/
              ],
              deep: [/modal/, /dialog/, /overlay/, /fade/, /visible/],
              greedy: [/animation$/, /transition$/, /modal$/, /overlay$/],
            },
          },
          cssnano: {
            preset: 'default',
          },
        }
      : {}),
  },
};