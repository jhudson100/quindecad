
PYTHON=python

.PHONY: glue

all: common super worker

glue:
	$(MAKE) -C glue

common: setupdist
	tsc -p src/common/tsconfig.json

super: setupdist
	$(PYTHON) scripts/filetots.py src/super/spinner.svg src/super/spinner_svg.ts spinner_svg
	tsc -p src/super/tsconfig.json

worker: setupdist
	tsc -p src/worker/tsconfig.json

setupdist:
	./setupdist.py

clean:
	-/bin/rm -r dist

zip: all
	-/bin/rm dist.zip
	(cd dist && zip -r ../dist.zip .)

dist: clean zip

serve:
	(cd dist && python -m http.server)
