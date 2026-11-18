const fs = require('fs');
const envText = fs.readFileSync('.env', 'utf8');
const env = {};
for (const line of envText.split('\n')) {
  const idx = line.indexOf('=');
  if (idx > 0 && !line.trim().startsWith('#')) {
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
}

const { Client } = require('@notionhq/client');
const notion = new Client({ auth: env.NOTION_TOKEN });

async function checkArrival() {
  const pageId = '41b93e07-1b90-8016-8a3b-f38d3bd9d3f6'; // 異星入境
  const page = await notion.pages.retrieve({ page_id: pageId });
  console.log('Title:', page.properties?.Name?.title?.[0]?.plain_text);
  console.log('Cover:', JSON.stringify(page.cover));
  
  const blocks = await notion.blocks.children.list({ block_id: pageId, page_size: 100 });
  console.log('Total blocks:', blocks.results.length);
  for (let i = 0; i < blocks.results.length; i++) {
    const b = blocks.results[i];
    if (b.type === 'image') {
      console.log(`[Block ${i}] Image:`, JSON.stringify(b.image));
    } else if (b.type === 'paragraph') {
      const text = b.paragraph?.rich_text?.map(r => r.plain_text).join('') || '';
      if (text) console.log(`[Block ${i}] Paragraph: ${text.slice(0, 30)}...`);
    } else if (b.type.startsWith('heading')) {
      const text = b[b.type]?.rich_text?.map(r => r.plain_text).join('') || '';
      console.log(`[Block ${i}] ${b.type}: ${text}`);
    }
  }
}

checkArrival().catch(console.error);
