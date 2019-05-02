fetch('https://medium.com/me/stats?format=json&limit=100000')
  .then(function(response) {
    return response.text();
  })
  .then(function(textRes) {
    const data = JSON.parse(textRes.split('</x>')[1]);
    const storyRawData = data.payload.value;
    const totalStories = storyRawData.length;
    const storyData = {
      totalViews: getTotal(storyRawData, 'views'),
      totalReads: getTotal(storyRawData, 'reads'),
      totalClaps: getTotal(storyRawData, 'claps'),
      totalUpvotes: getTotal(storyRawData, 'upvotes'),
      totalStories,
    };
    renderStoryData(storyData);
  })
  .catch(function(err) {
    const errorMsg = `<div class="label">Please log in to your Medium account :)<div>`;
    document.querySelector('#table_container').innerHTML = errorMsg;
    console.error(err);
  });

function getTotal(arr, type) {
  return arr.reduce((sum, el) => {
    return sum + el[type];
  }, 0);
}

function renderStoryData({ totalViews, totalReads, totalClaps, totalUpvotes, totalStories }) {
  document.querySelector('#table_loader').style.display = 'none';
  const html = `
  <table>
      <thead>
        <tr>
          <th>Types</th>
          <th>Views</th>
          <th>Reads</th>
          <th>Claps</th>
          <th>Fans</th>
        </tr>
      <thead>
      <tbody>
        <tr>
          <td>Total</td>
          <td>${totalViews.toLocaleString()}</td>
          <td>${totalReads.toLocaleString()}</td>
          <td>${totalClaps.toLocaleString()}</td>
          <td>${totalUpvotes.toLocaleString()}</td>
        </tr>
        <tr>
          <td>Average</td>
          <td>${Math.floor(totalViews / totalStories).toLocaleString()}</td>
          <td>${Math.floor(totalReads / totalStories).toLocaleString()}</td>
          <td>${Math.floor(totalClaps / totalStories).toLocaleString()}</td>
          <td>${Math.floor(totalUpvotes / totalStories).toLocaleString()}</td>
        </tr>
      </tbody>
    <table/>
  `;

  document.querySelector('.container').innerHTML = html;
}

let last30DaysStats = createLast30DaysObject();

fetchNextNoti({ to: -1 });

function createLast30DaysObject() {
  let obj = {};
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const date = today.getDate();
  for (let i = 0; i <= 30; i++) {
    const day = new Date(year, month, date - 30 + i);
    const key = day.getFullYear() * 10000 + (day.getMonth() + 1) * 100 + day.getDate();

    obj[key] = {
      follow: { count: 0, followers: [] },
      highlight: { count: 0, posts: [] },
      clap: { count: 0, posts: [] },
    };
  }
  return obj;
}

function fetchNextNoti({ to }) {
  const fetchUrl =
    to === -1
      ? 'https://medium.com/_/api/activity?limit=10000'
      : `https://medium.com/_/api/activity?limit=${10000}&to=${to}`;

  const isRollup = (type) => type.slice(type.length - 6, type.length) === 'rollup';

  fetch(fetchUrl)
    .then(function(response) {
      return response.text();
    })
    .then(function(textRes) {
      const data = JSON.parse(textRes.split('</x>')[1]);
      const { value: notiRawData, paging } = data.payload;

      notiRawData.forEach((notiItem) => {
        if (isRollup(notiItem.activityType)) {
          notiItem.rollupItems.forEach((noti) => countSingleNoti(noti));
        } else {
          countSingleNoti(notiItem);
        }
      });

      if (paging && paging.next) {
        fetchNextNoti(paging.next);
      } else {
        render30DaysStats();
      }
    })
    .catch(function(err) {
      document.querySelector('#line_loader').style.display = 'none';
      console.error(err);
    });
}

const eventType = {
  follow: 'users_following_you',
  highlight: 'quote',
  clap: 'post_recommended',
};
let lastNotiNotTrack;
function countSingleNoti(noti) {
  let date = new Date(noti.occurredAt);
  let key = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  if (last30DaysStats[key] !== undefined) {
    if (noti.activityType === eventType.follow) {
      last30DaysStats[key].follow.count++;
      last30DaysStats[key].follow.followers.push(noti.actorId);
    } else if (noti.activityType === eventType.clap) {
      last30DaysStats[key].clap.count++;
      last30DaysStats[key].clap.posts.push(noti.postId);
    } else if (noti.activityType === eventType.highlight) {
      last30DaysStats[key].highlight.count++;
      last30DaysStats[key].highlight.posts.push(noti.postId);
    }
  } else {
    lastNotiNotTrack = key;
  }
}

function render30DaysStats() {
  // console.log(last30DaysStats);
  console.log(lastNotiNotTrack);
  const ctx = document.getElementById('notiChart').getContext('2d');
  document.querySelector('#noti_loader').style.display = 'none';
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Object.keys(last30DaysStats).map(
        (key) => `${Math.floor((key % 10000) / 100)}/${key % 100}`
      ),
      datasets: [
        {
          label: 'Daily followers',
          borderColor: '#6eb799',
          data: [...Object.keys(last30DaysStats).map((key) => last30DaysStats[key].follow.count)],
        },
        {
          label: 'Daily claps',
          borderColor: '#b7746e',
          data: [...Object.keys(last30DaysStats).map((key) => last30DaysStats[key].clap.count)],
        },
        {
          label: 'Daily highlights',
          borderColor: '#b76eb1',
          data: [
            ...Object.keys(last30DaysStats).map((key) => last30DaysStats[key].highlight.count),
          ],
        },
      ],
    },

    options: {
      elements: {
        line: {
          backgroundColor: 'rgba(0,0,0,0)',
          pointBackgroundColor: 'rgba(0,0,0,0)',
          tension: 0,
        },
      },
    },
  });
}
let hour = [];
let hourSum = [...Array(24)].fill(0);
let daySum = [...Array(7)].fill(0);

const today = new Date();

fetchStoriesHourStats();
function fetchStoriesHourStats(now = new Date()) {
  if (now < new Date(today.getFullYear() - 1, today.getMonth() - 1, today.getDate())) {
    renderHourStats();
    return;
  }
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();
  const then = new Date(year, month - 1, date);
  const fetchUrl = `https://medium.com/me/stats/total/${then.getTime()}/${now.getTime()}`;

  fetch(fetchUrl)
    .then(function(response) {
      return response.text();
    })
    .then(function(textRes) {
      const data = JSON.parse(textRes.split('</x>')[1]);
      const { value: notiRawData } = data.payload;
      console.log(now);
      console.log(notiRawData.length);

      notiRawData.forEach((notiItem) => {
        let timeStamp = new Date(notiItem.timestampMs);
        hour.push([timeStamp, notiItem.views]);
        hourSum[timeStamp.getHours()] += notiItem.views;
        daySum[timeStamp.getDay()] += notiItem.views;
      });
      fetchStoriesHourStats(then);
    })
    .catch(function(err) {
      console.error(err);
    });
}

function renderHourStats() {
  console.log(lastNotiNotTrack);
  const ctx = document.getElementById('hourStatsChart').getContext('2d');
  document.querySelector('#hourStats_loader').style.display = 'none';
  // renderDayStats(ctx);
  renderHourlyStats(ctx);
}

function renderHourlyStats(ctx) {
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [...Array(23)].map((_, idx) => `${idx}:00`),
      datasets: [
        {
          label: 'Avg Views',
          borderColor: '#6eb799',
          backgroundColor: '#6eb799',
          data: hourSum.map((el) => Math.floor(el / 365)),
        },
      ],
    },

    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
  });
}

function renderDayStats(ctx) {
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      datasets: [
        {
          label: 'Avg Views',
          borderColor: '#6eb799',
          backgroundColor: '#6eb799',
          data: daySum.map((el) => Math.floor(el / 52)),
        },
      ],
    },

    options: {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
  });
}
