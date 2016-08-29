app-js = src/backend/app.js

-include src/backend/common/Makefile
-include src/backend/routes/Makefile
-include src/backend/stores/Makefile

all: $(app-js)

test: all $(test-js)

%.js: %.ts
	tsc $<
