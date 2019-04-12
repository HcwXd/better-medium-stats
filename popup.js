document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {}, function(response) {
      if (response) {
        const { stats } = response;
        const html = `<div class="label">
                      Total Views:<br>
                      Total Reads:<br>                                         
                      Total Fans:<br>
                      </div>
                      <div class="value">
                      ${stats.views}<br>
                      ${stats.reads}<br>
                      ${stats.fans}<br>
                      </div>                     `;
        document.querySelector('.container').innerHTML = html;
      } else {
        document.querySelector('.container').innerHTML =
          '<div class="label">Sorry, please refresh your website and try again :)</div>';
      }
    });
  });
});
