fetch('https://medium.com/me/stats?format=json&limit=100000')
  .then(function(response) {
    return response.text();
  })
  .then(function(textRes) {
    let JsonRes = textRes.split('</x>')[1];
    let data = JSON.parse(JsonRes);
    let storyRawData = data.payload.value;
    let totalStories = storyRawData.length;
    let storyData = {
      totalViews: getTotal(storyRawData, 'views'),
      totalReads: getTotal(storyRawData, 'reads'),
      totalClaps: getTotal(storyRawData, 'claps'),
      totalUpvotes: getTotal(storyRawData, 'upvotes'),
      totalStories,
    };
    render(storyData);
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

let total = 0;
let totalNoti = 0;
let followTrend = {};
const nowDate = new Date();

fetchNoti();

function fetchNoti() {
  fetch('https://medium.com/_/api/activity?limit=10000')
    .then(function(response) {
      return response.text();
    })
    .then(function(textRes) {
      let JsonRes = textRes.split('</x>')[1];
      let data = JSON.parse(JsonRes);
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
      if (paging) {
        fetchNextNoti(paging.next);
      } else {
        console.log('TOTAL:', total);
      }
    })
    .catch(function(err) {
      console.log(err);
    });
}

function fetchNextNoti({ to }) {
  fetch(`https://medium.com/_/api/activity?limit=${10000}&to=${to}`)
    .then(function(response) {
      return response.text();
    })
    .then(function(textRes) {
      let JsonRes = textRes.split('</x>')[1];
      let data = JSON.parse(JsonRes);
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
function renderFollowTrend() {}

function countAndLog(obj) {
  let date = new Date(obj.occurredAt);
  let key = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  if (followTrend[key]) {
    followTrend[key]++;
  } else {
    followTrend[key] = 1;
  }
  total++;
}

function render({ totalViews, totalReads, totalClaps, totalUpvotes, totalStories }) {
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
