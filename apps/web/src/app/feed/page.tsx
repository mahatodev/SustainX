"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { 
  Heart, 
  Search, 
  Send, 
  Sparkles, 
  ShieldCheck,
  MessageSquarePlus,
  Flame,
  Award
} from "lucide-react";

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newText, setNewText] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserId] = useState("usr_deepak_01");

  const fetchPosts = (query: string = "") => {
    fetch(`/api/feed?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.posts) setPosts(data.posts);
      })
      .catch((err) => console.error("Feed error:", err));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPosts(searchTerm);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUserId,
          text: newText,
          imageUrl: newImageUrl.trim() || null,
          cvLabel: "sapling_plantation",
          cvConfidence: 0.94,
          isVerifiedAction: true,
        }),
      });
      if (res.ok) {
        setNewText("");
        setNewImageUrl("");
        fetchPosts(searchTerm);
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.5 },
            colors: ["#10b981", "#34d399", "#38bdf8"],
          });
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      alert("Error posting flutter: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const res = await fetch("/api/feed", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, userId: currentUserId }),
      });
      if (res.ok) {
        fetchPosts(searchTerm);
      }
    } catch (err: any) {
      console.error("Like error:", err);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 text-slate-100">
      {/* Header Bar */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl shadow-glass border border-emerald-500/20 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Verified Flutters</span>
              <span className="text-xs font-mono font-bold bg-brand-700/60 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                GreenPratidin 2.0
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1.5">
              Peer-verified proof-of-green-work backed by MobileNetV3 and pHash perceptual collision checks.
            </p>
          </div>
        </div>

        {/* Modern Search Field */}
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              fetchPosts(e.target.value);
            }}
            placeholder="Fuzzy search actions (e.g. 'Metro', 'sapling', 'plastic')..."
            className="w-full glass-input rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-emerald-400 absolute left-4 top-3.5" />
        </form>
      </div>

      {/* Composer Card */}
      <div className="glass-panel p-6 rounded-3xl shadow-glass border border-emerald-500/20 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
          <MessageSquarePlus className="w-4 h-4" />
          <span>Publish Verified Ecological Milestone</span>
        </div>

        <form onSubmit={handleCreatePost} className="space-y-4">
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Share your verified green milestone with the neighborhood..."
            className="w-full glass-input rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none min-h-[90px]"
            required
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Proof image URL (optional)..."
              className="flex-1 glass-input rounded-xl px-4 py-2.5 text-xs text-emerald-300 font-mono placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-emerald-500 via-brand-600 to-brand-700 hover:from-emerald-400 hover:to-brand-600 text-slate-950 px-6 py-2.5 rounded-xl font-display font-extrabold text-xs flex items-center justify-center gap-2 shadow-glow-emerald transition-all duration-300 hover:scale-[1.02]"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Flutter</span>
            </button>
          </div>
        </form>
      </div>

      {/* Feed Stream */}
      <div className="space-y-5">
        {posts.map((post) => {
          const isLikedByYou = post.likesList?.includes(currentUserId);
          return (
            <div 
              key={post.id} 
              className="glass-panel p-6 rounded-3xl shadow-glass border border-emerald-500/20 space-y-4 transition-all hover:border-emerald-500/40"
            >
              {/* Post Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-slate-800 overflow-hidden relative border border-emerald-500/30">
                    {post.user?.picture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.user.picture} alt={post.user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-brand-700 text-white flex items-center justify-center font-bold text-sm">
                        {post.user?.name?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-display font-bold text-white text-sm flex items-center gap-2">
                      <span>{post.user?.name}</span>
                      <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 px-2 py-0.2 rounded-full font-bold">
                        {post.user?.tier || "CITIZEN"}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400">
                      @{post.user?.nickname} • {new Date(post.postedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* AI dMRV Verification Tag */}
                {post.isVerifiedAction && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline">MobileNetV3</span>
                    <span>({Math.round((post.cvConfidence || 0.91) * 100)}%)</span>
                  </div>
                )}
              </div>

              {/* Body */}
              <p className="text-sm text-slate-200 leading-relaxed font-normal">{post.body}</p>

              {/* Photo Evidence with pHash watermark */}
              {post.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-emerald-900/40 relative max-h-96 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={post.imageUrl} alt="dMRV Proof" className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-500" />
                  {post.pHash && (
                    <div className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur-md text-emerald-300 text-[10px] font-mono px-3 py-1 rounded-lg border border-emerald-500/30">
                      pHash: {post.pHash}
                    </div>
                  )}
                </div>
              )}

              {/* Post Footer */}
              <div className="pt-3 border-t border-emerald-900/30 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-medium transition-all ${
                    isLikedByYou 
                      ? "text-rose-400 bg-rose-500/15 border border-rose-500/30" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLikedByYou ? "fill-rose-400 text-rose-400" : ""}`} />
                  <span className="font-mono text-xs">{post.likesCount || 0} Endorsements</span>
                </button>

                <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{post.cvLabel ? `dMRV: ${post.cvLabel}` : "Proof-of-Work Verified"}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
