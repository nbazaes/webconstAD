(function () {
  'use strict'

  function getCookie(name) {
    if (!document.cookie) return null
    var match = document.cookie.match(
      new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\\/+^])/g, '\\$1') + '=([^;]*)')
    )
    return match ? decodeURIComponent(match[1]) : null
  }

  window.csrfToken = null

  var csrfPromise = null

  function ensureCsrfToken() {
    if (window.csrfToken) return Promise.resolve(window.csrfToken)
    if (!csrfPromise) {
      csrfPromise = fetch('/api/auth/csrf/', { credentials: 'include' })
        .then(function (response) {
          return response.json()
        })
        .then(function (data) {
          window.csrfToken = (data && data.csrfToken) || null
          return window.csrfToken
        })
        .catch(function () {
          window.csrfToken = null
          return window.csrfToken
        })
    }
    return csrfPromise
  }

  window.getCsrfToken = ensureCsrfToken

  var origFetch = window.fetch
  window.fetch = async function (input, init) {
    init = init || {}
    var method = (init.method || (input instanceof Request ? input.method : 'GET')).toUpperCase()
    if (['POST', 'PUT', 'PATCH', 'DELETE'].indexOf(method) !== -1) {
      init.credentials = init.credentials || 'include'
      var token = window.csrfToken || await ensureCsrfToken()
      if (token) {
        init.headers = init.headers || {}
        init.headers['X-CSRFToken'] = token
      }
    }
    return origFetch.call(window, input, init)
  }
})()
