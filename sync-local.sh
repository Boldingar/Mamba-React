#!/bin/bash

# Script to keep your local environment in sync with GitHub repository

# Navigate to your project directory - update this path to your project location
cd /root/Mamba-React

# Store the current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

echo "Syncing local repository with GitHub..."
echo "Current branch: $CURRENT_BRANCH"

# Fetch all changes
git fetch --all

# Check if there are any changes to pull
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse origin/$CURRENT_BRANCH)

if [ $LOCAL = $REMOTE ]; then
    echo "Local repository is up to date with origin/$CURRENT_BRANCH"
else
    echo "Changes detected on origin/$CURRENT_BRANCH, pulling updates..."
    git pull origin $CURRENT_BRANCH
    echo "Local repository updated successfully!"
fi

echo "Sync completed at $(date)" 