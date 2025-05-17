FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

# COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/nginx/nginx.local.conf /etc/nginx/conf.d/nginx.local.conf

# COPY docker/nginx/ssl/options-ssl-nginx.conf /etc/letsencrypt/options-ssl-nginx.conf

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
