closure-library/closure/bin/build/closurebuilder.py \
--root=closure-library \
--root=babyBracket \
--input=babyBracket/bracketHelper.js \
--namespace="bracketHelper.SelectUpdater" \
--output_mode=compiled \
--compiler_jar=compiler.jar \
--compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" \
--output_file=babyBracket/bracketHelper-compiled.js
