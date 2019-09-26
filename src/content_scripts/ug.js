const auth_url    = new URL("https://accounts.spotify.com/authorize");
const auth_params = new URLSearchParams();

auth_params.append("client_id", "fbbf2fd601d3499d8843bed68bed8b49");
auth_params.append("response_type", "code");
auth_params.append("redirect_uri", "https://www.ultimate-guitar.com/");
auth_params.append("scope", "user-read-currently-playing");
auth_params.append("show_dialog", "false");

const AuthUrl = auth_url.toString() + "?" + auth_params.toString();

const url_params  = new URLSearchParams((new URL(window.location.href)).search);
const code        = url_params.get("code");
const reset_token = url_params.get("reset_token");

if (reset_token === "true") {
  chrome.storage.sync.remove(["access_token"], function() {
    $("body").append(`
      <script>
        window.open("https://ultimate-guitar.com", "_self");
      </script>
    `);
  });
}

if (code) {
  $.ajax({
    type: "POST",
    url: "https://cloud.madya121.com/get_spotify_token.php",
    data: {
      code: code,
    },
    success: (resp) => {
      const obj = JSON.parse(resp);
      console.log(obj);

      chrome.storage.sync.set({access_token: obj.access_token}, function() {
        $("body").append(`
          <script>
            window.open("https://ultimate-guitar.com", "_self");
          </script>
        `);
      });
    },
  });
}

// Read it using the storage API
chrome.storage.sync.get(['access_token'], function(items) {
  const token = items['access_token'];

  if (token) {
    showGoToTabButton(token);
  } else {
    showLoginButton();
  }
});

//*****************************************************************

function showLoginButton() {
  $("body").append(`
    <button onclick="authorizeSpotify()" style="position: fixed; right: 10px; bottom: 10px;">
      Login To Spotify
    </button>

    <script>
      function authorizeSpotify() {
        window.open("${AuthUrl}", "_self");
      }
    </script>
  `);
}

function showGoToTabButton(token) {
  $("body").append(`
    <button onclick="imFeelingLucky()" style="position: fixed; right: 10px; bottom: 10px;">
      Go To Tab
    </button>
  `);

  $("body").append(`
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>

    <script>
      var urlParams = new URLSearchParams(window.location.search);

      if (urlParams.get("from") === "ug_spotify_plugin") {
        var generatedSource = new XMLSerializer().serializeToString(document);

        var arrays = generatedSource.split("\\n");
        arrays.forEach((s) => {
          const trimmed = s.trim();

          if (trimmed.startsWith("window.UGAPP.store.page")) {
            var objStr = trimmed.substring("window.UGAPP.store.page = ".length, trimmed.length - 1);
            var obj    = JSON.parse(objStr);
            var data   = obj.data;
            var lucky  = data.results[0].tab_url;

            window.open(lucky, "_self");
          }
        })
      }

      function imFeelingLucky() {
        $.ajax({
          url: "https://api.spotify.com/v1/me/player/currently-playing",
          beforeSend: function(xhr) {
            xhr.setRequestHeader('Accept', 'application/json');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Authorization', 'Bearer ${token}');
          },
          success: function(resp) {
            var songInfo = resp.item;

            var songName = songInfo.name;
            var artist   = songInfo.artists[0].name;

            // scrapUGSearch(songName + " " + artist);
            window.open("https://www.ultimate-guitar.com/search.php?from=ug_spotify_plugin&search_type=title&value=" +
              encodeURIComponent(songName + " " + artist),
              "_self"
            );
          },
          error: function() {
            window.open("https://ultimate-guitar.com?reset_token=true", "_self");
          }
        });
      }

    </script>
  `);
}
