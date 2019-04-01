SRC = src/nearest-es6.js
MIN = src/nearest-es6.min.js
VERSION = $(shell cat VERSION.txt)

$(MIN): uglify

uglify:
	uglifyjs $(SRC) --compress --mangle --comments '/^\!/' --output $(MIN)
	@echo "" >> $(MIN)

install:
	npm install -g uglifyjs

version:
	@sed -i '' 's/\("version": \)"\(.*\)"/\1"$(VERSION)"/g' *.json
	@sed -i '' 's/\(plugin v\).*$\/\1$(VERSION)/' src/*.js
	@sed -i '' 's/\(class="version">v\).*\(<\/span>\)/\1$(VERSION)\2/' index.html

commit-version: version
	git commit -m "Bumped version to $(VERSION)" VERSION.txt *.json src/*.js index.html

tag: commit-version
	git tag v$(VERSION)

update-pages:
	git checkout gh-pages
	git merge --no-ff -m "Keeping gh-pages up to date" master
	git checkout -

push: update-pages
	git push --tags origin master gh-pages

.PHONY: uglify install version commit-version tag update-pages push
