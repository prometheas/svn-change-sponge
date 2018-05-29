# svn-wc-attendant

Deals with your dirty Subversion WC so you don't have to.

[![Travis CI badge](https://travis-ci.org/prometheas/svn-wc-attendant.svg)](https://travis-ci.org/prometheas/svn-wc-attendant)
<br />
[![bitHound Overall Score](https://www.bithound.io/github/prometheas/svn-wc-attendant/badges/score.svg)](https://www.bithound.io/github/prometheas/svn-wc-attendant)
[![bitHound Dependencies](https://www.bithound.io/github/prometheas/svn-wc-attendant/badges/dependencies.svg)](https://www.bithound.io/github/prometheas/svn-wc-attendant/master/dependencies/npm)
[![bitHound Dev Dependencies](https://www.bithound.io/github/prometheas/svn-wc-attendant/badges/devDependencies.svg)](https://www.bithound.io/github/prometheas/svn-wc-attendant/master/dependencies/npm)
[![bitHound Code](https://www.bithound.io/github/prometheas/svn-wc-attendant/badges/code.svg)](https://www.bithound.io/github/prometheas/svn-wc-attendant)
<br />
[![Waffle.io - Columns and their card count](https://badge.waffle.io/prometheas/svn-wc-attendant.svg?columns=all)](https://waffle.io/prometheas/svn-wc-attendant)


## Introduction

This is a very simple, almost _brutish_ utility that basically takes a "dirty" Subversion repository and just "crams" all changes that `svn status` finds in a wc directory up into its repository (yep, it's definitely as dirty as it sounds).  In a nut, it will `svn add` all unknown files (`?`), `svn delete` all missing files (`!`), at which point you can then elect to `svn commit` the contents of the wc directory to the repository.

To be clear, `svn-wc-attendant` does _not_ check files out of a repository; it's meant to help you deal with your dirty wc directory by getting everything _ready_ for a commit. This is also to say that it does _not_ commit the changes in your wc directory to the repository.

Which is to say that even if this _is_ the module you're looking for, you're almost certainly still going to need something that lets you do all that other stuff.

It literally just saves you the trouble of doing all the adds and deletes.

So if you haven't already picked a full-featured Subversion module out, I could recommend having a look at packages such as [svn-interface](https://www.npmjs.com/package/svn-interface) or [svn-spawn](https://www.npmjs.com/package/svn-spawn) (in fact, this project uses the former for its `svn status`, `svn add`, and `svn delete` functionality).


## Usage

Usage of this module is quite simple:

```javascript
var wcAttendant = require('svn-wc-attendant');
var workingDir = '/path/to/wc';

// checkout files from Subversion repo into `workingDir`
// modify some files in aforementioned wc dir

wcAttendant.prepareWcForCommitting(workingDir);

// commit all changes back to repo
```

In the preceding code sample, `wcAttendant.prepareWcForCommitting()` is called to `svn add` any unversioned files and `svn delete` any files that were deleted.  From there, running `svn commit` on that wc directory will commit all those adds and deletes to the repo.


## Contributing

Contributions from the community are welcome!  Please note that all pull requests must satisfy the following conditions to be considered for acceptance:

1. Every pull request must include supporting testing code.  Every new feature must be accompanied by mocha testing code that verifies the work.

2. Pull requests must pass linting.  I've configured an integration with (HoundCI)[https://houndci.com/] that will automatically provide feedback on pull requests that displease the linter.


### Getting Started

Because many of the tests in this module deal with a remote Subversion service, its testing suite requires that you've got [Docker installed](https://docs.docker.com/engine/installation/) on your workstation.  Installation and configuration instructions can vary by platform and your individual needs, so I'll need to take a simplified approach to getting you set up.

For the sake of simplicity, I'll assume you've got Docker installed, and that:

1. You've cloned this repo
2. You've got a docker machine named `default`
3. You're using the bash shell

Open a bash session and input the following commands to prepare Docker:

```sh
$ docker-machine start default
$ eval $(docker env default)
```

Because the project offers purpose-built containers to run the testing suite, you actually don't even need `npm` installed on your development machine to test this project!  If this is useful (or if you suspect that you might be running into trouble with your `npm` or `node` installations or configuration), you'll be able run the complete test suite using Docker directly, as follows:

```sh
# run the tests once
$ docker-compose -f test/services/docker-compose.yml run test

# run the tests and keep watching the project JS files to automatically
# test again each time a file is saved
$ docker-compose -f test/services/docker-compose.yml run develop
```

Of course _having_ `npm` installed on your workstation allows you run those same containers with much less typing:

```sh
# run tests once, via npm
$ npm run test

# run tests each time a file is modified, via npm
$ npm run develop
```

When I'm working on this project, I execute `npm run develop` before starting, so that I can get feedback when I save a file that introduces changes that have broken the tests.


### Working With the `node-host` Service Container

In case you're hacking on the project sources such that you find you need to edit files in the `test/services/node-host` directory (e.g., you need to modify the `node-host` container definition), you'll need to rebuild the container image.  I've included the following scripts:

```sh
# rebuild the `develop` container
$ npm run rebuild-develop

# rebuild the `test` container
$ npm run rebuild-test
```
