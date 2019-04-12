const totalTypes = {
  VIEWS: 2,
  READS: 3,
  FANS: 5,
};

const getTotal = (tableColumn) =>
  [...document.querySelectorAll(`td:nth-child(${tableColumn}) > span.sortableTable-number`)]
    .map((e) => parseInt(e.getAttribute('title').replace(/,/g, ''), 10))
    .reduce((a, b) => a + b, 0);

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  const stats = {
    views: getTotal(totalTypes.VIEWS),
    reads: getTotal(totalTypes.READS),
    fans: getTotal(totalTypes.FANS),
  };
  console.log(stats);
  sendResponse({ stats });
});
