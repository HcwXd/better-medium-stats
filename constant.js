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
const AVATAR_URL = `https://cdn-images-1.medium.com/fit/c/64/64/`;

const NUMBER_OF_MONTH_FETCHED = 120;

const NOTI_EVENT_TYPE = {
  follow: 'users_following_you',
  highlight: 'quote',
  clap: 'post_recommended',
};

const ERROR_MESSAGE = `<div class="error_message_container">
                          <span class="error_title">Something went wrong, please try again later.</span>
                          <br><br>
                          Medium is changing the method of getting data frequently and Better Medium Stats may not work due to some changes. I'll fix the extension as soon as possible once I find out the changes.
                          <br><br>
                          If you keep getting errors and are willing to provide more information to help fix problems, feel free to reach out to me in your most convenient way. My contact information can be found at <a class="link" href="https://chengweihu.com/" rel="noopener noreferrer" target="_blank";">chengweihu.com</a>.
                          <br><br>
                          Thanks for your patience :)
                          <br><br>
                          <img class="sorry_gif" src="/icon/sorry.gif"/>
                       </div>`;
