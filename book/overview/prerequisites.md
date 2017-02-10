# Prerequisites

## Node.js

Serenity/JS is a Node.js module. To help you ensure maximum stability, 
it relies on a recent, **{{ book.package.engines.node }}** [Long-Term Support (LTS)](https://github.com/nodejs/LTS)
version of the [Node.js platform](https://nodejs.org/).

You can get both Node.js and the Node Package Manager (npm) either from the [nodejs.org](https://nodejs.org/) website,
which provides convenient installers for all the major operating systems, 
or using the [Node Version Manager (nvm)](https://nvm.sh), which is more appropriate if you need to work with several 
versions of the Node.js platform simultaneously.

Check if your machine is set up correctly with these terminal commands:

```bash
$> node --version
v6.9.5
```

```bash
$> npm --version
3.10.10
```

## A Node.js project

Serenity/JS is typically installed 
as a [dev dependency](https://docs.npmjs.com/files/package.json#devdependencies)
of a [Node.js project](https://docs.npmjs.com/files/package.json), 
so that it doesn't get accidentally bundled together with your production dependencies. 

If you're introducing Serenity/JS to an existing project you can skip this section as its purpose is to help you
create `package.json` - a Node.js project descriptor file, which would already be part of your project.

To create a Node.js project from scratch, create a new directory, such as `guide-to-serenity`, 
and initialise a new project accepting the default configuration suggested by the npm with these terminal commands:

```bash
$> mkdir guide-to-serenity
$> cd guide-to-serenity
$> npm init
```

Your actions should result in a basic [`package.json` file](https://docs.npmjs.com/files/package.json) 
appearing under `guide-to-serenity`, with contents similar to the following:
 
```json
{
  "name": "guide-to-serenity",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC"
}
```

## Java Runtime Environment

Serenity/JS delegates the work of generating the illustrated HTML reports to [Serenity BDD](http://serenity-bdd.info/), 
which is a Java library and therefore requires 
a [Java Runtime Environment (JRE)](http://www.oracle.com/technetwork/java/javase/overview/index.html),
which you can [download from the oracle.com website](http://www.oracle.com/technetwork/java/javase/downloads/jre8-downloads-2133155.html)

To verify that you have Java 7 or newer installed, run the below terminal command:

```bash
$> java -version
java version "1.8.0_25"
Java(TM) SE Runtime Environment (build 1.8.0_25-b17)
Java HotSpot(TM) 64-Bit Server VM (build 25.25-b02, mixed mode)
```

If you're working with several versions of the Java platform simultaneously, please make sure that you point
your `JAVA_HOME` environmental variable
to the correct version.

On MacOS this could be:

```
$> echo $JAVA_HOME
/Library/Java/JavaVirtualMachines/jdk1.8.0_25.jdk/Contents/Home
```

Please consult the [Oracle documentation](https://docs.oracle.com/cd/E21454_01/html/821-2532/inst_cli_jdk_javahome_t.html) 
for more details.

## A web browser

To automate acceptance tests of a web interface, you'll also need a web browser.
[Google Chrome](https://www.google.com/chrome/) is a great one to start with. 

{% include "../_partials/feedback.md" %}
