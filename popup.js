'use strict';
const NOW = {
  epoch: new Date(),
  year: new Date().getFullYear(),
  month: new Date().getMonth(),
  date: new Date().getDate(),
};

Date.prototype.addTime = function(timeType, timeOffset) {
  let result = new Date(this);
  result[`set${timeType}`](result[`get${timeType}`]() + timeOffset);
  return result;
};

Date.prototype.daysInThisMonth = function() {
  return new Date(this.getFullYear(), this.getMonth() + 1, 0).getDate();
};

const numOfMonthFetched = 48;

const getDateKeyFromEpoch = (date) =>
  date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

const getDetailedDateLabelFromEpoch = (date) =>
  `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;

const getDateLabelFromDateKey = (key) => `${Math.floor((key % 10000) / 100)}/${key % 100}`;

let fetchReadyState = Array(numOfMonthFetched).fill(false);
let hourView = [];
let monthView = [...Array(numOfMonthFetched / 12 + 1)].map(() => [...Array(12)].map(() => 0));
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

function changeTimeFormatState(newTimeFormat) {
  timeFormatState = newTimeFormat;
  if (hourView[fromTimeState] !== undefined) {
    backwardTimeBtn.classList.remove('change_time_btn-prohibit');
  }
  renderHandler[timeFormatState](hourView[fromTimeState][0], fromTimeState);
}

const forwardTimeBtn = document.querySelector('.forward_time_btn');
forwardTimeBtn.addEventListener('click', forwardTimeHandler);

const backwardTimeBtn = document.querySelector('.backward_time_btn');
backwardTimeBtn.addEventListener('click', backwardTimeHandler);

function forwardTimeHandler() {
  if (
    this.classList.contains('change_time_btn-prohibit') &&
    hourView[fromTimeState] === undefined
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
  if (hourView[fromTimeState] !== undefined) {
    backwardTimeBtn.classList.remove('change_time_btn-prohibit');
  }
  renderHandler[timeFormatState](hourView[fromTimeState][0], fromTimeState);
}

function backwardTimeHandler() {
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
    return;
  }
  renderHandler[timeFormatState](hourView[fromTimeState][0], fromTimeState);
}

init();
const renderHandler = {
  hour: function(lastestTime, hourIdx) {
    let labels = [];
    let data = [];
    for (let idx = 0; idx < 24; idx++) {
      if (hourView[hourIdx + idx] === undefined) {
        backwardTimeBtn.classList.add('change_time_btn-prohibit');
        break;
      }
      let [timeStamp, views] = hourView[hourIdx + idx];
      let label = `${23 - idx}:00 - ${23 - idx + 1}:00 (${timeStamp.getMonth() +
        1}/${timeStamp.getDate()})`;
      labels.push(label);
      data.push(views);
    }

    renderBarChart(labels.reverse(), data.reverse(), lastestTime);
  },
  day: function(lastestTime, hourIdx) {
    let labels = [];
    let data = [];
    for (let idx = 0; idx < 24 * 7; idx++) {
      if (hourView[hourIdx + idx] === undefined) {
        backwardTimeBtn.classList.add('change_time_btn-prohibit');
        break;
      }
      let [timeStamp, views] = hourView[hourIdx + idx];
      if (idx % 24 === 0) {
        let label = `${timeStamp.getMonth() + 1}/${timeStamp.getDate()}`;
        labels.push(label);
        data.push(0);
      }
      data[data.length - 1] += views;
    }

    renderBarChart(labels.reverse(), data.reverse(), lastestTime);
  },
  week: function(lastestTime, hourIdx) {
    let labels = [];
    let data = [];
    for (let idx = 0; idx < 24 * 7 * 8; idx++) {
      if (hourView[hourIdx + idx] === undefined) {
        backwardTimeBtn.classList.add('change_time_btn-prohibit');
        break;
      }
      let [timeStamp, views] = hourView[hourIdx + idx];
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

    renderBarChart(labels.reverse(), data.reverse(), lastestTime);
  },
  month: function(lastestTime, hourIdx) {
    let labels = [];
    let data = [];
    let curTime = hourView[hourIdx][0];

    for (let idx = 0; idx < 6; idx++) {
      let label = `${curTime}`.split(' ')[1];
      labels.push(label);
      data.push(monthView[NOW.year - curTime.getFullYear()][curTime.getMonth()]);
      curTime = curTime.addTime('Month', -1);
    }

    renderBarChart(labels.reverse(), data.reverse(), lastestTime);
  },
  year: function(lastestTime, hourIdx) {
    let labels = [];
    let data = [];
    let curTime = hourView[hourIdx][0];
    for (let idx = 0; idx < 3; idx++) {
      let label = `${curTime}`.split(' ')[3];
      labels.push(label);
      data.push(monthView[NOW.year - curTime.getFullYear()].reduce((acc, cur) => acc + cur));
      curTime = curTime.addTime('FullYear', -1);
    }

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
    chart.options.title.text = timeStamp.getFullYear();
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
        display: false,
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
        let curHourView = [];
        notiRawData.forEach((notiItem) => {
          let timeStamp = new Date(notiItem.timestampMs);
          curHourView.push([timeStamp, notiItem.views]);
          sumByHour[timeStamp.getHours()] += notiItem.views;
          sumByDay[timeStamp.getDay()] += notiItem.views;
          monthView[NOW.year - timeStamp.getFullYear()][timeStamp.getMonth()] += notiItem.views;
        });
        if (hourView.length === 0) {
          while (curHourView[curHourView.length - 1][0].getHours() !== 23) {
            curHourView.push([curHourView[curHourView.length - 1][0].addTime('Hours', 1), 0]);
          }
        }
        hourView.push(...curHourView.reverse());
        fetchStoriesHourStats(toTime);
      })
      .catch(function(err) {
        console.error(err);
      });
  }
}
