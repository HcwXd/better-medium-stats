displaySummaryData();
// displayNotiData();

function numFormater(number) {
  const SI_SYMBOL = ['', 'k', 'M', 'G', 'T', 'P', 'E'];

  let tier = (Math.log10(number) / 3) | 0;
  if (tier == 0) return number;
  let suffix = SI_SYMBOL[tier];
  let scale = Math.pow(10, tier * 3);
  let scaled = number / scale;
  return scaled.toFixed(1) + suffix;
}

function displaySummaryData() {
  fetch('https://medium.com/me/stats?format=json&limit=100000')
    .then(function(response) {
      return response.text();
    })
    .then(function(textRes) {
      const data = JSON.parse(textRes.split('</x>')[1]);
      const storyRawData = data.payload.value;
      const storyData = {
        totalViews: getTotal(storyRawData, 'views'),
        totalReads: getTotal(storyRawData, 'reads'),
        totalClaps: getTotal(storyRawData, 'claps'),
        totalUpvotes: getTotal(storyRawData, 'upvotes'),
        totalStories: storyRawData.length,
      };
      renderStoryData(storyData);
    })
    .catch(function(err) {
      console.error(err);
      const errorMsg = `<div class="label">Please log in to your Medium account :)<div>`;
      document.querySelector('#table_container').innerHTML = errorMsg;
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
                          <td>${numFormater(totalViews)}</td>
                          <td>${numFormater(totalReads)}</td>
                          <td>${numFormater(totalClaps)}</td>
                          <td>${numFormater(totalUpvotes)}</td>
                        </tr>
                        <tr>
                          <td>Average</td>
                          <td>${numFormater(Math.floor(totalViews / totalStories))}</td>
                          <td>${numFormater(Math.floor(totalReads / totalStories))}</td>
                          <td>${numFormater(Math.floor(totalClaps / totalStories))}</td>
                          <td>${numFormater(Math.floor(totalUpvotes / totalStories))}</td>
                        </tr>
                      </tbody>
                    <table/>
                  `;

    document.querySelector('.container').innerHTML = html;
  }
}
// function displayNotiData() {
//   let notiStats = createNotiStats();

//   fetchNextNoti({ to: -1 });

//   function createNotiStats(notiOffset = 30) {
//     let obj = {};
//     for (let i = 0; i <= notiOffset; i++) {
//       const key = getDateKeyFromEpoch(new Date(NOW.year, NOW.month, NOW.date - notiOffset + i));
//       obj[key] = {
//         follow: { count: 0, followers: [] },
//         highlight: { count: 0, posts: [] },
//         clap: { count: 0, posts: [] },
//       };
//     }
//     return obj;
//   }

//   function fetchNextNoti({ to }) {
//     const fetchUrl = `https://medium.com/_/api/activity?limit=10000${to === -1 ? '' : `&to=${to}`}`;
//     const isRollup = (type) => type.slice(type.length - 6, type.length) === 'rollup';

//     fetch(fetchUrl)
//       .then(function(response) {
//         return response.text();
//       })
//       .then(function(textRes) {
//         const data = JSON.parse(textRes.split('</x>')[1]);
//         const { value: notiRawData, paging } = data.payload;

//         notiRawData.forEach((notiItem) => {
//           if (isRollup(notiItem.activityType)) {
//             notiItem.rollupItems.forEach((noti) => countSingleNoti(noti));
//           } else {
//             countSingleNoti(notiItem);
//           }
//         });

//         if (paging && paging.next) {
//           fetchNextNoti(paging.next);
//         } else {
//           renderNotiStats();
//         }
//       })
//       .catch(function(err) {
//         console.error(err);
//         document.querySelector('#noti_loader').style.display = 'none';
//       });
//   }

//   const notiEventType = {
//     users_following_you: { name: 'follow', data: 'followers', idName: 'actorId' },
//     quote: { name: 'highlight', data: 'posts', idName: 'postId' },
//     post_recommended: { name: 'clap', data: 'posts', idName: 'postId' },
//   };

//   let lastNotiNotTrack;
//   function countSingleNoti(noti) {
//     let key = getDateKeyFromEpoch(new Date(noti.occurredAt));
//     if (notiStats[key] !== undefined) {
//       const { name, data, idName } = notiEventType[noti.activityType];
//       notiStats[key][name].count++;
//       notiStats[key][name][data].push(noti[idName]);
//     } else {
//       lastNotiNotTrack = key;
//     }
//   }

//   function renderNotiStats() {
//     console.log(lastNotiNotTrack);
//     const ctx = document.getElementById('notiChart').getContext('2d');
//     document.querySelector('#noti_loader').style.display = 'none';
//     const chart = new Chart(ctx, {
//       type: 'line',
//       data: {
//         labels: Object.keys(notiStats).map((key) => getDateLabelFromDateKey(key)),
//         datasets: [
//           {
//             label: 'Daily followers',
//             borderColor: '#6eb799',
//             data: [...Object.keys(notiStats).map((key) => notiStats[key].follow.count)],
//           },
//           {
//             label: 'Daily claps',
//             borderColor: '#b7746e',
//             data: [...Object.keys(notiStats).map((key) => notiStats[key].clap.count)],
//           },
//           {
//             label: 'Daily highlights',
//             borderColor: '#b76eb1',
//             data: [...Object.keys(notiStats).map((key) => notiStats[key].highlight.count)],
//           },
//         ],
//       },

//       options: {
//         elements: {
//           line: {
//             backgroundColor: 'rgba(0,0,0,0)',
//             pointBackgroundColor: 'rgba(0,0,0,0)',
//             tension: 0,
//           },
//         },
//       },
//     });
//   }
// }

// function renderHourStats() {
//   const ctx = document.getElementById('hourStatsChart').getContext('2d');
//   document.querySelector('#hourStats_loader').style.display = 'none';
//   // renderDayStats(ctx);
//   renderHourlyStats(ctx);
//   // renderDateStats(ctx);
// }

// function renderHourlyStats(ctx) {
//   const chart = new Chart(ctx, {
//     type: 'bar',
//     data: {
//       labels: [...Array(23)].map((_, idx) => `${idx}:00`),
//       datasets: [
//         {
//           label: 'Avg Views',
//           borderColor: '#6eb799',
//           backgroundColor: '#6eb799',
//           data: sumByHour.map((el) => Math.floor(el / 365)),
//         },
//       ],
//     },

//     options: {
//       scales: {
//         yAxes: [
//           {
//             ticks: {
//               beginAtZero: true,
//             },
//           },
//         ],
//       },
//     },
//   });
// }

// function renderDayStats(ctx) {
//   const chart = new Chart(ctx, {
//     type: 'bar',
//     data: {
//       labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
//       datasets: [
//         {
//           label: 'Avg Views',
//           borderColor: '#6eb799',
//           backgroundColor: '#6eb799',
//           data: sumByDay.map((el) => Math.floor(el / 52)),
//         },
//       ],
//     },

//     options: {
//       scales: {
//         yAxes: [
//           {
//             ticks: {
//               beginAtZero: true,
//             },
//           },
//         ],
//       },
//     },
//   });
// }
// function renderDateStats(ctx) {
//   let dateSum = {};
//   hour.forEach(([time, views]) => {
//     let key = getDateKeyFromEpoch(time);
//     if (!dateSum[key]) dateSum[key] = 0;
//     dateSum[key] += views;
//   });
//   const chart = new Chart(ctx, {
//     type: 'bar',
//     data: {
//       labels: Object.keys(dateSum).map((key) => getDateLabelFromDateKey(key)),
//       datasets: [
//         {
//           label: 'Avg Views',
//           borderColor: '#6eb799',
//           backgroundColor: '#6eb799',
//           data: dateSum,
//         },
//       ],
//     },

//     options: {
//       scales: {
//         yAxes: [
//           {
//             ticks: {
//               beginAtZero: true,
//             },
//           },
//         ],
//       },
//     },
//   });
// }
