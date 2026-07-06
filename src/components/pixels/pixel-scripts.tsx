"use client";

import { useEffect, useRef } from "react";

interface PublicConfig {
  pixel_taboola?: string;
}

interface PixelScriptsProps {
  pageType?: "checkout" | "confirmation";
}

export function PixelScripts({ pageType = "confirmation" }: PixelScriptsProps) {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    async function loadTaboola() {
      try {
        const res = await fetch("/api/configuracoes/publicas");
        if (!res.ok) return;
        const json = await res.json();
        const config: PublicConfig = json.data ?? json;

        if (!config.pixel_taboola) return;

        const advertiserId = config.pixel_taboola;

        // Load Taboola base script
        const existing = document.getElementById("tb_tfa_script");
        if (!existing) {
          const script = document.createElement("script");
          script.id = "tb_tfa_script";
          script.src = `https://cdn.taboola.com/libtrc/${advertiserId}/tfa.js`;
          script.async = true;
          document.head.appendChild(script);
        }

        // Push event
        (window as any)._tfa = (window as any)._tfa || [];
        if (pageType === "checkout") {
          (window as any)._tfa.push({ notify: "event", name: "start_checkout", id: advertiserId });
        } else if (pageType === "confirmation") {
          (window as any)._tfa.push({ notify: "event", name: "purchase", id: advertiserId });
        }
      } catch (err) {
        console.error("Erro ao carregar Taboola:", err);
      }
    }

    loadTaboola();
  }, [pageType]);

  return null;
}
