# Troubleshooting

Common issues and their solutions.

## Installation Issues

### Dependencies Not Installing

**Problem:** `npm install` fails with errors

**Solutions:**
1. Ensure Node.js 20+ is installed: `node --version`
2. Clear npm cache: `npm cache clean --force`
3. Delete `node_modules` and try again
4. Use a different package manager: `pnpm install` or `yarn install`

### TypeScript Compilation Errors

**Problem:** `npm run build` shows TypeScript errors

**Solutions:**
1. Check TypeScript version: `npx tsc --version`
2. Ensure `@types/node` is installed
3. Verify `tsconfig.json` is correctly configured
4. Run `npm install` again to reinstall dependencies

## Runtime Issues

### DOCS_DIR Not Found

**Problem:** Error: `Documentation directory does not exist`

**Solutions:**
1. Verify the `DOCS_DIR` environment variable is set in `.env.local`
2. Ensure the path is absolute, not relative
3. Check that the directory exists and contains .md files
4. Verify file permissions allow read access

### AI Gateway API Key Invalid

**Problem:** Error: `Authentication failed` or `Invalid API key`

**Solutions:**
1. Verify `VERCEL_AI_GATEWAY_API_KEY` is set correctly
2. Check the API key is active in Vercel dashboard
3. Ensure there are no extra spaces or quotes in the key
4. Try regenerating the API key

### Streaming Response Not Working

**Problem:** No streaming data or connection timeout

**Solutions:**
1. Check network connectivity
2. Verify the model is available via AI Gateway
3. Increase `maxDuration` in `vercel.json` if needed
4. Check browser console for errors
5. Test with curl to rule out client issues

## Agent Behavior Issues

### Agent Not Finding Information

**Problem:** Agent returns "information not found" for existing content

**Solutions:**
1. Verify markdown files are in the correct directory
2. Check file permissions (agent needs read access)
3. Test bash commands manually: `grep -r "keyword" docs/`
4. Review agent instructions in [lib/agent.ts](../lib/agent.ts)
5. Add more specific queries with keywords

### Agent Making Too Many Tool Calls

**Problem:** Agent exceeds maxSteps limit

**Solutions:**
1. Reduce `maxSteps` in [api/search/stream.ts](../api/search/stream.ts)
2. Provide more specific queries
3. Adjust agent instructions to be more focused
4. Consider breaking complex queries into smaller ones

### Incorrect or Irrelevant Responses

**Problem:** Agent provides wrong information

**Solutions:**
1. Review agent instructions for clarity
2. Ensure documentation is up-to-date
3. Add examples to agent instructions
4. Use custom instructions per request
5. Consider using a different model

## Performance Issues

### Slow Response Times

**Problem:** Queries take too long to complete

**Solutions:**
1. Verify Fluid compute is enabled in `vercel.json`
2. Reduce the number of files in the docs directory
3. Optimize documentation structure
4. Use more specific queries
5. Consider indexing frequently accessed content

### High Token Usage

**Problem:** API calls consuming too many tokens

**Solutions:**
1. Adjust agent instructions to be more concise
2. Reduce maxSteps to limit iterations
3. Structure documentation for easier grep-based search
4. Use bash commands efficiently (grep before cat)

## Deployment Issues

### Vercel Deployment Fails

**Problem:** `vercel --prod` fails

**Solutions:**
1. Verify Vercel CLI is installed: `vercel --version`
2. Login to Vercel: `vercel login`
3. Check vercel.json syntax is valid
4. Ensure all dependencies are in package.json
5. Review build logs for specific errors

### Environment Variables Not Working in Production

**Problem:** Deployed app can't access environment variables

**Solutions:**
1. Set variables in Vercel dashboard (Project Settings → Environment Variables)
2. Ensure variables are set for the correct environment (Production/Preview)
3. Redeploy after adding variables
4. Use `process.env.VAR_NAME` in code, not destructuring

## Getting Help

If you're still experiencing issues:

1. Check the error logs in Vercel dashboard
2. Review the [configuration guide](configuration.md)
3. Test locally with `npm run dev` first
4. Search GitHub issues for similar problems
5. Create a new issue with error details and steps to reproduce
