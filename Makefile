# all
# @serenity-js
# @integration
# @documentation
# @examples
BOOTSTRAP=all

.PHONY: all install clean lint test compile integration-test verify report site
all: install clean compile

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

integration-test:
	npm run integration-test

verify:
	npm run verify

report:
	npm run report

site:
	npm run site
