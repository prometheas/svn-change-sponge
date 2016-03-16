# svn-wc-attendant

Deals with your dirty Subversion WC so you don't have to.

<img src="https://travis-ci.org/prometheas/svn-wc-attendant.svg">


## Introduction

This is a very simple, almost _brutish_ utility that basically takes a "dirty" Subversion repository and just "crams" all changes that `svn status` finds in a wc directory up into its repository (yep, it's definitely as dirty as it sounds).  In a nut, it will `svn add` all unknown files (`?`), `svn delete` all missing files (`!`), at which point you can then `svn commit` the contents of the wc directory.

It doesn't check files out of a repository, and it doesn't commit files to their repository.  So even if this _is_ the module you're looking for, you're almost certainly still going to need something that lets you do all that other stuff.

If you're haven't already picked a full-featured Subversion module out, I could recommend having a look at packages such as [svn-interface](https://www.npmjs.com/package/svn-interface) or [svn-spawn](https://www.npmjs.com/package/svn-spawn).
