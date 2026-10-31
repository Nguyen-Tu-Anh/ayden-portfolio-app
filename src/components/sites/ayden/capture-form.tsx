"use client";

import { useRef, useState, type FormEvent } from "react";
import { intents, type IntentKey } from "./content";

export function CaptureForm() {
  const startedAt = useRef(0);
  const [selected, setSelected] = useState<Set<IntentKey>>(new Set());
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const toggle = (key: IntentKey) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") ?? "").trim(),
          hp_email: String(data.get("hp_email") ?? ""),
          city: selected.has("shows_near_me") ? String(data.get("intent_city") ?? "").trim() : "",
          intents: [...selected],
          ts: startedAt.current,
          source: "homepage",
        }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  };

  const showCity = selected.has("shows_near_me");

  return (
    <>
      {status !== "done" && (
        <form
          className="capture-form"
          onSubmit={onSubmit}
          onFocus={() => {
            if (!startedAt.current) startedAt.current = Date.now();
          }}
        >
          <input
            type="email"
            name="email"
            required
            placeholder="YOUR EMAIL"
            aria-label="Email address"
            autoComplete="email"
          />
          <input type="text" name="hp_email" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp" />
          <button type="submit" className="capture-submit" disabled={status === "sending"}>
            SIGN UP
          </button>
          <div className="intent-chips" role="group" aria-label="optional interests">
            <p className="intent-label">
              I&rsquo;M INTERESTED IN <span className="intent-optional">(OPTIONAL)</span>
            </p>
            <div className="intent-row">
              {intents.map((intent) => (
                <button
                  key={intent.key}
                  type="button"
                  className="intent-chip"
                  aria-pressed={selected.has(intent.key)}
                  onClick={() => toggle(intent.key)}
                >
                  {intent.label}
                </button>
              ))}
            </div>
            {showCity && (
              <div className="intent-city">
                <label htmlFor="intent-city" className="intent-city-label">
                  YOUR CITY <span className="intent-optional">(OPTIONAL)</span>
                </label>
                <input
                  id="intent-city"
                  name="intent_city"
                  type="text"
                  autoComplete="address-level2"
                  placeholder="CITY"
                />
              </div>
            )}
          </div>
        </form>
      )}
      <p className="capture-msg" role="status">
        {status === "done" && "You're in. Check your inbox."}
        {status === "error" && "Something went wrong — try again."}
      </p>
    </>
  );
}
