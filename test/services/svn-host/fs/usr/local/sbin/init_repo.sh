#!/bin/bash

if [[ ! -d /var/svn ]]; then
	mkdir -p /var/svn
else
	rm -rf /var/svn/*
fi

/usr/local/subversion/bin/svnadmin create /var/svn/repository

# allow apache write perms
chown -R www-data:www-data /var/svn/repository
chmod -R g+rw /var/svn/repository
