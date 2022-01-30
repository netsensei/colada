---
layout: post
title:  "Caddy, PHP and Docker"
date:   2022-01-30
render_with_liquid: false
---
So, I wanted to quickly set up a webserver with PHP support. And I wanted to do it with
Docker since that's what all the hip kids use these days. Nothing fancy, right? Well, 
not quite. This is one of those challenges where there's a million ways to accomplish the same
thing. There's no shortage of tutorials and code snippets floating around.

So, here's what I've learned so far.

## One container to rule them all?

Well, my first idea was to build a single Docker image with both [Caddy](https://caddyserver.com/) 
and PHP-FPM. It would be my powertool which I can drop everywhere and - boom! - I'm up and running.
There's also no shortage of code examples of people trying to do something similar. Turns out this 
is not necessarily the, how to put it... orthodox, perhaps?, way of approaching this.

The basic philosophy behind containers is that their purpose is to isolate one single  process, 
and all the dependencies which are needed to run that process in isolation. This is really 
important, remember this bit as you read on.

There are two major ways to set up PHP with a webserver. 

* As an Apache module, `mod_php`, and thus as part of the `httpd` process.
* Via (Fast)CGI. Here, PHP runs as a separate process. This is `php-fpm`.

Now, if you choose to run PHP via FCGI, you're effectively starting two different processes
within your container, which isn't all that ideal. Sure, throwing in [supervisor](http://supervisord.org/)
to manage processes makes it easy to do just that. But it still felt like a bit of clutch to me.

If you use Caddy - or NGinX - you'll definitely going to go down the FCGI route, as neither supports
PHP as an embedded subsystem the way Apache does.

I ended up spending several hours fiddling with multi stage `Dockerfile` configurations just to jerry-rig
PHP (`php-fpm`) with Caddy in a single container. And the more I looked through the many examples 
online, the saw a lot of complexity pass by. I just needed something fast and simple.

Throughout the years, I learned that you needs to stay aware of the moment when you start to fight 
against the framework, system, model. That's when you need to take a step back towards the drawing board.

## Take two: separate containers.

Turns out it's easier to go with separate `caddy` and `php` containers and let Docker do the heavy 
lifting for us.

Here's an example `docker-compose.yml` file:

```yml
version: "3.9"

services:
    caddy:
        container_name: caddy
        image: caddy:latest
        volumes:
            - app:/var/www/html
        networks:
            - phpapp
        ports:
            - 8080:8080

    php:
        container_name: php
        image: php:7.4-fpm-alpine
        volumes:
            - app:/var/www/html
        networks:
            - phpapp
        ports:
            - 9000:9000

volumes:
    app:
        driver_opts:
            type: none
            o: bind
            device: /home/netsensei/Docker/caddy

networks:
    phpapp:
        name: phpapp
```

The challenging bit here is the shared docker volume. When Caddy gets a request for a
PHP script, it farms out the execution to `php-fpm` which runs in a separate container. 
Of course, the PHP file which Caddy serves also needs to be available in the `php` container.
You could use a `bind mount` in each container to mount the same directory in each container.
I chose to do it the fancy way by defining a single named volume separately, and then referring
to it from the container configuration:

```yml
volumes:
    app:
        driver_opts:
            type: none
            o: bind
            device: /home/netsensei/Docker/caddy # Path to your PHP application
```

The other thing of note is that I defined a separate `docker network` and mapped the necessary
ports in order for the containers to be able to communicate.

## Caddy

The missing piece of the puzzle is Caddy. I didn't use the official `caddy` Docker image and 
rolled my own, tweaked version, instead. Why? Because I wanted to bake the `Caddyfile` 
configuration into the container with a personal default and run the process under a 
dedicated, restricted user.

Of course, you can use the official `caddy` Docker image and ignore what I'm doing here:

```Dockerfile
FROM caddy:alpine AS caddy-build

FROM alpine:latest

LABEL org.opencontainers.image.authors="Matthias Vandermaesen <matthias@colada.be>"

RUN set -eux; \
	apk --update add --no-cache \
	ca-certificates \
	mailcap \
	libcap

COPY --from=caddy-build /usr/bin/caddy /usr/bin/caddy

RUN addgroup -S caddy && \
    adduser -D -S -s /sbin/nologin -G caddy caddy && \
    setcap cap_net_bind_service=+ep `readlink -f /usr/bin/caddy` && \
    /usr/bin/caddy version

VOLUME ["/etc/caddy", "/var/www/html"]

RUN [ ! -e /etc/nsswitch.conf ] && echo 'hosts: files dns' > /etc/nsswitch.conf

COPY Caddyfile /etc/caddy/Caddyfile

RUN chown -R caddy:caddy /var/www/html

USER caddy

EXPOSE 8080 8443

WORKDIR /var/www/html

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
```

Finally, there's the `Caddyfile` itself which remains extremely terse:

```txt
:8080 {
	# Set this path to your site's directory.
	root * /var/www/html

	# Enable the static file server.
	file_server

	# Or serve a PHP site through php-fpm:
	php_fastcgi php:9000
}
```

Note how I refer to the PHP container via the named docker service `php` instead of
`localhost`. Docker containers will automagically translate that into the correct 
destination within the internal docker network. Baking this into the image seemingly
reduces the portability towards other Docker contexts. However, `/etc/caddy` can also
be mounted as a bind mount with your own custom `Caddyfile` from the host.

## But I still prefer to use a single container

Absolutely. It's not that there's anything inherently wrong with doing so. It's 
perfectly possible and it works just as well for many individuals and organizations.

It's just that you're probably shoving more complexity into a single container then
was originally intended when the ideas behind containerization were first conceived.
And those clearly weren't developed with PHP applications specifically in mind.

Separate containers are less wieldy when you want to scale up as high availabilty
becomes a real concern. That's when packaging both webserver as well as PHP into a 
single container really makes sense.

