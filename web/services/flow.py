import hashlib
import hmac
import json
import logging
import urllib.error
import urllib.request
from typing import Any
from urllib.parse import urlencode

from django.conf import settings

logger = logging.getLogger(__name__)

FLOW_ENVIRONMENTS = {
    "sandbox": {
        "base_url": "https://sandbox.flow.cl/api",
    },
    "production": {
        "base_url": "https://www.flow.cl/api",
    },
}


class FlowError(Exception):
    def __init__(self, message: str, code: int | None = None, raw: Any = None):
        self.code = code
        self.raw = raw
        super().__init__(message)


class FlowClient:
    def __init__(self):
        self.api_key = settings.FLOW_API_KEY
        self.secret_key = settings.FLOW_SECRET_KEY
        env = settings.FLOW_ENVIRONMENT
        env_config = FLOW_ENVIRONMENTS.get(env)
        if not env_config:
            raise FlowError(f"FLOW_ENVIRONMENT invalido: {env!r}, usar 'sandbox' o 'production'")
        self.base_url = env_config["base_url"]
        self.timeout = settings.FLOW_REQUEST_TIMEOUT

    def _sign(self, params: dict[str, Any]) -> str:
        sorted_keys = sorted(params.keys())
        to_sign = "".join(f"{key}{params[key]}" for key in sorted_keys)
        signature = hmac.new(
            self.secret_key.encode("utf-8"),
            to_sign.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()
        return signature

    def _signed_params(self, params: dict[str, Any]) -> dict[str, Any]:
        signed = dict(params)
        signed["apiKey"] = self.api_key
        signature = self._sign(signed)
        signed["s"] = signature
        return signed

    def _post(self, path: str, data: dict[str, Any]) -> dict[str, Any]:
        url = f"{self.base_url}{path}"
        body = urlencode(data).encode("utf-8")
        req = urllib.request.Request(url, data=body, method="POST")
        req.add_header("Content-Type", "application/x-www-form-urlencoded")
        return self._request(req, path)

    def _get(self, path: str, params: dict[str, Any]) -> dict[str, Any]:
        qs = urlencode(params)
        url = f"{self.base_url}{path}?{qs}"
        req = urllib.request.Request(url, method="GET")
        return self._request(req, path)

    def _request(self, req: urllib.request.Request, service: str) -> dict[str, Any]:
        try:
            resp = urllib.request.urlopen(req, timeout=self.timeout)
            body = resp.read().decode("utf-8")
            status = resp.status
        except urllib.error.HTTPError as e:
            status = e.code
            body = e.read().decode("utf-8", errors="replace")
            self._handle_error(status, body, service)
        except urllib.error.URLError as e:
            raise FlowError(f"Error de conexion con Flow: {e.reason}") from e

        if status == 200:
            try:
                return json.loads(body)
            except json.JSONDecodeError as e:
                raise FlowError(f"Respuesta invalida de Flow: {e}") from e
        else:
            self._handle_error(status, body, service)

    def create_payment(
        self,
        commerce_order: str,
        subject: str,
        amount: int,
        email: str,
        url_confirmation: str,
        url_return: str,
        currency: str = "CLP",
        payment_method: int | None = 9,
        optional: str | None = None,
        timeout: int | None = None,
    ) -> dict[str, Any]:
        params: dict[str, Any] = {
            "commerceOrder": commerce_order,
            "subject": subject,
            "currency": currency,
            "amount": amount,
            "email": email,
            "urlConfirmation": url_confirmation,
            "urlReturn": url_return,
            "paymentMethod": payment_method,
        }
        if optional is not None:
            params["optional"] = optional
        if timeout is not None:
            params["timeout"] = timeout

        signed = self._signed_params(params)
        logger.info("Flow create_payment: commerceOrder=%s amount=%s", commerce_order, amount)
        data = self._post("/payment/create", signed)
        logger.info("Flow create_payment OK: commerceOrder=%s", commerce_order)
        return data

    def get_status(self, token: str) -> dict[str, Any]:
        params = {"token": token}
        signed = self._signed_params(params)
        return self._get("/payment/getStatus", signed)

    def get_status_by_commerce_id(self, commerce_id: str) -> dict[str, Any]:
        params = {"commerceId": commerce_id}
        signed = self._signed_params(params)
        return self._get("/payment/getStatusByCommerceId", signed)

    def _handle_error(self, status: int, body: str, service: str) -> None:
        try:
            data = json.loads(body)
            message = data.get("message", data.get("error", "Error desconocido"))
        except (json.JSONDecodeError, TypeError):
            message = body or f"HTTP {status}"
        logger.error("Flow %s error (HTTP %d): %s", service, status, message)
        raise FlowError(message, code=status, raw=body)
