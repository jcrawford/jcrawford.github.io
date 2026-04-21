import type { GatsbyBrowser } from 'gatsby';

export const onClientEntry: GatsbyBrowser['onClientEntry'] = () => {
  const savedTheme = localStorage.getItem('theme');
  const theme = savedTheme === 'light' ? 'light' : 'dark';

  if (theme === 'dark') {
    document.documentElement.classList.add('hm-dark');
  } else {
    document.documentElement.classList.remove('hm-dark');
  }
};

