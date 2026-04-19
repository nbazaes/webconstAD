import threading
from pathlib import Path
import subprocess
from typing import Dict

from django.conf import settings

from .models import BuildState


_build_lock = threading.Lock()
_build_thread = None


def _frontend_dir() -> Path:
    return settings.BASE_DIR / 'frontend'


def _get_or_create_state() -> BuildState:
    state, _ = BuildState.objects.get_or_create(name='frontend')
    return state


def _set_state(status: str, last_error: str = '') -> None:
    state = _get_or_create_state()
    state.status = status
    state.last_error = last_error
    state.save(update_fields=['status', 'last_error', 'updated_at'])


def _run_build_task() -> None:
    global _build_thread
    try:
        _set_state(BuildState.STATUS_PROCESSING, '')

        result = subprocess.run(
            ['npm', 'run', 'build'],
            cwd=str(_frontend_dir()),
            capture_output=True,
            text=True,
            check=False,
        )

        if result.returncode == 0:
            _set_state(BuildState.STATUS_READY, '')
        else:
            error_msg = (result.stderr or result.stdout or 'Build failed').strip()[:4000]
            _set_state(BuildState.STATUS_ERROR, error_msg)
    finally:
        _build_thread = None


def trigger_build_async() -> None:
    global _build_thread
    with _build_lock:
        if _build_thread and _build_thread.is_alive():
            return

        state = _get_or_create_state()
        if state.status == BuildState.STATUS_PROCESSING:
            return

        _build_thread = threading.Thread(target=_run_build_task, daemon=True, name='astro-build-thread')
        _build_thread.start()


def get_build_state() -> Dict[str, str]:
    state = _get_or_create_state()
    return {
        'status': state.status,
        'last_error': state.last_error,
        'updated_at': state.updated_at.isoformat() if state.updated_at else '',
    }
