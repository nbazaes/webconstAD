(function () {
  'use strict'

  function getCookie(name) {
    if (!document.cookie) return null
    var match = document.cookie.match(
      new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/+^])/g, '\\$1') + '=([^;]*)')
    )
    return match ? decodeURIComponent(match[1]) : null
  }

  fetch('/api/auth/csrf/', { credentials: 'include' }).catch(function () {})

  var origFetch = window.fetch
  window.fetch = function (input, init) {
    init = init || {}
    var method = (init.method || (input instanceof Request ? input.method : 'GET')).toUpperCase()
    if (['POST', 'PUT', 'PATCH', 'DELETE'].indexOf(method) !== -1) {
      init.credentials = init.credentials || 'include'
      var token = getCookie('csrftoken')
      if (token) {
        init.headers = init.headers || {}
        init.headers['X-CSRFToken'] = token
      }
    }
    return origFetch.call(window, input, init)
  }
})()
