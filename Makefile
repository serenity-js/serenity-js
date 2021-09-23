# all
# @serenity-js
# @integration
# @documentation
# @examples
BOOTSTRAP=all

.PHONY: all install clean lint test compile integration-test web-integration-test non-web-integration-test verify report site
all: install clean compile

reinstall:
	npm install
	npm run lerna:bootstrap:all

install:
	npm ci
	npm run lerna:bootstrap:$(BOOTSTRAP)

clean:
	npm run clean

lint:
	npm run lint

test:
	npm test

compile:
	npm run compile

integration-test: non-web-integration-test web-integration-test

non-web-integration-test:
	npm run non-web-integration-test

web-integration-test:
	npm run web-integration-test

verify: lint compile test integration-test

report:
	npm run report

site:
	npm run site
