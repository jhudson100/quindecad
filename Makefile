

all: common super worker

common: setupdist
	tsc -p src/common/tsconfig.json

super: setupdist
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

dist: zip
