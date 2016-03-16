# svn-wc-attendant

A utility that pushes all changes to a Subversion working copy up to its repository.

## Introduction

This is a very simple, almost _brutish_ utility that basically takes a "dirty" Subversion repository and just "crams" all changes that `svn status` finds in a working copy up into the repository.  In a nut, it will `svn add` all unknown files (`?`), `svn delete` all missing files (`!`), and then `svn commit` the contents of the wc directory.

You probably don't want this tool.  Unless you _really do_ want this tool.
