# all
# libs
# site
# @serenity-js
# @integration
# @examples
BOOTSTRAP_SCOPE=all

# all
# libs
# @serenity-js
# @integration
# @examples
COMPILE_SCOPE=all

# all
# cucumber-all
# playwright-all
# protractor-all
# webdriverio-8-all
# jasmine
# mocha
# playwright-test
# playwright-web
# protractor-test-runners
# protractor-cucumber
# protractor-jasmine
# protractor-mocha
# protractor-web
# webdriverio-8-test-runners
# webdriverio-8-cucumber
# webdriverio-8-jasmine
# webdriverio-8-mocha
# webdriverio-8-web
# webdriverio-8-web-devtools
# webdriverio-8-web-webdriver
INTEGRATION_SCOPE=all

.PHONY: all install clean lint test compile integration-test verify report
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

test-no-coverage:
	npm run test:no-coverage

compile:
	npm run compile:$(COMPILE_SCOPE)

integration-test:
	npm run integration-test:$(INTEGRATION_SCOPE)

verify: lint compile test integration-test

report:
	npm run report
