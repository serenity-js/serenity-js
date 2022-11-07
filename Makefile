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
# cucumber-1
# cucumber-2
# cucumber-3
# cucumber-4
# cucumber-5
# cucumber-6
# cucumber-7
# cucumber-8
# jasmine
# mocha
# playwright-test
# playwright-web
# protractor-cucumber
# protractor-jasmine
# protractor-mocha
# protractor-web
# webdriverio-cucumber
# webdriverio-jasmine
# webdriverio-mocha
# webdriverio-web
INTEGRATION_SCOPE=all

.PHONY: all install clean lint test compile integration-test verify report site
all: install clean compile

reinstall:
	npm install
	npm run lerna:bootstrap:all

install:
	npm ci
	npm run lerna:bootstrap:$(BOOTSTRAP_SCOPE)

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
