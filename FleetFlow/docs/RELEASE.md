# Release Process

1. Ensure all code is linted and builds successfully.
2. Update the version using semantic versioning:

   ```bash
   npm version patch # or minor / major
   ```

3. Push commits and tags:

   ```bash
   git push origin main --follow-tags
   ```

4. Netlify will automatically deploy the tagged commit to production.
5. Create a GitHub release summarising the changes.
