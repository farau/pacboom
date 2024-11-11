#!/bin/bash

INPUT_DIR="public/js"
OUTPUT_DIR="public/js-obfuscated"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Loop through all JavaScript files in input directory
for file in "$INPUT_DIR"/boss.js; do
  # Get the filename without the extension
  filename=$(basename "$file" .js)

  # Obfuscate the file and save it to the output directory
  javascript-obfuscator "$file" > "$OUTPUT_DIR/$filename-obfuscated.js"
done
