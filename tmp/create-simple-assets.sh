#!/bin/bash
# tmp/create-simple-assets.sh

# Create directory if it doesn't exist
mkdir -p public/assets

# Create a simple 16x16 blue ball using ImageMagick if available, otherwise create minimal assets
if command -v convert >/dev/null 2>&1; then
    echo "Creating assets with ImageMagick..."
    convert -size 16x16 xc:"#0095DD" public/assets/ballGrey.png
    convert -size 75x10 xc:"#0095DD" public/assets/paddle.png
    echo "Assets created successfully with ImageMagick!"
else
    echo "ImageMagick not available, creating minimal placeholder assets..."
    # Create minimal 1x1 blue PNG files that can be stretched
    printf '\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\x0bIDATx\x9cc`\x00\x82\x00\x00\x00\x02\x00\x01\xe2!\xbc3\x00\x00\x00\x00IEND\xaeB`\x82' > public/assets/ballGrey.png
    cp public/assets/ballGrey.png public/assets/paddle.png
    echo "Minimal placeholder assets created!"
fi