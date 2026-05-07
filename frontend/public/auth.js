const refreshRibbonLabels = () => {
  const sideNavLinks = document.querySelectorAll('.side-nav li a')
  sideNavLinks.forEach((link) => {
    const rawLabel = (link.textContent || '').replace(/\s+/g, ' ').trim()
    if (!rawLabel) return
    link.dataset.ribbonLabel = rawLabel
    link.textContent = rawLabel
  })
}

const toggle = document.querySelector('[data-menu-toggle]')
const mobileNav = document.querySelector('[data-mobile-nav]')

const authModal = document.querySelector('[data-auth-modal]')
const authMessage = document.querySelector('[data-auth-message]')
const authViews = document.querySelectorAll('[data-auth-view]')
const loginForm = document.querySelector('[data-login-form]')
const registerForm = document.querySelector('[data-register-form]')
const loginBtn = loginForm?.querySelector('button[type="submit"]')
const registerBtn = registerForm?.querySelector('button[type="submit"]')
const authTabs = document.querySelectorAll('[data-auth-tab]')
const navAccountLinks = document.querySelectorAll('[data-nav-id="cuenta"]')
const publishNavItems = document.querySelectorAll('[data-publish-nav]')
const modalClosers = document.querySelectorAll('[data-auth-close]')
const openRegisterButtons = document.querySelectorAll('[data-open-register]')
const openLoginButtons = document.querySelectorAll('[data-open-login]')

const confirmModal = document.querySelector('[data-confirm-modal]')
const confirmPanel = document.querySelector('[data-confirm-panel]')
const confirmTitle = document.querySelector('#confirm-modal-title')
const confirmMessage = document.querySelector('[data-confirm-message]')
const confirmAcceptButton = document.querySelector('[data-confirm-accept]')
const confirmCancelButton = document.querySelector('.confirm-modal [data-confirm-cancel].btn-secondary')
const confirmCancelButtons = document.querySelectorAll('[data-confirm-cancel]')

let authState = { authenticated: false, user: null }
let confirmResolver = null
let confirmMode = 'confirm'

const backendOrigin = window.location.origin
const backendUrl = (path) => `${backendOrigin}${path}`

const readJsonResponse = async (response) => {
  try {
    if (!response.ok) {
      const text = await response.text().catch(() => '')
      return { ok: false, message: `HTTP ${response.status}${text ? ': ' + text.slice(0, 200) : ''}` }
    }
    return await response.json()
  } catch {
    const text = await response.text().catch(() => '')
    const message = text && text.includes('CSRF')
      ? 'Fallo la verificaci\u00f3n CSRF. Recarga la p\u00e1gina e intenta de nuevo.'
      : text
        ? 'El servidor devolvi\u00f3 una respuesta inesperada.'
        : 'No se pudo procesar la respuesta del servidor.'
    return { ok: false, message }
  }
}

window.safeFetchJson = readJsonResponse

const ensureCsrfToken = async () => {
  if (window.getCsrfToken) {
    await window.getCsrfToken()
  }
}

const setAuthMessage = (text = '', isError = false) => {
  if (!authMessage) return
  authMessage.textContent = text
  authMessage.classList.toggle('error', isError)
}

const setButtonLoading = (button, isLoading) => {
  if (!button || !button.dataset.loadingText) return
  if (isLoading) {
    button.dataset.originalText = button.textContent
    button.classList.add('btn--loading')
    button.disabled = true
    let count = 0
    button._ellipsisTimer = setInterval(() => {
      count = (count + 1) % 4
      button.textContent = button.dataset.loadingText + '.'.repeat(count)
    }, 400)
  } else {
    clearInterval(button._ellipsisTimer)
    button.textContent = button.dataset.originalText || button.textContent
    button.disabled = false
    button.classList.remove('btn--loading')
  }
}

window.setButtonLoading = setButtonLoading

const setVisibleAuthView = (view) => {
  authViews.forEach((section) => {
    section.hidden = section.getAttribute('data-auth-view') !== view
  })
  setAuthMessage('')
}

const openAuthModal = (view) => {
  if (!authModal) return
  setVisibleAuthView(view)
  authModal.removeAttribute('hidden')
}

const closeAuthModal = () => {
  if (!authModal) return
  authModal.setAttribute('hidden', '')
  setAuthMessage('')
}

const closeConfirmModal = (accepted = false) => {
  if (!confirmModal) return
  confirmModal.setAttribute('hidden', '')
  confirmModal.dataset.variant = 'confirm'
  confirmMode = 'confirm'
  if (confirmResolver) {
    confirmResolver(accepted)
    confirmResolver = null
  }
}

const showStyledConfirm = (message) => {
  if (!confirmModal || !confirmMessage) {
    return Promise.resolve(window.confirm(message))
  }

  confirmMode = 'confirm'
  confirmModal.dataset.variant = 'confirm'
  confirmPanel?.classList.remove('confirm-modal__panel--alert', 'confirm-modal__panel--success', 'confirm-modal__panel--danger')
  if (confirmTitle) confirmTitle.textContent = 'Confirmación'
  if (confirmCancelButton) confirmCancelButton.hidden = false
  if (confirmAcceptButton) confirmAcceptButton.textContent = 'Aceptar'
  confirmMessage.textContent = message
  confirmModal.removeAttribute('hidden')
  return new Promise((resolve) => {
    confirmResolver = resolve
  })
}

const showStyledAlert = (message, title = 'Aviso', variant = 'alert') => {
  if (!confirmModal || !confirmMessage) {
    window.alert(message)
    return Promise.resolve(true)
  }

  confirmMode = 'alert'
  confirmModal.dataset.variant = variant
  confirmPanel?.classList.remove('confirm-modal__panel--alert', 'confirm-modal__panel--success', 'confirm-modal__panel--danger')
  confirmPanel?.classList.add(`confirm-modal__panel--${variant}`)
  if (confirmTitle) confirmTitle.textContent = title
  if (confirmCancelButton) confirmCancelButton.hidden = true
  if (confirmAcceptButton) confirmAcceptButton.textContent = 'Entendido'
  confirmMessage.textContent = message
  confirmModal.removeAttribute('hidden')

  return new Promise((resolve) => {
    confirmResolver = resolve
  })
}

window.showStyledConfirm = showStyledConfirm
window.showStyledAlert = showStyledAlert
window.openAuthModal = openAuthModal

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeAuthModal()
})

confirmAcceptButton?.addEventListener('click', () => closeConfirmModal(true))
confirmCancelButtons.forEach((button) => {
  button.addEventListener('click', () => closeConfirmModal(false))
})

confirmModal?.addEventListener('click', (event) => {
  if (event.target === confirmModal || event.target.matches('[data-confirm-cancel]')) {
    if (confirmMode === 'alert') {
      closeConfirmModal(true)
      return
    }
    closeConfirmModal(false)
  }
})

const renderAuthTabs = () => {
  const accountLabel = authState.authenticated ? 'Cuenta' : 'Registrarse'
  const authLabel = authState.authenticated ? 'Cerrar sesión' : 'Iniciar sesión'
  navAccountLinks.forEach((tab) => {
    tab.textContent = accountLabel
    tab.setAttribute('href', authState.authenticated ? '/cuenta/' : '#')
  })

  authTabs.forEach((tab) => {
    tab.textContent = authLabel
  })

  const isAdmin = Boolean(
    authState.authenticated &&
    (authState.user?.rol === 'admin' || authState.user?.rol === 'artista' || authState.user?.is_staff || authState.user?.is_superuser)
  )
  publishNavItems.forEach((item) => {
    item.hidden = !isAdmin
  })

  refreshRibbonLabels()
}

const refreshSession = async () => {
  try {
    const response = await fetch(backendUrl('/api/auth/session/'), { credentials: 'include' })
    const data = await response.json()
    authState = data
  } catch {
    authState = { authenticated: false, user: null }
  }
  renderAuthTabs()
}

if (toggle && mobileNav) {
  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.toggle('open')
    mobileNav.classList.toggle('open', isOpen)
    document.body.classList.toggle('nav-open', isOpen)
    toggle.setAttribute('aria-expanded', String(isOpen))
  })
}

mobileNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    toggle?.classList.remove('open')
    mobileNav.classList.remove('open')
    document.body.classList.remove('nav-open')
    toggle?.setAttribute('aria-expanded', 'false')
  })
})

authTabs.forEach((tab) => {
  tab.addEventListener('click', async (event) => {
    event.preventDefault()

    if (!authState.authenticated) {
      openAuthModal('login')
      return
    }

    const shouldLogout = await showStyledConfirm('¿Quieres cerrar sesión?')
    if (!shouldLogout) {
      return
    }

    await ensureCsrfToken()
    const logoutResponse = await fetch(backendUrl('/api/auth/logout/'), {
      method: 'POST',
      credentials: 'include',
    })
    if (!logoutResponse.ok) {
      const errorData = await readJsonResponse(logoutResponse)
      console.warn('Logout backend rejected request', errorData)
    }
    authState = { authenticated: false, user: null }
    renderAuthTabs()
    window.location.href = '/'
  })
})

navAccountLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    if (authState.authenticated) return
    event.preventDefault()
    openAuthModal('register')
  })
})

modalClosers.forEach((button) => {
  button.addEventListener('click', closeAuthModal)
})

openRegisterButtons.forEach((button) => {
  button.addEventListener('click', () => setVisibleAuthView('register'))
})

openLoginButtons.forEach((button) => {
  button.addEventListener('click', () => setVisibleAuthView('login'))
})

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault()
  const formData = new FormData(loginForm)
  const identifier = String(formData.get('identifier') || '').trim()
  const password = String(formData.get('password') || '')

  if (!identifier || !password) {
    setAuthMessage('Completa usuario/email y password.', true)
    return
  }

  const payload = new URLSearchParams()
  payload.append('username', identifier)
  payload.append('password', password)

  setButtonLoading(loginBtn, true)
  try {
    await ensureCsrfToken()
    const response = await fetch(backendUrl('/api/auth/login/'), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload,
    })

    const data = await readJsonResponse(response)
    if (!response.ok || !data.ok) {
      const errorMessage = data.message || 'No se pudo iniciar sesión.'
      setAuthMessage(errorMessage, true)
      await showStyledAlert(`Error al iniciar sesión\n${errorMessage}`, 'Error', 'danger')
      return
    }

    await refreshSession()
    loginForm.reset()
    closeAuthModal()
    await showStyledAlert('Sesión iniciada\nBienvenido de vuelta.', 'Éxito', 'success')
  } finally {
    setButtonLoading(loginBtn, false)
  }
})

registerForm?.addEventListener('submit', async (event) => {
  event.preventDefault()
  const formData = new FormData(registerForm)
  const username = String(formData.get('username') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const nombre = String(formData.get('nombre') || '').trim()
  const apellido = String(formData.get('apellido') || '').trim()
  const pais = String(formData.get('pais') || '').trim()
  const password = String(formData.get('password') || '')
  const passwordConfirm = String(formData.get('password_confirm') || '')

  if (!username || !email || !nombre || !apellido || !pais || !password || !passwordConfirm) {
    setAuthMessage('Completa todos los campos.', true)
    return
  }

  if (password !== passwordConfirm) {
    setAuthMessage('Las contraseñas no coinciden.', true)
    return
  }

  const wantsRegister = await showStyledConfirm(
    `¿Confirmas los datos?\n\nUsername: ${username}\nEmail: ${email}\nNombre: ${nombre}\nApellido: ${apellido}\nPaís: ${pais}`
  )

  if (!wantsRegister) {
    return
  }

  const payload = new URLSearchParams()
  payload.append('username', username)
  payload.append('email', email)
  payload.append('nombre', nombre)
  payload.append('apellido', apellido)
  payload.append('pais', pais)
  payload.append('password', password)

  setButtonLoading(registerBtn, true)
  try {
    await ensureCsrfToken()
    const response = await fetch(backendUrl('/api/auth/register/'), {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: payload,
    })

    const data = await readJsonResponse(response)
    if (!response.ok || !data.ok) {
      const errorMessage = data.message || 'No se pudo crear la cuenta.'
      setAuthMessage(errorMessage, true)
      await showStyledAlert(`Error al registrarse\n${errorMessage}`, 'Error', 'danger')
      return
    }

    registerForm.reset()
    closeAuthModal()
    await showStyledAlert(
      'Registro exitoso\nRevisa tu correo para verificar tu cuenta. Luego podrás iniciar sesión automáticamente al abrir el enlace.',
      'Éxito',
      'success'
    )
  } finally {
    setButtonLoading(registerBtn, false)
  }
})

refreshRibbonLabels()
refreshSession()
