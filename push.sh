#!/bin/bash
# Usage: ./push.sh "your commit message"

# 1. Add all changes
git add .

# 2. Commit with the provided message (or a default)
MESSAGE="${1:-Auto-commit: $(date +'%Y-%m-%d %H:%M:%S')}"
git commit -m "$MESSAGE"

# 3. Push to current branch
git push origin $(git rev-parse --abbrev-ref HEAD)

echo "🚀 Upload complete!"
