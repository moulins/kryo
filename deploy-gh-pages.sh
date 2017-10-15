#!/bin/bash
# bash is required (instead of a simple POSIX shell) for substitutions (and maybe indirect variable access)

# This script deploys the `typedoc` directory to the `gh-pages` branch of the repo
# when a change is merged into `master`.
# It requires an encrypted SSH key for the repo, you can generate it with a command similar to:
#
# ```bash
# EMAIL="demurgos@demurgos.net"
# OUTPUT_KEYFILE="deploy_key"
# ssh-keygen -t rsa -C "$EMAIL" -N "" -f "$OUTPUT_KEYFILE"
# travis encrypt-file "$OUTPUT_KEYFILE"
# rm "$OUTPUT_KEYFILE"
# ```

# Upload the public key to the repository's setting, then remove the public key and commit the encrypted private key.
# Make sure that the clear private key ($OUTPUT_KEYFILE) is not in the history (it should be removed after the
# encryption).

# Exit with nonzero exit code if anything fails
set -e

# Deploy only on merge commit to this branch
SOURCE_BRANCH="master"
# Id in the name of the key and iv files
TRAVIS_ENCRYPTION_ID="xxxxxxxxxxxx"

# Pull requests shouldn't try to deploy
if [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
    echo "Skipping deployment: not on the main branch ($SOURCE_BRANCH)."
    exit 0
fi

# Commits to other branches shouldn't try to deploy
if [ "$TRAVIS_BRANCH" != "$SOURCE_BRANCH" ]; then
    echo "Skipping deployment: not on the main branch ($SOURCE_BRANCH)."
    exit 0
fi

echo "Starting deployment"

# Get the deploy key by using Travis's stored variables to decrypt deploy_key.enc
TRAVIS_ENCRYPTED_KEY_VAR="encrypted_${TRAVIS_ENCRYPTION_ID}_key"
TRAVIS_ENCRYPTED_IV_VAR="encrypted_${TRAVIS_ENCRYPTION_ID}_iv"
openssl aes-256-cbc -K "${!TRAVIS_ENCRYPTED_KEY_VAR}" -iv "${!TRAVIS_ENCRYPTED_IV_VAR}" -in deploy_key.enc -out deploy_key -d
# Start SSH
eval `ssh-agent -s`
# Reduce the permissions of the deploy key, or it will be rejected by ssh-add
chmod 600 deploy_key
# Add the key
ssh-add deploy_key

gulp lib:publish:typedoc
