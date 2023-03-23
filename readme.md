Freischütz Digital Topic Map Visualization
=========================================

FreiDi:topicMapViz can run independently as a mere HTML and Javascript application and thus be served with almost no need for a server.
It is intended for visualizing JTM topic maps.

For development purposes it can be built and served with bower and grunt, a respective test topic map is included as the application is tailored to our data.
Moreover, an ant script for building an eXist-db application is included. In the eXist-based setup, the tmxsl stylesheets by Lars Heuer (published at https://github.com/heuer/tmxsl under BSD 3-Clause License) will be used for transforming XTM 2.0 topic maps to JTM 1.1 specification. To include this script you need SVN installed as the repository will be checked out via bower install.

Setup
-----
You need node.js and SVN installed on your system.

If you have grunt and bower installed globally you may skip the first two lines of the following commands:

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

The following command will start a grunt server that will open the index page in your system web browser.

```shell
grunt run
```

Building XAR for eXist-db
-------------------------

You need ant installed on your system

```shell
ant
```

License
-------

This package is available under the terms of [GNU GPL-3 License](https://www.gnu.org/licenses/gpl.html) a copy of the license can be found in the repository [gpl-3.0.txt](gpl-3.0.txt).
