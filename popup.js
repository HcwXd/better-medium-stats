'use strict';

let isReadyToRender = false;
let storiesData;

const nav_items = document.querySelectorAll('.nav_item');
nav_items.forEach((el) => el.addEventListener('click', handleChangeTab));

function handleChangeTab() {
  nav_items.forEach((el) => {
    if (el.dataset.name !== this.dataset.name) {
      el.classList.remove('nav_item-active');
      document.querySelector(`#${el.dataset.name}_container`).style.display = 'none';
    } else {
      el.classList.add('nav_item-active');
      document.querySelector(`#${el.dataset.name}_container`).style.display = 'flex';
    }
  });
}

displaySummaryData();

function displaySummaryData() {
  /**
   * 1. Total Views
   * 2. Total Followers
   * 3. Last 24 hours / 7 days / 30 days views
   * 4. General Table
   */

  fetch(MEDIUM_SUMMARY_STATS_URL)
    .then((response) => response.text())
    .then((response) => {
      const data = JSON.parse(response.split('</x>')[1]);
      const storyRawData = data && data.payload && data.payload.value;
      const users =
        (data && data.payload && data.payload.references && data.payload.references.User) || {};
      const { username } = Object.values(users)[0] || {};

      return fetch(MEDIUM_FOLLOWERS_STATS_URL(username))
        .then((response) => response.text())
        .then((response) => {
          const data = JSON.parse(response.split('</x>')[1]);
          const followersRawData = data.payload;
          return {
            storyRawData,
            followersRawData,
          };
        });
    })
    .then(({ storyRawData, followersRawData }) => {
      storiesData = storyRawData.slice();
      const storyData = {
        totalViews: getTotal(storyRawData, 'views'),
        totalReads: getTotal(storyRawData, 'reads'),
        totalClaps: getTotal(storyRawData, 'claps'),
        totalUpvotes: getTotal(storyRawData, 'upvotes'),
        totalStories: storyRawData.length,
      };
      const followerCount = (Object.values(followersRawData.references.SocialStats)[0] || {})
        .usersFollowedByCount;

      renderSummaryData({ followerCount, ...storyData });

      renderStoryData();
    })
    .catch(function(err) {
      console.error(err);
      const errorMsg = `<div class="label">Please log in to your Medium account :)<div>`;
      document.querySelector('#summary_container').innerHTML = errorMsg;
    });

  function getTotal(arr, type) {
    return arr.reduce((sum, el) => {
      return sum + el[type];
    }, 0);
  }
  function renderStoryData() {
    handleStoriesDownload();
    renderStoriesHandler('views');
  }

  function renderSummaryData({
    followerCount,
    totalViews,
    totalReads,
    totalClaps,
    totalUpvotes,
    totalStories,
  }) {
    document.querySelector('.total_views').innerHTML = totalViews.toLocaleString();
    document.querySelector('.total_followers').innerHTML = followerCount.toLocaleString();

    const html = `<table>
                      <thead>
                        <tr>
                          <th></th>
                          <th>Stories</th>
                          <th>Views</th>
                          <th>Reads</th>
                          <th>R/V</th>
                          <th>Claps</th>
                          <th>Fans</th>
                          <th>C/F</th>
                        </tr>
                      <thead>
                      <tbody>
                        <tr>
                          <td>Total</td>
                          <td>${numFormater(totalStories)}</td>
                          <td>${numFormater(totalViews)}</td>
                          <td>${numFormater(totalReads)}</td>
                          <td>${(totalReads / totalViews).toFixed(2) * 100}%</td>
                          <td>${numFormater(totalClaps)}</td>
                          <td>${numFormater(totalUpvotes)}</td>
                          <td>${numFormater((totalClaps / totalUpvotes).toFixed(1))}</td>
                        </tr>
                      </tbody>
                    <table/>
                  `;

    document.querySelector('.summary_table').innerHTML = html;
    if (isReadyToRender) {
      document.querySelector('#summary_loader').style.display = 'none';
      document.querySelector('.summary_wrap').style.display = 'flex';
    } else {
      isReadyToRender = true;
    }
  }
}

const fetchReadyState = Array(NUMBER_OF_MONTH_FETCHED).fill(false);
const hourViews = [];
const monthViews = [...Array(NUMBER_OF_MONTH_FETCHED / 12 + 1)].map(() =>
  [...Array(12)].map(() => 0)
);
const sumByHour = [...Array(24)].fill(0);
const sumByDay = [...Array(7)].fill(0);

let timeFormatState = 'day';
let fromTimeState = 0;
let isFinishFetch = false;
let zeroViewCounter = 0;
let alignHourOffset = 0;

const timeFormatBtnWrap = document.querySelector('.time_format_btn_wrap');
timeFormatBtnWrap.addEventListener('click', function(e) {
  if (e.target.classList.contains('format_btn-select')) return;

  for (let child of this.children) {
    if (child !== e.target) {
      child.classList.remove('format_btn-select');
    } else {
      child.classList.add('format_btn-select');
    }
  }
  changeTimeFormatState(e.target.dataset.timeformat);
});

function changeTimeFormatState(newTimeFormat) {
  timeFormatState = newTimeFormat;
  if (hourViews[fromTimeState] !== undefined) {
    backwardTimeBtn.classList.remove('change_time_btn-prohibit');
  }
  renderHandler[timeFormatState](fromTimeState);
}

const forwardTimeBtn = document.querySelector('.forward_time_btn');
forwardTimeBtn.addEventListener('click', forwardTimeHandler);

const backwardTimeBtn = document.querySelector('.backward_time_btn');
backwardTimeBtn.addEventListener('click', backwardTimeHandler);

function forwardTimeHandler() {
  if (
    this.classList.contains('change_time_btn-prohibit') &&
    hourViews[fromTimeState] === undefined
  ) {
    return;
  }

  if (timeFormatState === 'hour') {
    fromTimeState -= 24;
  } else if (timeFormatState === 'day') {
    fromTimeState -= 24 * 7;
  } else if (timeFormatState === 'week') {
    fromTimeState -= 24 * 7 * 8;
  } else if (timeFormatState === 'month') {
    fromTimeState -= 24 * 30 * 6;
  } else if (timeFormatState === 'year') {
    fromTimeState -= 24 * 30 * 12;
  }
  if (fromTimeState <= 0) {
    fromTimeState = 0;
    forwardTimeBtn.classList.add('change_time_btn-prohibit');
  }
  if (hourViews[fromTimeState] !== undefined) {
    backwardTimeBtn.classList.remove('change_time_btn-prohibit');
  }
  renderHandler[timeFormatState](fromTimeState);
}

function backwardTimeHandler() {
  if (this.classList.contains('change_time_btn-prohibit')) return;
  let oldFromTimeState = fromTimeState;

  if (timeFormatState === 'hour') {
    fromTimeState += 24;
  } else if (timeFormatState === 'day') {
    fromTimeState += 24 * 7;
  } else if (timeFormatState === 'week') {
    fromTimeState += 24 * 7 * 8;
  } else if (timeFormatState === 'month') {
    fromTimeState += 24 * 30 * 6;
  } else if (timeFormatState === 'year') {
    fromTimeState += 24 * 30 * 12;
  }
  if (fromTimeState > 0 && forwardTimeBtn.classList.contains('change_time_btn-prohibit')) {
    forwardTimeBtn.classList.remove('change_time_btn-prohibit');
  }
  if (hourViews[fromTimeState] === undefined && hourViews[oldFromTimeState + 1] !== undefined) {
    backwardTimeBtn.classList.add('change_time_btn-prohibit');
    fromTimeState = hourViews.length - 1;
  }
  renderHandler[timeFormatState](fromTimeState);
}

init();
const renderHandler = {
  hour: function(hourIdx) {
    let labels = [];
    let data = [];
    for (let idx = 0; idx < 24; idx++) {
      if (hourViews[hourIdx + idx] === undefined) {
        backwardTimeBtn.classList.add('change_time_btn-prohibit');
        break;
      }
      let [timeStamp, views] = hourViews[hourIdx + idx];
      let label = `${23 - idx}:00 - ${23 - idx + 1}:00 (${timeStamp.getMonth() +
        1}/${timeStamp.getDate()})`;
      labels.push(label);
      data.push(views);
    }

    renderBarChart(labels.reverse(), data.reverse(), hourViews[fromTimeState][0]);
  },
  day: function(hourIdx) {
    let labels = [];
    let data = [];
    for (let idx = 0; idx < 24 * 7; idx++) {
      if (hourViews[hourIdx + idx] === undefined) {
        backwardTimeBtn.classList.add('change_time_btn-prohibit');
        break;
      }
      let [timeStamp, views] = hourViews[hourIdx + idx];
      if (idx % 24 === 0) {
        let label = `${timeStamp.getMonth() + 1}/${timeStamp.getDate()}`;
        labels.push(label);
        data.push(0);
      }
      data[data.length - 1] += views;
    }

    renderBarChart(labels.reverse(), data.reverse(), hourViews[fromTimeState][0]);
  },
  week: function(hourIdx) {
    let labels = [];
    let data = [];
    for (let idx = 0; idx < 24 * 7 * 8; idx++) {
      if (hourViews[hourIdx + idx] === undefined) {
        backwardTimeBtn.classList.add('change_time_btn-prohibit');
        break;
      }
      let [timeStamp, views] = hourViews[hourIdx + idx];
      if (idx % (24 * 7) === 0) {
        let label =
          `${timeStamp.addTime('Date', -6).getMonth() + 1}/${timeStamp
            .addTime('Date', -6)
            .getDate()}` +
          ` - ` +
          `${timeStamp.getMonth() + 1}/${timeStamp.getDate()}`;

        labels.push(label);
        data.push(0);
      }
      data[data.length - 1] += views;
    }

    renderBarChart(labels.reverse(), data.reverse(), hourViews[fromTimeState][0]);
  },
  month: function(hourIdx) {
    let labels = [];
    let data = [];
    let curTime = hourViews[hourIdx][0];

    for (let idx = 0; idx < 6; idx++) {
      let label = `${curTime}`.split(' ')[1];
      labels.push(label);
      data.push(monthViews[NOW.year - curTime.getFullYear()][curTime.getMonth()]);
      curTime = curTime.addTime('Month', -1);
    }

    renderBarChart(labels.reverse(), data.reverse(), hourViews[fromTimeState][0]);
  },
  year: function(hourIdx) {
    let labels = [];
    let data = [];
    let curTime = hourViews[hourIdx][0];
    for (let idx = 0; idx < 3; idx++) {
      let label = `${curTime}`.split(' ')[3];
      labels.push(label);
      data.push(monthViews[NOW.year - curTime.getFullYear()].reduce((acc, cur) => acc + cur));
      curTime = curTime.addTime('FullYear', -1);
    }

    renderBarChart(labels.reverse(), data.reverse(), hourViews[fromTimeState][0]);
  },
};
const viewsCtx = document.getElementById('viewsChart').getContext('2d');
let viewsChart;

function renderBarChart(labels, data, timeStamp) {
  document.getElementById('viewsChart').style.display = 'block';
  document.querySelector('#views_loader').style.display = 'none';
  if (viewsChart) {
    viewsChart.data.datasets[0].data = data;
    viewsChart.data.labels = labels;
    viewsChart.options.title.text = timeStamp.getFullYear();
    viewsChart.update();
    return;
  }
  viewsChart = new Chart(viewsCtx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Views',
          borderColor: '#6eb799',
          backgroundColor: 'rgba(104, 172, 144, 0.9)',
          data: data,
        },
      ],
    },

    options: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: timeStamp.getFullYear(),
        position: 'bottom',
      },
      tooltips: {
        displayColors: false,
        callbacks: {
          title: function(tooltipItem, data) {
            return data.labels[tooltipItem[0].index];
          },
          label: function(tooltipItem, data) {
            return 'Views: ' + data.datasets[0].data[tooltipItem.index].toLocaleString();
          },
        },
      },

      scales: {
        xAxes: [
          {
            ticks: {
              callback: function(t) {
                return t.split(' - ')[0];
              },
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
              callback: function(value) {
                return value.toLocaleString();
              },
            },
          },
        ],
      },
    },
  });
}
const stories_format_btn_wrap = document.querySelector('.stories_format_btn_wrap');
stories_format_btn_wrap.addEventListener('click', function(e) {
  if (e.target.classList.contains('format_btn-select')) return;

  for (let child of this.children) {
    if (child !== e.target) {
      child.classList.remove('format_btn-select');
    } else {
      child.classList.add('format_btn-select');
    }
  }
  changeStoriesFormatState(e.target.dataset.storiesformat);
});

function changeStoriesFormatState(newStoriesFormat) {
  renderStoriesHandler(newStoriesFormat);
}

const renderStoriesHandler = (format) => {
  let stories;
  if (format === 'r/v') {
    stories = storiesData.map((story) => {
      return {
        title: story.title,
        [format]: story.reads / story.views,
      };
    });
  } else if (format === 'c/f') {
    stories = storiesData.map((story) => {
      return {
        title: story.title,
        [format]: story.claps / story.upvotes,
      };
    });
  } else {
    stories = storiesData.map((story) => {
      return {
        title: story.title,
        [format]: story[format],
      };
    });
  }
  stories.sort((a, b) => {
    return a[format] > b[format] ? -1 : a[format] == b[format] ? 0 : 1;
  });

  const labels = stories.slice(0, 5).map(({ title }) => title);
  const data = stories.slice(0, 5).map((story) => story[format]);

  if (format === 'upvotes') format = 'fans';
  renderStoriesChart(labels, data, format);
};

const storiesCtx = document.getElementById('storiesChart').getContext('2d');
let storiesChart;

function renderStoriesChart(labels, data, format) {
  document.getElementById('storiesChart').style.display = 'block';
  document.querySelector('#stories_loader').style.display = 'none';
  if (storiesChart) {
    storiesChart.data.datasets[0].data = data;
    storiesChart.data.datasets[0].label = format;
    storiesChart.data.labels = labels;
    storiesChart.options.title.text = '';
    storiesChart.update();
    return;
  }
  storiesChart = new Chart(storiesCtx, {
    type: 'horizontalBar',
    data: {
      labels: labels,
      datasets: [
        {
          label: format,
          borderColor: '#6eb799',
          backgroundColor: 'rgba(104, 172, 144, 0.9)',
          data: data,
        },
      ],
    },

    options: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: '',
        position: 'bottom',
      },
      tooltips: {
        displayColors: false,
        callbacks: {
          title: (tooltipItem, data) => data.labels[tooltipItem[0].index],
          label: (tooltipItem, data) =>
            `${data.datasets[0].label}: ${data.datasets[0].data[
              tooltipItem.index
            ].toLocaleString()}`,
        },
      },

      scales: {
        xAxes: [
          {
            ticks: {
              beginAtZero: true,
              callback: (t) => numFormater(t),
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              callback: (value) => trimString(value, 12),
            },
          },
        ],
      },
    },
  });
}

const renderViewsMetrics = () => {
  let daySum;
  let weekSum;
  let monthSum = 0;
  for (let idx = 0; idx < 24 * 30; idx++) {
    monthSum += hourViews[alignHourOffset + idx][1];
    if (idx === 24) daySum = monthSum;
    if (idx === 24 * 7) weekSum = monthSum;
  }
  document.querySelector('.day_views').innerHTML = numFormater(daySum);
  document.querySelector('.week_views').innerHTML = numFormater(weekSum);
  document.querySelector('.month_views').innerHTML = numFormater(monthSum);
  if (isReadyToRender) {
    document.querySelector('#summary_loader').style.display = 'none';
    document.querySelector('.summary_wrap').style.display = 'flex';
  } else {
    isReadyToRender = true;
  }
};

function init() {
  fetchStoriesStatsByMonth(NOW.epoch, 0);
  let lastTimeStamp;
  function fetchStoriesStatsByMonth(fromTime, monthIdx) {
    if (zeroViewCounter > 3 || monthIdx === NUMBER_OF_MONTH_FETCHED - 1) {
      isFinishFetch = true;
      handleViewsDownload();
      return;
    }

    const year = fromTime.getFullYear();
    const month = fromTime.getMonth();
    const date = fromTime.getDate();
    const toTime = new Date(year, month - 1, date);

    fetch(MEDIUM_HOURLY_STATS_URL(toTime, fromTime))
      .then(function(response) {
        return response.text();
      })
      .then(function(textRes) {
        const data = JSON.parse(textRes.split('</x>')[1]);
        const { value: rawData } = data.payload;
        let isZeroView = true;

        for (let idx = rawData.length - 1; idx >= 0; idx--) {
          let hourlyData = rawData[idx];
          if (hourlyData.views > 0 && isZeroView) isZeroView = false;
          let timeStamp = new Date(hourlyData.timestampMs);

          // Fill the gap btw two timestamps to ensure data continuity
          while (lastTimeStamp && getHourDiff(timeStamp, lastTimeStamp) > 1) {
            lastTimeStamp = lastTimeStamp.addTime('Hours', -1);
            hourViews.push([lastTimeStamp, 0]);
          }

          hourViews.push([timeStamp, hourlyData.views]);

          // Align the hourly data of the latest day to have 24 hours
          if (hourViews.length === 1) {
            while (hourViews[hourViews.length - 1][0].getHours() !== 23) {
              hourViews.push([hourViews[hourViews.length - 1][0].addTime('Hours', 1), 0]);
              alignHourOffset++;
            }
            hourViews.reverse();
          }
          if (hourViews.length - alignHourOffset === 24 * 30) {
            renderViewsMetrics(alignHourOffset);
          }

          sumByHour[timeStamp.getHours()] += hourlyData.views;
          sumByDay[timeStamp.getDay()] += hourlyData.views;
          monthViews[NOW.year - timeStamp.getFullYear()][timeStamp.getMonth()] += hourlyData.views;
          lastTimeStamp = timeStamp;
        }

        if (isZeroView) zeroViewCounter++;

        if (!fetchReadyState[monthIdx]) {
          fetchReadyState[monthIdx] = true;
          if (monthIdx === 0) renderHandler['day'](0);
        }

        fetchStoriesStatsByMonth(toTime, monthIdx + 1);
      })
      .catch(function(err) {
        console.error(err);
      });
  }
}

const views_download = document.querySelector('.views_download');
const views_download_loader = document.querySelector('.views_download_loader');
const views_download_wrap = document.querySelector('.views_download_wrap');
function handleViewsDownload() {
  exportViewsToCsv();
  views_download.style.display = 'block';
  views_download_loader.style.display = 'none';
}

function exportViewsToCsv() {
  let content = [['Year', 'Month', 'Day', 'Views']];
  let curDateViews = 0;
  let curDateKey = getDateKeyFromEpoch(new Date(hourViews[0]));
  for (let idx = 0; idx < hourViews.length; idx++) {
    const [timestamp, views] = hourViews[idx];
    const tmpDateKey = getDateKeyFromEpoch(new Date(timestamp));
    if (curDateKey !== tmpDateKey) {
      content.push([
        `${curDateKey}`.slice(0, 4),
        `${curDateKey}`.slice(4, 6),
        `${curDateKey}`.slice(6, 8),
        curDateViews,
      ]);
      curDateViews = 0;
      curDateKey = tmpDateKey;
    }
    curDateViews += views;
  }

  let finalVal = '';

  for (let i = 0; i < content.length; i++) {
    let value = content[i];

    for (let j = 0; j < value.length; j++) {
      let innerValue = value[j] === null ? '' : value[j].toString();
      let result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (j > 0) finalVal += ',';
      finalVal += result;
    }

    finalVal += '\n';
  }

  views_download_wrap.setAttribute(
    'href',
    'data:text/csv;charset=utf-8,' + encodeURIComponent(finalVal)
  );
  views_download_wrap.setAttribute(
    'download',
    `Medium-Stats-Counter-${getDateKeyFromEpoch(NOW.epoch)}.csv`
  );
}

const stories_download = document.querySelector('.stories_download');
const stories_download_loader = document.querySelector('.stories_download_loader');
const stories_download_wrap = document.querySelector('.stories_download_wrap');
function handleStoriesDownload() {
  exportstoriesToCsv();
  stories_download.style.display = 'block';
  stories_download_loader.style.display = 'none';
}

function exportstoriesToCsv() {
  let content = [['Title', 'Views', 'Reads', 'R/V', 'Claps', 'Fans', 'C/F', 'Date']];
  storiesData.forEach(({ title, views, reads, claps, upvotes, createdAt }) => {
    content.push([
      title,
      views,
      reads,
      views > 0 ? (reads / views).toFixed(2) : 0,
      claps,
      upvotes,
      upvotes > 0 ? (claps / upvotes).toFixed(2) : 0,
      getDetailedDateLabelFromEpoch(new Date(createdAt)),
    ]);
  });

  let finalVal = '';

  for (let i = 0; i < content.length; i++) {
    let value = content[i];

    for (let j = 0; j < value.length; j++) {
      let innerValue = value[j] === null ? '' : value[j].toString();
      let result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (j > 0) finalVal += ',';
      finalVal += result;
    }

    finalVal += '\n';
  }
  stories_download_wrap.setAttribute(
    'href',
    'data:text/csv;charset=utf-8,' + encodeURIComponent(finalVal)
  );
  stories_download_wrap.setAttribute(
    'download',
    `Medium-Stats-Counter-${getDateKeyFromEpoch(NOW.epoch)}.csv`
  );
}

const followersCtx = document.getElementById('followersChart').getContext('2d');
let followersChart;

let last30DaysStats = createLast30DaysObject();

fetchNextNoti({ to: -1 });

function createLast30DaysObject() {
  let obj = {};
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const date = today.getDate();
  for (let i = 0; i <= 30; i++) {
    const day = new Date(year, month - 1, date + i);
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
  const fetchUrl = to === -1 ? MEDIUM_NOTI_STATS_URL : `${MEDIUM_NOTI_STATS_URL}&to=${to}`;

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
        renderFollowersChart();
      }
    })
    .catch(function(err) {
      document.querySelector('#followers_loader').style.display = 'none';
      console.error(err);
    });
}

function countSingleNoti(noti) {
  let date = new Date(noti.occurredAt);
  let key = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  if (last30DaysStats[key] !== undefined) {
    if (noti.activityType === NOTI_EVENT_TYPE.follow) {
      last30DaysStats[key].follow.count++;
      last30DaysStats[key].follow.followers.push(noti.actorId);
    } else if (noti.activityType === NOTI_EVENT_TYPE.clap) {
      last30DaysStats[key].clap.count++;
      last30DaysStats[key].clap.posts.push(noti.postId);
    } else if (noti.activityType === NOTI_EVENT_TYPE.highlight) {
      last30DaysStats[key].highlight.count++;
      last30DaysStats[key].highlight.posts.push(noti.postId);
    }
  } else {
    console.log(key);
  }
}

function renderFollowersChart() {
  document.querySelector('#followers_loader').style.display = 'none';
  const followersChart = new Chart(followersCtx, {
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
      ],
    },

    options: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `Last 30 Days Followers: ${Object.keys(last30DaysStats).reduce(
          (acc, key) => (acc += last30DaysStats[key].follow.count),
          0
        )}`,
        position: 'bottom',
      },
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
