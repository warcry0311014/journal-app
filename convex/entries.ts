import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getEntries = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("entries")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const createEntry = mutation({
  args: {
    userId: v.string(),
    title: v.string(),
    excerpt: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("entries", args);
  },
});

export const updateEntry = mutation({
  args: {
    id: v.id("entries"),
    title: v.string(),
    excerpt: v.string(),
    content: v.string(),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const deleteEntry = mutation({
  args: { id: v.id("entries") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});
