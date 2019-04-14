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

  const html = `<div class="label">         
                      Total Views:<br>
                      Total Reads:<br>                                         
                      Total Fans:<br>
                      Total Claps:<br>
                      Total Stories:<br>
                      </div>
                      <div class="value">          
                      ${totalViews.toLocaleString()}<br>
                      ${totalReads.toLocaleString()}<br>
                      ${totalClaps.toLocaleString()}<br>
                      ${totalUpvotes.toLocaleString()}<br>
                      ${totalStories.toLocaleString()}<br>
                      </div>`;
  document.querySelector('.container').innerHTML = html;
}
