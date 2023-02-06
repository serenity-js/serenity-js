# all
# libs
# site
# @serenity-js
# @integration
# @documentation
# @examples
BOOTSTRAP_SCOPE=all

# all
# libs
# @serenity-js
# @integration
# @documentation
# @examples
COMPILE_SCOPE=all

# all
# cucumber-all
# playwright-all
# protractor-all
# webdriverio-all
# jasmine
# mocha
# playwright-test
# playwright-web
# protractor-test-runners
# protractor-cucumber
# protractor-jasmine
# protractor-mocha
# protractor-web
# webdriverio-test-runners
# webdriverio-cucumber
# webdriverio-jasmine
# webdriverio-mocha
# webdriverio-web
# webdriverio-web-devtools
# webdriverio-web-webdriver
INTEGRATION_SCOPE=all

.PHONY: all install clean lint test compile integration-test verify report site
all: install clean compile

reinstall:
	npm install
	npm run lerna:bootstrap:all

install:
	npm ci
	npm run lerna:bootstrap:$(BOOTSTRAP_SCOPE)

cc:
	npm run cc

clean:
	npm run clean

lint:
	npm run lint

test:
	npm test

compile:
	npm run compile:$(COMPILE_SCOPE)

integration-test:
	npm run integration-test:$(INTEGRATION_SCOPE)

verify: lint compile test integration-test

report:
	npm run report

site:
	npm run site
