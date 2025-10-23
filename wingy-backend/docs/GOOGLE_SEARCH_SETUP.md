# Google Custom Search API Setup Guide

This guide will walk you through setting up Google Custom Search API for Wingy's web search functionality.

## Why Google Custom Search?

Google Custom Search API provides:
- ✅ Reliable, high-quality search results
- ✅ Easy integration with simple REST API
- ✅ Free tier: 100 searches per day
- ✅ Customizable search scope
- ✅ Well-documented and maintained

## Setup Steps

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project name

### Step 2: Enable Custom Search API

1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Custom Search API"
3. Click on **Custom Search API**
4. Click **Enable**

### Step 3: Create API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Copy the API key (you'll need this for `.env`)
4. (Optional) Click **Restrict Key** to add restrictions:
   - Application restrictions: None (or IP addresses if deploying)
   - API restrictions: Select **Custom Search API**
5. Click **Save**

### Step 4: Create Custom Search Engine

1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Click **Get Started** or **Add**
3. Configure your search engine:
   - **Sites to search**: 
     - Option 1: Search the entire web: Toggle "Search the entire web" ON
     - Option 2: Specific sites: Add gaming sites like:
       - reddit.com/r/leagueoflegends
       - reddit.com/r/valorant  
       - mobafire.com
       - op.gg
       - etc.
4. Click **Create**
5. Copy your **Search engine ID** (you'll need this for `.env`)

### Step 5: Configure Wingy

1. Open your `.env` file in the Wingy project root
2. Add your credentials:

```env
# Google Custom Search API Configuration
GOOGLE_API_KEY=your_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

Example:
```env
GOOGLE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_SEARCH_ENGINE_ID=a1b2c3d4e5f6g7h8i
```

### Step 6: Install Dependencies

```bash
uv pip install httpx
```

Or if you've already installed Wingy:
```bash
uv pip install -e .
```

### Step 7: Test the Integration

Run the test script:
```bash
python tests/test_web_search.py
```

You should see:
```
✓ GOOGLE_API_KEY: ********************abcd
✓ GOOGLE_SEARCH_ENGINE_ID: a1b2c3d4e5...
✅ Google Search API is configured!
```

## Usage in Agents

Once configured, agents can automatically use the web search tool:

```python
from wingy.agents import game_strategy_agent
from agents import Runner

result = await Runner.run(
    game_strategy_agent,
    "What are the best strategies for League of Legends Season 14?"
)

# Agent will automatically call web_search_tool to get current information
print(result.final_output)
```

## API Quotas and Limits

### Free Tier
- **100 queries per day** (free)
- 10 results per query maximum

### Paid Tier
If you need more, you can enable billing:
- **$5 per 1000 queries** beyond free tier
- Up to 10,000 queries per day

### Check Your Usage
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Dashboard**
3. Click on **Custom Search API**
4. View usage metrics

## Troubleshooting

### Error: "API key not valid"
- Check that the API key is correctly copied to `.env`
- Verify the Custom Search API is enabled in your project
- If using API restrictions, make sure Custom Search API is allowed

### Error: "Invalid search engine ID"
- Verify the search engine ID is correctly copied to `.env`
- Make sure the search engine status is "Active" in the control panel
- The ID should look like: `a1b2c3d4e5f6g7h8i` (alphanumeric)

### Error: "Quota exceeded"
- You've used all 100 free searches for the day
- Wait 24 hours or enable billing for more quota
- Check usage in Google Cloud Console

### Error: "Search returned no results"
- The query might be too specific
- Try broader search terms
- Check if your custom search engine is configured to search the entire web

### Tool returns error message instead of results
- Check that both `GOOGLE_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID` are set
- Run `python tests/test_web_search.py` to diagnose the issue
- Check the logs for detailed error messages

## Optimizing Search Results

### For Gaming Content

To get better gaming-related results, you can:

1. **Add specific gaming sites** to your custom search engine:
   - reddit.com/r/leagueoflegends
   - reddit.com/r/valorant
   - reddit.com/r/gaming
   - mobafire.com
   - op.gg
   - dotabuff.com
   - liquipedia.net

2. **Use gaming-specific keywords** in queries:
   - "patch notes"
   - "meta tier list"
   - "pro builds"
   - "strategy guide"

3. **Enable SafeSearch** (recommended):
   - Edit your custom search engine
   - Turn on SafeSearch filtering

## Alternative: Search Entire Web

If you want to search the entire internet (not just gaming sites):

1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Edit your search engine
3. Toggle **"Search the entire web"** to ON
4. Save changes

This gives you broader results but may return less relevant gaming content.

## Security Best Practices

### Protect Your API Keys

1. **Never commit `.env` to Git**:
   ```bash
   # Already in .gitignore
   .env
   ```

2. **Use environment variables** in production:
   ```bash
   export GOOGLE_API_KEY="your_key"
   export GOOGLE_SEARCH_ENGINE_ID="your_id"
   ```

3. **Rotate keys regularly** if exposed

4. **Set up API restrictions**:
   - Restrict by IP address (production)
   - Restrict to Custom Search API only
   - Set up usage alerts

### Monitor Usage

Set up alerts for unusual activity:
1. Go to Google Cloud Console
2. **Monitoring** > **Alerting**
3. Create alert for Custom Search API usage
4. Set threshold (e.g., alert if > 80 queries/day)

## Cost Estimation

### Free Tier Only (100 queries/day)
- Perfect for development and testing
- **Cost: $0/month**

### Light Usage (500 queries/day)
- 100 free + 400 paid = 500 total
- 400 × $0.005 = $2.00/day
- **Cost: ~$60/month**

### Medium Usage (2000 queries/day)
- 100 free + 1900 paid = 2000 total
- 1900 × $0.005 = $9.50/day
- **Cost: ~$285/month**

### Optimization Tips

To reduce costs:
1. **Cache results** - store recent searches
2. **Rate limit** - prevent abuse
3. **Deduplicate** - check if query was recently made
4. **Batch queries** - combine related searches

## Advanced Configuration

### Custom Parameters

You can modify the search parameters in `web_search.py`:

```python
params = {
    "key": api_key,
    "cx": search_engine_id,
    "q": query,
    "num": num_results,
    "lr": "lang_en",           # Language restrict
    "safe": "active",          # SafeSearch
    "dateRestrict": "m3",      # Last 3 months
}
```

### Supported Parameters

- `lr`: Language restriction (e.g., "lang_en" for English)
- `safe`: SafeSearch level ("active", "off")
- `dateRestrict`: Time period (e.g., "d1", "w1", "m1", "y1")
- `siteSearch`: Restrict to specific domain
- `fileType`: Filter by file type

See [API Reference](https://developers.google.com/custom-search/v1/reference/rest/v1/cse/list) for all parameters.

## Resources

- [Custom Search API Documentation](https://developers.google.com/custom-search/v1/overview)
- [Programmable Search Engine Help](https://developers.google.com/custom-search/docs/tutorial/introduction)
- [API Reference](https://developers.google.com/custom-search/v1/reference/rest/v1/cse/list)
- [Pricing Information](https://developers.google.com/custom-search/v1/overview#pricing)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Run the test script: `python tests/test_web_search.py`
3. Check logs in the console
4. Review Google Cloud Console for API errors
5. Verify quota hasn't been exceeded

---

**Next Steps**: Once configured, your agents will automatically use real-time web search to provide up-to-date gaming information! 🎮
