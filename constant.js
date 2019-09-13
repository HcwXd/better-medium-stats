const NOW = {
  epoch: new Date(),
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
  date: new Date().getDate(),
};

const MEDIUM_HOURLY_STATS_URL = (toTime, fromTime) =>
  `https://medium.com/me/stats/total/${toTime.getTime()}/${fromTime.getTime()}`;

const MEDIUM_FOLLOWERS_STATS_URL = (username) =>
  `https://medium.com/@${username}/followers?format=json`;
const MEDIUM_SUMMARY_STATS_URL = `https://medium.com/me/stats?format=json&limit=100000`;
const MEDIUM_NOTI_STATS_URL = `https://medium.com/_/api/activity?limit=10000`;

const NUMBER_OF_MONTH_FETCHED = 120;

const NOTI_EVENT_TYPE = {
  follow: 'users_following_you',
  highlight: 'quote',
  clap: 'post_recommended',
};
