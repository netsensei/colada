---
layout: post
title:  "A quick installation of PostgreSQL on Fedora"
date:   2023-01-26
render_with_liquid: false
---
As I'm working on an array of projects with wildly differing technology stacks, I tend
to switch between different development environments on my work machine. I used to
keep a separate PostgreSQL installation per environment as a way to keep data close to the application. However, PostgreSQL is perfectly capable of accepting remote connections. The better
approach is to have a single PostgreSQL instance directly installed on the host OS where
all database live, serving as a single point of entry for all local projects.

This is a quick walkthrough on getting up and running with PostgreSQL on Fedora.

## Step 1: Installation of PostgreSQL

Add the PostgreSQL yum repo:

```bash
sudo dnf install https://download.postgresql.org/pub/repos/yum/reporpms/F-34-x86_64/pgdg-fedora-repo-latest.noarch.rpm
```

Install PostgreSQL. Here I'm going with PostgreSQL 10.

```bash
sudo dnf install postgresql10-server postgresql10
sudo /usr/pgsql-10/bin/postgresql-10-setup initdb
sudo systemctl start postgresql-10
sudo systemctl enable postgresql-10
```

## Step 2: Securing your local installation

The installation will create a postgres UNIX user on your system. Postgres is configured by default to log in with system user accounts.The postgres user is a superuser for PostgreSQL. The postgres user is setup without a password in PostgreSQL.

So, let's change the password first by logging with `psql` and executing a SQL query:

```bash
sudo -i -u postgres
psql
> psql (10.21)
> Type "help" for help.
postgres=# alter user postgres with password 'postgres';
> ALTER ROLE
```

## Step 3: Allow local access to PostgreSQL

Next up, we want to allow access from local connections to the PostgreSQL server. We'll edit the `/var/lib/pgsql/10/data/postgresql.conf` file:

```bash
sudo vim /var/lib/pgsql/10/data/pg_hba.conf
```

Alter the IPv4 section so it reads:

```bash
# IPv4 local connections:
host    all             all             127.0.0.1/32            md5
host    all             all             localhost               md5
```

This allows connections from the loopback device as well as 127.0.0.1. The md5 modifier allows for authentication with PostgreSQL user accounts that aren't tied to a system user.

You'll need to change that if you want access to PostgreSQL on your host from a `vagrant` guest:

```bash
host    all             all             10.0.2.1/24             md5
```

Then connect from with your guest with the IP of your host in the database connection string. To find
the IP of the host from within the guest:

```bash
netstat -rn | grep "^0.0.0.0 " | cut -d " " -f10
```

## Step 4: creating users and database

Here we create a database user `netsensei` and a new database called `netsensei`. We also make
the new user owner of the new database. Also notice how we're setting the collation during creation.

```bash
sudo -i -u postgres
# e.g. netsensei
createuser --interactive
createdb netsensei -O netsensei -T template0 -l en_US.UTF-8 -E UTF8
```

Let's set the privileges on the database via `psql`:

```bash
sudo -i -u postgres
psql
> psql (10.21)
> Type "help" for help.
postgres=# grant all privileges on database netsensei to netsensei ;
> GRANT
```