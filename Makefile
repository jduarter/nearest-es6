SRC = src/jquery.nearest.js
MIN = src/jquery.nearest.min.js
VERSION = $(shell cat VERSION.txt)

$(MIN): uglify

uglify:
	@uglifyjs $(SRC) --compress --mangle --comments '/^\!/' --output $(MIN)

install:
	npm install -g uglifyjs

version:
	@sed -i '' 's/\("version": \)"\(.*\)"/\1"$(VERSION)"/g' *.json
	@sed -i '' 's/\(plugin v\).*$\/\1$(VERSION)/' src/*.js
	@sed -i '' 's/\(class="version">v\).*\(<\/span>\)/\1$(VERSION)\2/' index.html

.PHONY: uglify install version