# svn-wc-attendant

Deals with your dirty Subversion WC so you don't have to.

<img src="https://travis-ci.org/prometheas/svn-wc-attendant.svg">


## Introduction

This is a very simple, almost _brutish_ utility that basically takes a "dirty" Subversion repository and just "crams" all changes that `svn status` finds in a wc directory up into its repository (yep, it's definitely as dirty as it sounds).  In a nut, it will `svn add` all unknown files (`?`), `svn delete` all missing files (`!`), at which point you can then elect to `svn commit` the contents of the wc directory to the repository.

To be clear, `svn-wc-attendant` does _not_ check files out of a repository; it's meant to help you deal with your dirty wc directory by getting everything _ready_ for a commit. This is also to say that it does _not_ commit the changes in your wc directory to the repository.

Which is to say that even if this _is_ the module you're looking for, you're almost certainly still going to need something that lets you do all that other stuff.

It literally just saves you the trouble of doing all the adds and deletes.

So if you haven't already picked a full-featured Subversion module out, I could recommend having a look at packages such as [svn-interface](https://www.npmjs.com/package/svn-interface) or [svn-spawn](https://www.npmjs.com/package/svn-spawn) (in fact, this project uses the former for its `svn status`, `svn add`, and `svn delete` functionality).
