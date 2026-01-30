export const getNextShow = (shows) => {
  const now = new Date();
  return shows
    .filter(show => new Date(show.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
};
