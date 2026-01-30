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
# jasmine-5
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
# webdriverio-test-runners
# webdriverio-web
INTEGRATION_SCOPE=all

.PHONY: all install clean lint test compile integration-test verify
all: install clean compile

install:
	corepack enable
	pnpm install

cc:
	pnpm cc

clean:
	pnpm clean

lint:
	pnpm lint

test:
	pnpm test

test-no-coverage:
	pnpm test:no-coverage

compile:
	pnpm compile:$(COMPILE_SCOPE)

integration-test:
	pnpm integration-test:$(INTEGRATION_SCOPE)

verify: lint compile test integration-test
