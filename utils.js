const numFormater = (number) => {
  const SI_SYMBOL = ['', 'k', 'M', 'G', 'T', 'P', 'E'];
  let tier = (Math.log10(number) / 3) | 0;
  if (tier == 0) return number;
  let suffix = SI_SYMBOL[tier];
  let scale = Math.pow(10, tier * 3);
  let scaled = number / scale;
  return scaled.toFixed(1) + suffix;
};

const getDateKeyFromEpoch = (date) =>
  date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

const getDetailedDateLabelFromEpoch = (date) =>
  `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;

const getDateLabelFromDateKey = (key) => `${Math.floor((key % 10000) / 100)}/${key % 100}`;

const getMonthDiff = (olderTime, newerTime) => {
  return (
    newerTime.getMonth() -
    olderTime.getMonth() +
    1 +
    12 * (newerTime.getFullYear() - olderTime.getFullYear())
  );
};

const trimString = (str, length) => {
  return str.length > length ? str.substring(0, length) + '...' : str;
};

const getHourDiff = (olderTime, newerTime) => {
  return Math.abs(newerTime - olderTime) / 36e5;
};

const toPercentage = (num, den) => `${(num / den).toFixed(2) * 100}%`;

const getCsvString = (csvArray) => {
  let csvString = '';
  for (let i = 0; i < csvArray.length; i++) {
    let value = csvArray[i];
    for (let j = 0; j < value.length; j++) {
      let innerValue = value[j] === null ? '' : value[j].toString();
      let result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (j > 0) csvString += ',';
      csvString += result;
    }
    csvString += '\n';
  }
  return csvString;
};

const parseMediumResponse = (response) => JSON.parse(response.split('</x>')[1]);

Date.prototype.addTime = function (timeType, timeOffset) {
  let result = new Date(this);
  result[`set${timeType}`](result[`get${timeType}`]() + timeOffset);
  return result;
};

Date.prototype.daysInThisMonth = function () {
  return new Date(this.getFullYear(), this.getMonth() + 1, 0).getDate();
};

Date.prototype.getWeek = function () {
  var firstDay = new Date(this.getFullYear(), 0, 1);
  return Math.ceil(((this - firstDay) / 86400000 + firstDay.getDay() + 1) / 7) - 1;
};
