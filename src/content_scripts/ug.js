const auth_url    = new URL("https://accounts.spotify.com/authorize");
const auth_params = new URLSearchParams();

auth_params.append("client_id", "fbbf2fd601d3499d8843bed68bed8b49");
auth_params.append("response_type", "code");
auth_params.append("redirect_uri", "https://www.ultimate-guitar.com/");
auth_params.append("scope", "user-read-currently-playing");
auth_params.append("show_dialog", "true");

const AuthUrl = auth_url.toString() + "?" + auth_params.toString();

const url_params  = new URLSearchParams((new URL(window.location.href)).search);
const code        = url_params.get("code");
const reset_token = url_params.get("reset_token");

if (reset_token === "true") {
  chrome.storage.local.remove(["access_token"], function() {
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

      chrome.storage.local.set({access_token: obj.access_token}, function() {
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
chrome.storage.local.get(['access_token', 'type', 'official'], function(items) {
  const token    = items['access_token'];
  const type     = items['type'] || 'any';
  const official = items['official'] || false;

  if (token) {
    showGoToTabButton(token, official, type);
  } else {
    showLoginButton();
  }
});

//*****************************************************************

$("body").append(`
  <style>
    .ug-spotify {
      position: fixed;
      right: 15px;
      bottom: 15px;
      width: 75px;
      cursor: pointer;
    }

    .ug-spotify:hover {
      bottom: 17px;
    }
  </style>
`);

function showLoginButton() {
  $("body").append(`
    <img src="https://raw.githubusercontent.com/madya121/ug-spotify-connector/master/icons/spotify128.png" onclick="authorizeSpotify()" class="ug-spotify" />

    <script>
      function authorizeSpotify() {
        window.open("${AuthUrl}", "_self");
      }
    </script>
  `);
}

function showGoToTabButton(token, official, type) {
  $("body").append(`
    <img src="https://raw.githubusercontent.com/madya121/ug-spotify-connector/master/icons/icon128.png" onclick="imFeelingLucky()" class="ug-spotify" />
  `);

  $("body").append(`
    <script>
      var official  = ${official};
      var type      = "${type}";
      var urlParams = new URLSearchParams(window.location.search);

      var typeMap   = {
        'chords': 300,
        'tab': 200,
        'ukulele': 800,
        'bass': 400,
        'any': 0,
      };
      
      if (window.location.hostname !== "tabs.ultimate-guitar.com") {
        console.log("Kontol");
        loadScript("https://code.jquery.com/jquery-3.5.1.js", () => {
          $.get(window.location.href, function(data, status){
            processData(data);
          });
        })
      }
      
      function processData(data) {
        var arrays = data.split("\\n");
        arrays.forEach((s) => {
          const trimmed = s.trim();
          
          if (trimmed.startsWith('<div class="js-store" data-content="')) {
            var objStr  = trimmed.substring('<div class="js-store" data-content="'.length, trimmed.length - 8).replace(/&quot;/g, '"');
            var obj     = JSON.parse(objStr);
            
            if (!obj || !obj.store || !obj.store.page || !obj.store.page.data || !obj.store.page.data.results)
              return;
            
            var results = obj.store.page.data.results;
            var lucky   = null;
            console.log(results);
            
            for (var i = 0; i < results.length; i++) {
              if (official === false && results[i].marketing_type === 'official')
                continue;

              var dType = results[i].marketing_type || results[i].type;

              if (type !== 'any' && dType.toLowerCase() !== type)
                continue;

              found = true;
              lucky = results[i].tab_url;
              break;
            }

            if (found)
              window.open(lucky, "_self");
          }
        })
      }

      // if (urlParams.get("from") === "ug_spotify_plugin") {
      // var generatedSource = new XMLSerializer().serializeToString(document);
      
      // }

      function imFeelingLucky() {
        loadScript("https://code.jquery.com/jquery-3.5.1.js", () => {
            
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
                  encodeURIComponent(songName + " " + artist) + "&type=" + typeMap[type],
                  "_self"
                );
              },
              error: function() {
                window.open("https://ultimate-guitar.com?reset_token=true", "_self");
              }
            });
            
        });
      }
      
      function loadScript(url, callback){

        var script = document.createElement("script")
        script.type = "text/javascript";

        if (script.readyState){  //IE
          script.onreadystatechange = function(){
              if (script.readyState == "loaded" || script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
              }
          };
        } else {  //Others
          script.onload = function(){
            callback();
          };
        }

        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
      }

    </script>
  `);
}
