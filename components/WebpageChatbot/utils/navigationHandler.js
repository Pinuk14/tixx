export const handleNavigation = (url) => {
  if (url) {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.location.href = url;
    } else {
      // Assuming React Router or similar is handling history if not absolute,
      // but as a fallback for standard HTML/JS integration we can just use location
      window.location.href = url;
    }
  }
};
