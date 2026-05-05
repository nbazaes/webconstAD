const buildRibbonArc = (labelText) => {
  const chars = Array.from(labelText)
  const visibleCount = chars.reduce((count, ch) => (ch === ' ' ? count : count + 1), 0)
  const midpoint = (visibleCount - 1) / 2
  const maxLift = 3.4

  const wrapper = document.createElement('span')
  wrapper.className = 'ribbon-arc'

  let visibleIndex = 0
  chars.forEach((ch) => {
    const chunk = document.createElement('span')
    chunk.textContent = ch
    if (ch !== ' ') {
      const distance = Math.abs(visibleIndex - midpoint)
      const normalized = midpoint === 0 ? 1 : distance / midpoint
      const lift = maxLift * (1 - normalized ** 1.4)
      const direction = midpoint === 0 ? 0 : (visibleIndex - midpoint) / midpoint
      const tilt = 10 * direction
      chunk.style.setProperty('--arc-lift', lift.toFixed(2))
      chunk.style.setProperty('--arc-tilt', tilt.toFixed(2))
      visibleIndex += 1
    } else {
      chunk.style.setProperty('--arc-lift', '0')
      chunk.style.setProperty('--arc-tilt', '0')
      chunk.style.width = '0.2em'
    }
    wrapper.append(chunk)
  })

  return wrapper
}

const refreshRibbonLabels = () => {
  const sideNavLinks = document.querySelectorAll('.side-nav li a')
  sideNavLinks.forEach((link) => {
    const rawLabel = (link.textContent || '').replace(/\s+/g, ' ').trim()
    if (!rawLabel) return
    link.dataset.ribbonLabel = rawLabel
    link.replaceChildren(buildRibbonArc(rawLabel))
  })
}

const toggle = document.querySelector('[data-menu-toggle]')
const mobileNav = document.querySelector('[data-mobile-nav]')

const authModal = document.querySelector('[data-auth-modal]')
const authMessage = document.querySelector('[data-auth-message]')
const authViews = document.querySelectorAll('[data-auth-view]')
const loginForm = document.querySelector('[data-login-form]')
const registerForm = document.querySelector('[data-register-form]')
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

const setAuthMessage = (text = '', isError = false) => {
  if (!authMessage) return
  authMessage.textContent = text
  authMessage.classList.toggle('error', isError)
}

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

    await fetch(backendUrl('/api/auth/logout/'), {
      method: 'POST',
      credentials: 'include',
    })
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

  const response = await fetch(backendUrl('/api/auth/login/'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: payload,
  })

  let data = null
  try {
    data = await response.json()
  } catch {
    setAuthMessage('No se pudo procesar la respuesta del servidor.', true)
    return
  }
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

  const response = await fetch(backendUrl('/api/auth/register/'), {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: payload,
  })

  const data = await response.json()
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
})

refreshRibbonLabels()
refreshSession()
