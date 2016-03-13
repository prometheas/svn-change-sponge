FROM starlight36/httpd-subversion
MAINTAINER John Lianoglou <prometheas@github>

COPY fs/ /

# configure apache
RUN \
	echo "User www-data" >> /usr/local/apache2/conf/httpd.conf && \
	cat /usr/local/svn-forcer/apache2/svn-repo.conf >> /usr/local/apache2/conf/extra/httpd-svn.conf

# prepare svn repository
RUN \
	mkdir /var/svn && \
	/usr/local/subversion/bin/svnadmin create /var/svn/repository && \
	chown -R www-data:www-data /var/svn/repository && \
	chmod -R g+rw /var/svn/repository
