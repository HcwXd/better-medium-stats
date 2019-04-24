fetch('https://medium.com/me/stats?format=json&limit=100000')
  .then(function(response) {
    return response.text();
  })
  .then(function(textRes) {
    let data = JSON.parse(textRes.split('</x>')[1]);
    let storyRawData = data.payload.value;
    let totalStories = storyRawData.length;
    let storyData = {
      totalViews: getTotal(storyRawData, 'views'),
      totalReads: getTotal(storyRawData, 'reads'),
      totalClaps: getTotal(storyRawData, 'claps'),
      totalUpvotes: getTotal(storyRawData, 'upvotes'),
      totalStories,
    };
    renderStoryData(storyData);
  })
  .catch(function() {
    document.querySelector('.loader').style.display = 'none';
    document.querySelector(
      '.container'
    ).innerHTML = `<div class="label">Please log in to your Medium account :)<div>`;
  });

function getTotal(arr, type) {
  return arr.reduce((sum, el) => {
    return sum + el[type];
  }, 0);
}

function renderStoryData({ totalViews, totalReads, totalClaps, totalUpvotes, totalStories }) {
  document.querySelector('.loader').style.display = 'none';
  const html = `
  <table>
      <thead>
        <tr>
          <th>Types</th>
          <th>Views</th>
          <th>Reads</th>
          <th>Fans</th>
          <th>Claps</th>
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

let total = 0;
let totalNoti = 0;
let followTrend = createLast30DaysObject();
const nowDate = new Date();

fetchNextNoti({ to: -1 });

function createLast30DaysObject() {
  let obj = {};
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const date = today.getDate();
  for (let i = 0; i <= 30; i++) {
    const day = new Date(year, month - 1, date + i);
    let key = day.getFullYear() * 10000 + (day.getMonth() + 1) * 100 + day.getDate();

    obj[key] = 0;
  }
  return obj;
}

function fetchNextNoti({ to }) {
  let fetchUrl =
    to === -1
      ? 'https://medium.com/_/api/activity?limit=10000'
      : `https://medium.com/_/api/activity?limit=${10000}&to=${to}`;

  fetch(fetchUrl)
    .then(function(response) {
      return response.text();
    })
    .then(function(textRes) {
      let data = JSON.parse(textRes.split('</x>')[1]);
      let { value: notiRawData, paging } = data.payload;
      notiRawData.forEach((el) => {
        totalNoti++;
        if (el.activityType === 'users_following_you') {
          countAndLog(el);
        } else if (el.activityType === 'users_following_you_rollup') {
          el.rollupItems.forEach((ell) => {
            countAndLog(ell);
          });
        }
      });
      if (paging && paging.next) {
        fetchNextNoti(paging.next);
      } else {
        console.log('total:', total);
        console.log('totalNoti:', totalNoti);
        console.log(followTrend);
        renderFollowTrend();
      }
    })
    .catch(function(err) {
      console.log(err);
    });
}
function renderFollowTrend() {
  const ctx = document.getElementById('myChart').getContext('2d');

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Object.keys(followTrend).map(
        (key) => `${Math.floor((key % 10000) / 100)}/${key % 100}`
      ),
      datasets: [
        {
          // label: 'My First dataset',
          // backgroundColor: 'rgb(255, 99, 132)',
          // borderColor: 'rgb(255, 99, 132)',
          data: [...Object.keys(followTrend).map((key) => followTrend[key])],
        },
      ],
    },

    // Configuration options go here
    options: {
      elements: {
        line: {
          tension: 0, // disables bezier curves
        },
      },
    },
  });
}

function countAndLog(obj) {
  let date = new Date(obj.occurredAt);
  let key = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  if (followTrend[key] !== undefined) {
    followTrend[key]++;
  }
  total++;
}
