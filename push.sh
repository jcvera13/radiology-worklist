#!/bin/bash
# push.sh

# Check if origin exists
if ! git remote | grep -q 'origin'; then
    echo "❌ Error: 'origin' remote not found."
    echo "Run: git remote add origin <your-url>"
    exit 1
fi

# Add, Commit, and Push
git add .
MESSAGE="${1:-Auto-upload: $(date +'%Y-%m-%d %H:%M:%S')}"
git commit -m "$MESSAGE"

# Push to the current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)
git push origin "$BRANCH"

echo "✅ Successfully pushed to $BRANCH at origin"
