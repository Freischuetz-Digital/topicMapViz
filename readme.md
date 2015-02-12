Freischütz Digital topicMap Visualization
=========================================

FreiDi:topicMapViz can run independently as mere HTML and Javascript application and thus be served with almost no needs to a server.
It is intended for vizualizing JTM topic maps.

For development purposes it can be built and served with bower and grunt, a respective test topic map is included as the application is tailored to our data.

Moreover a ant script for building a eXist-db application is included. In the eXist based setup the tm-converter stylesheets by Lars Heuer (published at https://code.google.com/p/topic-maps/ under Apache License 2.0) will be used for transfroming XTM 2.0 topic maps to JTM 1.1 specification. In order to include theses script you need SVN installed as the repository will be checked out via bower install.

Setup
-----
You need node.js and SVN installed on your system.

If you have grunt and bower insalled globally you may skip the first two lines of the following commands:

```shell
npm install grunt
npm install bower
npm istall
bower install
grunt build
grunt
```

Launching grunt server
----------------------

The following command will start a grunt server that will oben the index page in you system web browser.

```shell
grunt run
```

Building XAR for eXist-db
-------------------------

You need ant insalled on your system

```shell
ant
```