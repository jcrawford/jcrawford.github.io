import type { GatsbyBrowser } from 'gatsby';

export const onClientEntry: GatsbyBrowser['onClientEntry'] = () => {
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('hm-dark');
  } else {
    document.documentElement.classList.remove('hm-dark');
  }
};

