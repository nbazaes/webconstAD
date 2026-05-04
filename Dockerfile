FROM python:3.12-slim

ARG APP_VERSION=dev
ARG NGINX_CONF=nginx.dev.conf

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    APP_VERSION=${APP_VERSION} \
    PUBLIC_APP_VERSION=${APP_VERSION}

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl gnupg nginx gettext-base \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_24.x nodistro main" > /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -f /etc/nginx/sites-enabled/default \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

COPY frontend/package*.json /app/frontend/
RUN npm --prefix /app/frontend ci

COPY . /app

RUN npm --prefix /app/frontend run build

RUN rm -rf /etc/nginx/conf.d/
COPY docker/${NGINX_CONF}.template /etc/nginx/conf.d/default.conf.template
COPY docker/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh \
    && mkdir -p /run/nginx /var/log/nginx /app/media /app/staticfiles

EXPOSE 80

CMD ["/entrypoint.sh"]
