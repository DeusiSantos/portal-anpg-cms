import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch knowledge base from Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: knowledgeBase } = await supabase
      .from("knowledge_base")
      .select("title, content, category")
      .eq("is_active", true)
      .order("category");

    const knowledgeContext = knowledgeBase?.length
      ? knowledgeBase
          .map((kb) => `[${kb.category}] ${kb.title}:\n${kb.content}`)
          .join("\n\n---\n\n")
      : "";

    const lang = language === "en" ? "English" : "Portuguese";

    const systemPrompt = `You are SOBA, the virtual assistant of ANPG (Agência Nacional de Petróleo, Gás e Biocombustíveis de Angola). You are friendly, professional, and knowledgeable about Angola's oil and gas sector.

IMPORTANT RULES:
- Respond in ${lang} matching the user's language.
- When responding in Portuguese, ALWAYS use European Portuguese (Portugal) following the pre-orthographic agreement conventions (antes do Acordo Ortográfico de 1990). This means:
  - Use "facto" instead of "fato", "óptimo" instead of "ótimo", "acção" instead of "ação", "direcção" instead of "direção", "projecto" instead of "projeto", "objectivo" instead of "objetivo", "correcto" instead of "correto", "electricidade" instead of "eletricidade", "actividade" instead of "atividade", "colecção" instead of "coleção".
  - Maintain silent consonants: "c" in "acção", "projecto", "directo"; "p" in "óptimo", "adopção", "excepção".
  - Use the diaeresis (trema) where traditionally applied.
  - Use "contacto" instead of "contato", "recepção" instead of "receção".
- Use the knowledge base below to answer questions accurately.
- If a question falls outside the knowledge base, politely say you can help with ANPG-related topics and suggest contacting the team directly.
- Keep answers concise but informative (2-4 paragraphs max).
- Use a professional yet approachable institutional tone.
- Never invent data, statistics, or facts not in the knowledge base.
- You can greet users, handle pleasantries, and guide them to relevant topics.

KNOWLEDGE BASE:
${knowledgeContext || "No specific content has been loaded yet. Respond with general guidance about ANPG and suggest the visitor explore the website or contact the team directly."}`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.slice(-10), // Last 10 messages for context window
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Serviço temporariamente indisponível. Tente novamente em instantes." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Serviço temporariamente indisponível." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Erro no serviço de IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("soba-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
