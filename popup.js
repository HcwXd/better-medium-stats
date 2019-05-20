'use strict';
const NOW = {
  epoch: new Date(),
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
  date: new Date().getDate(),
};
function addHours(timeStamp, hours) {
  let result = new Date(timeStamp);
  result.setHours(result.getHours() + hours);
  return result;
}

function addDays(timeStamp, days) {
  let result = new Date(timeStamp);
  result.setDate(result.getDate() + days);
  return result;
}

function addMonths(timeStamp, months) {
  let result = new Date(timeStamp);
  result.setMonth(result.getMonth() + months);
  return result;
}
function addYears(timeStamp, years) {
  let result = new Date(timeStamp);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

const numOfMonthFetched = 36;

const getDateKeyFromEpoch = (date) =>
  date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

const getDetailedDateLabelFromEpoch = (date) =>
  `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;

const getDateLabelFromDateKey = (key) => `${Math.floor((key % 10000) / 100)}/${key % 100}`;

let fetchReadyState = Array(numOfMonthFetched).fill(false);
let hourView = [];
let timeFormatState = 'day';
let fromTimeState = 0;

const timeFormatBtnWrap = document.querySelector('.time_format_btn_wrap');
timeFormatBtnWrap.addEventListener('click', function(e) {
  if (e.target.classList.contains('time_format_btn-select')) return;

  for (let child of this.children) {
    if (child !== e.target) {
      child.classList.remove('time_format_btn-select');
    } else {
      child.classList.add('time_format_btn-select');
    }
  }
  changeTimeFormatState(e.target.dataset.timeformat);
});

const forwardTimeBtn = document.querySelector('.forward_time_btn');
forwardTimeBtn.addEventListener('click', forwardTimeHandler);

const backwardTimeBtn = document.querySelector('.backward_time_btn');
backwardTimeBtn.addEventListener('click', backwardTimeHandler);

function forwardTimeHandler() {
  console.log(+this.dataset.direction);
  if (this.classList.contains('change_time_btn-prohibit')) return;

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
  if (hourView[fromTimeState] !== undefined) {
    backwardTimeBtn.classList.remove('change_time_btn-prohibit');
  }
  renderHandler[timeFormatState](hourView[fromTimeState][0], fromTimeState);
}

function backwardTimeHandler() {
  console.log(+this.dataset.direction);
  if (this.classList.contains('change_time_btn-prohibit')) return;

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
  if (fromTimeState > 0) {
    forwardTimeBtn.classList.remove('change_time_btn-prohibit');
  }
  if (hourView[fromTimeState] === undefined) {
    backwardTimeBtn.classList.add('change_time_btn-prohibit');
  }
  renderHandler[timeFormatState](hourView[fromTimeState][0], fromTimeState);
}

init();
const renderHandler = {
  hour: function(lastestTime, hourIdx) {
    let labels = [];
    let data = [];
    for (let idx = 0; idx < 24; idx++) {
      if (hourView[hourIdx + idx] === undefined) break;
      let [timeStamp, views] = hourView[hourIdx + idx];
      let label =
        `${timeStamp.getHours()}:00` +
        ` - ` +
        `${addHours(timeStamp, 1).getHours()}:00` +
        ` (${timeStamp.getMonth() + 1}/${timeStamp.getDate()})`;
      labels.push(label);
      data.push(views);
    }
    console.log({ labels, data });

    renderBarChart(labels.reverse(), data.reverse(), lastestTime);
  },
  day: function(lastestTime, hourIdx) {
    let labels = [];
    let data = [];
    for (let idx = 0; idx < 24 * 7; idx++) {
      if (hourView[hourIdx + idx] === undefined) break;
      let [timeStamp, views] = hourView[hourIdx + idx];
      if (idx % 24 === 0) {
        let label =
          `${timeStamp.getMonth() + 1}/${timeStamp.getDate()}` +
          ` - ` +
          `${addDays(timeStamp, 1).getMonth() + 1}/${addDays(timeStamp, 1).getDate()}`;

        labels.push(label);
        data.push(0);
      }
      data[data.length - 1] += views;
    }
    console.log({ labels, data });

    renderBarChart(labels.reverse(), data.reverse(), lastestTime);
  },
  week: function(lastestTime, hourIdx) {
    let labels = [];
    let data = [];
    for (let idx = 0; idx < 24 * 7 * 8; idx++) {
      if (hourView[hourIdx + idx] === undefined) break;
      let [timeStamp, views] = hourView[hourIdx + idx];
      if (idx % (24 * 7) === 0) {
        let label =
          `${timeStamp.getMonth() + 1}/${timeStamp.getDate()}` +
          ` - ` +
          `${addDays(timeStamp, 7).getMonth() + 1}/${addDays(timeStamp, 7).getDate()}`;
        labels.push(label);
        data.push(0);
      }
      data[data.length - 1] += views;
    }
    console.log({ labels, data });

    renderBarChart(labels.reverse(), data.reverse(), lastestTime);
  },
  month: function(lastestTime, hourIdx) {
    let labels = [];
    let data = [];
    for (let idx = 0; idx < 24 * 30 * 6; idx++) {
      if (hourView[hourIdx + idx] === undefined) break;
      let [timeStamp, views] = hourView[hourIdx + idx];
      if (idx % (24 * 30) === 0) {
        let label =
          `${timeStamp.getMonth() + 1}/${timeStamp.getDate()}` +
          ` - ` +
          `${addMonths(timeStamp, 1).getMonth() + 1}/${addMonths(timeStamp, 1).getDate()}`;
        labels.push(label);
        data.push(0);
      }
      data[data.length - 1] += views;
    }
    console.log({ labels, data });

    renderBarChart(labels.reverse(), data.reverse(), lastestTime);
  },
  year: function(lastestTime, hourIdx) {
    let labels = [];
    let data = [];
    for (let idx = 0; idx < 24 * 30 * 12 * 6; idx++) {
      if (hourView[hourIdx + idx] === undefined) break;
      let [timeStamp, views] = hourView[hourIdx + idx];
      if (idx % (24 * 30 * 12) === 0) {
        let label =
          `${timeStamp.getFullYear()}/${timeStamp.getMonth()}` +
          ` - ` +
          `${addYears(timeStamp, 1).getFullYear()}/${addYears(timeStamp, 1).getMonth()}`;
        labels.push(label);
        data.push(0);
      }
      data[data.length - 1] += views;
    }
    console.log({ labels, data });

    renderBarChart(labels.reverse(), data.reverse(), lastestTime);
  },
};
const ctx = document.getElementById('hourStatsChart').getContext('2d');
let chart;

function renderBarChart(labels, data, timeStamp) {
  document.getElementById('hourStatsChart').style.display = 'block';
  document.querySelector('#hourStats_loader').style.display = 'none';
  if (chart) {
    chart.data.datasets[0].data = data;
    chart.data.labels = labels;
    chart.options.title.text = getDetailedDateLabelFromEpoch(timeStamp);
    chart.update();
    return;
  }
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Views',
          borderColor: '#6eb799',
          backgroundColor: '#6eb799',
          data: data,
        },
      ],
    },

    options: {
      legend: {
        display: false,
      },
      title: {
        display: false,
        text: getDetailedDateLabelFromEpoch(timeStamp),
        position: 'bottom',
      },
      tooltips: {
        callbacks: {
          title: function(t, d) {
            return d.labels[t[0].index];
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
            },
          },
        ],
      },
    },
  });
}

function changeTimeFormatState(newTimeFormat) {
  timeFormatState = newTimeFormat;
  renderHandler[timeFormatState](hourView[fromTimeState][0], fromTimeState);
}

function init() {
  let sumByHour = [...Array(24)].fill(0);
  let sumByDay = [...Array(7)].fill(0);

  fetchStoriesHourStats(NOW.epoch);
  function fetchStoriesHourStats(fromTime) {
    for (let idx = 0; idx < numOfMonthFetched; idx++) {
      if (!fetchReadyState[idx] && fromTime < new Date(NOW.year, NOW.month - idx, NOW.date)) {
        fetchReadyState[idx] = true;
        if (idx === 0) renderHandler['day'](hourView[fromTimeState][0], 0);
        if (idx === numOfMonthFetched) return;
      }
    }

    const year = fromTime.getFullYear();
    const month = fromTime.getMonth();
    const date = fromTime.getDate();
    const toTime = new Date(year, month - 1, date);
    const fetchUrl = `https://medium.com/me/stats/total/${toTime.getTime()}/${fromTime.getTime()}`;

    fetch(fetchUrl)
      .then(function(response) {
        return response.text();
      })
      .then(function(textRes) {
        const data = JSON.parse(textRes.split('</x>')[1]);
        const { value: notiRawData } = data.payload;
        // console.log(fromTime);
        // console.log(notiRawData.length);
        let curHourView = [];
        notiRawData.forEach((notiItem) => {
          let timeStamp = new Date(notiItem.timestampMs);
          curHourView.push([timeStamp, notiItem.views]);
          sumByHour[timeStamp.getHours()] += notiItem.views;
          sumByDay[timeStamp.getDay()] += notiItem.views;
        });
        hourView.push(...curHourView.reverse());
        fetchStoriesHourStats(toTime);
      })
      .catch(function(err) {
        console.error(err);
      });
  }

  function renderHourStats() {
    const ctx = document.getElementById('hourStatsChart').getContext('2d');
    document.querySelector('#hourStats_loader').style.display = 'none';
    // renderDayStats(ctx);
    renderHourlyStats(ctx);
    // renderDateStats(ctx);
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
            data: sumByHour.map((el) => Math.floor(el / 365)),
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
            data: sumByDay.map((el) => Math.floor(el / 52)),
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
  function renderDateStats(ctx) {
    let dateSum = {};
    hour.forEach(([time, views]) => {
      let key = getDateKeyFromEpoch(time);
      if (!dateSum[key]) dateSum[key] = 0;
      dateSum[key] += views;
    });
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(dateSum).map((key) => getDateLabelFromDateKey(key)),
        datasets: [
          {
            label: 'Avg Views',
            borderColor: '#6eb799',
            backgroundColor: '#6eb799',
            data: dateSum,
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
}
