"use client";

import { useEffect } from "react";

interface PublicConfig {
  pixel_meta?: string;
  pixel_google_analytics?: string;
  pixel_google_ads?: string;
  pixel_taboola?: string;
}

interface PixelScriptsProps {
  pageType?: "checkout" | "confirmation";
}

function removePixelScripts() {
  const existing = document.querySelectorAll("[data-pixel-script]");
  existing.forEach((el) => el.remove());
}

function createScript(
  id: string,
  content?: string,
  src?: string,
  isAsync = true
): HTMLScriptElement | null {
  if (!content && !src) return null;
  const script = document.createElement("script");
  script.setAttribute("data-pixel-script", id);
  script.type = "text/javascript";
  if (isAsync) script.async = true;
  if (content) script.textContent = content;
  if (src) script.src = src;
  return script;
}

function injectMetaPixel(pixelId: string, pageType: "checkout" | "confirmation" | "pageview") {
  const baseScript = createScript(
    "meta-base",
    `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');`
  );
  if (baseScript) document.head.appendChild(baseScript);

  const initScript = createScript(
    "meta-init",
    `fbq('init', '${pixelId}');fbq('track', 'PageView');`
  );
  if (initScript) document.head.appendChild(initScript);

  if (pageType === "checkout") {
    const script = createScript(
      "meta-startcheckout",
      `fbq('track', 'InitiateCheckout');`
    );
    if (script) document.head.appendChild(script);
  }

  if (pageType === "confirmation") {
    const script = createScript(
      "meta-purchase",
      `fbq('track', 'Purchase', {value: 0, currency: 'BRL'});`
    );
    if (script) document.head.appendChild(script);
  }

  const noscript = document.createElement("noscript");
  noscript.setAttribute("data-pixel-script", "meta-noscript");
  const img = document.createElement("img");
  img.height = 1;
  img.width = 1;
  img.style.display = "none";
  img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
  noscript.appendChild(img);
  document.body.appendChild(noscript);
}

function injectGoogleAnalytics(gaId: string) {
  const gtagScript = createScript(
    "ga-gtag",
    undefined,
    `https://www.googletagmanager.com/gtag/js?id=${gaId}`
  );
  if (gtagScript) document.head.appendChild(gtagScript);

  const configScript = createScript(
    "ga-config",
    `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`
  );
  if (configScript) document.head.appendChild(configScript);
}

function injectGoogleAds(awId: string, pageType: "checkout" | "confirmation" | "pageview") {
  const gtagScript = createScript(
    "gads-gtag",
    undefined,
    `https://www.googletagmanager.com/gtag/js?id=${awId}`
  );
  if (gtagScript) document.head.appendChild(gtagScript);

  const configScript = createScript(
    "gads-config",
    `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${awId}');`
  );
  if (configScript) document.head.appendChild(configScript);

  if (pageType === "checkout") {
    const script = createScript(
      "gads-startcheckout",
      `gtag('event', 'begin_checkout', { currency: 'BRL', value: 0 });`
    );
    if (script) document.head.appendChild(script);
  }

  if (pageType === "confirmation") {
    const script = createScript(
      "gads-purchase",
      `gtag('event', 'purchase', { currency: 'BRL', value: 0 });`
    );
    if (script) document.head.appendChild(script);
  }
}

function injectTaboola(advertiserId: string, pageType: "checkout" | "confirmation" | "pageview") {
  const taboolaScript = createScript(
    "taboola-base",
    undefined,
    `https://cdn.taboola.com/libtrc/${advertiserId}/tfa.js`
  );
  if (taboolaScript) {
    taboolaScript.id = "tb_tfa_script";
    document.head.appendChild(taboolaScript);
  }

  if (pageType === "checkout") {
    const script = createScript(
      "taboola-startcheckout",
      `window._tfa = window._tfa || [];
_tfa.push({notify: 'event', name: 'start_checkout', id: '${advertiserId}'});`
    );
    if (script) document.head.appendChild(script);
  }

  if (pageType === "confirmation") {
    const script = createScript(
      "taboola-purchase",
      `window._tfa = window._tfa || [];
_tfa.push({notify: 'event', name: 'purchase', id: '${advertiserId}'});`
    );
    if (script) document.head.appendChild(script);
  }

  if (pageType === "pageview") {
    const script = createScript(
      "taboola-track",
      `window._tfa = window._tfa || [];
_tfa.push({notify: 'event', name: 'page_view', id: '${advertiserId}'});`
    );
    if (script) document.head.appendChild(script);
  }
}

export function PixelScripts({ pageType = "pageview" }: PixelScriptsProps) {
  useEffect(() => {
    async function loadPixels() {
      try {
        const res = await fetch("/api/configuracoes/publicas");
        if (!res.ok) return;
        const json = await res.json();
        const config: PublicConfig = json.data ?? json;

        removePixelScripts();

        if (config.pixel_meta) {
          injectMetaPixel(config.pixel_meta, pageType);
        }
        if (config.pixel_google_analytics) {
          injectGoogleAnalytics(config.pixel_google_analytics);
        }
        if (config.pixel_google_ads) {
          injectGoogleAds(config.pixel_google_ads, pageType);
        }
        if (config.pixel_taboola) {
          injectTaboola(config.pixel_taboola, pageType);
        }
      } catch (err) {
        console.error("Erro ao carregar pixels:", err);
      }
    }

    loadPixels();

    return () => {
      removePixelScripts();
    };
  }, [pageType]);

  return null;
}
