# Releasing

1. Bump version in package.json
2. Update changelog by moving any items in the Unreleased section into a section for this version.
3. Create PR against main
4. Marge PR
5. Wait for it to build
6. Create and push a tag (not sure if you can do this without making a commit)
7. Wait for this build to finish
8. Test out staging
9. Create release using this tag
