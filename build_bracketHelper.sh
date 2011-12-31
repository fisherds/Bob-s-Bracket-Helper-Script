#!/bin/bash
#
# Author: David Fisher (fisherds@gmail.com)
# Note: Not using this flag at present due to a Closure Library error in goog.debug
#--compiler_flags="--jscomp_error=checkTypes" \

runpath="closure"
if [[ ! "$PWD" =~ ${runpath}$ ]]; then
	echo "You must run this script from the ${runpath} directory."
	exit 1
fi

closure-library/closure/bin/build/closurebuilder.py \
--root=closure-library \
--root=babyBracket \
--input=babyBracket/bracketHelper.js \
--namespace="bracketHelper.SelectUpdater" \
--output_mode=compiled \
--compiler_jar=compiler.jar \
--compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" \
--compiler_flags="--warning_level=VERBOSE" \
--output_file=babyBracket/bracketHelper-compiled.js


