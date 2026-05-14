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
    // Get auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user has backoffice access
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: hasAccess } = await supabase.rpc("has_backoffice_access", { _user_id: user.id });
    if (!hasAccess) {
      return new Response(JSON.stringify({ error: "Sem permissão" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return new Response(JSON.stringify({ error: "Nenhum ficheiro enviado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fileName = `knowledge-docs/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    // Upload to storage
    const fileBuffer = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage
      .from("cms-assets")
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(JSON.stringify({ error: "Erro ao carregar ficheiro" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: publicUrlData } = supabase.storage
      .from("cms-assets")
      .getPublicUrl(fileName);

    // Extract text from the document using Lovable AI
    let extractedText = "";
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (LOVABLE_API_KEY && (file.type === "application/pdf" || file.type.includes("text"))) {
      try {
        // For text files, read directly
        if (file.type.includes("text")) {
          const textDecoder = new TextDecoder("utf-8");
          extractedText = textDecoder.decode(fileBuffer);
        } else {
          // For PDFs, use AI to extract/summarize from the URL
          // We'll use a simpler approach: attempt to extract raw text from PDF bytes
          extractedText = extractTextFromPDF(new Uint8Array(fileBuffer));
          
          // If raw extraction yields very little, use AI to help
          if (extractedText.length < 100 && LOVABLE_API_KEY) {
            const aiResponse = await fetch(
              "https://ai.gateway.lovable.dev/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${LOVABLE_API_KEY}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  model: "google/gemini-2.5-flash",
                  messages: [
                    {
                      role: "user",
                      content: `I have a PDF document titled "${file.name}". The raw text I could extract is: "${extractedText || 'empty'}". Please provide a comprehensive summary of what this document likely contains based on its filename, or if the extracted text is available, clean it up and organize it. Respond in the same language as the filename suggests.`,
                    },
                  ],
                }),
              }
            );
            if (aiResponse.ok) {
              const aiData = await aiResponse.json();
              const aiText = aiData.choices?.[0]?.message?.content || "";
              if (aiText) {
                extractedText = `[Resumo AI do documento "${file.name}"]\n\n${aiText}`;
              }
            }
          }
        }
      } catch (e) {
        console.error("Text extraction error:", e);
        extractedText = `[Documento: ${file.name}] — Extracção automática não disponível. Conteúdo deve ser adicionado manualmente.`;
      }
    } else {
      extractedText = `[Documento: ${file.name}] — Tipo de ficheiro não suporta extracção automática de texto.`;
    }

    return new Response(
      JSON.stringify({
        document_url: publicUrlData.publicUrl,
        extracted_text: extractedText.slice(0, 50000), // Limit to 50k chars
        file_name: file.name,
        file_size: file.size,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (e) {
    console.error("extract-document-text error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

/**
 * Basic PDF text extraction - extracts text streams from PDF binary data.
 * Works for text-based PDFs (not scanned images).
 */
function extractTextFromPDF(bytes: Uint8Array): string {
  const text: string[] = [];
  const str = new TextDecoder("latin1").decode(bytes);
  
  // Find text between BT and ET markers (PDF text objects)
  const btEtRegex = /BT\s([\s\S]*?)ET/g;
  let match;
  while ((match = btEtRegex.exec(str)) !== null) {
    const block = match[1];
    // Extract text from Tj and TJ operators
    const tjRegex = /\(([^)]*)\)\s*Tj/g;
    let tjMatch;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      text.push(tjMatch[1]);
    }
    // TJ arrays
    const tjArrayRegex = /\[([^\]]*)\]\s*TJ/g;
    let tjArrMatch;
    while ((tjArrMatch = tjArrayRegex.exec(block)) !== null) {
      const innerRegex = /\(([^)]*)\)/g;
      let innerMatch;
      while ((innerMatch = innerRegex.exec(tjArrMatch[1])) !== null) {
        text.push(innerMatch[1]);
      }
    }
  }
  
  return text.join(" ").replace(/\\n/g, "\n").replace(/\s+/g, " ").trim();
}
