// Supabase Edge Function: live-research
// Purpose: fetch public RSS headlines and publish concise update cards.
// Deploy with: supabase functions deploy live-research
// Add a scheduled invocation using Supabase Cron/pg_cron or an external scheduler.
// The browser should NOT contain any secret key.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db = createClient(SUPABASE_URL, SERVICE_ROLE);

async function requireAdmin(req: Request) {
  const auth = req.headers.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token) throw new Error("Authentication required");
  const authClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") || "");
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user) throw new Error("Invalid session");
  if (data.user.app_metadata?.is_admin !== true) throw new Error("Admin permission required");
  return data.user;
}

function clean(s: string) {
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function rssItems(xml: string) {
  const out: {title:string;link:string;description:string}[] = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)) {
    const block=m[1];
    const title=clean((block.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i)?.[1]||block.match(/<title>([\s\S]*?)<\/title>/i)?.[1]||""));
    const link=clean((block.match(/<link>([\s\S]*?)<\/link>/i)?.[1]||""));
    const description=clean((block.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i)?.[1]||block.match(/<description>([\s\S]*?)<\/description>/i)?.[1]||""));
    if(title) out.push({title,link,description});
  }
  return out;
}

Deno.serve(async (req) => {
  try {
    await requireAdmin(req);
    const body = await req.json().catch(()=>({}));
    const limit = Math.min(Number(body.limit||5),10);

    // Public RSS source. Add other reputable sources after checking their terms.
    const feedUrl = "https://news.google.com/rss/search?q=Bodo+Assam+culture+festival+calendar&hl=en-IN&gl=IN&ceid=IN:en";
    const response = await fetch(feedUrl, {headers:{"User-Agent":"BodoCalendarLive/1.0"}});
    if(!response.ok) throw new Error(`RSS request failed: ${response.status}`);
    const xml = await response.text();
    const items = rssItems(xml).slice(0,limit);

    let inserted=0;
    for(const item of items){
      const message = item.description
        ? `${item.description.slice(0,700)}`
        : `New public report: ${item.title}`;
      const {error}=await db.from("live_messages").insert({
        title:item.title.slice(0,140),
        message,
        icon:"📰",
        source:item.link ? `News • ${item.link}` : "News",
        active:true
      });
      if(!error) inserted++;
    }

    return new Response(JSON.stringify({ok:true,inserted}),{headers:{"content-type":"application/json"}});
  } catch(error) {
    return new Response(JSON.stringify({ok:false,error:String(error)}),{status:500,headers:{"content-type":"application/json"}});
  }
});
