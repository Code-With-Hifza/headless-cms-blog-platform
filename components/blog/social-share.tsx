"use client";

import { useState } from "react";
import { Twitter, Linkedin, Facebook, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SocialShare({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : `https://contentflow.io/blog/${slug}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const shareTwitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const shareLinkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const shareFacebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-muted-foreground mr-1">Share:</span>
      <a href={shareTwitter} target="_blank" rel="noopener noreferrer">
        <Button size="icon" variant="outline" className="h-8 w-8 hover:text-sky-500" title="Share on X / Twitter">
          <Twitter className="h-3.5 w-3.5" />
        </Button>
      </a>

      <a href={shareLinkedin} target="_blank" rel="noopener noreferrer">
        <Button size="icon" variant="outline" className="h-8 w-8 hover:text-blue-600" title="Share on LinkedIn">
          <Linkedin className="h-3.5 w-3.5" />
        </Button>
      </a>

      <a href={shareFacebook} target="_blank" rel="noopener noreferrer">
        <Button size="icon" variant="outline" className="h-8 w-8 hover:text-blue-700" title="Share on Facebook">
          <Facebook className="h-3.5 w-3.5" />
        </Button>
      </a>

      <Button
        size="icon"
        variant="outline"
        onClick={copyToClipboard}
        className="h-8 w-8"
        title="Copy article link"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Link2 className="h-3.5 w-3.5" />}
      </Button>
    </div>
  );
}
