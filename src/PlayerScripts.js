import {MUTE_MODE, PAUSE_MODE, PLAY_MODE, UNMUTE_MODE} from './constants';

export const PLAYER_FUNCTIONS = {
  muteVideo: 'player.mute(); true;',
  unMuteVideo: 'player.unMute(); true;',
  playVideo: 'player.playVideo(); true;',
  pauseVideo: 'player.pauseVideo(); true;',
  getVideoUrlScript: `
window.ReactNativeWebView.postMessage(JSON.stringify({eventType: 'getVideoUrl', data: player.getVideoUrl()}));
true;
  `,
  durationScript: `
window.ReactNativeWebView.postMessage(JSON.stringify({eventType: 'getDuration', data: player.getDuration()}));
true;
`,
  currentTimeScript: `
window.ReactNativeWebView.postMessage(JSON.stringify({eventType: 'getCurrentTime', data: player.getCurrentTime()}));
true;
`,
  isMutedScript: `
window.ReactNativeWebView.postMessage(JSON.stringify({eventType: 'isMuted', data: player.isMuted()}));
true;
`,
  getVolumeScript: `
window.ReactNativeWebView.postMessage(JSON.stringify({eventType: 'getVolume', data: player.getVolume()}));
true;
`,
  getPlaybackRateScript: `
window.ReactNativeWebView.postMessage(JSON.stringify({eventType: 'getPlaybackRate', data: player.getPlaybackRate()}));
true;
`,
  getAvailablePlaybackRatesScript: `
window.ReactNativeWebView.postMessage(JSON.stringify({eventType: 'getAvailablePlaybackRates', data: player.getAvailablePlaybackRates()}));
true;
`,

  setVolume: volume => {
    return `player.setVolume(${volume}); true;`;
  },

  seekToScript: (seconds, allowSeekAhead) => {
    return `player.seekTo(${seconds}, ${allowSeekAhead}); true;`;
  },

  setPlaybackRate: playbackRate => {
    return `player.setPlaybackRate(${playbackRate}); true;`;
  },

  loadPlaylist: (playList, startIndex, play) => {
    const index = startIndex || 0;
    const func = play ? 'loadPlaylist' : 'cuePlaylist';

    const list = typeof playList === 'string' ? `"${playList}"` : 'undefined';
    const listType =
      typeof playList === 'string' ? `"${playlist}"` : 'undefined';
    const playlist = Array.isArray(playList)
      ? `"${playList.join(',')}"`
      : 'undefined';

    return `player.${func}({listType: ${listType}, list: ${list}, playlist: ${playlist}, index: ${index}}); true;`;
  },

  loadVideoById: (videoId, play) => {
    const func = play ? 'loadVideoById' : 'cueVideoById';

    return `player.${func}({videoId: ${JSON.stringify(videoId)}}); true;`;
  },
};

export const playMode = {
  [PLAY_MODE]: PLAYER_FUNCTIONS.playVideo,
  [PAUSE_MODE]: PLAYER_FUNCTIONS.pauseVideo,
};

export const soundMode = {
  [MUTE_MODE]: PLAYER_FUNCTIONS.muteVideo,
  [UNMUTE_MODE]: PLAYER_FUNCTIONS.unMuteVideo,
};

export const MAIN_SCRIPT = (
  videoId,
  playList,
  initialPlayerParams,
  allowWebViewZoom,
  contentScale,
) => {
  const {
    end,
    rel,
    color,
    start,
    playerLang,
    loop = false,
    cc_lang_pref,
    iv_load_policy,
    modestbranding,
    controls = true,
    showClosedCaptions,
    preventFullScreen = false,
  } = initialPlayerParams;

  // _s postfix to refer to "safe"
  const rel_s = rel ? 1 : 0;
  const loop_s = loop ? 1 : 0;
  const videoId_s = videoId || '';
  const controls_s = controls ? 1 : 0;
  const cc_lang_pref_s = cc_lang_pref || '';
  const modestbranding_s = modestbranding ? 1 : 0;
  const preventFullScreen_s = preventFullScreen ? 0 : 1;
  const showClosedCaptions_s = showClosedCaptions ? 1 : 0;
  const contentScale_s = typeof contentScale === 'number' ? contentScale : 1.0;

  const list = typeof playList === 'string' ? playList : undefined;
  const listType = typeof playList === 'string' ? 'playlist' : undefined;
  const playlist = Array.isArray(playList) ? playList.join(',') : undefined;

  // scale will either be "initial-scale=1.0"
  let scale = `initial-scale=${contentScale_s}`;
  if (!allowWebViewZoom) {
    // or "initial-scale=0.8, maximum-scale=1.0"
    scale += `, maximum-scale=${contentScale_s}`;
  }

  const safeData = {
    end,
    list,
    start,
    color,
    rel_s,
    loop_s,
    listType,
    playlist,
    videoId_s,
    controls_s,
    playerLang,
    iv_load_policy,
    contentScale_s,
    cc_lang_pref_s,
    allowWebViewZoom,
    modestbranding_s,
    preventFullScreen_s,
    showClosedCaptions_s,
  };

  const urlEncodedJSON = encodeURI(JSON.stringify(safeData));

  const listParam = list ? `list: '${list}',` : '';
  const listTypeParam = listType ? `listType: '${list}',` : '';
  const playlistParam = playList ? `playlist: '${playList}',` : '';

  const htmlString = `
<!DOCTYPE html>
<html>
  <head>
    <meta
      name="viewport"
      content="width=device-width, ${scale}"
    >
    <style>
      * {
        margin: 0 !important;
        padding: 0 !important;
        box-sizing: border-box !important;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        overflow: hidden !important;
        background: black !important;
      }
      .container {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
        display: block !important;
      }
      .video {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
      }
      iframe {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
      }
    </style>
  </head>
  <body style="margin: 0 !important; padding: 0 !important; background-color: black !important; width: 100vw !important; height: 100vh !important; overflow: hidden !important;">
    <div class="container">
      <div class="video" id="player" />
    </div>

    <script>
      var tag = document.createElement('script');

      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      var player;
      function onYouTubeIframeAPIReady() {
        player = new YT.Player('player', {
          width: '100vw',
          height: "100vh",
          videoId: '${videoId_s}',
          playerVars: {
            ${listParam}
            ${listTypeParam}
            ${playlistParam}

            end: ${end},
            rel: ${rel_s},
            playsinline: 1,
            loop: ${loop_s},
            color: ${color},
            start: ${start},
            hl: ${playerLang},
            controls: ${controls_s},
            fs: ${preventFullScreen_s},
            cc_lang_pref: '${cc_lang_pref_s}',
            iv_load_policy: ${iv_load_policy},
            modestbranding: ${modestbranding_s},
            cc_load_policy: ${showClosedCaptions_s},
            autoplay: 1,
            mute: 1,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError,
            'onPlaybackQualityChange': onPlaybackQualityChange,
            'onPlaybackRateChange': onPlaybackRateChange,
          }
        });
      }

      function onPlayerError(event) {
        window.ReactNativeWebView.postMessage(JSON.stringify({eventType: 'playerError', data: event.data}))
      }

      function onPlaybackRateChange(event) {
        window.ReactNativeWebView.postMessage(JSON.stringify({eventType: 'playbackRateChange', data: event.data}))
      }

      function onPlaybackQualityChange(event) {
        window.ReactNativeWebView.postMessage(JSON.stringify({eventType: 'playerQualityChange', data: event.data}))
      }

      function onPlayerReady(event) {
        // Force autoplay for Android devices
        setTimeout(function() {
          if (player && typeof player.playVideo === 'function') {
            player.playVideo();
          }
        }, 500);
        window.ReactNativeWebView.postMessage(JSON.stringify({eventType: 'playerReady'}))
      }

      var done = false;
      function onPlayerStateChange(event) {
        window.ReactNativeWebView.postMessage(JSON.stringify({eventType: 'playerStateChange', data: event.data}))
      }

      var isFullScreen = false;
      function onFullScreenChange() {
        isFullScreen = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
        window.ReactNativeWebView.postMessage(JSON.stringify({eventType: 'fullScreenChange', data: Boolean(isFullScreen)}));
      }

      document.addEventListener('fullscreenchange', onFullScreenChange)
      document.addEventListener('mozfullscreenchange', onFullScreenChange)
      document.addEventListener('msfullscreenchange', onFullScreenChange)
      document.addEventListener('webkitfullscreenchange', onFullScreenChange)

      // Handle visibility change for React Native navigation
      var wasPlaying = false;
      document.addEventListener('visibilitychange', function() {
        if (player && typeof player.getPlayerState === 'function') {
          if (document.hidden) {
            // Page is hidden, store current state
            var currentState = player.getPlayerState();
            wasPlaying = (currentState === 1); // 1 = playing
          } else {
            // Page is visible again, resume if it was playing
            if (wasPlaying) {
              setTimeout(function() {
                player.playVideo();
              }, 100); // Small delay to ensure player is ready
            }
          }
        }
      });

      // Additional listener for React Native WebView focus/blur
      window.addEventListener('focus', function() {
        if (player && typeof player.getPlayerState === 'function' && wasPlaying) {
          setTimeout(function() {
            player.playVideo();
          }, 100);
        }
      });

      window.addEventListener('blur', function() {
        if (player && typeof player.getPlayerState === 'function') {
          var currentState = player.getPlayerState();
          wasPlaying = (currentState === 1); // Store playing state
        }
      });

      window.addEventListener('message', function (event) {
        const {data} = event;

        try {
          const parsedData = JSON.parse(data);

          switch (parsedData.eventName) {
            case 'playVideo':
              player.playVideo();
              break;

            case 'pauseVideo':
              player.pauseVideo();
              break;

            case 'muteVideo':
              player.mute();
              break;

            case 'unMuteVideo':
              player.unMute();
              break;
          }
        } catch (error) {
          console.error('Error parsing data', event, error);
        }
      });
    </script>
  </body>
</html>
`;

  return {htmlString, urlEncodedJSON};
};
