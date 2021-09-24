# all
# @serenity-js
# @integration
# @documentation
# @examples
BOOTSTRAP=all

.PHONY: all install clean lint test compile integration-test integration-test-web integration-test-non-web verify report site
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

integration-test: integration-test-non-web integration-test-web

integration-test-non-web:
	npm run integration-test:non-web

integration-test-web:
	npm run integration-test:web

verify: lint compile test integration-test

report:
	npm run report

site:
	npm run site
