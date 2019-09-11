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

Date.prototype.addTime = function(timeType, timeOffset) {
  let result = new Date(this);
  result[`set${timeType}`](result[`get${timeType}`]() + timeOffset);
  return result;
};

Date.prototype.daysInThisMonth = function() {
  return new Date(this.getFullYear(), this.getMonth() + 1, 0).getDate();
};
