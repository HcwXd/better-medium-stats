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

function render({ totalViews, totalReads, totalClaps, totalUpvotes, totalStories }) {
  document.querySelector('.loader').style.display = 'none';
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
